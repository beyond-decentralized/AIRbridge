import { IAirEntity } from "@airport/ground-control"
import { Repository_GUID, Repository_Name } from "@airport/ground-control";

export type RepositoryKey_EncryptionKey = string
export type RepositoryKey_PublicSigningKey = string
export type RepositoryKey_PrivateSigningKey = string

export interface IRepositoryKey extends IAirEntity {

    encryptionKey?: RepositoryKey_EncryptionKey
    keyRing?: IKeyRing
    privateSigningKey?: RepositoryKey_PrivateSigningKey
    publicSigningKey?: RepositoryKey_PublicSigningKey
    repositoryGUID?: Repository_GUID
    repositoryName?: Repository_Name

}

export type KeyRing_Email = string
export type KeyRing_ExternalPrivateKey = string
export type KeyRing_InternalPrivateSigningKey = string

export interface IKeyRing extends IAirEntity {

    email?: KeyRing_Email
    externalPrivateKey?: KeyRing_ExternalPrivateKey
    internalPrivateSigningKey?: KeyRing_InternalPrivateSigningKey
    repositoryKeys?: IRepositoryKey[]

}
