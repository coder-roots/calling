import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnquiryDropComponent } from './enquiry-drop.component';

describe('EnquiryDropComponent', () => {
  let component: EnquiryDropComponent;
  let fixture: ComponentFixture<EnquiryDropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnquiryDropComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnquiryDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
