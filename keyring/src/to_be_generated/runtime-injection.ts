import { app } from '@airport/direction-indicator'

import { application } from './app-declaration'
import {
    KeyRingDao,
    RepositoryKeyDao
} from '../dao/dao'
import { KeyRingManager } from '../manager/KeyRingManager'
import { RepositoryMemberDao, REPOSITORY_MANAGER } from '@airport/holding-pattern/dist/app/bundle'
import { REPOSITORY_LOADER } from '@airport/air-traffic-control'
import { TERMINAL_SESSION_MANAGER } from '@airport/terminal-map'
import { DbApplicationUtils, KeyUtils } from '@airport/ground-control'
import { MessageSigningManager } from './runtime-index'

export const keyring = app(application)

keyring.register(
    KeyRingDao,
    KeyRingManager,
    MessageSigningManager,
    RepositoryKeyDao
)

keyring.setDependencies(KeyRingManager, {
    dbApplicationUtils: DbApplicationUtils,
    keyRingDao: KeyRingDao,
    keyUtils: KeyUtils,
    repositoryKeyDao: RepositoryKeyDao,
    repositoryLoader: REPOSITORY_LOADER,
    repositoryManager: REPOSITORY_MANAGER,
    repositoryMemberDao: RepositoryMemberDao,
    terminalSessionManager: TERMINAL_SESSION_MANAGER
})

keyring.setDependencies(MessageSigningManager, {
    terminalSessionManager: TERMINAL_SESSION_MANAGER
})
