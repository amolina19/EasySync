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
import { AppComponent } from '../app.component';
import { FileService } from '../_services/file.service';
import { TokenStorageService } from '../_services/token-storage.service';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { OnInit } from '@angular/core';

@Component({
  selector: 'file-explorer',
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.css']
})
export class FileExplorerComponent implements OnInit{

  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  ascDate: boolean = false;
  ascName: boolean = true;
  ascSize: boolean = false;
  userId:string;

  public screenWidth: any;
  public screenHeight: any;

  

  
  constructor(public httpClient: HttpClient,public dialog: MatDialog,private userService:UserService,private snackBar:MatSnackBar,public driveComponent:DriveComponent,public appComponent:AppComponent,private fileService:FileService,private tokenStorage:TokenStorageService) {
  }

  ngOnInit():void{
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    document.getElementById('upload').setAttribute('style',"opacity: 0.0; position: absolute; left: "+(this.screenWidth-Number.parseInt("100"))+"px;overflow:invisible");

    let user = this.tokenStorage.getUser();
    
    this.userId = user._id;
    console.log(this.userId);

    console.log('Tus archivos',this.appComponent.tusarchivos);
    console.log('Compartido',this.appComponent.compartido);
    console.log('papelera',this.appComponent.papelera);

  }

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

  generateUpload():void{
    let upload = 
    document.getElementById('upload').removeAttribute('disabled');
    document.getElementById('upload').click();
    document.getElementById('upload').setAttribute('disabled',"true");
    
  }

  onFileSelect(event) {
    if (event.target.files.length > 0) {
      console.log(event.target.files);
      this.uploadFile(event.target.files[0]);
    }
  }

  uploadFile(file:any){
    const formData = new FormData();
    formData.append('token',this.tokenStorage.getToken());
    formData.append('file', file);
    formData.append('keys', this.tokenStorage.getKeys());
    formData.append('parent', this.driveComponent.parentID);

    console.log(file);

    this.appComponent.uploadPost = this.httpClient.post<any>(this.userService.API_FILES+"storage/upload", formData,{reportProgress: true, observe: "events"}).subscribe(
      
      event => {
        this.appComponent.upload = true;
        this.appComponent.uploadName = file.name;
        this.appComponent.uploadSize = this.appComponent.convertBytesSize(file.size);
        this.appComponent.uploadState = "UPLOADING";
        
        if (event.type === HttpEventType.DownloadProgress) {
            //console.log("download progress"); 
        }
        if (event.type === HttpEventType.Response) {
          this.appComponent.uploadState = "DONE";
          this.appComponent.uploadFinished = true;
          this.snackBar.open("El archivo "+file.name+" se subio correctamente", 'Cerrar', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 5 * 1000
          });
          this.driveComponent.updateFiles(0);
          this.path = this.driveComponent.path;
        }

        if (event.type === HttpEventType.UploadProgress) {
          this.appComponent.uploadProgress = Number.parseInt(""+(event.loaded*100)/event.total);
          this.appComponent.uploaded = this.appComponent.convertBytesSize(event.loaded);
          //console.log(this.appComponent.uploaded);
        }
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
    let dialogRef = this.dialog.open(RenameDialogComponent,{data:{element}});
    dialogRef.afterClosed().subscribe(res => {
      //console.log(res);
      if (res) {
        element.name = res;
        this.userService.renameFile(element.id,element.name).subscribe(
          data =>{
            //console.log(data);
            //this.elementRenamed.emit(element);
            this.driveComponent.updateFiles(0);
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
    this.appComponent.downloadIDFile = this.userService.API_FILES+"storage/download?idfile="+element.id+"&&token="+this.tokenStorage.getToken()+"&&keys="+this.tokenStorage.getKeys();
    this.appComponent.downloadSize = this.appComponent.convertBytesSize(element.size);
    this.appComponent.downloadSizeNumber = Number.parseInt(element.size);
    this.appComponent.download(this.appComponent.downloadIDFile,this.appComponent.downloadName);
  }

  openMoreInfoDialog(element:FileElement){
    //console.log(element);
    let dialogRef = this.dialog.open(MoreInfoComponent,{data:{element}});
    this.fileService.hasChilds(element.id);
  }

  openDeleteDialog(element:FileElement){
    let dialogRef = this.dialog.open(DeleteDialogComponent,{data:{element}});
    dialogRef.afterClosed().subscribe(res => {
      if(res === undefined){
          this.userService.moveToTrash(this.fileService.getItems(element.id),true).subscribe( data=>{
          this.driveComponent.updateFiles(this.driveComponent.getActualDrive());
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

        });
      }
    });
  }

  openRestoreDialog(element:FileElement){
    let dialogRef = this.dialog.open(DeleteDialogComponent,{data:{element}});
    dialogRef.afterClosed().subscribe(res => {
      if(res === undefined){
          this.userService.moveToTrash(this.fileService.getItems(element.id),false).subscribe( data=>{
          this.driveComponent.updateFiles(this.driveComponent.getActualDrive());
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

        });
      }
    });
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
        this.driveComponent.updateFiles(0);
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