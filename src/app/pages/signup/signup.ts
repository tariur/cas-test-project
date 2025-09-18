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

  constructor(private userService:UserService, private authService:Auth, private router:Router){}

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

    //Fetching signupForm properties
    const passwordValue = this.signupForm.get('password')?.value || '';
    const rePasswordValue = this.signupForm.get('passwordAgain')?.value || '';
    const emailValue = this.signupForm.get('email')?.value  || '';

    if(passwordValue !== rePasswordValue){
      console.log("passwords not matching error");
      return;
    }

    //Signing up user, using auth.ts service signup() function
    this.authService.signup(emailValue, passwordValue)
      .then(userCredential => {
        console.log('user signed up');

        //user data stored in const user
        const user = userCredential.user;
        //Adds user data to Firestore, using user-service.ts createUserData()
        this.userService.createUserData(user.email || '');
        this.router.navigateByUrl('/login');
      })
      .catch(error => {
        console.error('Signup error:', error.message);
      });
  }

}
