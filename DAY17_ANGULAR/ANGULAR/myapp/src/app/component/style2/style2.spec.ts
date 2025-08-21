import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Style2 } from './style2';

describe('Style2', () => {
  let component: Style2;
  let fixture: ComponentFixture<Style2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Style2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Style2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
