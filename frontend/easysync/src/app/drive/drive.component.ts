import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { FileElement } from '../file-explorer/model/file-element';
import { AuthService } from '../_services/auth.service';
import { FileService } from '../_services/file.service';
import { UserService } from '../_services/user.service';
import dateFormat from 'dateformat';

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

  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  orderByName: boolean = true;
  orderBySize: boolean = false;
  orderByDate: boolean = false;

  parentID:any = 'root';

  constructor(public fileService:FileService,private authService:AuthService,private router:Router,public userService:UserService,private snackBar:MatSnackBar) { }

  
  ngOnInit(): void {

    dateFormat.i18n = {
      dayNames: [
        "Dom",
        "Lun",
        "Mar",
        "Mie",
        "Jue",
        "Vie",
        "Sab",
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sabado",
      ],
      monthNames: [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ],
      timeNames: ["a", "p", "am", "pm", "A", "P", "AM", "PM"],
    };

    if(this.authService.isLoggedIn === false){
      this.router.navigate(['/login']);
    }

    this.updateFiles();

    /*
    const folderA = this.fileService.add({ name: 'Folder A',size:"102223 bytes", isFolder: true, parent: 'root' });
    this.fileService.add({ name: 'Folder B',size:"102223 bytes", isFolder: true, parent: 'root' });
    this.fileService.add({ name: 'Folder C',size:"102223 bytes", isFolder: true, parent: folderA.id });
    this.fileService.add({ name: 'File A', size:"102223 bytes",isFolder: false, parent: 'root' });
    this.fileService.add({ name: 'File B', size:"102223 bytes",isFolder: false, parent: 'root' });
    */
    
  }

  updateFiles():void{
    this.userService.getFilesUser().subscribe(
  
      data =>{
        this.fileService.clear();
        this.files = data;
        //console.log(this.files);

        //debug
        
        this.files.forEach(element => {
          if(element.parent === undefined){
            element.parent = 'root';
          }
          this.fileService.add({id:element._id,name:element.name,size:element.size,isFolder:element.isFolder,parent:element.parent,created_at:element.created_at,modified_at:element.modified_at,owner_id:element.owner_id,shared:element.shared,md5:element.md5,url:element.url,mimetype:element.mimetype,extension:element.extension});
        });
        this.updateFileElementQuery();
      }, err =>{

        this.snackBar.open(err.message, 'Cerrar', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 5 * 1000
        });
      }
    )
  }


  addFolder(folder: { name: string }) {
    this.userService.addFolder(folder.name,this.parentID).subscribe(
      data =>{
        //this.fileService.add({id:data.id,name:folder.name,size:null,isFolder:data.isFolder,parent:data.parent,created_at:folderDate,modified_at:data,owner_id:data.owner_id,shared:null,md5:null,url:null,mimetype:null,extension:null});
        this.snackBar.open(data.message, 'Cerrar', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 5 * 1000
        });
        this.updateFiles();
      },err =>{
        this.snackBar.open(err.message, 'Cerrar', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 5 * 1000
        });
      }
    );
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
      this.parentID = 'root';
      this.updateFileElementQuery();
    } else {
      this.currentRoot = this.fileService.get(this.currentRoot.parent);
      this.parentID = this.currentRoot.id;
      this.updateFileElementQuery();
    }
    console.log(this.parentID);
    this.currentPath = this.popFromPath(this.currentPath);
  }
  
  navigateToFolder(element: FileElement) {
    this.currentRoot = element;
    this.updateFileElementQuery();
    this.currentPath = this.pushToPath(this.currentPath, element.name);
    this.canNavigateUp = true;
    this.parentID = element.id;
    console.log(this.parentID);
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
