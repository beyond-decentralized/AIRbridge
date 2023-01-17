import { RepositorySynchronizationMessage, RepositorySynchronizationReadResponseFragment } from "@airport/arrivals-n-departures"
import { RepositoryTransactionHistory_SyncTimestamp } from "@airport/ground-control"

export interface IClient {

    getRepositoryTransactions(
        location: string,
        repositoryGUID: string,
        sinceSyncTimestamp?: number
    ): Promise<RepositorySynchronizationReadResponseFragment[]>

    sendRepositoryTransactions(
        location: string,
        repositoryGUID: string,
        messages: RepositorySynchronizationMessage[]
    ): Promise<RepositoryTransactionHistory_SyncTimestamp>

}
