import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomStatisticsComponent } from './room-statistics-component';

describe('RoomStatisticsComponent', () => {
  let component: RoomStatisticsComponent;
  let fixture: ComponentFixture<RoomStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomStatisticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
