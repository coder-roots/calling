import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmissionViewFeeComponent } from './admission-view-fee.component';

describe('AdmissionViewFeeComponent', () => {
  let component: AdmissionViewFeeComponent;
  let fixture: ComponentFixture<AdmissionViewFeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdmissionViewFeeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmissionViewFeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
