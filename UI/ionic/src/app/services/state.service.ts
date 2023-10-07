import { IApplication, IRepository, Repository_GUID, airportApi } from '@airport/server'
import { Injectable } from '@angular/core'
import { SafeResourceUrl } from '@angular/platform-browser'
import { BehaviorSubject, Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class StateService {

  isUiLoaded$ = new BehaviorSubject(false)

  isUiShown$ = new BehaviorSubject(false)

  isLoggedIn$ = new BehaviorSubject(false)

  uiFrameSource$ = new BehaviorSubject<string | SafeResourceUrl>('')

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
