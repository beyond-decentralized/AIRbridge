import { airportApi, DbApplication, IRepository, IUserAccountInfo } from '@airport/server'
import { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';

let latestRepositories: IRepository[] = []
let setRepositoriesCallback: (repositories: IRepository[]) => void
airportApi.getRepositories().subscribe((
    repositories: IRepository[]
) => {
    if (setRepositoriesCallback) {
        setRepositoriesCallback(repositories)
    }
    latestRepositories = repositories
})

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
    setRepositories: (repositories: IRepository[]) => void
): Promise<void> {
    setRepositoriesCallback = setRepositories
    setRepositories(latestRepositories)
}

export async function getRepository(
    repositoryId: string,
    setRepository: (repository: IRepository) => void,
    showMessage: (message: string, duration: number) => void
) {
    try {
        const repository = await airportApi.getRepository(repositoryId)
        setRepository(repository)
    } catch (e) {
        console.error(e)
        showMessage('Error retrieving Repository', 10000)
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
