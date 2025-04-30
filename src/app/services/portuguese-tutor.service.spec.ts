import { TestBed } from '@angular/core/testing';

import { PortugueseTutorService } from './portuguese-tutor.service';

describe('PortugueseTutorService', () => {
  let service: PortugueseTutorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortugueseTutorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
