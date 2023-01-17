import { IAirEntity } from "@airport/ground-control"
import { Repository_GUID, Repository_Name } from "@airport/ground-control";
import { RepositoryMember_GUID } from "./RepositoryMember";

export type RepositoryKey_EncryptionKey = string
export type RepositoryKey_PrivateSigningKey = string

export interface IRepositoryKey extends IAirEntity {

    encryptionKey?: RepositoryKey_EncryptionKey
    keyRing?: IKeyRing
    memberGUID?: RepositoryMember_GUID
    privateSigningKey?: RepositoryKey_PrivateSigningKey
    repositoryGUID?: Repository_GUID
    repositoryName?: Repository_Name

}

export type KeyRing_PrivateKey = string
export type KeyRing_PrivateMetaSigningKey = string

export interface IKeyRing extends IAirEntity {

    privateKey?: KeyRing_PrivateKey
    privateMetaSigningKey?: KeyRing_PrivateMetaSigningKey
    repositoryKeys?: IRepositoryKey[]

}
