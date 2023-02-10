import { IContext, Inject, Injected } from "@airport/direction-indicator";
import { IKeyUtils, SyncRepositoryMessage, Repository_GUID, Dictionary, IRepositoryTransactionHistory } from "@airport/ground-control";
import { ITerminalSessionManager } from "@airport/terminal-map";
import { RepositoryKeyDao } from "../dao/RepositoryKeyDao";
import { RepositoryKey } from "../ddl/RepositoryKey";

export interface IMessageSigningManager {

    signMessages(
        historiesToSend: IRepositoryTransactionHistory[],
        unsingedMessages: SyncRepositoryMessage[],
        context: IContext
    ): Promise<void>

}

@Injected()
export class MessageSigningManager
    implements IMessageSigningManager {

    @Inject()
    dictionary: Dictionary

    @Inject()
    keyUtils: IKeyUtils

    @Inject()
    repositoryKeyDao: RepositoryKeyDao

    @Inject()
    terminalSessionManager: ITerminalSessionManager

    async signMessages(
        historiesToSend: IRepositoryTransactionHistory[],
        unsingedMessages: SyncRepositoryMessage[],
        context: IContext
    ): Promise<void> {
        const keyRing = (await this.terminalSessionManager.getUserSession()).keyRing
        if (!keyRing) {
            throw new Error(`No KeyRing is not set on UserSession.`)
        }

        const repositoryGUIDSet: Set<Repository_GUID> = new Set()
        const messagesToSign: SyncRepositoryMessage[] = []
        for (let i = 0; i < historiesToSend.length; i++) {
            let history = historiesToSend[i]
            let unsignedMessage = unsingedMessages[i]
            if (this.dictionary.isKeyringEntity(history.operationHistory[0].entity)) {
                continue
            }
            repositoryGUIDSet.add(history.repository.GUID)
            messagesToSign.push(unsignedMessage)
        }

        const repositoryKeys = await this.repositoryKeyDao
            .findByRepositoryGUIDs(keyRing.internalPrivateSigningKey,
                Array.from(repositoryGUIDSet), context)
        const repositoryKeysByRepositoryGUIDs: Map<Repository_GUID, RepositoryKey> = new Map()

        for (const repositoryKey of repositoryKeys) {
            repositoryKeysByRepositoryGUIDs.set(repositoryKey.repositoryGUID, repositoryKey)
        }

        for (const unsingedMessage of messagesToSign) {
            const history = unsingedMessage.data.history
            const repositoryKey = repositoryKeysByRepositoryGUIDs
                .get(history.repository.GUID)
            const contents = JSON.stringify(unsingedMessage)

            unsingedMessage.memberSignature = await this.keyUtils
                .sign(contents, repositoryKey.privateSigningKey)

            if (history.invitationPrivateSigningKey) {
                unsingedMessage.acceptanceSignature = await this.keyUtils
                    .sign(contents, history.invitationPrivateSigningKey)
            }
            if (history.invitationPrivateSigningKey || history.isRepositoryCreation) {
                unsingedMessage.userAccountSignature = await this.keyUtils
                    .sign(contents, keyRing.internalPrivateSigningKey)
            }
        }
    }

}
