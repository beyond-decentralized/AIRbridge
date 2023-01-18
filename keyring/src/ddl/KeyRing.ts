import { KeyRing_PrivateKey, KeyRing_PrivateMetaSigningKey } from "@airbridge/data-model";
import { InternalAirEntity } from "@airport/holding-pattern/dist/app/bundle";
import { Column, DbString, Entity, OneToMany, Table } from "@airport/tarmaq-entity";
import { RepositoryKey } from "./RepositoryKey";

@Entity()
@Table({ name: 'KEY_RING' })
export class KeyRing extends InternalAirEntity {

    @Column({ name: 'PRIVATE_KEY', nullable: false })
    @DbString()
    privateKey?: KeyRing_PrivateKey

    @Column({ name: 'PRIVATE_META_SIGNING_KEY', nullable: false })
    @DbString()
    privateMetaSigningKey?: KeyRing_PrivateMetaSigningKey

    @OneToMany({ mappedBy: 'keyRing' })
    repositoryKeys?: RepositoryKey[] = []

}
