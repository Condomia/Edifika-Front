import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitsResidentsPage } from './units-residents-page';

describe('UnitsResidentsPage', () => {
  let component: UnitsResidentsPage;
  let fixture: ComponentFixture<UnitsResidentsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitsResidentsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitsResidentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
