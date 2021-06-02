import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppComponent } from '../app.component';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-activate',
  templateUrl: './activate.component.html',
  styleUrls: ['./activate.component.css']
})
export class ActivateComponent implements OnInit {

  token:string;
  successFull:boolean = null;
  successMessage:string;
  errorMessage:string;
  constructor(private route: ActivatedRoute,private auth:AuthService,private appComponent:AppComponent) { }

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      console.log(this.token);

      this.appComponent.progressBar = true;
      this.auth.activate(this.token).subscribe(
        data =>{
          var dataMap = new Map(Object.entries(data));
          this.successMessage = dataMap.get('message');
          this.successFull = true;
          this.appComponent.progressBar = false;
        },err =>{
          this.errorMessage = err.error.message;
          this.successFull = false;
          this.appComponent.progressBar = false;
        });
      
    });
  }

}
