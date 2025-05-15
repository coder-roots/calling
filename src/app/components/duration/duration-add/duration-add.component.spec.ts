import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DurationAddComponent } from './duration-add.component';

describe('DurationAddComponent', () => {
  let component: DurationAddComponent;
  let fixture: ComponentFixture<DurationAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DurationAddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DurationAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
