import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss'
})
export class Signup {
  private userService = inject(UserService);
  private authService = inject(Auth);
  private router = inject(Router);
  signupError = '';

  //Signup reactive form
  private formBuilder = inject(FormBuilder);
  signupForm = this.formBuilder.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
    passwordAgain: ['', Validators.required]
  });

  loginPage(){
    this.router.navigateByUrl('/login');
  }

  //Submiting signup form
  onSubmit(){
    this.signupError = '';

    const passwordValue = this.signupForm.get('password')?.value || '';
    const rePasswordValue = this.signupForm.get('passwordAgain')?.value || '';
    const emailValue = this.signupForm.get('email')?.value  || '';

    if(passwordValue !== rePasswordValue){
      this.signupError = 'Passwords are not mathcing'
      return;
    }

    this.authService.signup(emailValue, passwordValue).subscribe({
      next: userCredential =>{
        const user = userCredential.user;
        this.userService.createUserData(user.email || '', user.uid)
      },
      error: e => {
        switch(e.code){
          case 'auth/email-already-in-use':
            this.signupError = 'Email already in use';
            break;
          case 'auth/weak-password':
            this.signupError = 'Password should be at least 6 characters';
            break;
          default:
            break;
        }
      },
      complete:()=> {
        this.router.navigateByUrl('/home');
      }
    });
  }  
}
