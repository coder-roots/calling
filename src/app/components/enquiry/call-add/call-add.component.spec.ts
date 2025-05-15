import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallAddComponent } from './call-add.component';

describe('CallAddComponent', () => {
  let component: CallAddComponent;
  let fixture: ComponentFixture<CallAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallAddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CallAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
