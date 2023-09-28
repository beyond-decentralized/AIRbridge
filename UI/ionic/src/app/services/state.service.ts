import { IApplication, IRepository, Repository_GUID, airportApi } from '@airport/server'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class StateService {

  isUiShown$ = new BehaviorSubject(false)

  uiLocation$ = new BehaviorSubject('')

  isLoggedIn$ = new BehaviorSubject(false)

  currentUiUrl$ = new BehaviorSubject('')

  iframe: HTMLIFrameElement = null as any

  private repositories$: Observable<IRepository[]> = null as any

  private applications$: Observable<IApplication[]> = null as any

  constructor() {
  }

  async getRepositories(): Promise<Observable<IRepository[]>> {
    if (this.repositories$) {
      return this.repositories$
    }

    this.repositories$ = await airportApi.getRepositories()

    return this.repositories$
  }

  async getApplications(): Promise<Observable<IApplication[]>> {
    if (this.applications$) {
      return this.applications$
    }

    this.applications$ = await airportApi.getAllApplications()

    return this.applications$
  }

  getRepository$(
    repositoryGuid: Repository_GUID
  ): Observable<IRepository> {

    return airportApi.getRepository(repositoryGuid)
  }
}
