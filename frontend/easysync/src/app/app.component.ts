import { Component, Inject, OnInit } from '@angular/core';
import { TokenStorageService } from './_services/token-storage.service';
import { UserService } from './_services/user.service';
import { AuthService } from './_services/auth.service';
import { FileService } from './_services/file.service';
import * as CryptoJS from 'crypto-js';
import { Observable } from 'rxjs';
import { DownloadService } from './_services/download.service';
import { DOCUMENT } from '@angular/common';
import { Download } from './_services/download'


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

  downloadURL: string;
  downloadName: string;
  downloadSize: string;
  downloadProgressSize: string;
  downloadSizeNumber:number;

  download$: Observable<Download>;
  //private keySize = 256;
  //private iterations = 100;
  //private salt = "xVhbJrXM7pQXK4wWcCPqU6YTCbFPe6xt";

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

  /*

  getPBKDF2Key(password:string):string{
    let keySize = 512;
    var key = CryptoJS.PBKDF2(password, this.salt, {
      keySize: keySize / 32,
      iterations: this.iterations*10
    });

    return key;
  }

  encryptAES(text:string,passorpkfd2key:string):string{
    let salt = CryptoJS.lib.WordArray.random(128/8);
    let key = CryptoJS.PBKDF2(passorpkfd2key, salt, {
        keySize: this.keySize/32,
        iterations: this.iterations
    });
  
    var iv = CryptoJS.lib.WordArray.random(128/8);
    
    let encrypted = CryptoJS.AES.encrypt(text, key, { 
      iv: iv, 
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });
    
    let transitmessage = salt.toString()+ iv.toString() + encrypted.toString();
    return transitmessage;
  }

  decryptAES(transitmessage, pass):string {
    let salt = CryptoJS.enc.Hex.parse(transitmessage.substr(0, 32));
    let iv = CryptoJS.enc.Hex.parse(transitmessage.substr(32, 32))
    let encrypted = transitmessage.substring(64);
    
    let key = CryptoJS.PBKDF2(pass, salt, {
        keySize: this.keySize/32,
        iterations: this.iterations
    });
  
    let decrypted = CryptoJS.AES.decrypt(encrypted, key, { 
      iv: iv, 
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });
    return decrypted;
  }
  */
}
