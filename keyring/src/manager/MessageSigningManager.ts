import { RepositorySynchronizationMessage } from "@airport/arrivals-n-departures";
import { IContext, Inject, Injected } from "@airport/direction-indicator";
import { IKeyUtils, Repository_GUID } from "@airport/ground-control";
import { ITerminalSessionManager } from "@airport/terminal-map";
import { RepositoryKeyDao } from "../dao/RepositoryKeyDao";
import { RepositoryKey } from "../ddl/RepositoryKey";

export interface IMessageSigningManager {

    signMessages(
        messages: RepositorySynchronizationMessage[],
        context: IContext
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
        context: IContext
    ): Promise<void> {
        const userSession = await this.terminalSessionManager.getUserSession(context)
        if (!userSession || !userSession.keyRing) {
            throw new Error(`No UserSession present.`)
        }
        if (!userSession.keyRing) {
            throw new Error(`No KeyRing is not set on UserSession.`)
        }
        const repositoryGUIDSet: Set<Repository_GUID> = new Set()

        for (const unsignedMessage of unsingedMessages) {
            repositoryGUIDSet.add(unsignedMessage.data.history.repository.GUID)
        }

        const repositoryKeys = await this.repositoryKeyDao.findByRepositoryGUIDs(Array.from(repositoryGUIDSet))
        const repositoryKeysByRepositoryGUIDs: Map<Repository_GUID, RepositoryKey> = new Map()

        for (const repositoryKey of repositoryKeys) {
            repositoryKeysByRepositoryGUIDs.set(repositoryKey.repository.GUID, repositoryKey)
        }

        for (const unsingedMessage of unsingedMessages) {
            const repositoryKey = repositoryKeysByRepositoryGUIDs.get(unsingedMessage.data.history.repository.GUID)
            const contents = JSON.stringify(unsingedMessage)
            unsingedMessage.signature = await this.keyUtils.sign(contents, repositoryKey.privateSigningKey)
        }
    }

}
