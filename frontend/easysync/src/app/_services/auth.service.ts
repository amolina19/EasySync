import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from 'rxjs';
import { TokenStorageService } from './token-storage.service';

const AUTH_API = 'https://easysync.es:2096/api/users/auth/';
const USERS_API = 'https://easysync.es:2096/api/users/';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded',
    'Access-Control-Allow-Origin':'*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token,content-type'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isLoggedIn = false;
  password:string;

  constructor(private http: HttpClient,private injector:Injector,private tokenService:TokenStorageService) { }

  login(credentials: { useremail: string; password: any; email:any },device_os:string,device_browser:string,device_uuid:string): Observable<any>{
    let body = new URLSearchParams();
    body.set('useremail', credentials.useremail);
    body.set('password', credentials.password);
    body.set('device_os', device_os);
    body.set('device_browser', device_browser);
    body.set('deviceuuid', device_uuid);
    return this.http.post(AUTH_API + 'login',body.toString(), httpOptions);
  }

  loginByToken(token:string){
    let body = new URLSearchParams();
    body.set('token',token);
    return this.http.post(AUTH_API+ 'token',body.toString(),httpOptions);
  }

  loginByT2A(token:string,code:string,password:string,device_os:string,device_browser:string,device_uuid:string){
    let body = new URLSearchParams();
    body.set('token',token);
    body.set('code',code);
    body.set('password',password);
    body.set('device_os', device_os);
    body.set('device_browser', device_browser);
    body.set('deviceuuid', device_uuid);
    return this.http.post(AUTH_API+ 't2a/login',body.toString(),httpOptions);
  }

  register(user: { username: any; name:any, email: any; password: any; }): Observable<any>{

    let body = new URLSearchParams();
    body.set('username', user.username);
    body.set('name', user.name);
    body.set('password', user.password);
    body.set('email', user.email);
    return this.http.post(AUTH_API+'register',body.toString(),httpOptions);
  }

  change_password(password:string): Observable<any>{
    let body = new URLSearchParams();
    body.set('password', password);
    body.set('token',this.tokenService.getToken());
    body.set('keys',this.tokenService.getKeys());
    return this.http.post(AUTH_API+'change_password',body.toString(),httpOptions);
  }


  recover_password(token:string,password:string,pbkdf2key:string): Observable<any>{
    let body = new URLSearchParams();
    body.set('token', token);
    body.set('password', password);
    body.set('key',pbkdf2key);
    return this.http.post(AUTH_API+'recover_password',body.toString(),httpOptions);
  }

  send_recover_password(useremail:string): Observable<any>{
    let body = new URLSearchParams();
    body.set('useremail', useremail);
    return this.http.post(AUTH_API+'send_recover_password',body.toString(),httpOptions);
  }

  update_email(email:string): Observable<any>{
    let body = new URLSearchParams();
    body.set('email', email);
    body.set('token',this.tokenService.getToken());
    return this.http.post(AUTH_API+'update_email',body.toString(),httpOptions);
  }

  updatet2a(t2avalue:boolean): Observable<any>{
    let body = new URLSearchParams();
    body.set('token', this.tokenService.getToken());
    body.set('t2avalue', t2avalue.toString());
    return this.http.post(USERS_API+'updatet2a',body.toString(),httpOptions);
  }

  updateUserInfo(){
    this.loginByToken(this.injector.get(TokenStorageService).getToken()).subscribe( 
      data =>{
        var dataMap = new Map(Object.entries(data));
        //this.tokenService.saveToken(dataMap.get('token'));
        this.tokenService.saveUser(dataMap.get('user'));
    });
  }

  activate(token:string){
    let body = new URLSearchParams();
    body.set('token', token);
    return this.http.post(USERS_API+'activate',body.toString(),httpOptions);
  }

  delete(){
    let body = new URLSearchParams();
    body.set('token',this.tokenService.getToken());
    return this.http.post(USERS_API+'delete',body.toString(),httpOptions);
  }
  
}
