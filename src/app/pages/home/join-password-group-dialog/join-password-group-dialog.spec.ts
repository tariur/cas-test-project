import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinPasswordGroupDialog } from './join-password-group-dialog';

describe('JoinPasswordGroupDialog', () => {
  let component: JoinPasswordGroupDialog;
  let fixture: ComponentFixture<JoinPasswordGroupDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinPasswordGroupDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinPasswordGroupDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
