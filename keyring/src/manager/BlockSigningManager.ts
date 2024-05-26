import { IContext, Inject, Injected } from "@airport/direction-indicator"
import { IKeyUtils, IRepositoryBlock, Repository_GUID, Dictionary, IRepositoryTransactionHistory } from "@airport/ground-control"
import { ITerminalSessionManager } from "@airport/terminal-map"
import { RepositoryKeyDao } from "../dao/RepositoryKeyDao"
import { RepositoryKey } from "../ddl/RepositoryKey"
import { IKeyRing } from "@airbridge/data-model"

export interface IBlockSigningManager {

    signBlocks(
        historiesToSend: IRepositoryTransactionHistory[],
        unsignedBlocks: IRepositoryBlock[],
        context: IContext
    ): Promise<void>

}

@Injected()
export class BlockSigningManager
    implements IBlockSigningManager {

    @Inject()
    dictionary: Dictionary

    @Inject()
    keyUtils: IKeyUtils

    @Inject()
    repositoryKeyDao: RepositoryKeyDao

    @Inject()
    terminalSessionManager: ITerminalSessionManager

    async signBlocks(
        historiesToSend: IRepositoryTransactionHistory[],
        unsingedBlocks: IRepositoryBlock[],
        context: IContext
    ): Promise<void> {
        const {
            blocksToSign,
            repositoryGUIDSet
        } = this.getBlocksToSignData(
            historiesToSend,
            unsingedBlocks
        )

        if (!blocksToSign.length) {
            return
        }

        const {
            keyRing,
            repositoryKeysByRepositoryGUIDs
        } = await this.getRepositoryKeysByRepositoryGUIDs(
            repositoryGUIDSet,
            context
        )

        for (const block of blocksToSign) {
            const blockToStringify: IRepositoryBlock = {
                data: block.data,
                GUID: block.GUID,
                previousBlock: {
                    GUID: block.previousBlock.GUID,
                    hashSum: block.previousBlock.hashSum
                }
            }
            let stringifiedBlock = JSON.stringify(blockToStringify)

            stringifiedBlock = await this.hashSumBlock(
                block,
                stringifiedBlock
            )

            this.signBlock(
                block,
                stringifiedBlock,
                repositoryKeysByRepositoryGUIDs,
                keyRing
            )

            // FIXME: apply PSON transformation to the stringifiedBlock
            let packagedData = stringifiedBlock // this.pson.encode(block)

            block.packagedData = packagedData
        }
    }

    private getBlocksToSignData(
        historiesToSend: IRepositoryTransactionHistory[],
        unsingedBlocks: IRepositoryBlock[]
    ): {
        blocksToSign: IRepositoryBlock[],
        repositoryGUIDSet: Set<Repository_GUID>
    } {
        const blocksToSign: IRepositoryBlock[] = []
        const repositoryGUIDSet: Set<Repository_GUID> = new Set()
        for (let i = 0; i < historiesToSend.length; i++) {
            const history = historiesToSend[i]
            const unsignedBlock = unsingedBlocks[i]
            // Operation history may not be present if its
            // a RepositoryMember-only operation
            const firstOperationHistory = history.operationHistory[0]
            if (firstOperationHistory && this.dictionary.isKeyringEntity(firstOperationHistory.entity)) {
                continue
            }
            blocksToSign.push(unsignedBlock)
            repositoryGUIDSet.add(history.repository.GUID)
        }

        return {
            blocksToSign,
            repositoryGUIDSet
        }
    }

    private async getRepositoryKeysByRepositoryGUIDs(
        repositoryGUIDSet: Set<Repository_GUID>,
        context: IContext
    ): Promise<{
        keyRing: IKeyRing,
        repositoryKeysByRepositoryGUIDs: Map<Repository_GUID, RepositoryKey>
    }> {
        const keyRing = (await this.terminalSessionManager.getUserSession()).keyRing
        if (!keyRing) {
            throw new Error(`No KeyRing is not set on UserSession.`)
        }

        const repositoryKeys = await this.repositoryKeyDao
            .findByRepositoryGUIDs(keyRing.internalPrivateSigningKey,
                Array.from(repositoryGUIDSet), context)
        const repositoryKeysByRepositoryGUIDs: Map<Repository_GUID, RepositoryKey> = new Map()

        for (const repositoryKey of repositoryKeys) {
            repositoryKeysByRepositoryGUIDs.set(repositoryKey.repositoryGUID, repositoryKey)
        }

        return {
            keyRing,
            repositoryKeysByRepositoryGUIDs
        }
    }

    private async hashSumBlock(
        unsignedBlock: IRepositoryBlock,
        stringifiedBlock: string
    ): Promise<string> {
        const previousBlock = unsignedBlock.previousBlock
        let previousBlockHashSum = ''
        if (previousBlock) {
            previousBlockHashSum = previousBlock.hashSum
        }
        const hashSum = await this.keyUtils.sha512(previousBlockHashSum + stringifiedBlock)
        unsignedBlock.hashSum = hashSum

        return this.prependPropertyIntoSerializedJson(
            stringifiedBlock,
            "hashSum",
            hashSum
        )
    }

    private async signBlock(
        unsignedBlock: IRepositoryBlock,
        stringifiedBlock: string,
        repositoryKeysByRepositoryGUIDs: Map<Repository_GUID, RepositoryKey>,
        keyRing: IKeyRing
    ): Promise<void> {
        const history = unsignedBlock.data.history
        let repositoryGUID: Repository_GUID
        if (typeof history.repository === 'string') {
            repositoryGUID = history.repository
        } else {
            repositoryGUID = history.repository.GUID
        }
        const repositoryKey = repositoryKeysByRepositoryGUIDs
            .get(repositoryGUID)

        unsignedBlock.memberSignature = await this.keyUtils
            .sign(stringifiedBlock, repositoryKey.privateSigningKey)

        if (history.invitationPrivateSigningKey) {
            unsignedBlock.acceptanceSignature = await this.keyUtils
                .sign(stringifiedBlock, history.invitationPrivateSigningKey)
        }

        if (history.invitationPrivateSigningKey || history.isRepositoryCreation) {
            unsignedBlock.userAccountSignature = await this.keyUtils
                .sign(stringifiedBlock, keyRing.internalPrivateSigningKey, 521)
        }
    }

    private prependPropertyIntoSerializedJson(
        serializedJson: string,
        propertyName: string,
        propertyValue: string
    ): string {
        if (typeof propertyValue === "string") {
            propertyValue = `"${propertyValue}"`
        }
        return serializedJson.substring(0, 1) + `"${propertyName}":${propertyValue},` + serializedJson.substring(1)
    }
}
