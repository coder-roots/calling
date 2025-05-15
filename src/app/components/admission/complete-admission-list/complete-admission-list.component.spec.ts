import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteAdmissionListComponent } from './complete-admission-list.component';

describe('CompleteAdmissionListComponent', () => {
  let component: CompleteAdmissionListComponent;
  let fixture: ComponentFixture<CompleteAdmissionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompleteAdmissionListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompleteAdmissionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
