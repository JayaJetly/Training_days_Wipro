import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all users', () => {
    const mockUsers = { '$values': [{ userId: 1, username: 'testuser1' }] };

    service.getAllUsers().subscribe(users => {
      expect(users).toEqual(mockUsers);
    });

    const req = httpTestingController.expectOne('http://localhost:5029/api/User/all');
    expect(req.request.method).toEqual('GET');
    req.flush(mockUsers);
  });

  it('should get user by id', () => {
    const mockUser = { userId: 1, username: 'testuser1' };
    const userId = 1;

    service.getUserById(userId).subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpTestingController.expectOne(`http://localhost:5029/api/User/${userId}`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockUser);
  });

  it('should update a user', () => {
    const mockUser = { userId: 1, username: 'updateduser' };

    service.updateUser(mockUser).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpTestingController.expectOne(`http://localhost:5029/api/User/${mockUser.userId}`);
    expect(req.request.method).toEqual('PUT');
    req.flush({});
  });

  it('should delete a user', () => {
    const userId = 1;

    service.deleteUser(userId).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpTestingController.expectOne(`http://localhost:5029/api/User/${userId}`);
    expect(req.request.method).toEqual('DELETE');
    req.flush({});
  });
});
