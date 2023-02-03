import { airportApi, DbApplication, IRepository, IUserAccountInfo } from '@airport/server'
import { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';

export function signUp(
    ev: CustomEvent<OverlayEventDetail>,
    showMessage: (message: string, duration: number) => void
): void {
    asyncSignUp(ev.detail.role, ev.detail.data, showMessage).then()
}

export function getApplications(
    setApplications: (applications: DbApplication[]) => void,
    showMessage: (message: string, duration: number) => void
) {
    getApplicationsAsync(setApplications, showMessage).then()
}

async function getApplicationsAsync(
    setApplications: (applications: DbApplication[]) => void,
    showMessage: (message: string, duration: number) => void
) {
    try {
        const applications = await airportApi.getAllApplications()
        setApplications(applications)
    } catch (e) {
        console.error(e)
        showMessage('Error retrieving Applications', 10000)
    }
}

export async function getRepositories(
    setRepositories: (repositories: IRepository[]) => void,
    showMessage: (message: string, duration: number) => void
): Promise<void> {
    try {
        const repositories = await airportApi.getRootRepositories()
        setRepositories(repositories)
    } catch (e) {
        console.error(e)
        showMessage('Error retrieving Root Repositories', 10000)
    }
}

export async function getRepository(
    repositoryId: string,
    setRepository: (repository: IRepository) => void,
    setReferencedRepositories: (repositoryGroups: IRepository[]) => void,
    showMessage: (message: string, duration: number) => void
) {
    try {
        const repository = await airportApi.getRepository(repositoryId)
        setRepository(repository)
        getReferencedRepositories(repository, setReferencedRepositories,
            showMessage)
    } catch (e) {
        console.error(e)
        showMessage('Error retrieving Repository', 10000)
    }
}

function getReferencedRepositories(
    repository: IRepository,
    setReferencedRepositories: (repositoryGroups: IRepository[]) => void,
    showMessage: (message: string, duration: number) => void
): void {
    try {
        // const referencedRepositories = repository.references.map(
        //     reference => reference.referencedRepository
        // ).sort((a, b) => {
        //     if (a.name > b.name) return 1;
        //     if (a.name < b.name) return -1;
        //     return 0;
        // })
        // setReferencedRepositories(referencedRepositories)
    } catch (e) {
        console.error(e)
        showMessage('Error getting Referenced Repositories', 10000)
    }
}

async function asyncSignUp(
    action: string | undefined,
    userAccountInfo: IUserAccountInfo,
    showMessage: (message: string, duration: number) => void
) {
    if (!action) {
        return
    }
    try {
        await airportApi.signUp(action, userAccountInfo)
    } catch (e) {
        let message = e
        if (e instanceof Error) {
            message = e.message
            console.error(e)
        }
        console.error(message)
        showMessage(message as string, 10000)
    }
}
