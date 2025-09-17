import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { Validators } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss'
})
export class Signup {
  constructor(private authService:Auth, private router:Router){}
  private formBuilder = inject(FormBuilder);

  signupForm = this.formBuilder.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
    passwordAgain: ['', Validators.required]
  });

  loginPage(){
    this.router.navigateByUrl('/login');
  }

  onSubmit(){

    const password = this.signupForm.get('password')?.value || '';
    const rePassword = this.signupForm.get('passwordAgain')?.value || '';

    if(password !== rePassword){
      console.log("passwords not matching error");
      return;
    }

    const emailValue = this.signupForm.get('email')?.value  || '';
    const passwordValue = this.signupForm.get('password')?.value || '';

    this.authService.signup(emailValue, passwordValue)
      .then((userCredential => {
        console.log('user signed up');
        const user = userCredential.user;
        this.router.navigateByUrl('/login');
      }))
      .catch(error => {
        console.error('Signup error:', error.message);
      });
  }

}
