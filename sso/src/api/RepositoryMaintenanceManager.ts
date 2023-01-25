import { IContext, Inject, Injected } from "@airport/direction-indicator";
import { IRepositoryDao, Repository, RepositoryMemberInvitation } from "@airport/holding-pattern/dist/app/bundle";
import { IKeyRingManager } from "@airbridge/keyring/dist/app/bundle"
import { IKeyUtils, IRepository, IRepositoryMember, IRepositoryTransactionHistory, ITransactionHistory, IUserAccount, RepositoryMemberInvitation_PrivateSigningKey, RepositoryMemberInvitation_PublicSigningKey, RepositoryMember_CanWrite, RepositoryMember_IsAdministrator, RepositoryMember_IsOwner, RepositoryMember_PublicSigningKey, RepositoryMember_Status, Repository_GUID } from "@airport/ground-control";
import { RepositoryMemberDao } from "@airport/holding-pattern/dist/app/bundle";
import { RepositoryMember, RepositoryMemberAcceptance } from "@airport/holding-pattern";
import { Api } from "@airport/check-in";
import { IHistoryManager, IOperationContext, ITerminalSessionManager } from "@airport/terminal-map";

export interface IRepositoryMaintenanceManager {

    selfJoinRepository(
        repositoryGUID: Repository_GUID
    ): Promise<void>

    acceptRepositoryMemberInvitation(
        repositoryGUID: Repository_GUID,
        base64EncodedInvitationPrivateSigningKey: RepositoryMemberInvitation_PrivateSigningKey,
        base64EncodedInvitationPublicSigningKey: RepositoryMemberInvitation_PublicSigningKey,
    ): Promise<void>

    inviteUserToRepository(
        repository: Repository,
        userEmail: string
    ): Promise<void>

    createRepositoryMember(
        repository: IRepository,
        userAccount: IUserAccount,
        isOwner: RepositoryMember_IsOwner,
        isAdministrator: RepositoryMember_IsAdministrator,
        canWrite: RepositoryMember_CanWrite,
        addRepositoryKey: boolean,
        publicSigningKey: RepositoryMember_PublicSigningKey,
        context: IContext
    ): Promise<IRepositoryMember>

}

