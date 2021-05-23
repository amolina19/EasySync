import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Observable } from 'rxjs/internal/Observable';

import { v4 } from 'uuid';
import { FileElement } from '../file-explorer/model/file-element';



export interface IFileService {
  add(fileElement: FileElement);
  delete(id: string);
  update(id: string, update: Partial<FileElement>);
  queryInFolder(folderId: string): Observable<FileElement[]>;
  get(id: string): FileElement;
  shortByName(ascName:boolean);
  shortByDate(ascDate:boolean);
  shortBySize(ascSize:boolean);
}

@Injectable()
export class FileService implements IFileService {
  private map = new Map<string, FileElement>();

  constructor() {}

  add(fileElement: FileElement) {
    //fileElement.id = v4();
    this.map.set(fileElement.id, this.clone(fileElement));
    return fileElement;
  }

  delete(id: string) {
    this.map.delete(id);
  }

  clear(){
    this.map.clear();
  }

  update(id: string, update: Partial<FileElement>) {
    let element = this.map.get(id);
    element = Object.assign(element, update);
    this.map.set(element.id, element);
  }

  private querySubject: BehaviorSubject<FileElement[]>;
  queryInFolder(folderId: string) {
    const result: FileElement[] = [];
    this.map.forEach(element => {
      if (element.parent === folderId) {
        result.push(this.clone(element));
      }
    });
    if (!this.querySubject) {
      this.querySubject = new BehaviorSubject(result);
    } else {
      this.querySubject.next(result);
    }
    return this.querySubject.asObservable();
  }

  get(id: string) {
    return this.map.get(id);
  }

  clone(element: FileElement) {
    return JSON.parse(JSON.stringify(element));
  }

  shortByName(ascName:boolean){
    let newMap = new Map([...this.map].sort(([k, v], [k2, v2])=> {

      if(ascName){
        if (v.name > v2.name) {
          return 1;
        }
        if (v.name < v2.name) {
          return -1;
        }
        return 0;
      }else{
        if (v.name < v2.name) {
          return 1;
        }
        if (v.name > v2.name) {
          return -1;
        }
        return 0;
      }
    }));

    this.map.clear();
    this.map = newMap;
  }

  shortByDate(ascDate:boolean){
    let newMap = new Map([...this.map].sort(([k, v], [k2, v2])=> {

      if(v.modified_at === null || v2.modified_at === null){

        if(ascDate){
          if (v.created_at > v2.created_at) {
            return 1;
          }
          if (v.created_at < v2.created_at) {
            return -1;
          }
          return 0;
        }else{
          if (v.created_at < v2.created_at) {
            return 1;
          }
          if (v.created_at > v2.created_at) {
            return -1;
          }
          return 0;
        }
         
      }else{

        if(ascDate){
          if (v.modified_at > v2.modified_at) {
            return 1;
          }
          if (v.modified_at < v2.modified_at) {
            return -1;
          }
          return 0; 
        }else{
          if (v.modified_at < v2.modified_at) {
            return 1;
          }
          if (v.modified_at > v2.modified_at) {
            return -1;
          }
          return 0; 
        }    
      } 
    }));

    this.map.clear();
    this.map = newMap;
  }

  shortBySize(ascSize:boolean){
    
    let newMap = new Map([...this.map].sort(([k, v], [k2, v2])=> {

      if(ascSize){
        if (v.size > v2.size) {
          return 1;
        }
        if (v.size < v2.size) {
          return -1;
        }
        return 0; 
      }else{
        if (v.size < v2.size) {
          return 1;
        }
        if (v.size > v2.size) {
          return -1;
        }
        return 0; 
      }
    }));

    this.map.clear();
    this.map = newMap;
  }
}
