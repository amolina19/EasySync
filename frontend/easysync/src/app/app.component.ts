import { Component, Inject, OnInit } from '@angular/core';
import { TokenStorageService } from './_services/token-storage.service';
import { UserService } from './_services/user.service';
import { AuthService } from './_services/auth.service';
import { FileService } from './_services/file.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'easysync';
  isActivated = true;
  activated: string = '';
  activateError: string= '';
  showAdminBoard = false;
  username: string = '';
  user: any;
  progressBar = false;

  constructor(private TokenStorageService: TokenStorageService, private userService:UserService,public auth:AuthService, public fileService: FileService) {}

  ngOnInit(): void {

    this.auth.isLoggedIn = !!this.TokenStorageService.getToken();

    if(this.auth.isLoggedIn){
      this.user = this.TokenStorageService.getUser();
      //this.roles = this.user.roles;
      this.isActivated = this.user.activated;
      //this.showAdminBoard = this.roles.includes('ROLE_ADMIN');
      this.username = this.user.username;
    }
  }
  

  logout():void{
    this.TokenStorageService.signOut();
    window.location.reload();
    this.auth.isLoggedIn = false;
  }

  activateAccount():void{
    if(this.TokenStorageService.userExits()){
      this.userService.setActivateAccount(this.TokenStorageService.getToken()).subscribe(
        data =>{
          this.activated = data.message;
          this.auth.updateUserInfo();
        }
       );
      //console.log(this.user);
      
    }else{
      
    }
    
  }

  moreInfo():void{

  }
}
