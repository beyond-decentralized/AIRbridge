import { RepositoryMember_CanWrite, RepositoryMember_GUID, RepositoryMember_IsAdministrator, RepositoryMember_IsOwner, RepositoryMember_PublicSigningKey } from "@airbridge/data-model";
import { AirEntity } from "@airport/final-approach";
import {
    Column,
    DbBoolean,
    DbString,
    Entity,
    JoinColumn,
    ManyToOne,
    Table
} from "@airport/tarmaq-entity";
import {
    UserAccount
} from "@airport/travel-document-checkpoint/dist/app/bundle";

@Entity()
@Table({ name: 'REPOSITORY_MEMBER' })
export class RepositoryMember
    extends AirEntity {

    @Column({ name: 'REPOSITORY_MEMBER_GUID', nullable: false })
    @DbString()
    GUID?: RepositoryMember_GUID

    @Column({ name: 'IS_OWNER', nullable: false })
    @DbBoolean()
    isOwner?: RepositoryMember_IsOwner = false

    @Column({ name: 'IS_ADMINISTRATOR', nullable: false })
    @DbBoolean()
    isAdministrator?: RepositoryMember_IsAdministrator = false

    @Column({ name: 'CAN_WRITE', nullable: false })
    @DbBoolean()
    canWrite?: RepositoryMember_CanWrite = true

    // Can be null for read-only permissions
    @Column({ name: 'PUBLIC_SIGNING_KEY' })
    @DbString()
    publicSigningKey?: RepositoryMember_PublicSigningKey

    @ManyToOne()
    @JoinColumn({
        name: 'USER_ACCOUNT_LID',
        referencedColumnName: 'USER_ACCOUNT_LID',
        nullable: false
    })
    userAccount?: UserAccount

}
