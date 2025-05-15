import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmissionAddComponent } from './admission-add.component';

describe('AdmissionAddComponent', () => {
  let component: AdmissionAddComponent;
  let fixture: ComponentFixture<AdmissionAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdmissionAddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmissionAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
