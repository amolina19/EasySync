import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.css']
})
export class RecoverPasswordComponent implements OnInit {


  hide:boolean = true;
  form: any = {};
  constructor() { }

  ngOnInit(): void {
  }

  onSubmitNewPassword(){

  }

}
