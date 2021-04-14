import { Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { TokenStorageService } from '../_services/token-storage.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  currentUser: any;
  currentToken: any;
  panelOpenState:boolean;

  constructor(private router:Router,private authService:AuthService,private tokenService:TokenStorageService) { }

  ngOnInit(): void {

    if(!this.tokenService.userExits()){
      this.router.navigate(['/login']);
    }
    //this.authService.updateUserInfo();
    this.currentUser = this.tokenService.getUser();
  }

}
