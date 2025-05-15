import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRolesPermissionsComponent } from './add-roles-permissions.component';

describe('AddRolesPermissionsComponent', () => {
  let component: AddRolesPermissionsComponent;
  let fixture: ComponentFixture<AddRolesPermissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddRolesPermissionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRolesPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
