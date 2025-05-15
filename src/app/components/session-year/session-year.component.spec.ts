import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionYearComponent } from './session-year.component';

describe('SessionYearComponent', () => {
  let component: SessionYearComponent;
  let fixture: ComponentFixture<SessionYearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SessionYearComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
