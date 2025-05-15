import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateSheetComponent } from './certificate-sheet.component';

describe('CertificateSheetComponent', () => {
  let component: CertificateSheetComponent;
  let fixture: ComponentFixture<CertificateSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CertificateSheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificateSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
