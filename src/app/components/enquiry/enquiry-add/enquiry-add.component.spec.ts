import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnquiryAddComponent } from './enquiry-add.component';

describe('EnquiryAddComponent', () => {
  let component: EnquiryAddComponent;
  let fixture: ComponentFixture<EnquiryAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnquiryAddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnquiryAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
