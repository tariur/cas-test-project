import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import {MatDividerModule} from '@angular/material/divider';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDividerModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private userService = inject(UserService);
  private authService = inject(Auth);
  private router = inject(Router);

  //Template prints loginError, after submitting invalid loginForm
  loginError = '';

  //Login reactive form
  private formBuilder = inject(FormBuilder);
  loginForm = this.formBuilder.group({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  //Email property of loginForm
  get email(){
    return this.loginForm.get('email');
  }
  
  signupPage(){
    this.router.navigateByUrl('/signup');
  }

  //Sign in with Google
  signInWithGoogle(){
    this.authService.googleSignIn()
      .then(userCredential =>{
        const user = userCredential.user;
        this.userService.createUserData(user.email || '', user.uid);
        this.userService.changeStatusOnline(user.uid);
        this.router.navigateByUrl('/home');
      })
      .catch(error => {
        console.error('Google login error:', error.message);
      });
  }

  //Sign in with Facebook
  signInWithFacebook(){
    this.authService.facebookSignIn().then(userCredential =>{
      const user = userCredential.user;
      this.userService.createUserData(user.email || '', user.uid);
      this.userService.changeStatusOnline(user.uid);
      this.router.navigateByUrl('/home');
    }).catch(error =>{
      console.error('Facebook login error: ', error.message);
    });
  }

  //Logs in user using auth.ts service login() function
  onLogin(){
    const emailValue = this.loginForm.get('email')?.value  || '';
    const passwordValue = this.loginForm.get('password')?.value || '';

    this.authService.login(emailValue, passwordValue)
      .then(userCredential =>{
        const user = userCredential.user;
        this.userService.changeStatusOnline(user.uid);
        console.log('user logged in');
        this.router.navigateByUrl('/home');
      })
      .catch(() => {
        this.loginError = 'Email and/or password incorrect';
      });
  }
}
