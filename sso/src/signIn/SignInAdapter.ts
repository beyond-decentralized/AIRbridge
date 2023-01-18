import { IKeyRing, ISignInCredentials } from "@airbridge/data-model"
import { Inject, Injected } from "@airport/direction-indicator"
import { IClient } from "@airway/client"

export interface ISignInAdapter {

    getKeyRing(
        signInCredentials: ISignInCredentials
    ): Promise<IKeyRing>
}

@Injected()
export class DevSignInAdapter {

    @Inject()
    client: IClient

    async getKeyRing(
        signInCredentials: ISignInCredentials
    ): Promise<IKeyRing> {
        throw new Error(`Not implemented`)
        // return await this.client.getKeyRing(signInCredentials.email)
    }

}
