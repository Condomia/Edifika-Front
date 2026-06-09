import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonAreaListComponent } from './common-area-list.component';

describe('CommonAreaListComponent', () => {
  let component: CommonAreaListComponent;
  let fixture: ComponentFixture<CommonAreaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonAreaListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonAreaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
