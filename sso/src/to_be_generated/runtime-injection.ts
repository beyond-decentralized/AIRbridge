import { KeyRingManager } from '@airbridge/keyring/dist/app/bundle'
import { domain } from '@airport/direction-indicator'
import { KeyUtils } from '@airport/ground-control'
import { RepositoryMemberDao } from '@airport/holding-pattern/dist/app/bundle'
import { TerminalStore, UserStore } from '@airport/terminal-map'
import { UserAccountManager } from '@airport/travel-document-checkpoint/dist/app/bundle'
import { RepositoryMaintenanceManager } from '../api/RepositoryMaintenanceManager'
import { SSOManager } from '../api/SSOManager'

const sso = domain('airbridge').app('sso')

sso.register(RepositoryMaintenanceManager, SSOManager)

sso.setDependencies(RepositoryMaintenanceManager, {
    keyRingManager: KeyRingManager,
    repositoryMemberDao: RepositoryMemberDao,
    keyUtils: KeyUtils
})

sso.setDependencies(SSOManager, {
    keyUtils: KeyUtils,
    keyRingManager: KeyRingManager,
    // signInAdapter: ISignInAdapter,
    terminalStore: TerminalStore,
    userAccountManager: UserAccountManager,
    userStore: UserStore
})
