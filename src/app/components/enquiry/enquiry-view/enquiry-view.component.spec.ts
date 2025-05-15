import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnquiryViewComponent } from './enquiry-view.component';

describe('EnquiryViewComponent', () => {
  let component: EnquiryViewComponent;
  let fixture: ComponentFixture<EnquiryViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnquiryViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnquiryViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
