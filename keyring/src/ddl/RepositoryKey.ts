import { RepositoryKey_EncryptionKey, RepositoryKey_PrivateSigningKey } from "@airbridge/data-model";
import { RepositoryMember_GUID, Repository_GUID, Repository_Name } from "@airport/ground-control";
import { InternalAirEntity } from "@airport/holding-pattern/dist/app/bundle";
import { Column, DbString, Entity, ManyToOne, Table } from "@airport/tarmaq-entity";
import { KeyRing } from "./KeyRing";

@Entity()
@Table({ name: 'REPOSITORY_KEY' })
export class RepositoryKey
    extends InternalAirEntity {

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
