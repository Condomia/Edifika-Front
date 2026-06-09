import { TestBed } from '@angular/core/testing';

import { CommonAreaService } from './common-area.service';

describe('CommonAreaService', () => {
  let service: CommonAreaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommonAreaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
