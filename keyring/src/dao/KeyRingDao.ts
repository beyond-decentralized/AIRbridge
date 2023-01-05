import { Injected } from "@airport/direction-indicator";
import { KeyRing } from "../ddl/KeyRing";
import { BaseKeyRingDao } from "../generated/baseDaos";
import Q_airbridge____at_airbridge_slash_keyring from "../generated/qApplication";
import { QKeyRing } from "../generated/qInterfaces";

@Injected()
export class KeyRingDao extends BaseKeyRingDao {

    async findKeyRing(
        privateKey: string
    ): Promise<KeyRing> {
        let Q = Q_airbridge____at_airbridge_slash_keyring
        let kr: QKeyRing

        return this._findOne({
            SELECT: {},
            FROM: [
                kr = Q.KeyRing
            ],
            WHERE: kr.privateKey.equals(privateKey)
        })
    }

}
