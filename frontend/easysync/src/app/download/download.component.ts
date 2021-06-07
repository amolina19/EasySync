import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../_services/user.service';
import { DownloadService } from './../_services/download.service';
import { Download } from './../_services/download';


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
  codeEntered:boolean=false;
  passwordValue:boolean = false;

  errorString:string;

  form:any = {};

  password: string;
  url:string;

  file:any;
  name:string;
  size:string;

  download$: Observable<Download>;
  progressBar:boolean = false;

  downloadIDFile: string;
  downloadName: string;
  downloadSize: string;
  downloadProgressSize: string;
  downloadSizeNumber:number;
  downloadFinished:boolean = false;
  downloadIsFolder:boolean;
  

  constructor(private route: ActivatedRoute,private userService: UserService,private downloads: DownloadService) { }

  ngOnInit(): void {

    this.progressBar = true;

    this.route.queryParams.subscribe(params => {
      this.url = params['url'];
      this.password = params['!'];
    });

    this.userService.getFileToDownload(this.url,this.password).subscribe(
      data =>{
        this.progressBar = false;
        var dataMap = new Map(Object.entries(data));
        this.file = dataMap.get('result');
        this.name = this.file.name;
        this.size = this.convertBytesSize(this.file.size);
        this.passwordValue = dataMap.get('password');
        if(this.passwordValue === true){
          this.passwordMatch = true;
        }else{
          this.errorString = dataMap.get('message');
          this.passwordMatch = false;
          
        }
        //this.errorNotFound = true;
        //console.log(dataMap);
        console.log(data);
      },err =>{
        this.errorNotFound = true;
        this.progressBar = false;
        this.passwordMatch = false;
        this.downloadingFile = false;
        this.decrpytingFile = false;
      }
    )
  }

  setDownload(url: string,filename:string) {
    this.download$ = this.downloads.download(url,filename);
    this.errorNotFound = false;
    this.passwordMatch = true;
    this.downloadingFile = true;
    this.decrpytingFile = false;
  }

  download(){
    this.downloadName = this.file.name;

    if(!this.passwordValue){
      this.codeEntered = true;
      this.downloadIDFile = this.userService.API_FILES+"download?url="+this.url+"&&password="+this.form.password;
    }else{
      this.downloadIDFile = this.userService.API_FILES+"download?url="+this.url+"&&password="+this.password;
    }
    
    this.downloadSize = this.convertBytesSize(this.file.size);
    this.downloadSizeNumber = Number.parseInt(this.file.size);
    if(this.file.isFolder){
      this.downloadIsFolder = true;
    }else{
      this.downloadIsFolder = false;
    }
    this.errorNotFound = false;
    this.passwordMatch = true;
    this.downloadingFile = true;
    this.decrpytingFile = false;
    this.setDownload(this.downloadIDFile,this.downloadName);
  }

  cerrarVentana():void{
    this.download$ = null;
    this.downloadName = null;
    this.downloadSize = null;
    this.downloadProgressSize = null;
    this.downloadSizeNumber = null;
  }

  cancelar():void{
    this.download$ = null;
    this.downloadName = null;
    this.downloadSize = null;
    this.downloadProgressSize = null;
    this.downloadSizeNumber = null;
  }

  convertBytesSize(bytes:any):string{
    let bytesNumber = Number.parseInt(bytes);
    let returnString = "";
    if(bytesNumber < 1024){
      returnString = (bytesNumber).toFixed(2)+" Bytes";
    }else if(bytesNumber >= 1024 && bytesNumber < (1024*1024)){
      returnString = (bytesNumber/1024).toFixed(2)+" KB";
    }else if(bytesNumber >= (1024*1024) && bytesNumber < (1024*1024*1024)){
      returnString = (bytesNumber/1024/1024).toFixed(2)+" MB";
    }else if(bytesNumber >= (1024*1024*1024) && bytesNumber < (1024*1024*1024*1024)){
      returnString = (bytesNumber/1024/1024/1024).toFixed(2)+" GB";
    }else if(bytesNumber >= (1024*1024*1024*1024) && bytesNumber < (1024*1024*1024*1024*1024)){
      returnString = (bytesNumber/1024/1024/1024/1024).toFixed(2)+" TB";
    }else if(bytesNumber >= (1024*1024*1024*1024*1024) && bytesNumber < (1024*1024*1024*1024*1024*1024)){
      returnString = (bytesNumber/1024/1024/1024/1024/1024).toFixed(2)+" PTB";
    }
    return returnString;
  }

  convertBytesSizeWithoutStr(bytes:any):number{
    let bytesNumber = Number.parseFloat(bytes);
    let returnSize = null;
    if(bytesNumber < 1024){
      returnSize = (bytesNumber).toFixed(2);
    }else if(bytesNumber >= 1024 && bytesNumber < (1024*1024)){
      returnSize = (bytesNumber/1024).toFixed(2);
    }else if(bytesNumber >= (1024*1024) && bytesNumber < (1024*1024*1024)){
      returnSize = (bytesNumber/1024/1024).toFixed(2);
    }else if(bytesNumber >= (1024*1024*1024) && bytesNumber < (1024*1024*1024*1024)){
      returnSize = (bytesNumber/1024/1024/1024).toFixed(2);
    }else if(bytesNumber >= (1024*1024*1024*1024) && bytesNumber < (1024*1024*1024*1024*1024)){
      returnSize = (bytesNumber/1024/1024/1024/1024).toFixed(2);
    }else if(bytesNumber >= (1024*1024*1024*1024*1024) && bytesNumber < (1024*1024*1024*1024*1024*1024)){
      returnSize = (bytesNumber/1024/1024/1024/1024/1024).toFixed(2);
    }
    return returnSize;
  }

}
