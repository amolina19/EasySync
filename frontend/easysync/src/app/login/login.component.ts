import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { TokenStorageService } from '../_services/token-storage.service';


import {Router} from "@angular/router"
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  form: any = {};
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];
  hide = true;
  user:any;

  constructor(private authService: AuthService, private tokenStorage: TokenStorageService, private router: Router,private appComponent:AppComponent,public auth:AuthService) { }

  

  ngOnInit(): void {

    if(this.tokenStorage.userExits()){
      this.router.navigate(['/home']);
    }
  }

  onSubmit(){
    this.appComponent.progressBar = true;
    this.authService.login(this.form).subscribe(
      data => {
        console.log(data);
        var dataMap = new Map(Object.entries(data));
        this.tokenStorage.saveToken(dataMap.get('token'));
        this.tokenStorage.saveUser(dataMap.get('user'));

        this.isLoginFailed = false;
        this.auth.isLoggedIn = true;
        this.reloadPage();

        this.tokenStorage.setPBKDF2Key(dataMap.get('pbkdf2'));
        
        
      },
      err =>{
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
        this.appComponent.progressBar = false;
      }
    );
  }

  reloadPage():void{
    window.location.reload();
  }

}



