import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollegeCourseAddComponent } from './college-course-add.component';

describe('CollegeCourseAddComponent', () => {
  let component: CollegeCourseAddComponent;
  let fixture: ComponentFixture<CollegeCourseAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollegeCourseAddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollegeCourseAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
