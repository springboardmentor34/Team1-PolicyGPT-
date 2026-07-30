import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovernmentDashboard } from './government-dashboard';

describe('GovernmentDashboard', () => {
  let component: GovernmentDashboard;
  let fixture: ComponentFixture<GovernmentDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovernmentDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(GovernmentDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
