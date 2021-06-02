import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenStorageService } from './token-storage.service';



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
export class UserService {

  API_URL = 'https://api.easysync.es/test/';
  API_USER = 'https://easysync.es:2096/api/users/';
  API_FILES = 'https://easysync.es:2096/api/files/';
  API_DOCUMENTATION = 'https://easysync.es:2096/api/api';

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

  getFilesUser(type:number): Observable<any>{
    let token = this.tokenStorageService.getToken();
    //console.log(token);
    let request = this.API_FILES+'userfiles?type='+type+'&&token='+token;
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

  getAPI(){
    return this.http.get(this.API_DOCUMENTATION);
  }

  getUserStorageSize(): Observable<any>{
    let token = this.tokenStorageService.getToken();
    //console.log(token);
    let request = this.API_FILES+'storagesize?token='+token;
    //console.log(request);
    return this.http.get(request);
  }

  removeFile(fileid:any,):Observable<any>{
    let token = this.tokenStorageService.getToken();
    let body = new URLSearchParams();
    body.set('token',token);
    body.set('fileid',fileid);
    return this.http.post(this.API_FILES + 'storage/delete',body.toString(), httpOptions);
  }

  renameFile(fileid:any,newname:any):Observable<any>{
    let token = this.tokenStorageService.getToken();
    let body = new URLSearchParams();
    body.set('token',token);
    body.set('fileid',fileid);
    body.set('newname',newname);
    return this.http.post(this.API_FILES + 'storage/rename',body.toString(), httpOptions);
  }

  addFolder(foldername:any,parent:any,path:any):Observable<any>{
    let token = this.tokenStorageService.getToken();
    let body = new URLSearchParams();
    body.set('token',token);
    body.set('foldername',foldername);
    body.set('parent',parent);
    body.set('path',path);
    return this.http.post(this.API_FILES + 'storage/createfolder',body.toString(), httpOptions);
  }

  moveFolder(elementid:any,parent:any,path:any):Observable<any>{
    let token = this.tokenStorageService.getToken();
    let body = new URLSearchParams();
    body.set('token',token);
    body.set('elementid',elementid);
    body.set('parent',parent);
    body.set('path',path);
    return this.http.post(this.API_FILES + 'storage/move',body.toString(), httpOptions);
  }

  moveToTrash(elements:any,value):Observable<any>{
    let token = this.tokenStorageService.getToken();
    let body = new URLSearchParams();
    body.set('token',token);
    body.set('elements',elements);
    body.set('trash',value);
    return this.http.post(this.API_FILES + 'storage/trash',body.toString(), httpOptions);
  }

  /*
  downloadByUrl(url:any):Observable<any>{
    //let token = this.tokenStorageService.getToken();
    //let body = new URLSearchParams();
    //body.set('token',token);
    //body.set('url',url);
    return this.http.get(this.API_FILES + 'storage/download?url='+url,{ responseType: 'blob',reportProgress: true, observe: 'events', });
  }*/

  /*
  downloadByUrl(url:any,password:any){
    //let token = this.tokenStorageService.getToken();
    let body = new URLSearchParams();
    //body.set('token',token);
    body.set('url',url);
    body.set('password',password);
    return this.http.post(this.API_FILES + 'download',body.toString(), httpOptions);
  }*/

  getFileToDownload(url:any,password:any){
  //let token = this.tokenStorageService.getToken();
    let body = new URLSearchParams();
    //body.set('token',token);
    body.set('url',url);
    body.set('password',password);
    return this.http.post(this.API_FILES + 'download',body.toString(), httpOptions);
  }

  getURLFile(idfile:any){
    let body = new URLSearchParams();
    body.set('idfile',idfile);
    body.set('keys',this.tokenStorageService.getKeys());
    return this.http.post(this.API_FILES + 'storage/geturlfile/',body.toString(), httpOptions);
  }

  getPublicFilePassword(idfile:any){
    let body = new URLSearchParams();
    body.set('idfile',idfile);
    body.set('keys',this.tokenStorageService.getKeys());
    return this.http.post(this.API_FILES + 'storage/getpublicpassword',body.toString(), httpOptions);
  }

  deleteURLFile(idfile:any){
    let body = new URLSearchParams();
    body.set('idfile',idfile);
    body.set('keys',this.tokenStorageService.getKeys());
    return this.http.post(this.API_FILES + 'storage/deleteurl/',body.toString(), httpOptions);
  }



}
