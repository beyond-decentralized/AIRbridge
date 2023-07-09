import { IContext, Inject, Injected } from "@airport/direction-indicator";
import { IRepositoryDao, Repository, RepositoryMemberInvitation } from "@airport/holding-pattern/dist/app/bundle";
import { IKeyRingManager } from "@airbridge/keyring/dist/app/bundle"
import { IKeyUtils, IRepository, IRepositoryMember, IRepositoryTransactionHistory, ITransactionHistory, IUserAccount, RepositoryMemberInvitation_PrivateSigningKey, RepositoryMemberInvitation_PublicSigningKey, RepositoryMember_CanWrite, RepositoryMember_IsAdministrator, RepositoryMember_IsOwner, RepositoryMember_PublicSigningKey, RepositoryMember_Status, Repository_GUID } from "@airport/ground-control";
import { RepositoryMember, RepositoryMemberAcceptance, RepositoryMemberDao } from "@airport/holding-pattern/dist/app/bundle";
import { IHistoryManager, IOperationContext, ITerminalSessionManager, ITransaction } from "@airport/terminal-map";
import { Api } from "@airport/air-traffic-control";

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

        const repository = await this.repositoryDao.findRepository(repositoryGUID, context)
        if (!repository) {
            throw new Error(`Repository with GUID: ${repositoryGUID} is not found.`)
        }
        if (!repository.isPublic) {
            throw new Error(`Cannot self-join a non-public Repository, use the joinRepository method.`)
        }

        const repositoryMember = await this.repositoryMemberDao
            .findForRepositoryLocalIdAndAccountPublicSingingKey(repository._localId,
                userAccount.accountPublicSigningKey, context)
        if (repositoryMember) {
            console.warn(`User ${userAccount.username} is already a member of Repository ${repository.name}`)
            return
        }

        await this.createRepositoryMember(
            repository, userAccount, false, false, true, true, context
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

        const repository = await this.repositoryDao.findRepository(
            repositoryGUID, context)
        if (!repository) {
            throw new Error(`Repository with GUID: ${repositoryGUID} is not found.`)
        }
        if (repository.isPublic) {
            throw new Error(`Cannot join a public Repository, use selfJoinRepository method.`)
        }

        const invitationPublicSigningKey = atob(base64EncodedInvitationPublicSigningKey)

        const acceptingRepositoryMember: IRepositoryMember = await this.repositoryMemberDao
            .findForRepositoryLocalIdAndIvitationPublicSigningKey(
                repository._localId, invitationPublicSigningKey, context)
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
            true,
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

        const invitedRepositoryMember = await this.doCreateRepositoryMember(
            repository, null, false, false, true, false, context
        )
        const base64EncodedKeyInvitationPublicSigningKey = btoa(invitationSigningKey.public);

        const repositoryMemberInvitation = new RepositoryMemberInvitation()
        repositoryMemberInvitation.createdAt = new Date()
        repositoryMemberInvitation.invitationPublicSigningKey = invitationSigningKey.public
        repositoryMemberInvitation.invitedRepositoryMember = invitedRepositoryMember

        await this.addRepositoryMemberInfoToHistory(
            invitedRepositoryMember,
            false,
            repository,
            null,
            null,
            repositoryMemberInvitation,
            context
        )

        const joinUrl = `https://localhost:5173/joinRepository/${repository.GUID}/${base64EncodedKeyInvitationPublicSigningKey}/${base64EncodedKeyInvitationPrivateSigningKey}`

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
        context: IContext
    ): Promise<IRepositoryMember> {
        const repositoryMember = await this.doCreateRepositoryMember(
            repository,
            userAccount,
            isOwner,
            isAdministrator,
            canWrite,
            addRepositoryKey,
            context
        )

        await this.addRepositoryMemberInfoToHistory(
            repositoryMember,
            true,
            repository,
            null,
            null,
            null,
            context
        )

        return repositoryMember
    }

    private async doCreateRepositoryMember(
        repository: IRepository,
        userAccount: IUserAccount,
        isOwner: RepositoryMember_IsOwner,
        isAdministrator: RepositoryMember_IsAdministrator,
        canWrite: RepositoryMember_CanWrite,
        addRepositoryKey: boolean,
        context: IContext
    ): Promise<IRepositoryMember> {
        let memberPublicSigningKey: RepositoryMember_PublicSigningKey = null
        if (addRepositoryKey) {
            memberPublicSigningKey = await this.keyRingManager.addRepositoryKey(
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
            memberPublicSigningKey
        )

        await this.repositoryMemberDao.save(repositoryMember, context)

        return repositoryMember
    }

    private async addRepositoryMemberInfoToHistory(
        repositoryMember: IRepositoryMember,
        isInitiatingChange: boolean,
        repository: IRepository,
        repositoryMemberAcceptance: RepositoryMemberAcceptance,
        invitationPrivateSigningKey: RepositoryMemberInvitation_PrivateSigningKey,
        repositoryMemberInvitation: RepositoryMemberInvitation,
        context: IContext
    ): Promise<void> {
        const {
            repositoryTransactionHistory,
            transactionHistory
        } = await this.getRepositoryTransactionHistory(repository,
            isInitiatingChange ? repositoryMember : null,
            context)
        repositoryTransactionHistory.newRepositoryMembers.push(repositoryMember)
        if (repositoryMemberAcceptance) {
            repositoryTransactionHistory.newRepositoryMemberAcceptances
                .push(repositoryMemberAcceptance)
            repositoryTransactionHistory.invitationPrivateSigningKey
                = invitationPrivateSigningKey
        }
        if (repositoryMemberInvitation) {
            repositoryTransactionHistory.newRepositoryMemberInvitations
                .push(repositoryMemberInvitation)
        }
    }

    private async getRepositoryTransactionHistory(
        repository: IRepository,
        repositoryMember: IRepositoryMember,
        context: IContext
    ): Promise<{
        repositoryTransactionHistory: IRepositoryTransactionHistory,
        transactionHistory: ITransactionHistory
    }> {
        const userSession = await this.terminalSessionManager.getUserSession()
        if (!userSession) {
            throw new Error('No User Session present')
        }
        const transaction: ITransaction = context.transaction
        if (!transaction) {
            throw new Error('No Current Transaction present')
        }
        const actor = transaction.actor
        if (!actor) {
            throw new Error('No actor associated with transaction Id: ' + transaction.id)
        }

        const repositoryTransactionHistory = await this
            .historyManager.getRepositoryTransactionHistory(
                transaction.transactionHistory,
                repository._localId, actor, repositoryMember,
                context as IOperationContext
            )

        return {
            repositoryTransactionHistory,
            transactionHistory: transaction.transactionHistory
        }
    }

    private getRepositoryMember(
        userAccount: IUserAccount,
        repository: IRepository,
        isOwner: boolean,
        isAdministrator: boolean,
        canWrite: boolean,
        memberPublicSigningKey: RepositoryMember_PublicSigningKey,
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