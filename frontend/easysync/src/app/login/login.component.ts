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

  constructor(private authService: AuthService, private tokenStorage: TokenStorageService, private router: Router,private appComponent:AppComponent,public auth:AuthService,private deviceService: DeviceDetectorService) { }

  

  ngOnInit(): void {

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
        console.log(data);
        var dataMap = new Map(Object.entries(data));
        this.tokenStorage.saveToken(dataMap.get('token'));
        this.tokenStorage.saveUser(dataMap.get('user'));

        this.isLoginFailed = false;
        this.auth.isLoggedIn = true;
        this.reloadPage();

        /*
        this.tokenStorage.setPBKDF2Key(dataMap.get('pbkdf2'));
        */

        this.auth.password = this.form.password;
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



