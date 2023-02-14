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
            const history = historiesToSend[i]
            const unsignedMessage = unsingedMessages[i]
            // Operation history may not be present if its
            // a RepositoryMember-only operation
            const firstOperationHistory = history.operationHistory[0]
            if (firstOperationHistory && this.dictionary.isKeyringEntity(firstOperationHistory.entity)) {
                continue
            }
            repositoryGUIDSet.add(history.repository.GUID)
            messagesToSign.push(unsignedMessage)
        }

        if (!messagesToSign.length) {
            return
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
            let repositoryGUID: Repository_GUID
            if (typeof history.repository === 'string') {
                repositoryGUID = history.repository
            } else {
                repositoryGUID = history.repository.GUID
            }

            const repositoryKey = repositoryKeysByRepositoryGUIDs
                .get(repositoryGUID)
            const contents = JSON.stringify(unsingedMessage)

            unsingedMessage.memberSignature = await this.keyUtils
                .sign(contents, repositoryKey.privateSigningKey)

            if (history.invitationPrivateSigningKey) {
                unsingedMessage.acceptanceSignature = await this.keyUtils
                    .sign(contents, history.invitationPrivateSigningKey)
            }
            if (history.invitationPrivateSigningKey || history.isRepositoryCreation) {
                unsingedMessage.userAccountSignature = await this.keyUtils
                    .sign(contents, keyRing.internalPrivateSigningKey, 521)
            }
        }
    }

}
