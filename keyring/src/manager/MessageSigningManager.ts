import { RepositorySynchronizationMessage } from "@airport/arrivals-n-departures";
import { IContext, Inject, Injected } from "@airport/direction-indicator";
import { IKeyUtils, Repository_GUID } from "@airport/ground-control";
import { ITerminalSessionManager } from "@airport/terminal-map";
import { RepositoryKeyDao } from "../dao/RepositoryKeyDao";
import { RepositoryKey } from "../ddl/RepositoryKey";

export interface IMessageSigningManager {

    signMessages(
        unsingedMessages: RepositorySynchronizationMessage[]
    ): Promise<void>

}

@Injected()
export class MessageSigningManager
    implements IMessageSigningManager {

    @Inject()
    keyUtils: IKeyUtils

    @Inject()
    repositoryKeyDao: RepositoryKeyDao

    @Inject()
    terminalSessionManager: ITerminalSessionManager

    async signMessages(
        unsingedMessages: RepositorySynchronizationMessage[],
    ): Promise<void> {
        const keyRing = (await this.terminalSessionManager.getUserSession()).keyRing
        if (!keyRing) {
            throw new Error(`No KeyRing is not set on UserSession.`)
        }

        const repositoryGUIDSet: Set<Repository_GUID> = new Set()
        for (const unsignedMessage of unsingedMessages) {
            repositoryGUIDSet.add(unsignedMessage.data.history.repository.GUID)
        }

        const repositoryKeys = await this.repositoryKeyDao
            .findByRepositoryGUIDs(keyRing.internalPrivateSigningKey,
                Array.from(repositoryGUIDSet))
        const repositoryKeysByRepositoryGUIDs: Map<Repository_GUID, RepositoryKey> = new Map()

        for (const repositoryKey of repositoryKeys) {
            repositoryKeysByRepositoryGUIDs.set(repositoryKey.repository.GUID, repositoryKey)
        }

        for (const unsingedMessage of unsingedMessages) {
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
