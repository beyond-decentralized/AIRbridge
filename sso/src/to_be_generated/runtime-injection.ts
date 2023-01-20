import { KeyRingManager } from '@airbridge/keyring/dist/app/bundle'
import { domain } from '@airport/direction-indicator'
import { KeyUtils } from '@airport/ground-control'
import { RepositoryMemberDao } from '@airport/holding-pattern/dist/app/bundle'
import { HISTORY_MANAGER, TerminalStore, TERMINAL_SESSION_MANAGER, UserStore } from '@airport/terminal-map'
import { UserAccountManager } from '@airport/travel-document-checkpoint/dist/app/bundle'
import { RepositoryMaintenanceManager } from '../api/RepositoryMaintenanceManager'
import { SSOManager } from '../api/SSOManager'

const sso = domain('airbridge').app('sso')

sso.register(RepositoryMaintenanceManager, SSOManager)

sso.setDependencies(RepositoryMaintenanceManager, {
    historyManager: HISTORY_MANAGER,
    keyRingManager: KeyRingManager,
    keyUtils: KeyUtils,
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
