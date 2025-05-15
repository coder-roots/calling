import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateAddDialogComponent } from './certificate-add-dialog.component';

describe('CertificateAddDialogComponent', () => {
  let component: CertificateAddDialogComponent;
  let fixture: ComponentFixture<CertificateAddDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CertificateAddDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificateAddDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
