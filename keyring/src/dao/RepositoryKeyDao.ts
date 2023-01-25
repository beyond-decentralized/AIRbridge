import { KeyRing_InternalPrivateSigningKey } from "@airbridge/data-model";
import { Injected } from "@airport/direction-indicator";
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
        repositoryGUIDs: Repository_GUID[]
    ): Promise<RepositoryKey[]> {
        let kr: QKeyRing,
            rk: QRepositoryKey

        return await this._find({
            SELECT: {
                privateSigningKey: Y,
                repositoryGUID: Y,
            },
            FROM: [
                kr = Q_airbridge____at_airbridge_slash_keyring.KeyRing,
                rk = kr.repositoryKeys.LEFT_JOIN()
            ],
            WHERE: AND(
                kr.internalPrivateSigningKey.equals(internalPrivateSingingKey),
                rk.repositoryGUID.IN(repositoryGUIDs)
            )
        })
    }

}
