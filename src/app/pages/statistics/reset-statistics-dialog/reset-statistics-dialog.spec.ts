import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetStatisticsDialog } from './reset-statistics-dialog';

describe('ResetStatisticsDialog', () => {
  let component: ResetStatisticsDialog;
  let fixture: ComponentFixture<ResetStatisticsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetStatisticsDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetStatisticsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
