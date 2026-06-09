import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonAreaCardComponent } from './common-area-card.component';

describe('CommonAreaCardComponent', () => {
  let component: CommonAreaCardComponent;
  let fixture: ComponentFixture<CommonAreaCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonAreaCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonAreaCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
