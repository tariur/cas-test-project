import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeUsernameDialog } from './change-username-dialog';

describe('ChangeUsernameDialog', () => {
  let component: ChangeUsernameDialog;
  let fixture: ComponentFixture<ChangeUsernameDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeUsernameDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeUsernameDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
