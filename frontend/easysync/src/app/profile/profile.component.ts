import { Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { TokenStorageService } from '../_services/token-storage.service';
import { UserService } from '../_services/user.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  currentUser: any;
  currentToken: any;
  panelOpenState:boolean;
  createdDateString:string;
  lastLoginDateString:string;
  

  constructor(private router:Router,private authService:AuthService,private tokenService:TokenStorageService,private userService:UserService) { }

  ngOnInit(): void {


    if(!this.tokenService.userExits()){
      this.router.navigate(['/login']);
    }
     
    //this.authService.updateUserInfo();
    this.currentUser = this.tokenService.getUser();
    this.createdDateString = this.userService.dateToString(this.currentUser.created_at);
    this.lastLoginDateString = this.userService.dateToString(this.currentUser.last_login);

    console.log(this.createdDateString);
    console.log(this.lastLoginDateString);
  }

}
