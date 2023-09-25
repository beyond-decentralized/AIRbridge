import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserInterfacePage } from './user-interface.page';

describe('UserInterfacePage', () => {
  let component: UserInterfacePage;
  let fixture: ComponentFixture<UserInterfacePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(UserInterfacePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
