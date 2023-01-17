import { InternalUserAccount } from '@airport/aviation-communication'
import { IAirEntity } from "@airport/ground-control"

export type RepositoryMember_LocalId = number
export type RepositoryMember_GUID = string
export type RepositoryMember_IsOwner = boolean
export type RepositoryMember_IsAdministrator = boolean
export type RepositoryMember_CanWrite = boolean
export type RepositoryMember_PublicSigningKey = string

export interface IRepositoryMember
    extends IAirEntity {

    GUID: RepositoryMember_GUID

    isOwner?: RepositoryMember_IsOwner

    isAdministrator?: RepositoryMember_IsAdministrator

    canWrite?: RepositoryMember_CanWrite

    publicSigningKey?: RepositoryMember_PublicSigningKey

    userAccount: InternalUserAccount

}
