import { IAirEntity } from "@airport/ground-control"

export interface IRepositoryKey {

    encryptionKey: string
    keyRing: IKeyRing
    memberGUID: string
    privateSigningKey: string
    repositoryGUID: string
    repositoryName: string

}

export interface IKeyRing extends IAirEntity {

    privateKey: string
    privateMetaSigningKey: string
    repositoryKeys: IRepositoryKey[]

}
