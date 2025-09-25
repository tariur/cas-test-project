import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGroupPasswordDialog } from './create-group-password-dialog';

describe('CreateGroupPasswordDialog', () => {
  let component: CreateGroupPasswordDialog;
  let fixture: ComponentFixture<CreateGroupPasswordDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateGroupPasswordDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateGroupPasswordDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
