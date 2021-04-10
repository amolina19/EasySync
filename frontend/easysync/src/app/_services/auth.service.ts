import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { TokenStorageService } from '../_services/token-storage.service';
import { Observable } from 'rxjs';

const AUTH_API = 'https://easysync.es:2096/api/users/auth/';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded','Access-Control-Allow-Origin':'*',})
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient,private tokenService:TokenStorageService) { }

  login(credentials: { useremail: string; password: any; email:any }): Observable<any>{
    let body = new URLSearchParams();
    body.set('useremail', credentials.useremail);
    body.set('password', credentials.password);
    return this.http.post(AUTH_API + 'login',body.toString(), httpOptions);
  }

  register(user: { username: any; email: any; password: any; }): Observable<any>{

    let body = new URLSearchParams();
    body.set('username', user.username);
    body.set('password', user.password);
    body.set('email', user.email);
    return this.http.post(AUTH_API+'register',body.toString(),httpOptions);
  }

  updateUserInfo(){
    const userStorage = this.tokenService.getUser();
    var userMap = new Map(Object.entries(userStorage));
    
    let username:any = userMap.get('username');
    let password:any = userMap.get('password');
    let email:any = userMap.get('email');
    
    let body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);
    body.set('email', email);
    return this.http.post(AUTH_API+'login',body.toString(),httpOptions);
  }
}
