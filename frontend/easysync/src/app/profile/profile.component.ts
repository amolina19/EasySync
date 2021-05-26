import { Component, Injector, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { TokenStorageService } from '../_services/token-storage.service';
import { UserService } from '../_services/user.service';
import {MatSnackBar,MatSnackBarHorizontalPosition,MatSnackBarVerticalPosition,} from '@angular/material/snack-bar';
import { FormControl, Validators } from '@angular/forms';
import { AppComponent } from '../app.component';
import dateFormat from 'dateformat';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {


  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  progressBar = false;
  currentUser: any;
  currentToken: any;
  panelOpenState:boolean;
  createdDateString:string;
  lastLoginDateString:string;
  key:string;
  T2A_OPCION:boolean;
  T2A_MENSAJE:string;
  T2A_MENSAJE_API:string;
  hide:boolean = true;
  form: any = {};

  progressBarStorage:number;
  userStorageTotal:string;
  userStorageUsed:string;

  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  public toggle(event: MatSlideToggleChange) {
    //console.log('toggle', event.checked);
    
    if(event.checked){
      this.T2A_OPCION = true;
      this.T2A_MENSAJE = "Activado";
    }else{
      this.T2A_OPCION = false;
      this.T2A_MENSAJE = "Desactivado";
    }

    this.progressBar = true;

    this.authService.updatet2a(event.checked).subscribe( 
      data =>{
        this.snackBar.open(data.message, 'Cerrar', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 5 * 1000,
        });
        this.progressBar = false;
      },err =>{
        this.snackBar.open(err.message, 'Cerrar', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 5 * 1000
        });
        this.progressBar = false;
    });

    
  }
  

  constructor(private router:Router,private authService:AuthService,private tokenService:TokenStorageService,private userService:UserService,private snackBar: MatSnackBar,private appComponent:AppComponent) { }

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

    if(!this.tokenService.userExits()){
      this.router.navigate(['/login']);
    }
     
    //this.authService.updateUserInfo();
    this.currentUser = this.tokenService.getUser();
    this.createdDateString = dateFormat(new Date(this.currentUser.created_at),'dddd dd mmmm yyyy HH:MM:ss');
    this.lastLoginDateString = dateFormat(new Date(this.currentUser.last_login),'dddd dd mmmm yyyy HH:MM:ss');
    this.key = this.tokenService.getPBKDF2Key();

    if(this.currentUser.t2a){
      this.T2A_OPCION = true;
      this.T2A_MENSAJE = "Activado";
    }else{
      this.T2A_OPCION = false;
      this.T2A_MENSAJE = "Desactivado";
    }
  }

  onSubmitNewEmail():void{
    this.progressBar = true;
    if(this.form.email === this.form.newemail){
      this.authService.update_email(this.form.email).subscribe(
        data =>{
          this.progressBar = false;
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
          this.progressBar = false;
        }
      );
    }else{
      this.snackBar.open("Los email tienen que ser iguales!.", 'Cerrar', {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        duration: 5 * 1000
      });
    }
  }

  
  copiedSuccesfull():void{
    this.snackBar.open("Clave copiada correctamente!.", 'Cerrar', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 5 * 1000
    });
  }

  
  downloadKey():void{
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.key));
    element.setAttribute('download', "Easysync_"+new Date().getTime()+"_key");

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }
  



  onSubmitNewPassword():void{

    this.progressBar = true;
    if(this.form.password === this.form.newpassword){
      this.authService.change_password(this.form.password).subscribe(
        data =>{
          this.progressBar = false;
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
          this.progressBar = false;
        }
      );
    }else{
      this.snackBar.open("Las contraseñas tienen que ser iguales!.", 'Cerrar', {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        duration: 5 * 1000
      });
    }
  }

  getProgressBarStorage():void{
    this.userService.getUserStorageSize().subscribe(
      data =>{
        let user = this.tokenService.getUser();
        this.progressBarStorage = (Number.parseInt(data.result) * 100)/ Number.parseInt(user.storage_limit);
        this.progressBarStorage = Number.parseInt(this.progressBarStorage+"");
        this.userStorageTotal = this.appComponent.convertBytesSize(Number(user.storage_limit));
        this.userStorageUsed = this.appComponent.convertBytesSize(Number.parseInt(data.result));
      });
  }

}
