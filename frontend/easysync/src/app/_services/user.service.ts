import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenStorageService } from './token-storage.service';

const API_URL = 'https://api.easysync.es/test/';
const API_USER = 'https://easysync.es:2096/api/users/';
const API_FILES = 'https://easysync.es:2096/api/files/';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded','Access-Control-Allow-Origin':'*',})
};

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient,private tokenStorageService:TokenStorageService) { }

  /*
  getPublicContent(): Observable<any> {
    return this.http.get(API_URL + 'all', { responseType: 'text' });
  }

  getUserBoard(): Observable<any> {
    return this.http.get(API_URL + 'user', { responseType: 'text' });
  }

  getModeratorBoard(): Observable<any> {
    return this.http.get(API_URL + 'mod', { responseType: 'text' });
  }

  getAdminBoard(): Observable<any> {
    return this.http.get(API_URL + 'admin', { responseType: 'text' });
  }
  */

  //POST

  setActivateAccount(token:any): Observable<any>{
    let body = new URLSearchParams();
    body.set('token', token);
    return this.http.post(API_USER+'activate',body.toString(),httpOptions);
  }

  getFilesUser(): Observable<any>{
    let token = this.tokenStorageService.getToken();
    //console.log(token);
    let request = API_FILES+'userfiles?token='+token;
    //console.log(request);
    return this.http.get(request);
  }

  dateToString(date:Date):string{

    let fixDate = new Date(date);
    console.log(fixDate);
    /*
    let dateSec = fixDate.getSeconds();
    let dateMin = fixDate.getMinutes();
    let dateHour = fixDate.getHours();

    let dateDay = fixDate.getDay();
    let dateMonth = fixDate.getMonth();
    let dateYear = fixDate.getFullYear();
    */
    /*return "El "+fixDate.get" "+dateDay+"/"+dateMonth+"/"+dateYear+"  a las  "+dateHour+":"+dateMin+":"+dateSec+" PM";*/
    return fixDate.toString();
  }


}
