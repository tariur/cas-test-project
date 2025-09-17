import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { Validators } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  constructor(private authService:Auth, private router:Router){}
  loginError:string = '';

  private formBuilder = inject(FormBuilder);
  loginForm = this.formBuilder.group({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  get email(){
    return this.loginForm.get('email');
  }
  
  signupPage(){
    this.router.navigateByUrl('/signup');
  }

  onLogin(){
    const emailValue = this.loginForm.get('email')?.value  || '';
    const passwordValue = this.loginForm.get('password')?.value || '';

    this.authService.login(emailValue, passwordValue)
      .then(userCredential =>{
        console.log('user logged in');
        this.router.navigateByUrl('/home');
      })
      .catch(error => {
        this.loginError = 'Email and/or password incorrect';
        console.error('Login error:', error.message);
      });
  }
}
