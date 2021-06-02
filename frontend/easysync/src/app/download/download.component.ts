import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Download } from 'src/app/_services/download';
import { AppComponent } from '../app.component';
import { UserService } from '../_services/user.service';

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.css']
})
export class DownloadComponent implements OnInit {

  //STATES
  errorNotFound:boolean = false;
  passwordMatch:boolean = false;
  decrpytingFile:boolean = false;
  downloadingFile:boolean = false;

  errorString:string;

  form:any = {};

  password: string;
  url:string;

  file:any;
  name:string;
  size:string;

  download$: Observable<Download>;
  progressBarDownload:boolean = false;

  constructor(private route: ActivatedRoute,private userService: UserService,private appComponent:AppComponent) { }

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      this.url = params['url'];
      this.password = params['!'];
    });

    this.userService.getFileToDownload(this.url,this.password).subscribe(
      data =>{
        var dataMap = new Map(Object.entries(data));
        this.file = dataMap.get('result');
        this.name = this.file.name;
        this.size = this.appComponent.convertBytesSize(this.file.size);
        let passwordValue = dataMap.get('password');
        console.log(passwordValue);
        if(passwordValue === true){
          this.passwordMatch = true;
        }else{
          this.errorString = dataMap.get('message');
          this.passwordMatch = false;
        }
        //this.errorNotFound = true;
        //console.log(dataMap);
        console.log(data);
      },err =>{
        //this.errorNotFound = true;
        
      }
    )
  }

  download(){

  }

}
