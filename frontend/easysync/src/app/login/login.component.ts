import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { TokenStorageService } from '../_services/token-storage.service';
import { v4 as uuidv4 } from 'uuid';


import {Router} from "@angular/router"
import { AppComponent } from '../app.component';
import { DeviceDetectorService } from 'ngx-device-detector';

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
  t2aLogin:boolean = false;

  constructor(private authService: AuthService, private tokenStorage: TokenStorageService, private router: Router,private appComponent:AppComponent,public auth:AuthService,private deviceService: DeviceDetectorService) { }

  

  ngOnInit(): void {

    this.t2aLogin = false;

    if(this.tokenStorage.userExits()){
      this.router.navigate(['/home']);
    }

    if(this.tokenStorage.getDeviceUUID() === null){
      let uuid = uuidv4();
      this.tokenStorage.setDeviceUUID(uuid);
      this.tokenStorage.setDevice(this.deviceService.getDeviceInfo());
    }
    
  }

  onSubmit(){
    this.appComponent.progressBar = true;
    this.authService.login(this.form).subscribe(
      data => {
        if(data.user === undefined){
          this.tokenStorage.setTokenT2A(data.token);
          this.t2aLogin = true;
          this.appComponent.progressBar = false;
        }else{
          var dataMap = new Map(Object.entries(data));
          this.tokenStorage.saveToken(dataMap.get('token'));
          this.tokenStorage.saveUser(dataMap.get('user'));
          this.tokenStorage.setKeys(dataMap.get('keys'));
          this.tokenStorage.setPBKDF2Key(dataMap.get('pbkdf2'));
  
          this.isLoginFailed = false;
          this.auth.isLoggedIn = true;
          this.reloadPage();
        }
      },
      err =>{
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
        this.appComponent.progressBar = false;
      }
    );
  }

  onSubmitT2A(){
    this.appComponent.progressBar = true;
    this.authService.loginByT2A(this.tokenStorage.getTokenT2A(),this.form.t2acode).subscribe(
      data => {
        console.log(data);
        this.t2aLogin = false;
        var dataMap = new Map(Object.entries(data));
        this.tokenStorage.saveToken(dataMap.get('token'));
        this.tokenStorage.saveUser(dataMap.get('user'));
        this.tokenStorage.setKeys(dataMap.get('keys'));
        this.tokenStorage.setPBKDF2Key(dataMap.get('pbkdf2'));
        this.tokenStorage.removeTokenT2A();
        this.isLoginFailed = false;
        this.auth.isLoggedIn = true;
        this.reloadPage();
      },
      err =>{
        console.log(err);
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
        this.appComponent.progressBar = false;
      }
    );
  }

  volver(){
    this.t2aLogin = false;
    this.tokenStorage.removeTokenT2A();
  }

  reloadPage():void{
    window.location.reload();
  }

}



