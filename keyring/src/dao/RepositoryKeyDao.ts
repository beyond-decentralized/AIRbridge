import { KeyRing_InternalPrivateSigningKey } from "@airbridge/data-model";
import { IContext, Injected } from "@airport/direction-indicator";
import { Repository_GUID } from "@airport/ground-control";
import { AND, Y } from "@airport/tarmaq-query";
import { RepositoryKey } from "../ddl/RepositoryKey";
import { BaseRepositoryKeyDao } from "../generated/baseDaos";
import Q_airbridge____at_airbridge_slash_keyring from "../generated/qApplication";
import { QKeyRing, QRepositoryKey } from "../generated/qInterfaces";

@Injected()
export class RepositoryKeyDao extends BaseRepositoryKeyDao {

    async findByRepositoryGUIDs(
        internalPrivateSingingKey: KeyRing_InternalPrivateSigningKey,
        repositoryGUIDs: Repository_GUID[],
        context: IContext
    ): Promise<RepositoryKey[]> {
        let kr: QKeyRing,
            rk: QRepositoryKey

        return await this._find({
            SELECT: {
                privateSigningKey: Y,
                repositoryGUID: Y,
            },
            FROM: [
                rk = Q_airbridge____at_airbridge_slash_keyring.RepositoryKey,
                kr = rk.keyRing.INNER_JOIN()
            ],
            WHERE: AND(
                rk.repositoryGUID.IN(repositoryGUIDs),
                kr.internalPrivateSigningKey.equals(internalPrivateSingingKey)
            )
        }, context)
    }

}
