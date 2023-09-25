import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserInterfacesPage } from './user-interfaces.page';

describe('UserInterfacesPage', () => {
  let component: UserInterfacesPage;
  let fixture: ComponentFixture<UserInterfacesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(UserInterfacesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
