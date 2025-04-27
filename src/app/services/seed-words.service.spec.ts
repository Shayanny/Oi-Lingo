import { TestBed } from '@angular/core/testing';

import { SeedWordsService } from './seed-words.service';

describe('SeedWordsService', () => {
  let service: SeedWordsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeedWordsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
