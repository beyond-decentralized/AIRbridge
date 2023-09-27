import { IRepositoryLoader } from "@airport/air-traffic-control";
import {
    IContext,
    Inject,
    Injected
} from "@airport/direction-indicator";
import { IRepositoryManager, ITerminalSessionManager } from "@airport/terminal-map";
import { KeyRingDao } from "../dao/KeyRingDao";
import { RepositoryKeyDao } from "../dao/RepositoryKeyDao";
import { KeyRing } from "../ddl/KeyRing";
import { RepositoryKey } from "../ddl/RepositoryKey";
import { IApplicationNameUtils, IKeyUtils, RepositoryMember_PublicSigningKey } from "@airport/ground-control";
import { application } from "../to_be_generated/app-declaration";
import { IKeyRing, IRepositoryKey } from "@airbridge/data-model";

export interface IKeyRingManager {

    getKeyRing(
        userPrivateKey: string,
        privateMetaSigningKey: string,
        context: IContext
    ): Promise<IKeyRing>

    addRepositoryKey(
        repositoryGUID: string,
        repositoryName: string
    ): Promise<RepositoryMember_PublicSigningKey>

}

@Injected()
export class KeyRingManager
    implements IKeyRingManager {

    @Inject()
    applicationNameUtils: IApplicationNameUtils

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
    terminalSessionManager: ITerminalSessionManager

    async getKeyRing(
        userPrivateKey: string,
        privateMetaSigningKey: string,
        context: IContext
    ): Promise<IKeyRing> {
        await this.repositoryLoader.loadRepository(
            'DEVSERVR_' + userPrivateKey, context)

        let keyRing: IKeyRing = await this.keyRingDao.findKeyRing(userPrivateKey, context)

        if (!keyRing) {
            const keyRingContext = {
                ...context,
                applicationFullName: this.applicationNameUtils.getApplication_FullName(application),
                newRepositoryGUID: 'DEVSERVR_' + userPrivateKey,
                forKeyRingRepository: true
            }

            keyRing = new KeyRing()
            keyRing.externalPrivateKey = userPrivateKey
            keyRing.internalPrivateSigningKey = privateMetaSigningKey
            const userSession = await this.terminalSessionManager.getUserSession()
            userSession.keyRing = keyRing

            const repository = await this.repositoryManager
                .createRepository('Key ring', true, false, keyRingContext)
            keyRing.repository = repository

            await this.keyRingDao.save(keyRing, keyRingContext)
        }

        return keyRing
    }

    async addRepositoryKey(
        repositoryGUID: string,
        repositoryName: string
    ): Promise<RepositoryMember_PublicSigningKey> {
        // const encryptionKey = await this.keyUtils.getEncryptionKey()
        const signingKey = await this.keyUtils.getSigningKey()

        const userSession = await this.terminalSessionManager.getUserSession()
        if (!userSession) {
            throw new Error(`No User Session found`)
        }

        const keyRing = userSession.keyRing
        if (!keyRing) {
            throw new Error(`No Key Ring found in User Session`)
        }

        const memberPublicSigningKey = signingKey.public

        const repositoryKey: IRepositoryKey = new RepositoryKey()
        repositoryKey.repositoryGUID = repositoryGUID
        repositoryKey.keyRing = userSession.keyRing as KeyRing
        repositoryKey.publicSigningKey = memberPublicSigningKey
        repositoryKey.privateSigningKey = signingKey.private
        repositoryKey.repositoryName = repositoryName
        keyRing.repositoryKeys.push(repositoryKey)

        repositoryKey.repository = keyRing.repository
        await this.repositoryKeyDao.save(repositoryKey)

        return memberPublicSigningKey
    }

}
