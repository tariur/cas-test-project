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

    //Fetching signupForm properties
    const passwordValue = this.signupForm.get('password')?.value || '';
    const rePasswordValue = this.signupForm.get('passwordAgain')?.value || '';
    const emailValue = this.signupForm.get('email')?.value  || '';

    if(passwordValue !== rePasswordValue){
      this.signupError = 'Passwords are not mathcing'
      return;
    }

    //Signing up user, using auth.ts service signup() function
    this.authService.signup(emailValue, passwordValue)
      .then(userCredential => {
        console.log('user signed up');

        //user data stored in const user
        const user = userCredential.user;
        //Adds user data to Firestore, using user-service.ts createUserData()
        this.userService.createUserData(user.email || '', user.uid);
        this.router.navigateByUrl('/home');
      })
      .catch(error => {
        switch(error.code){
          case 'auth/email-already-in-use':
            this.signupError = 'Email already in use';
            break;
          case 'auth/weak-password':
            this.signupError = 'Password should be at least 6 characters';
            break;
          default:
            console.error('Signup error:', error.message);
            break;
        }
      });
  }

}
