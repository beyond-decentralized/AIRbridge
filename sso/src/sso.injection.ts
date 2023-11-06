import { KeyRingManager } from '@airbridge/keyring/dist/app/bundle'
import { lib } from '@airport/direction-indicator'
import { KeyUtils } from '@airport/ground-control'
import { ActorDao, RepositoryDao, RepositoryMemberDao } from '@airport/holding-pattern/dist/app/bundle'
import { HISTORY_MANAGER, TerminalStore, TERMINAL_SESSION_MANAGER, UserStore } from '@airport/terminal-map'
import { TerminalDao, UserAccountManager } from '@airport/travel-document-checkpoint/dist/app/bundle'
import { RepositoryMaintenanceManager } from './logic/RepositoryMaintenanceManager'
import { SSOManager } from './logic/SSOManager'

const sso = lib('sso')

sso.register(RepositoryMaintenanceManager, SSOManager)

sso.setDependencies(RepositoryMaintenanceManager, {
    historyManager: HISTORY_MANAGER,
    keyRingManager: KeyRingManager,
    keyUtils: KeyUtils,
    repositoryDao: RepositoryDao,
    repositoryMemberDao: RepositoryMemberDao,
    terminalSessionManager: TERMINAL_SESSION_MANAGER
})

sso.setDependencies(SSOManager, {
    actorDao: ActorDao,
    keyUtils: KeyUtils,
    keyRingManager: KeyRingManager,
    // signInAdapter: ISignInAdapter,
    terminalDao: TerminalDao,
    terminalStore: TerminalStore,
    userAccountManager: UserAccountManager,
    userStore: UserStore
})
