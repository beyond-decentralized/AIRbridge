import { IKeyRing, KeyRing_Email, KeyRing_ExternalPrivateKey, KeyRing_InternalPrivateSigningKey } from "@airbridge/data-model";
import { InternalAirEntity } from "@airport/holding-pattern/dist/app/bundle";
import { Column, DbString, Entity, OneToMany, Table } from "@airport/tarmaq-entity";
import { RepositoryKey } from "./RepositoryKey";

@Entity()
@Table({ name: 'KEY_RING' })
export class KeyRing
    extends InternalAirEntity
    implements IKeyRing {

    @Column({ name: "EMAIL", nullable: false })
    @DbString()
    email?: KeyRing_Email

    @Column({ name: 'EXTERNAL_PRIVATE_KEY', nullable: false })
    @DbString()
    externalPrivateKey?: KeyRing_ExternalPrivateKey

    @Column({ name: 'INTERNAL_PRIVATE_SIGNING_KEY', nullable: false })
    @DbString()
    internalPrivateSigningKey?: KeyRing_InternalPrivateSigningKey

    @OneToMany({ mappedBy: 'keyRing' })
    repositoryKeys?: RepositoryKey[] = []

}
