import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FileElement } from './model/file-element';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { NewFolderDialogComponent } from './modals/new-folder-dialog/new-folder-dialog.component';
import { RenameDialogComponent } from './modals/rename-dialog/rename-dialog.component';
import { MoreInfoComponent } from './modals/more-info/more-info.component';
import { DeleteDialogComponent } from './modals/delete-dialog/delete-dialog.component';
import { UserService } from '../_services/user.service';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { DriveComponent } from '../drive/drive.component';
import { DownloadComponent } from './modals/download/download.component';
import { AppComponent } from '../app.component';
import { FileService } from '../_services/file.service';

@Component({
  selector: 'file-explorer',
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.css']
})
export class FileExplorerComponent {

  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  ascDate: boolean = false;
  ascName: boolean = true;
  ascSize: boolean = false;
  
  constructor(public dialog: MatDialog,private userService:UserService,private snackBar:MatSnackBar,private driveComponent:DriveComponent,private appComponent:AppComponent,private fileService:FileService) {}

  breakpoint:number;
  @Input() fileElements: FileElement[] =[];
  @Input() canNavigateUp: boolean;
  @Input() path: string = "";
  breakpint: number;

  @Output() folderAdded = new EventEmitter<{ name: string }>();
  @Output() elementRemoved = new EventEmitter<FileElement>();
  @Output() elementRenamed = new EventEmitter<FileElement>();
  @Output() elementMoved = new EventEmitter<{ element: FileElement; moveTo: FileElement }>();
  @Output() navigatedDown = new EventEmitter<FileElement>();
  @Output() navigatedUp = new EventEmitter();
  

  deleteElement(element: FileElement) {
    this.elementRemoved.emit(element);
  }

  navigate(element: FileElement) {
    if (element.isFolder) {
      this.navigatedDown.emit(element);
    }
  }

  navigateUp() {
    this.navigatedUp.emit();
  }

  moveElement(element: FileElement, moveTo: FileElement) {

    this.userService.moveFolder(element.id,moveTo.id).subscribe(
      data=>{
        this.elementMoved.emit({ element: element, moveTo: moveTo });
        this.snackBar.open(data.message, 'Cerrar', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 5 * 1000
        });
      },err =>{
        this.snackBar.open(err.message, 'Cerrar', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 5 * 1000
        });
      }
    );
  }

  openNewFolderDialog() {
    let dialogRef = this.dialog.open(NewFolderDialogComponent);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.folderAdded.emit({ name: res });
      }
    });
  }

  openRenameDialog(element: FileElement) {
    let dialogRef = this.dialog.open(RenameDialogComponent);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        element.name = res;
        this.userService.renameFile(element.id,element.name).subscribe(
          data =>{
            console.log(data);
            //this.elementRenamed.emit(element);
            this.driveComponent.updateFiles();
            this.snackBar.open(data.message, 'Cerrar', {
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
              duration: 5 * 1000
            });
          },err =>{
            this.snackBar.open(err.message, 'Cerrar', {
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
              duration: 5 * 1000
            });
          }
        );
        
      }
    });
  }

  downloadDialog(element:FileElement){
    //let dialogRef = this.dialog.open(DownloadComponent,{data:{element}});

    /*
    this.userService.downloadByUrl(element.url).subscribe(
      data =>{
        console.log(data);
        //this.elementRenamed.emit(element);
        this.driveComponent.updateFiles();
        this.snackBar.open(data.message, 'Cerrar', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 5 * 1000
        });
      },err =>{
        this.snackBar.open(err.message, 'Cerrar', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 5 * 1000
        });
      }
    );
    */

    this.appComponent.downloadName = element.name;
    this.appComponent.downloadURL = this.userService.API_FILES+"storage/download?url="+element.url;
    this.appComponent.downloadSize = this.appComponent.convertBytesSize(element.size);
    this.appComponent.downloadSizeNumber = this.appComponent.convertBytesSizeWithoutStr(Number.parseInt(element.size));
    this.appComponent.download(this.appComponent.downloadURL,this.appComponent.downloadName);
  }

  openMoreInfoDialog(element:FileElement){
    //console.log(element);
    let dialogRef = this.dialog.open(MoreInfoComponent,{data:{element}});
    this.fileService.hasChilds(element.id);
  }

  openDeleteDialog(element:FileElement){
    let dialogRef = this.dialog.open(DeleteDialogComponent,{data:{element}});
  }

  openMenu(event: MouseEvent, viewChild: MatMenuTrigger) {
    event.preventDefault();
    viewChild.openMenu();
    this.fileService.getChildMap().clear();
  }

  shortByDate():void{
    this.ascDate = !this.ascDate;
    this.driveComponent.fileService.shortByDate(this.ascDate);
    this.driveComponent.updateFileElementQuery();
  }

  shortByName():void{
    this.ascName = !this.ascName;
    this.driveComponent.fileService.shortByName(this.ascName);
    this.driveComponent.updateFileElementQuery();
  }

  shortBySize():void{
    this.ascSize = !this.ascSize;
    this.driveComponent.fileService.shortBySize(this.ascSize);
    this.driveComponent.updateFileElementQuery();
  }

  moveToMainFolder(element:any){
    this.userService.moveFolder(element.id,'root').subscribe(
      data=>{
        this.snackBar.open(data.message, 'Cerrar', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 5 * 1000
        });
        this.driveComponent.updateFiles();
      },err =>{
        this.snackBar.open(err.message, 'Cerrar', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 5 * 1000
        });
      }
    );
    
  }
}