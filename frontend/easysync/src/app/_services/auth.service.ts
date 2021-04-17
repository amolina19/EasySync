import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from 'rxjs';
import { TokenStorageService } from './token-storage.service';

const AUTH_API = 'https://easysync.es:2096/api/users/auth/';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded','Access-Control-Allow-Origin':'*',})
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isLoggedIn = false;

  constructor(private http: HttpClient,private injector:Injector,private tokenService:TokenStorageService) { }

  login(credentials: { useremail: string; password: any; email:any }): Observable<any>{
    let body = new URLSearchParams();
    body.set('useremail', credentials.useremail);
    body.set('password', credentials.password);
    return this.http.post(AUTH_API + 'login',body.toString(), httpOptions);
  }

  loginByToken(token:string){
    let body = new URLSearchParams();
    body.set('token',token);
    return this.http.post(AUTH_API+ 'token',body.toString(),httpOptions);
  }

  register(user: { username: any; email: any; password: any; }): Observable<any>{

    let body = new URLSearchParams();
    body.set('username', user.username);
    body.set('password', user.password);
    body.set('email', user.email);
    return this.http.post(AUTH_API+'register',body.toString(),httpOptions);
  }

  updateUserInfo(){
    this.loginByToken(this.injector.get(TokenStorageService).getToken()).subscribe( 
      data =>{
        var dataMap = new Map(Object.entries(data));
        //this.tokenService.saveToken(dataMap.get('token'));
        this.tokenService.saveUser(dataMap.get('user'));
        this.isLoggedIn = true;
    });;
  }
}
