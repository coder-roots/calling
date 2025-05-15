import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculateFeeComponent } from './calculate-fee.component';

describe('CalculateFeeComponent', () => {
  let component: CalculateFeeComponent;
  let fixture: ComponentFixture<CalculateFeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalculateFeeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculateFeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
