import { AirEntity } from "@airport/final-approach";
import { Column, Entity, ManyToOne, Table } from "@airport/tarmaq-entity";
import { KeyRing } from "./KeyRing";

@Entity()
@Table({ name: 'REPOSITORY_KEY' })
export class RepositoryKey extends AirEntity {

    @Column({ name: 'ENCRYPTION_KEY' })
    encryptionKey?: string

    @Column({ name: 'MEMBER_GUID', nullable: false })
    memberGUID?: string

    @Column({ name: 'REPOSITORY_GUID', nullable: false })
    repositoryGUID?: string

    @Column({ name: 'PRIVATE_SIGNING_KEY', nullable: false })
    privateSigningKey?: string

    @Column({ name: 'REPOSITORY_NAME', nullable: false })
    repositoryName?: string

    @ManyToOne()
    keyRing?: KeyRing

}
