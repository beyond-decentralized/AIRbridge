import { Component, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { StateService } from '../../services/state.service';
import { IRepository } from '@airport/server';

@Component({
  selector: 'app-repositories',
  templateUrl: './repositories.page.html',
  styleUrls: ['./repositories.page.scss'],
})
export class RepositoriesPage implements OnInit {

  repositories = toSignal(this.stateService.repositories$, {
    initialValue: []
  })

  constructor(
    private stateService: StateService
  ) { }

  ngOnInit() {
  }

  trackRepository(
    _index: number,
    repository: IRepository
  ): string {
    return repository.GUID
  }

}
