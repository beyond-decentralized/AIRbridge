import { AirEntity } from "@airport/final-approach";
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    Table
} from "@airport/tarmaq-entity";
import {
    UserAccount
} from "@airport/travel-document-checkpoint/dist/app/bundle";

export type RepositoryMember_LocalId = number
export type RepositoryMember_GUID = string
export type RepositoryMember_IsOwner = boolean
export type RepositoryMember_IsAdministrator = boolean
export type RepositoryMember_CanWrtie = boolean
export type RepositoryMember_PublicSigningKey = string

@Entity()
@Table({ name: 'REPOSITORY_MEMBER' })
export class RepositoryMember
    extends AirEntity {

    @Column({ name: 'REPOSITORY_MEMBER_GUID', nullable: false })
    GUID: RepositoryMember_GUID

    @Column({ name: 'IS_OWNER', nullable: false })
    isOwner?: RepositoryMember_IsOwner = false

    @Column({ name: 'IS_ADMINISTRATOR', nullable: false })
    isAdministrator?: RepositoryMember_IsAdministrator = false

    @Column({ name: 'CAN_WRITE', nullable: false })
    canWrite?: RepositoryMember_CanWrtie = true

    // Can be null for read-only permissions
    @Column({ name: 'PUBLIC_SIGNING_KEY' })
    publicSigningKey?: RepositoryMember_PublicSigningKey

    @ManyToOne()
    @JoinColumn({
        name: 'USER_ACCOUNT_LID',
        referencedColumnName: 'USER_ACCOUNT_LID',
        nullable: false
    })
    userAccount: UserAccount

}
