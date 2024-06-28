import { IKeyRing, KeyRing_Email } from "@airbridge/data-model";
import { IKeyRingManager } from "@airbridge/keyring/dist/app/bundle";
import { IContext, Inject, Injected } from "@airport/direction-indicator";
import { IKeyUtils } from "@airport/ground-control";
import { IUserAccountInfo, IUserSession, TerminalStore, UserStore } from '@airport/terminal-map'
import { IUserAccountManager, TerminalDao } from "@airport/travel-document-checkpoint/dist/app/bundle";
import { ISignInAdapter } from "../signIn/SignInAdapter";
import { ActorDao } from "@airport/holding-pattern/dist/app/bundle";

export interface ISSOManager {

    signUp(
        userAccountInfo: IUserAccountInfo,
        context: IContext
    ): Promise<void>

    signIn(
        email: string
    ): Promise<IKeyRing>

}

@Injected()
export class SSOManager
    implements ISSOManager {

    @Inject()
    actorDao: ActorDao

    @Inject()
    keyUtils: IKeyUtils

    @Inject()
    keyRingManager: IKeyRingManager

    @Inject()
    signInAdapter: ISignInAdapter

    @Inject()
    terminalDao: TerminalDao

    @Inject()
    terminalStore: TerminalStore

    @Inject()
    userAccountManager: IUserAccountManager

    @Inject()
    userStore: UserStore

    async signUp(
        userAccountInfo: IUserAccountInfo,
        context: IContext
    ): Promise<void> {
        if (this.terminalStore.getIsSyncNode()) {
            throw new Error('Implement');
        }

        const allSessions = this.userStore.getAllSessions()
        let session: IUserSession = {
            currentRootTransaction: null,
            currentTransaction: null,
            keyRing: null,
            userAccount: null
        }
        allSessions.push(session)

        context.transaction.actor = this.terminalStore.getFrameworkActor()

        const signingKey = await this.keyUtils.getSigningKey(521)

        const accountPublicSigningKey = signingKey.public
        const username = userAccountInfo.username
        const hashedObject = {
            accountPublicSigningKey,
            username
        }
        const sha1sum = await this.keyUtils.sha1(JSON.stringify(hashedObject))

        const { userAccount } = await this.userAccountManager
            .addUserAccount(username, accountPublicSigningKey,
                sha1sum, context)
        session.userAccount = userAccount
        context.transaction.actor.userAccount = userAccount
        await this.actorDao.updateUserAccount(userAccount,
            context.transaction.actor, context)

        // FIXME: replace with passed in key
        const userPrivateKey = await this.keyUtils.getEncryptionKey()

        const keyRing = await this.keyRingManager.getKeyRing(
            userPrivateKey, signingKey.private, context)

        const terminal = this.terminalStore.getTerminal()
        terminal.owner = userAccount
        await this.terminalDao.updateOwner(
            terminal, userAccount, context)

        const sessionMapByAccountPublicSigningKey = this.userStore
            .getSessionMapByAccountPublicSigningKey()
        sessionMapByAccountPublicSigningKey.set(
            userAccount.accountPublicSigningKey, session)

        this.userStore.state.next({
            allSessions,
            sessionMapByAccountPublicSigningKey
        })
    }

    async login(
        userAccount: IUserAccountInfo
    ): Promise<void> {
        // context.transaction.actor.userAccount = userAccount
        throw new Error(`Implement`);
    }

    async signIn(
        email: KeyRing_Email
    ): Promise<IKeyRing> {
        throw new Error(`Implement`);
        // return await this.signInAdapter.getKeyRing({
        //     email
        // })
    }

}
