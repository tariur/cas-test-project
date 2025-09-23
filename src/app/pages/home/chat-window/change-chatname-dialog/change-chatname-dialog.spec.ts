import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeChatnameDialog } from './change-chatname-dialog';

describe('ChangeChatnameDialog', () => {
  let component: ChangeChatnameDialog;
  let fixture: ComponentFixture<ChangeChatnameDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeChatnameDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeChatnameDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
