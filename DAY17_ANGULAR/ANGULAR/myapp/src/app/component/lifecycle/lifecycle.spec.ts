import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lifecycle } from './lifecycle';

describe('Lifecycle', () => {
  let component: Lifecycle;
  let fixture: ComponentFixture<Lifecycle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Lifecycle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Lifecycle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
