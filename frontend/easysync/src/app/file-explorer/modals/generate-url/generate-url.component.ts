import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { UserService } from 'src/app/_services/user.service';
import { MoreInfoComponent } from '../more-info/more-info.component';
import { ClipboardModule } from '@angular/cdk/clipboard'
import { DriveComponent } from 'src/app/drive/drive.component';

@Component({
  selector: 'app-generate-url',
  templateUrl: './generate-url.component.html',
  styleUrls: ['./generate-url.component.css']
})
export class GenerateUrlComponent implements OnInit {

  constructor(private userService: UserService,public dialogRef: MatDialogRef<MoreInfoComponent>,@Inject(MAT_DIALOG_DATA) public data: any,private snackBar: MatSnackBar) { }

  notGenerated:boolean = true;
  form:any = {};
  spinnerURLGenerating:boolean = false;
  password:string;
  showPassword:boolean = false;
  url:string;

  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  linkURL:string = "https://easysync.es/download";

  ngOnInit(): void {

    //console.log(this.data.element);


    if(this.data.element.shared){
      this.userService.getPublicFilePassword(this.data.element.id).subscribe(
        data=>{
          var dataMap = new Map(Object.entries(data));
          this.password = dataMap.get('password');
          if(this.data.element.url){
            this.url = this.data.element.url;
            this.form.url = this.linkURL+"?url="+this.url+"&&!="+this.password;
          }
        }, error =>{
          this.snackBar.open(error.message, 'Cerrar', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 5 * 1000
          });
      });
    }
    
  }

  generarURL():void{
    this.userService.getURLFile(this.data.element.id).subscribe(

      result => {
        this.notGenerated = false;
        var dataMap = new Map(Object.entries(result));
        this.password = dataMap.get('password');
        this.url = dataMap.get('url');
        this.form.url = this.linkURL+"?url="+this.url+"&&!="+dataMap.get('password');
        this.showPassword = true;

        this.data.element.shared = true;

        this.snackBar.open(dataMap.get('message'), 'Cerrar', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 5 * 1000
        });
      },error =>{
        this.snackBar.open(error.message, 'Cerrar', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 5 * 1000
        });
      }
    );
    
  }

  show():void{
    this.showPassword = true;
    this.form.url = "";
    this.form.url = this.linkURL+"?url="+this.url+"&&!="+this.password;
  }

  hide():void{
    this.showPassword = false;
    this.form.url = "";
    this.form.url = this.linkURL+"?url="+this.url;
  }
  
  copy():void{
    this.snackBar.open("URL copiada correctamente!.", 'Cerrar', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 5 * 1000
    });
  }

  deleteURL():void{
    this.userService.deleteURLFile(this.data.element.id).subscribe(
      data=>{
        var dataMap = new Map(Object.entries(data));
        this.snackBar.open(dataMap.get('message'), 'Cerrar', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 5 * 1000
        });
        this.showPassword = false;
        this.form.url = null;
        this.password = null;
        this.url = null;
        this.data.element.shared = false;
      }, error =>{
        this.snackBar.open(error.message, 'Cerrar', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 5 * 1000
        });
    });
  }

}
