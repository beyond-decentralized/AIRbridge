import { RepositoryMaintenanceManager, SSOManager } from '../generated/api/api';
import { application } from './app-declaration';

export * from '../generated/api/api'

export * from '../generated/qApplication';
// export * from '../generated/qInterfaces';
// export * from '../generated/vInterfaces';
// export * from '../generated/interfaces';

for (let apiStub of [
    RepositoryMaintenanceManager,
    SSOManager
]) {
    (apiStub as any).application = application
}
