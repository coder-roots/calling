import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnquiryAddMultipleComponent } from './enquiry-add-multiple.component';

describe('EnquiryAddMultipleComponent', () => {
  let component: EnquiryAddMultipleComponent;
  let fixture: ComponentFixture<EnquiryAddMultipleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnquiryAddMultipleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnquiryAddMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
