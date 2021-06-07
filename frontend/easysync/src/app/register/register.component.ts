import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import {Router} from "@angular/router";
import { TokenStorageService } from '../_services/token-storage.service';

import {FormControl, Validators} from '@angular/forms';
import { AppComponent } from '../app.component';
import { MatDialog } from '@angular/material/dialog';
import { RegisterDialogComponent } from './modals/register-dialog/register-dialog.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  form:any = {};
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  hide = true;

  secondFormGroup:any = {};
  firstFormGroup:any = {};
  //acceptedPolicy:boolean = false;

  constructor(private authService: AuthService, private router:Router, private tokenStorage:TokenStorageService,private appComponent:AppComponent,private dialog:MatDialog) { }
    
  ngOnInit(): void {
    if(this.tokenStorage.userExits()){
      this.router.navigate(['/home']);
    }
  }

  openDialog() {
    const dialogRef = this.dialog.open(RegisterDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        //this.acceptedPolicy = true;
        this.onSubmit();
      }
    });
  }

  onSubmit():void{
    this.appComponent.progressBar = true;
    console.log(this.form);
    this.authService.register(this.form).subscribe(
      data => {
        console.log(data);
        this.isSuccessful = true;
        this.isSignUpFailed = false;
        //this.router.navigate(['/login']);
        this.appComponent.progressBar = false;
      },
      err => {
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
        this.appComponent.progressBar = false;
      }
      
    )
  }

}
