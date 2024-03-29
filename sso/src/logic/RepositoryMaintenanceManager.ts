import { IContext, Inject, Injected } from "@airport/direction-indicator";
import { IRepositoryDao, Repository, RepositoryMemberInvitation } from "@airport/holding-pattern/dist/app/bundle";
import { IKeyRingManager } from "@airbridge/keyring/dist/app/bundle"
import { IKeyUtils, IRepository, IRepositoryMember, IRepositoryTransactionHistory, IUserAccount, RepositoryMemberInvitation_PrivateSigningKey, RepositoryMemberInvitation_PublicSigningKey, RepositoryMember_CanWrite, RepositoryMember_IsAdministrator, RepositoryMember_IsOwner, RepositoryMember_PublicSigningKey, RepositoryMember_Status, Repository_GUID } from "@airport/ground-control";
import { RepositoryMember, RepositoryMemberAcceptance, RepositoryMemberDao } from "@airport/holding-pattern/dist/app/bundle";
import { IHistoryManager, IOperationContext, ITerminalSessionManager, ITransaction } from "@airport/terminal-map";

export interface IRepositoryMaintenanceManager {

    getSelfJoinRepositoryMembers(
        repositories: IRepository[],
        context: IContext
    ): Promise<IRepositoryMember[]>

    acceptRepositoryMemberInvitation(
        repositoryGUID: Repository_GUID,
        base64EncodedInvitationPrivateSigningKey: RepositoryMemberInvitation_PrivateSigningKey,
        base64EncodedInvitationPublicSigningKey: RepositoryMemberInvitation_PublicSigningKey,
        context: IContext
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

    async getSelfJoinRepositoryMembers(
        repositories: IRepository[],
        context: IContext
    ): Promise<IRepositoryMember[]> {
        const userAccount = await this.terminalSessionManager.getUserAccountFromSession()

        return await this.getRepositoryMembersToCreate(
            repositories, userAccount, false, false, true, true, context)
    }

    // Internal call, invoked from Turbase UI - @Api() Not needed
    async acceptRepositoryMemberInvitation(
        repositoryGUID: Repository_GUID,
        base64EncodedInvitationPrivateSigningKey: RepositoryMemberInvitation_PrivateSigningKey,
        base64EncodedInvitationPublicSigningKey: RepositoryMemberInvitation_PublicSigningKey,
        context: IContext
    ): Promise<void> {

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
        acceptingRepositoryMember.userAccount = userAccount

        const publicSigningKey = await this.keyRingManager.addRepositoryKey(
            repository.GUID,
            repository.name,
            context
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

    // Internal call, invoked from Turbase UI - @Api() Not needed
    async inviteUserToRepository(
        repository: Repository,
        userEmail: string
    ): Promise<void> {
        let context: IContext = arguments[2]

        const invitationSigningKey = await this.keyUtils.getSigningKey()
        const base64EncodedKeyInvitationPrivateSigningKey = btoa(invitationSigningKey.private);

        const invitedRepositoryMember = (await this.doCreateRepositoryMembers(
            [repository], null, false, false, true, false, context
        ))[0]
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

        const joinUrl = `https://localhost:4200/joinRepository/${repository.GUID}/${base64EncodedKeyInvitationPublicSigningKey}/${base64EncodedKeyInvitationPrivateSigningKey}`

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
        const repositoryMember = (await this.doCreateRepositoryMembers(
            [repository],
            userAccount,
            isOwner,
            isAdministrator,
            canWrite,
            addRepositoryKey,
            context
        ))[0]

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

    private async getRepositoryMembersToCreate(
        repositories: IRepository[],
        userAccount: IUserAccount,
        isOwner: RepositoryMember_IsOwner,
        isAdministrator: RepositoryMember_IsAdministrator,
        canWrite: RepositoryMember_CanWrite,
        addRepositoryKey: boolean,
        context: IContext
    ): Promise<IRepositoryMember[]> {
        const repositoryMembers: IRepositoryMember[] = []
        for (const repository of repositories) {
            let memberPublicSigningKey: RepositoryMember_PublicSigningKey = null
            if (addRepositoryKey) {
                memberPublicSigningKey = await this.keyRingManager.addRepositoryKey(
                    repository.GUID,
                    repository.name,
                    context
                )
            }

            repositoryMembers.push(this.getRepositoryMember(
                userAccount,
                repository,
                isOwner,
                isAdministrator,
                canWrite,
                memberPublicSigningKey
            ))
        }

        return repositoryMembers
    }

    private async doCreateRepositoryMembers(
        repositories: IRepository[],
        userAccount: IUserAccount,
        isOwner: RepositoryMember_IsOwner,
        isAdministrator: RepositoryMember_IsAdministrator,
        canWrite: RepositoryMember_CanWrite,
        addRepositoryKey: boolean,
        context: IContext
    ): Promise<IRepositoryMember[]> {
        const repositoryMembers: IRepositoryMember[] = await this.getRepositoryMembersToCreate(
            repositories,
            userAccount,
            isOwner,
            isAdministrator,
            canWrite,
            addRepositoryKey,
            context
        )

        await this.repositoryMemberDao.insert(repositoryMembers, context)

        return repositoryMembers
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
        const repositoryTransactionHistory = await this
            .getRepositoryTransactionHistory(repository, context)
        if (isInitiatingChange) {
            repositoryTransactionHistory.member = repositoryMember
        }
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
        context: IContext
    ): Promise<IRepositoryTransactionHistory> {
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
                repository._localId,
                context as IOperationContext
            )

        return repositoryTransactionHistory
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