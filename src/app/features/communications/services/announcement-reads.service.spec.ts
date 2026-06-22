import { TestBed } from '@angular/core/testing';

import { AnnouncementReadsService } from './announcement-reads.service';

describe('AnnouncementReadsService', () => {
  let service: AnnouncementReadsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnnouncementReadsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
