import { Component, Inject, OnInit } from '@angular/core';
import { TokenStorageService } from './_services/token-storage.service';
import { UserService } from './_services/user.service';
import { AuthService } from './_services/auth.service';
import { FileService } from './_services/file.service';

//var pbkdf2 = require('pbkdf2');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'easysync';
  username: string = '';
  user: any;
  progressBar = false;

  constructor(private TokenStorageService: TokenStorageService, private userService:UserService,public auth:AuthService, public fileService: FileService) {}

  ngOnInit(): void {
    this.progressBar = true;

    if(this.TokenStorageService.getToken() !=null){
      this.auth.loginByToken(this.TokenStorageService.getToken()).subscribe(
        data =>{
          this.progressBar = false;
          var dataMap = new Map(Object.entries(data));
          this.TokenStorageService.saveToken(dataMap.get('token'));
          this.TokenStorageService.saveUser(dataMap.get('user'));
          this.auth.isLoggedIn = true;
          let user = dataMap.get('user');
          this.username = user.username;

          if(this.TokenStorageService.getPBKDF2Key() === null){
            //this.TokenStorageService.setPBKDF2Key(pbkdf2.pbkdf2Sync(user.password,32,1000,"SHA-512"));
          }
        },err => {
          this.progressBar = false;
          this.TokenStorageService.signOut();
          this.auth.isLoggedIn = false;
        }
      );
    }else{
      this.progressBar = false;
    }
  }

  logout():void{
    this.TokenStorageService.signOut();
    window.location.reload();
    this.auth.isLoggedIn = false;
  }
}
