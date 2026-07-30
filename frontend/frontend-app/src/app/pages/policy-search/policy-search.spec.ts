import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicySearch } from './policy-search';

describe('PolicySearch', () => {
  let component: PolicySearch;
  let fixture: ComponentFixture<PolicySearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicySearch],
    }).compileComponents();

    fixture = TestBed.createComponent(PolicySearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
