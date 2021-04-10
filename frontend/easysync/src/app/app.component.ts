import { Component, OnInit } from '@angular/core';
import { TokenStorageService } from './_services/token-storage.service';
import { UserService } from './_services/user.service';
import { AuthService } from './_services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'easysync';

  private roles: string[] = [];
  isLoggedIn = false;
  isActivated = false;
  activated: string = '';
  activateError: string= '';
  showAdminBoard = false;
  username: string = '';
  user: any;
  progressBar = false;

  constructor(private TokenStorageService: TokenStorageService, private userService:UserService,private authService:AuthService) {}

  ngOnInit(): void {
    this.isLoggedIn = !!this.TokenStorageService.getToken();

    if(this.isLoggedIn){
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
  }

  activateAccount():void{
    if(this.TokenStorageService.userExits()){
      console.log(Object.keys(this.user));
      var userMap = new Map(Object.entries(this.user));
      this.userService.setActivateAccount(userMap.get('_id')).subscribe(
        data =>{
          this.activated = data.message;
          this.authService.updateUserInfo().subscribe(
            data =>{
              
              var dataMap = new Map(Object.entries(data));
              this.TokenStorageService.saveToken(dataMap.get('token'));
              this.TokenStorageService.saveUser(dataMap.get('user'));
              this.user = this.TokenStorageService.getUser();
            }
          )
        },
        err => {
          this.activateError = err.error.message;
        }
       );
      //console.log(this.user);
      
    }else{
      
    }
    
  }

  moreInfo():void{

  }
}
