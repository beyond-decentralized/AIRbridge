import { IRepositoryLoader } from "@airport/air-traffic-control";
import {
    IContext,
    Inject,
    Injected
} from "@airport/direction-indicator";
import {
    RepositoryMember,
    RepositoryMemberDao 
} from "@airport/holding-pattern/dist/app/bundle";
import { IRepositoryManager, ITerminalSessionManager } from "@airport/terminal-map";
import { KeyRingDao } from "../dao/KeyRingDao";
import { RepositoryKeyDao } from "../dao/RepositoryKeyDao";
import { KeyRing } from "../ddl/KeyRing";
import { RepositoryKey } from "../ddl/RepositoryKey";
import { DbApplicationUtils, IKeyUtils, IRepository, IRepositoryMember, RepositoryMember_PublicSigningKey } from "@airport/ground-control";
import { application } from "../to_be_generated/app-declaration";
import { v4 as guidv4 } from "uuid";
import { IUserAccount } from "@airport/aviation-communication";
import { IKeyRing, IRepositoryKey } from "@airbridge/data-model";

export interface IKeyRingManager {

    getKeyRing(
        userPrivateKey: string,
        privateMetaSigningKey: string,
        context: IContext
    ): Promise<IKeyRing>
    
    createRepositoryMember(
        repository: IRepository,
        userAccount: IUserAccount,
        isOwner: boolean,
        isAdministrator: boolean,
        canWrite: boolean,
        addRepositoryKey: boolean,
        context: IContext
    ): Promise<IRepositoryMember>

    addKeyToRepositoryMember(
        repository: IRepository,
        repositoryMember: IRepositoryMember,
        context: IContext
    ): Promise<void>

}

@Injected()
export class KeyRingManager
    implements IKeyRingManager {

    @Inject()
    dbApplicationUtils: DbApplicationUtils

    @Inject()
    keyRingDao: KeyRingDao

    @Inject()
    keyUtils: IKeyUtils

    @Inject()
    repositoryKeyDao: RepositoryKeyDao

    @Inject()
    repositoryLoader: IRepositoryLoader

    @Inject()
    repositoryManager: IRepositoryManager

    @Inject()
    repositoryMemberDao: RepositoryMemberDao

    @Inject()
    terminalSessionManager: ITerminalSessionManager

    async getKeyRing(
        userPrivateKey: string,
        privateMetaSigningKey: string,
        context: IContext
    ): Promise<IKeyRing> {
        await this.repositoryLoader.loadRepository(
            'DEVSERVR', userPrivateKey, {})

        let keyRing: IKeyRing = await this.keyRingDao.findKeyRing(userPrivateKey)

        if (!keyRing) {
            const keyRingContext = {
                ...context,
                applicationFullName: this.dbApplicationUtils.getApplication_FullName(application),
                newRepositoryGUID: 'DEVSERVR_' + userPrivateKey,
                forKeyRingRepository: true
            }

            keyRing = new KeyRing()
            keyRing.privateKey = userPrivateKey
            keyRing.privateMetaSigningKey = privateMetaSigningKey
            const userSession = await this.terminalSessionManager.getUserSession(context)
            userSession.keyRing = keyRing

            const repository = await this.repositoryManager
                .createRepository('Key ring', keyRingContext)
            keyRing.repository = repository

            await this.keyRingDao.save(keyRing, keyRingContext)
        }

        return keyRing
    }

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
            publicSigningKey = await this.addRepositoryKey(
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

    async addKeyToRepositoryMember(
        repository: IRepository,
        repositoryMember: IRepositoryMember,
        context: IContext
    ): Promise<void> {
        const publicSigningKey = await this.addRepositoryKey(
            repositoryMember.GUID,
            repository.GUID,
            repository.name,
            context
        )

        repositoryMember.publicSigningKey = publicSigningKey

        await this.repositoryMemberDao.save(repositoryMember)
    }

    private async addRepositoryKey(
        memberGUID: string,
        repositoryGUID: string,
        repositoryName: string,
        context: IContext
    ): Promise<RepositoryMember_PublicSigningKey> {
        // const encryptionKey = await this.keyUtils.getEncryptionKey()
        const signingKey = await this.keyUtils.getSigningKey()

        const userSession = await this.terminalSessionManager.getUserSession(context)
        if (!userSession) {
            throw new Error(`No User Session found`)
        }

        const keyRing = userSession.keyRing
        if (!keyRing) {
            throw new Error(`No Key Ring found in User Session`)
        }

        const publicSigningKeySignature = this.keyUtils.sign(
            signingKey.public, keyRing.privateMetaSigningKey, 521)

        const repositoryKey: IRepositoryKey = new RepositoryKey()
        repositoryKey.repositoryGUID = repositoryGUID
        repositoryKey.memberGUID = memberGUID
        repositoryKey.keyRing = userSession.keyRing as KeyRing
        repositoryKey.privateSigningKey = signingKey.private
        repositoryKey.repositoryName = repositoryName
        keyRing.repositoryKeys.push(repositoryKey)

        repositoryKey.repository = keyRing.repository
        await this.repositoryKeyDao.save(repositoryKey)

        return `${signingKey.public}|${publicSigningKeySignature}`
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

        return repositoryMember
    }

}
