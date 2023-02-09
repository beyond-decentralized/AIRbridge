import { KeyRingManager } from '@airbridge/keyring/dist/app/bundle'
import { app } from '@airport/direction-indicator'
import { KeyUtils } from '@airport/ground-control'
import { RepositoryDao, RepositoryMemberDao } from '@airport/holding-pattern/dist/app/bundle'
import { HISTORY_MANAGER, TerminalStore, TERMINAL_SESSION_MANAGER, UserStore } from '@airport/terminal-map'
import { UserAccountManager } from '@airport/travel-document-checkpoint/dist/app/bundle'
import { RepositoryMaintenanceManager } from '../api/RepositoryMaintenanceManager'
import { SSOManager } from '../api/SSOManager'
import { application } from './app-declaration'

const sso = app(application)

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
    keyUtils: KeyUtils,
    keyRingManager: KeyRingManager,
    // signInAdapter: ISignInAdapter,
    terminalStore: TerminalStore,
    userAccountManager: UserAccountManager,
    userStore: UserStore
})
