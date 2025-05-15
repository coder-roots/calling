import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionYearAddComponent } from './session-year-add.component';

describe('SessionYearAddComponent', () => {
  let component: SessionYearAddComponent;
  let fixture: ComponentFixture<SessionYearAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SessionYearAddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionYearAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