@Injected()
export class RepositoryMaintenanceManager
    implements IRepositoryMaintenanceManager {

    @Inject()
    historyManager: IHistoryManager

    @Inject()
    keyRingManager: IKeyRingManager

    @Inject()
    keyUtils: IKeyUtils

    @Inject()
    repositoryDao: IRepositoryDao

    @Inject()
    repositoryMemberDao: RepositoryMemberDao

    @Inject()
    terminalSessionManager: ITerminalSessionManager

    @Api()
    async selfJoinRepository(
        repositoryGUID: Repository_GUID
    ): Promise<void> {
        let context: IContext = arguments[1]

        const userAccount = await this.terminalSessionManager.getUserAccountFromSession()

        const repository = await this.repositoryDao.findRepository(repositoryGUID)
        if (!repository) {
            throw new Error(`Repository with GUID: ${repositoryGUID} is not found.`)
        }
        if (!repository.isPublic) {
            throw new Error(`Cannot self-join a non-public Repository, use the joinRepository method.`)
        }

        const repositoryMember = await this.repositoryMemberDao
            .findForRepositoryLocalIdAndAccountPublicSingingKey(repository._localId, userAccount.accountPublicSigningKey)
        if (repositoryMember) {
            console.warn(`User ${userAccount.username} is already a member of Repository ${repository.name}`)
            return
        }

        await this.createRepositoryMember(
            repository, userAccount, false, false, true, true, null, context
        )
    }

    @Api()
    async acceptRepositoryMemberInvitation(
        repositoryGUID: Repository_GUID,
        base64EncodedInvitationPrivateSigningKey: RepositoryMemberInvitation_PrivateSigningKey,
        base64EncodedInvitationPublicSigningKey: RepositoryMemberInvitation_PublicSigningKey,
    ): Promise<void> {
        let context: IContext = arguments[1]

        const userAccount = await this.terminalSessionManager.getUserAccountFromSession()

        const repository = await this.repositoryDao.findRepository(repositoryGUID)
        if (!repository) {
            throw new Error(`Repository with GUID: ${repositoryGUID} is not found.`)
        }
        if (repository.isPublic) {
            throw new Error(`Cannot join a public Repository, use selfJoinRepository method.`)
        }

        const invitationPublicSigningKey = atob(base64EncodedInvitationPublicSigningKey)

        const acceptingRepositoryMember: IRepositoryMember = await this.repositoryMemberDao
            .findForRepositoryLocalIdAndIvitationPublicSigningKey(
                repository._localId, invitationPublicSigningKey)
        if (!acceptingRepositoryMember) {
            throw new Error(`User '${userAccount.username}' is not a member of Repository '${repository.name}'`)
        }

        const publicSigningKey = await this.keyRingManager.addRepositoryKey(
            repository.GUID,
            repository.name
        )
        acceptingRepositoryMember.memberPublicSigningKey = publicSigningKey

        const repositoryMemberAcceptance = new RepositoryMemberAcceptance()
        repositoryMemberAcceptance.createdAt = new Date()
        repositoryMemberAcceptance.acceptingRepositoryMember = acceptingRepositoryMember
        repositoryMemberAcceptance.invitationPublicSigningKey = invitationPublicSigningKey

        await this.addRepositoryMemberInfoToHistory(
            acceptingRepositoryMember,
            repository,
            repositoryMemberAcceptance,
            atob(base64EncodedInvitationPrivateSigningKey),
            null,
            context
        )
    }

    @Api()
    async inviteUserToRepository(
        repository: Repository,
        userEmail: string
    ): Promise<void> {
        let context: IContext = arguments[2]

        const invitationSigningKey = await this.keyUtils.getSigningKey()
        const base64EncodedKeyInvitationPrivateSigningKey = btoa(invitationSigningKey.private);

        const invitedRepositoryMember = await this.createRepositoryMember(
            repository, null, false, false, true, false, null, context
        )
        const base64EncodedKeyInvitationPublicSigningKey = btoa(invitationSigningKey.public);

        const repositoryMemberInvitation = new RepositoryMemberInvitation()
        repositoryMemberInvitation.createdAt = new Date()
        repositoryMemberInvitation.invitationPublicSigningKey = invitationSigningKey.public
        repositoryMemberInvitation.invitedRepositoryMember = invitedRepositoryMember

        await this.addRepositoryMemberInfoToHistory(
            invitedRepositoryMember,
            repository,
            null,
            null,
            repositoryMemberInvitation,
            context
        )

        const joinUrl = `https://localhost:3000/joinRepository/${repository.GUID}/${base64EncodedKeyInvitationPublicSigningKey}/${base64EncodedKeyInvitationPrivateSigningKey}`

        await this.sendEmail(userEmail,
            `Join '${repository.name}' on Turbase`, joinUrl)

        if (this.canUseWebShareAPI()) {
            await this.share(`Join ${repository.name.substring(0, 20)}${repository.name.length > 20 ? '...' : ''}`,
                `You are invited to join '${repository.name}' on Turbase`,
                joinUrl)
        }
    }

    async createRepositoryMember(
        repository: IRepository,
        userAccount: IUserAccount,
        isOwner: RepositoryMember_IsOwner,
        isAdministrator: RepositoryMember_IsAdministrator,
        canWrite: RepositoryMember_CanWrite,
        addRepositoryKey: boolean,
        publicSigningKey: RepositoryMember_PublicSigningKey,
        context: IContext
    ): Promise<IRepositoryMember> {
        if (addRepositoryKey) {
            publicSigningKey = await this.keyRingManager.addRepositoryKey(
                repository.GUID,
                repository.name
            )
        }

        const repositoryMember = this.getRepositoryMember(
            userAccount,
            repository,
            isOwner,
            isAdministrator,
            canWrite,
            publicSigningKey
        )

        await this.addRepositoryMemberInfoToHistory(
            repositoryMember,
            repository,
            null,
            null,
            null,
            context
        )

        return repositoryMember
    }

    private async addRepositoryMemberInfoToHistory(
        repositoryMember: IRepositoryMember,
        repository: IRepository,
        repositoryMemberAcceptance: RepositoryMemberAcceptance,
        invitationPrivateSigningKey: RepositoryMemberInvitation_PrivateSigningKey,
        repositoryMemberInvitation: RepositoryMemberInvitation,
        context: IContext
    ): Promise<void> {
        const {
            repositoryTransactionHistory,
            transactionHistory
        } = await this.getRepositoryTransactionHistory(repository, context)
        repositoryTransactionHistory.newRepositoryMembers.push(repositoryMember)
        transactionHistory.allRepositoryMembers.push(repositoryMember)
        if (repositoryMemberAcceptance) {
            repositoryTransactionHistory.newRepositoryMemberAcceptances.push(repositoryMember)
            repositoryTransactionHistory.invitationPrivateSigningKey = invitationPrivateSigningKey
            transactionHistory.allRepositoryMemberAcceptances.push(repositoryMember)
        }
        if (repositoryMemberInvitation) {
            repositoryTransactionHistory.newRepositoryMemberInvitations.push(repositoryMember)
            transactionHistory.allRepositoryMemberInvitations.push(repositoryMember)
        }
    }

    private async getRepositoryTransactionHistory(
        repository: IRepository,
        context: IContext
    ): Promise<{
        repositoryTransactionHistory: IRepositoryTransactionHistory,
        transactionHistory: ITransactionHistory
    }> {
        const userSession = await this.terminalSessionManager.getUserSession()
        if (!userSession) {
            throw new Error('No User Session present')
        }
        const transaction = userSession.currentTransaction
        if (!transaction) {
            throw new Error('No Current Transaction present')
        }
        const actor = transaction.actor
        if (!actor) {
            throw new Error('No actor associated with transaction Id: ' + transaction.id)
        }

        const repositoryTransactionHistory = await this
            .historyManager.getRepositoryTransactionHistory(
                userSession.currentTransaction.transactionHistory,
                repository._localId, actor, context as IOperationContext
            )

        return {
            repositoryTransactionHistory,
            transactionHistory: userSession.currentTransaction.transactionHistory
        }
    }

    private getRepositoryMember(
        userAccount: IUserAccount,
        repository: IRepository,
        isOwner: boolean,
        isAdministrator: boolean,
        canWrite: boolean,
        memberPublicSigningKey: string
    ): IRepositoryMember {
        const repositoryMember: IRepositoryMember = new RepositoryMember()
        repositoryMember.isOwner = isOwner
        repositoryMember.isAdministrator = isAdministrator
        repositoryMember.canWrite = canWrite
        repositoryMember.memberPublicSigningKey = memberPublicSigningKey
        repositoryMember.repository = repository
        repositoryMember.userAccount = userAccount

        if (userAccount) {
            repositoryMember.status = RepositoryMember_Status.JOINED
        } else {
            repositoryMember.status = RepositoryMember_Status.INVITED
        }

        return repositoryMember
    }

    private sendEmail(
        to: string,
        subject: string,
        text: string
    ): string {
        return `mailto:${to}?subject=${subject}&body=${text}`
    }

    private canUseWebShareAPI(): boolean {
        return navigator.canShare && navigator.canShare()
    }

    private async share(
        title: string,
        text,
        url: string
    ): Promise<void> {
        const shareData = {
            title,
            text,
            url
        }

        await navigator.share(shareData)
    }

}