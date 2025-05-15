import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallAddMultipleComponent } from './call-add-multiple.component';

describe('CallAddMultipleComponent', () => {
  let component: CallAddMultipleComponent;
  let fixture: ComponentFixture<CallAddMultipleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallAddMultipleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CallAddMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
