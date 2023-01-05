import { AirEntity } from "@airport/final-approach";
import { Column, Entity, OneToMany, Table } from "@airport/tarmaq-entity";
import { RepositoryKey } from "./RepositoryKey";

@Entity()
@Table({ name: 'KEY_RING' })
export class KeyRing extends AirEntity {

    @Column({ name: 'PRIVATE_KEY', nullable: false })
    privateKey: string

    @Column({ name: 'PRIVATE_META_SIGNING_KEY', nullable: false })
    privateMetaSigningKey: string

    @OneToMany({ mappedBy: 'keyRing' })
    repositoryKeys: RepositoryKey[] = []
}