import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegDefaulterListComponent } from './reg-defaulter-list.component';

describe('RegDefaulterListComponent', () => {
  let component: RegDefaulterListComponent;
  let fixture: ComponentFixture<RegDefaulterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegDefaulterListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegDefaulterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
