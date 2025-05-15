import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabAddComponent } from './lab-add.component';

describe('LabAddComponent', () => {
  let component: LabAddComponent;
  let fixture: ComponentFixture<LabAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabAddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
