import { Component, Inject, OnInit } from '@angular/core';
import { TokenStorageService } from './_services/token-storage.service';
import { UserService } from './_services/user.service';
import { AuthService } from './_services/auth.service';
import { FileService } from './_services/file.service';
import * as CryptoJS from 'crypto-js';
import { Observable } from 'rxjs';
import { DownloadService } from './_services/download.service';
import { DOCUMENT } from '@angular/common';
import { Download } from './_services/download';



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

  downloadIDFile: string;
  downloadName: string;
  downloadSize: string;
  downloadProgressSize: string;
  downloadSizeNumber:number;
  downloadFinished:boolean = false;
  downloadIsFolder:boolean;

  upload:boolean = false;
  uploadFinished:boolean = false;
  uploadState:string;
  uploadName:string;
  uploadSize:string;
  uploadProgress: number;
  uploadTotal:string;
  uploaded:string;
  uploadPost:any;

  download$: Observable<Download>;
  //private keySize = 256;
  //private iterations = 100;
  //private salt = "xVhbJrXM7pQXK4wWcCPqU6YTCbFPe6xt";


  path:string = "Tus Archivos";
  tusarchivos:boolean = true;
  compartido:boolean = false;
  papelera:boolean = false;
  isGettinFiles:boolean = false;

  constructor(private TokenStorageService: TokenStorageService, private userService:UserService,public auth:AuthService, public fileService: FileService,private downloads: DownloadService,
    @Inject(DOCUMENT) private document: Document) {}

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

          if(this.auth.password != null){
            this.TokenStorageService.setPBKDF2Key(dataMap.get('pbkdf2'));
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

  download(url: string,filename:string) {
    this.download$ = this.downloads.download(url,filename);
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

  cerrarVentana(window:string):void{
    switch(window){
      case 'upload':
        //this.filesExplorer.upload.unsubscribe();
        this.upload = false;
        this.uploadPost.unsubscribe();
        this.uploadFinished = false;
        this.uploadState = null;
        this.uploadName= null;
        this.uploadSize = null;
        this.uploadProgress = null;
        this.uploadTotal = null;
        this.uploaded = null;
        break;
      case 'download':
        this.download$ = null;
        this.downloadName = null;
        this.downloadSize = null;
        this.downloadProgressSize = null;
        this.downloadSizeNumber = null;
        break;
    }
  }

  cancelar(window:string):void{
    switch(window){
      case 'upload':
        //this.filesExplorer.upload.unsubscribe();
        this.uploadPost.unsubscribe();
        this.upload = false;
        this.uploadFinished = false;
        this.uploadState = null;
        this.uploadName= null;
        this.uploadSize = null;
        this.uploadProgress = null;
        this.uploadTotal = null;
        this.uploaded = null;
        break;
      case 'download':
        this.download$ = null;
        this.downloadName = null;
        this.downloadSize = null;
        this.downloadProgressSize = null;
        this.downloadSizeNumber = null;
        break;
    }
  }
}
