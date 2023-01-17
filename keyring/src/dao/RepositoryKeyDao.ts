import { Injected } from "@airport/direction-indicator";
import { Repository_GUID } from "@airport/ground-control";
import { Y } from "@airport/tarmaq-query";
import { RepositoryKey } from "../ddl/RepositoryKey";
import { BaseRepositoryKeyDao } from "../generated/baseDaos";
import Q_airbridge____at_airbridge_slash_keyring from "../generated/qApplication";
import { QRepositoryKey } from "../generated/qInterfaces";

@Injected()
export class RepositoryKeyDao extends BaseRepositoryKeyDao {

    async findByRepositoryGUIDs(
        repositoryGUIDs: Repository_GUID[]
    ): Promise<RepositoryKey[]> {
        let rk: QRepositoryKey

        return await this._find({
            SELECT: {
                privateSigningKey: Y,
                repositoryGUID: Y,
            },
            FROM: [
                rk = Q_airbridge____at_airbridge_slash_keyring.RepositoryKey
            ],
            WHERE: rk.repositoryGUID.IN(repositoryGUIDs)
        })
    }

}
