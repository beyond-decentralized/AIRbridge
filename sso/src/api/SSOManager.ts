import { IKeyRing } from "@airbridge/data-model";
import { IKeyRingManager } from "@airbridge/keyring/dist/app/bundle";
import { IContext, Inject, Injected } from "@airport/direction-indicator";
import { IKeyUtils } from "@airport/ground-control";
import { IUserAccountInfo, IUserSession, TerminalStore, UserStore } from '@airport/terminal-map'
import { IUserAccountManager } from "@airport/travel-document-checkpoint/dist/app/bundle";
import { ISignInAdapter } from "../signIn/SignInAdapter";
import { UserAccount_Email } from "@airport/aviation-communication";
import { Api } from "@airport/air-traffic-control";

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
    keyUtils: IKeyUtils

    @Inject()
    keyRingManager: IKeyRingManager

    @Inject()
    signInAdapter: ISignInAdapter

    @Inject()
    terminalStore: TerminalStore

    @Inject()
    userAccountManager: IUserAccountManager

    @Inject()
    userStore: UserStore

    @Api()
    async signUp(
        userAccountInfo: IUserAccountInfo,
        context: IContext
    ): Promise<void> {
        if (this.terminalStore.getIsServer()) {
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

        const { userAccount } = await this.userAccountManager
            .addUserAccount(userAccountInfo.username,
                signingKey.public, context)
        session.userAccount = userAccount

        // FIXME: replace with passed in key
        const userPrivateKey = await this.keyUtils.getEncryptionKey()

        const keyRing = await this.keyRingManager.getKeyRing(
            userPrivateKey, signingKey.private, context)

        session.keyRing = keyRing

        const sessionMapByAccountPublicSigningKey = this.userStore
            .getSessionMapByAccountPublicSigningKey()
        sessionMapByAccountPublicSigningKey.set(
            userAccount.accountPublicSigningKey, session)

        this.userStore.state.next({
            allSessions,
            sessionMapByAccountPublicSigningKey
        })
    }

    @Api()
    async login(
        userAccount: IUserAccountInfo
    ): Promise<void> {
        throw new Error(`Implement`);
    }

    @Api()
    async signIn(
        email: UserAccount_Email
    ): Promise<IKeyRing> {
        throw new Error(`Implement`);
        // return await this.signInAdapter.getKeyRing({
        //     email
        // })
    }

}
