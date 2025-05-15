import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeCourseDialogComponent } from './change-course-dialog.component';

describe('ChangeCourseDialogComponent', () => {
  let component: ChangeCourseDialogComponent;
  let fixture: ComponentFixture<ChangeCourseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeCourseDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeCourseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
