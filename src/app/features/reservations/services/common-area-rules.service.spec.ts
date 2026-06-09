import { TestBed } from '@angular/core/testing';

import { CommonAreaRulesService } from './common-area-rules.service';

describe('CommonAreaRulesService', () => {
  let service: CommonAreaRulesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommonAreaRulesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
