import { IContext, Inject, Injected } from "@airport/direction-indicator";
import { Repository } from "@airport/holding-pattern/dist/app/bundle";
import { IKeyRingManager } from "@airbridge/keyring/dist/app/bundle"
import { IKeyUtils, IRepository, IRepositoryMember, IUserAccount, RepositoryMember_GUID, RepositoryMember_Status } from "@airport/ground-control";
import { RepositoryMemberDao } from "@airport/holding-pattern/dist/app/bundle";
import { RepositoryMember } from "@airport/holding-pattern";
import { v4 as guidv4 } from "uuid";
import { Api } from "@airport/check-in";

export interface IRepositoryMaintenanceManager {

    selfJoinRepository(
        repository: IRepository,
        userAccount: IUserAccount,
        context: IContext
    ): Promise<void>

    joinRepository(
        repository: Repository,
        memberGUID: RepositoryMember_GUID,
        userAccount: IUserAccount,
        context: IContext
    ): Promise<void>

    inviteUserToRepository(
        repository: Repository,
        userEmail: string,
        context: IContext
    ): Promise<void>

    createRepositoryMember(
        repository: IRepository,
        userAccount: IUserAccount,
        isOwner: boolean,
        isAdministrator: boolean,
        canWrite: boolean,
        addRepositoryKey: boolean,
        context: IContext
    ): Promise<IRepositoryMember>

}

@Injected()
export class RepositoryMaintenanceManager
    implements IRepositoryMaintenanceManager {

    @Inject()
    keyRingManager: IKeyRingManager

    @Inject()
    repositoryMemberDao: RepositoryMemberDao

    @Inject()
    keyUtils: IKeyUtils

    @Api()
    async selfJoinRepository(
        repository: IRepository,
        userAccount: IUserAccount,
        context: IContext
    ): Promise<void> {
        const repositoryMember = await this.repositoryMemberDao
            .findForRepositoryAndUser(repository.GUID, userAccount.email)
        if (repositoryMember) {
            return
        }

        await this.createRepositoryMember(
            repository, userAccount, false, false, true, true, context
        )
    }

    @Api()
    async joinRepository(
        repository: IRepository,
        memberGUID: RepositoryMember_GUID,
        userAccount: IUserAccount,
        context: IContext
    ): Promise<void> {
        const repositoryMember: IRepositoryMember = await this.repositoryMemberDao
            .findForRepositoryAndUser(repository.GUID, userAccount.email)
        if (!repositoryMember) {
            throw new Error(`User '${userAccount.email}' is not a member of Repository '${repository.name}'`)
        }

        await this.keyRingManager.addKeyToRepositoryMember(
            repository, repositoryMember, context
        )
    }

    @Api()
    async inviteUserToRepository(
        repository: Repository,
        userEmail: string,
        context: IContext
    ): Promise<void> {
        /*
        const serializedKey = await this.keyUtils.getEncryptionKey()

        const base64EncodedKey = btoa(serializedKey);
        console.log('base64EncodedKey')
        console.log(base64EncodedKey)
        */

        const repositoryMember = await this.createRepositoryMember(
            repository, null, false, false, true, false, context
        )

        // await this.addJoinKey(repository, base64EncodedKey)

        // const joinUrl = `https://localhost:3000/joinRepository/${repository.GUID}/${base64EncodedKey}`
        const joinUrl = `https://localhost:3000/joinRepository/${repository.GUID}/${repositoryMember.GUID}`

        await this.sendEmail(userEmail,
            `Join '${repository.name}' on Turbase`, joinUrl)

        if (this.canUseWebShareAPI()) {
            await this.share(`Join ${repository.name.substring(0, 20)}`,
                `You have been invited to join ${repository.name} on Turbase`,
                joinUrl)
        }
    }

    @Api()
    async createRepositoryMember(
        repository: IRepository,
        userAccount: IUserAccount,
        isOwner: boolean,
        isAdministrator: boolean,
        canWrite: boolean,
        addRepositoryKey: boolean,
        context: IContext
    ): Promise<IRepositoryMember> {
        const memberGUID = guidv4()
        let publicSigningKey = null
        if (addRepositoryKey) {
            publicSigningKey = await this.keyRingManager.addRepositoryKey(
                memberGUID,
                repository.GUID,
                repository.name,
                context
            )
        }

        const repositoryMember = this.getRepositoryMember(
            userAccount,
            repository,
            memberGUID,
            isOwner,
            isAdministrator,
            canWrite,
            publicSigningKey
        )

        await this.repositoryMemberDao.save(repositoryMember)

        return repositoryMember
    }

    private getRepositoryMember(
        userAccount: IUserAccount,
        repository: IRepository,
        GUID: string,
        isOwner: boolean,
        isAdministrator: boolean,
        canWrite: boolean,
        publicSigningKey: string
    ): IRepositoryMember {
        const repositoryMember: IRepositoryMember = new RepositoryMember()
        repositoryMember.GUID = GUID
        repositoryMember.isOwner = isOwner
        repositoryMember.isAdministrator = isAdministrator
        repositoryMember.canWrite = canWrite
        repositoryMember.userAccount = userAccount
        repositoryMember.repository = repository
        repositoryMember.publicSigningKey = publicSigningKey

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