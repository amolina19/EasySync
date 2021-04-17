import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { FileElement } from '../file-explorer/model/file-element';
import { AuthService } from '../_services/auth.service';
import { FileService } from '../_services/file.service';
import { UserService } from '../_services/user.service';

@Component({
  selector: 'app-drive',
  templateUrl: './drive.component.html',
  styleUrls: ['./drive.component.css']
})
export class DriveComponent implements OnInit {


  fileElements: Observable<FileElement[]>;
  currentRoot: FileElement;
  currentPath: string;
  canNavigateUp: boolean;
  breakpoint:number;
  files:any;

  constructor(public fileService:FileService,private authService:AuthService,private router:Router,public userService:UserService) { }

  
  ngOnInit(): void {
    if(this.authService.isLoggedIn === false){
      this.router.navigate(['/login']);
    }

    /*
    const folderA = this.fileService.add({ name: 'Folder A',size:"102223 bytes", isFolder: true, parent: 'root' });
    this.fileService.add({ name: 'Folder B',size:"102223 bytes", isFolder: true, parent: 'root' });
    this.fileService.add({ name: 'Folder C',size:"102223 bytes", isFolder: true, parent: folderA.id });
    this.fileService.add({ name: 'File A', size:"102223 bytes",isFolder: false, parent: 'root' });
    this.fileService.add({ name: 'File B', size:"102223 bytes",isFolder: false, parent: 'root' });
    */
   
    this.userService.getFilesUser().subscribe(
  
      data =>{
        this.fileService.clear();
        this.files = data;
        //console.log(this.files);
        this.files.forEach(element => {
          //console.log(element);
          this.fileService.add({id:element.id,name:element.name,size:element.size,isFolder:false,parent:'root',created_at:element.created_at,modified_at:element.modified_at,owner_id:element.owner_id,shared:element.shared});
        });
        this.updateFileElementQuery();
      }, err =>{

      }
    )
    
    
  }


  addFolder(folder: { name: string }) {
    //this.fileService.add({ isFolder: true, name: folder.name,size:"102223 bytes", parent: this.currentRoot ? this.currentRoot.id : 'root' });
    this.updateFileElementQuery();
  }
  
  removeElement(element: FileElement) {
    this.fileService.delete(element.id);
    this.updateFileElementQuery();
  }
  
  moveElement(event: { element: FileElement; moveTo: FileElement }) {
    this.fileService.update(event.element.id, { parent: event.moveTo.id });
    this.updateFileElementQuery();
  }
  
  renameElement(element: FileElement) {
    this.fileService.update(element.id, { name: element.name });
    this.updateFileElementQuery();
  }

  updateFileElementQuery() {
    this.fileElements = this.fileService.queryInFolder(this.currentRoot ? this.currentRoot.id : 'root');
  }

  navigateUp() {
    if (this.currentRoot && this.currentRoot.parent === 'root') {
      this.currentRoot = null;
      this.canNavigateUp = false;
      this.updateFileElementQuery();
    } else {
      this.currentRoot = this.fileService.get(this.currentRoot.parent);
      this.updateFileElementQuery();
    }
    this.currentPath = this.popFromPath(this.currentPath);
  }
  
  navigateToFolder(element: FileElement) {
    this.currentRoot = element;
    this.updateFileElementQuery();
    this.currentPath = this.pushToPath(this.currentPath, element.name);
    this.canNavigateUp = true;
  }

  pushToPath(path: string, folderName: string) {
    let p = path ? path : '';
    p += `${folderName}/`;
    return p;
  }
  
  popFromPath(path: string) {
    let p = path ? path : '';
    let split = p.split('/');
    split.splice(split.length - 2, 1);
    p = split.join('/');
    return p;
  }

}
