import { TestBed, inject } from '@angular/core/testing';

import { CoreUtil } from './core-util.service';

describe('CoreUtilService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoreUtil]
    });
  });

  it('should ...', inject([CoreUtil], (service: CoreUtil) => {
    expect(service).toBeTruthy();
  }));
});
