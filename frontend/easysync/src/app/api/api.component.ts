import { Component, OnInit } from '@angular/core';
import { UserService } from '../_services/user.service';

@Component({
  selector: 'app-api',
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.css']
})
export class ApiComponent implements OnInit {

  constructor(private userService: UserService) { }

  API_DOCUMENT:any = [];
  panelOpenState:boolean = false;




  ngOnInit(): void {

    this.userService.getAPI().subscribe(data => {
      this.API_DOCUMENT = data;
      console.log(this.API_DOCUMENT); 
    });
    
  }

}
