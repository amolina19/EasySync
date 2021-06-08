import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { AuthService } from '../_services/auth.service';
import { TokenStorageService } from '../_services/token-storage.service';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.css']
})
export class RecoverPasswordComponent implements OnInit {


  hide:boolean = true;
  token:string;
  form: any = {};
  passwordNotMatch:boolean = false;
  verificationKeyNotMatch:boolean = false;
  recoveredSuccess:boolean = false;
  successMessage:any;
  errorMessage:any;
  constructor(private authService: AuthService,private route: ActivatedRoute,private tokenStorage:TokenStorageService,private router:Router,private appComponent:AppComponent) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });

    if(this.tokenStorage.userExits()){
      this.router.navigate(['/home']);
    }

    console.log(this.errorMessage);
  }

  onSubmitNewPassword(){
    this.appComponent.progressBar = true;

    if(this.form.newpassword !== this.form.password){
      this.passwordNotMatch = true;
      this.appComponent.progressBar = false;
    }else{
      this.passwordNotMatch = false;
      this.authService.recover_password(this.token,this.form.password,this.form.pbkf2).subscribe(
        data =>{
          this.verificationKeyNotMatch = false;
          this.passwordNotMatch = false;
          let dataMap = new Map(Object.entries(data));
          console.log(dataMap.get('message'));
          this.appComponent.progressBar = false;
          this.recoveredSuccess = true;
          this.successMessage = dataMap.get('message');
      }, err=>{
          this.errorMessage = err.message;
          this.appComponent.progressBar = false;
          this.recoveredSuccess = false;
          this.verificationKeyNotMatch = true;
      });
    }
    
    
  }

}
