import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnquiryConfirmAdmissionComponent } from './enquiry-confirm-admission.component';

describe('EnquiryConfirmAdmissionComponent', () => {
  let component: EnquiryConfirmAdmissionComponent;
  let fixture: ComponentFixture<EnquiryConfirmAdmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnquiryConfirmAdmissionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnquiryConfirmAdmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
