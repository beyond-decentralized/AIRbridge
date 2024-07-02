import { KeyRing_ExternalPrivateKey } from "@airbridge/data-model";
import { IContext, Injected } from "@airport/direction-indicator";
import { KeyRing } from "../ddl/KeyRing";
import { BaseKeyRingDao } from "../generated/baseDaos";
import { QKeyRing } from "../generated/qInterfaces";

@Injected()
export class KeyRingDao extends BaseKeyRingDao {

    async findKeyRing(
        externalPrivateKey: KeyRing_ExternalPrivateKey,
        context: IContext
    ): Promise<KeyRing> {
        let kr: QKeyRing

        return this._findOne({
            SELECT: {},
            FROM: [
                kr = this.qSchema.KeyRing
            ],
            WHERE: kr.externalPrivateKey.equals(externalPrivateKey)
        }, context)
    }

}
