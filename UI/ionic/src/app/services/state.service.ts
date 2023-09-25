import { DbApplication, IRepository, Repository_GUID, airportApi } from '@airport/server';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  isUiShown$ = new BehaviorSubject(false)

  uiLocation$ = new BehaviorSubject('')

  isLoggedIn$ = new BehaviorSubject(false)

  currentUiUrl$ = new BehaviorSubject('')

  iframe: HTMLIFrameElement = null as any

  repositories$ = airportApi.getRepositories()

  applications$ = airportApi.getAllApplications()

  constructor() {
  }

  getRepository$(
    repositoryGuid: Repository_GUID
  ): Observable<IRepository> {

    return airportApi.getRepository(repositoryGuid)
  }
}
