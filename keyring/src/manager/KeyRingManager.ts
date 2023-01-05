import { IRepositoryLoader } from "@airport/air-traffic-control";
import {
    IContext,
    Inject,
    Injected
} from "@airport/direction-indicator";
import {
    IRepositoryManager,
    Repository,
    RepositoryMember,
    RepositoryMemberDao
} from "@airport/holding-pattern/dist/app/bundle";
import { ITerminalSessionManager } from "@airport/terminal-map";
import { KeyRingDao } from "../dao/KeyRingDao";
import { RepositoryKeyDao } from "../dao/RepositoryKeyDao";
import { KeyRing } from "../ddl/KeyRing";
import { RepositoryKey } from "../ddl/RepositoryKey";
import { DbApplicationUtils, IKeyUtils } from "@airport/ground-control";
import { application } from "../to_be_generated/app-declaration";
import { v4 as guidv4 } from "uuid";
import { IRepositoryKey } from "@airbridge/data-model";

export interface INewRepositoryKeyResult {

    memberGUID: string,
    publicSigningKey: string
    repositoryKey: IRepositoryKey

}

export interface IKeyRingManager {

    getKeyRing(
        userPrivateKey: string,
        privateMetaSigningKey: string,
        context: IContext
    ): Promise<KeyRing>

    addRepositoryKey(
        repositoryGUID: string,
        repositoryName: string,
        context: IContext
    ): Promise<INewRepositoryKeyResult>

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
    ): Promise<KeyRing> {
        await this.repositoryLoader.loadRepository(
            'DEVSERVR', userPrivateKey, {})

        let keyRing = await this.keyRingDao.findKeyRing(userPrivateKey)

        if (!keyRing) {
            const keyRingContext = {
                ...context,
                applicationFullName: this.dbApplicationUtils.getFullApplication_Name(application),
                newRepositoryGUID: "DEVSERVR_" + userPrivateKey,
                addRepositoryToKeyRing: false
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

    async addRepositoryKey(
        repositoryGUID: string,
        repositoryName: string,
        context: IContext
    ): Promise<INewRepositoryKeyResult> {
        const encryptionKey = await this.keyUtils.getEncryptionKey()
        const signingKey = await this.keyUtils.getSigningKey()
        const memberGUID = guidv4()

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

        const repositoryKey = new RepositoryKey()
        repositoryKey.encryptionKey = encryptionKey
        repositoryKey.repositoryGUID = repositoryGUID
        repositoryKey.memberGUID = memberGUID
        repositoryKey.keyRing = userSession.keyRing
        repositoryKey.privateSigningKey = signingKey.private
        repositoryKey.repositoryName = repositoryName
        keyRing.repositoryKeys.push(repositoryKey)

        if (keyRing.id) {
            repositoryKey.repository = keyRing.repository
            await this.repositoryKeyDao.save(repositoryKey)
        }

        return {
            memberGUID,
            publicSigningKey: `${signingKey.public}|${publicSigningKeySignature}`,
            repositoryKey
        }
    }

}
