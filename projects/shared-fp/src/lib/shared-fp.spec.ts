import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedFp } from './shared-fp';

describe('SharedFp', () => {
  let component: SharedFp;
  let fixture: ComponentFixture<SharedFp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedFp],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedFp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
