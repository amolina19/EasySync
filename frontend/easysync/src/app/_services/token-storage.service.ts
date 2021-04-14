import { Injectable, Injector } from '@angular/core';
import { AuthService } from './auth.service';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  constructor(private injector:Injector) { }

  signOut():void {
    window.localStorage.clear();
  }

  public saveToken(token: any):void{
    //window.localStorage.removeItem(TOKEN_KEY);
    //window.localStorage.setItem(TOKEN_KEY,token);
    const ttl = 1000 * 3600; //1H
    const now = new Date();
    const item = {
      value: token,
      expiry: now.getTime() + ttl
    }
    localStorage.setItem(TOKEN_KEY,JSON.stringify(item));
  }

  public getToken(): string {
    //return localStorage.getItem(TOKEN_KEY) || '';

    const itemStr = localStorage.getItem(TOKEN_KEY);
    if(!itemStr){
      return null;
    }

    const item = JSON.parse(itemStr);
    const now = new Date();
    if(now.getTime()> item.expiry){
      //localStorage.clear();
      //return null;
      this.injector.get(AuthService).loginByToken(item.value).subscribe( 
        data =>{
          var dataMap = new Map(Object.entries(data));
          this.saveToken(dataMap.get('token'));
          this.saveUser(dataMap.get('user'));
          this.injector.get(AuthService).isLoggedIn = true;
      });
    }
    return item.value;

  }

  public saveUser(user: any):void{
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.setItem(USER_KEY,JSON.stringify(user));
  }

  public getUser():any{
    return JSON.parse(localStorage.getItem(USER_KEY) || '{}');
  }

  public userExits():boolean{
    if(this.getToken() === null && window.localStorage.getItem(USER_KEY) === null){
      return false;
    }
    return true;
  }

}
