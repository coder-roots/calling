import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeAddMultipleDialogComponent } from './employee-add-multiple-dialog.component';

describe('EmployeeAddMultipleDialogComponent', () => {
  let component: EmployeeAddMultipleDialogComponent;
  let fixture: ComponentFixture<EmployeeAddMultipleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeAddMultipleDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeAddMultipleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
