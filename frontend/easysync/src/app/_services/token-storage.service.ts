import { Injectable, Injector } from '@angular/core';
import { AuthService } from './auth.service';


//LOCALSTORAGE
const TOKEN_KEY = 'auth-token';
const TOKENT2A_KEY = 'auth-tokent2a';
const USER_KEY = 'auth-user';
const DEVICE = 'device';
const UUID = 'device-uuid';

//SESSION STORAGE
const PBKDF2_KEY = 'pbkdf2key';
const KEYS = 'keys';

//var pbkdf2 = require('pbkdf2');

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  constructor(private injector:Injector) { }

  signOut():void {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.removeItem(PBKDF2_KEY);
    window.localStorage.removeItem(KEYS);
  }

  
  public saveToken(token: any):void{
    //window.localStorage.removeItem(TOKEN_KEY);
    //window.localStorage.setItem(TOKEN_KEY,token);
    /*const ttl = 1000 * 3600; //1H
    const now = new Date();
    const item = {
      value: token,
      expiry: now.getTime() + ttl
    }
    */
    localStorage.setItem(TOKEN_KEY,token);
  }

  
  public getTokenByRequest(): string {
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

  public getToken(): string {
    return localStorage.getItem(TOKEN_KEY);
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

  public getPBKDF2Key():string{
    return window.localStorage.getItem(PBKDF2_KEY);
  }

  public setPBKDF2Key(key):void{
    window.localStorage.removeItem(PBKDF2_KEY);
    window.localStorage.setItem(PBKDF2_KEY,key);
  }

  public getKeys():string{
    return window.localStorage.getItem(KEYS);
  }

  public setKeys(keys):void{
    window.localStorage.removeItem(KEYS);
    window.localStorage.setItem(KEYS,keys);
  }

  public getDevice(): any {
    return localStorage.getItem(DEVICE);
  }

  public setDevice(device:any): void{
    window.localStorage.removeItem(DEVICE);
    window.localStorage.setItem(DEVICE,JSON.stringify(device));
  }

  public getDeviceUUID(): any {
    return localStorage.getItem(UUID);
  }

  public setDeviceUUID(uuid:string):void{
    window.localStorage.removeItem(UUID)
    window.localStorage.setItem(UUID,uuid);
  }

  public setTokenT2A(tokent2a:string):any{
    window.localStorage.removeItem(TOKENT2A_KEY)
    window.localStorage.setItem(TOKENT2A_KEY,tokent2a);
  }

  public getTokenT2A():string{
    return window.localStorage.getItem(TOKENT2A_KEY);
  }

  public removeTokenT2A():void{
    window.localStorage.removeItem(TOKENT2A_KEY);
  }

}
