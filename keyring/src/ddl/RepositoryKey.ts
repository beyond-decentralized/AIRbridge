import { RepositoryKey_EncryptionKey, RepositoryKey_PrivateSigningKey, RepositoryMember_GUID } from "@airbridge/data-model";
import { AirEntity } from "@airport/final-approach";
import { Repository_GUID, Repository_Name } from "@airport/ground-control";
import { Column, DbString, Entity, ManyToOne, Table } from "@airport/tarmaq-entity";
import { KeyRing } from "./KeyRing";

@Entity()
@Table({ name: 'REPOSITORY_KEY' })
export class RepositoryKey
    extends AirEntity {

    @Column({ name: 'ENCRYPTION_KEY' })
    @DbString()
    encryptionKey?: RepositoryKey_EncryptionKey

    @Column({ name: 'MEMBER_GUID', nullable: false })
    @DbString()
    memberGUID?: RepositoryMember_GUID

    @Column({ name: 'REPOSITORY_GUID', nullable: false })
    @DbString()
    repositoryGUID?: Repository_GUID

    @Column({ name: 'PRIVATE_SIGNING_KEY', nullable: false })
    @DbString()
    privateSigningKey?: RepositoryKey_PrivateSigningKey

    @Column({ name: 'REPOSITORY_NAME', nullable: false })
    @DbString()
    repositoryName?: Repository_Name

    @ManyToOne()
    keyRing?: KeyRing

}
