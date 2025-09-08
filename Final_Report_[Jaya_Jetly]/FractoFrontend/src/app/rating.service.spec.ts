import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RatingService } from './rating.service';

describe('RatingService', () => {
  let service: RatingService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RatingService]
    });
    service = TestBed.inject(RatingService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should post a rating', () => {
    const mockRating = { doctorId: 1, ratingValue: 5 };
    const mockResponse = 'Rating submitted successfully.';

    service.postRating(mockRating).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne('http://localhost:5029/api/Rating');
    expect(req.request.method).toEqual('POST');
    req.flush(mockResponse);
  });
});
