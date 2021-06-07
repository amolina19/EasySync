import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from 'src/app/_services/user.service';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.css']
})
export class ShareComponent implements OnInit {

  constructor(private userService: UserService,public dialogRef: MatDialogRef<ShareComponent>,@Inject(MAT_DIALOG_DATA) public data: any,private snackBar: MatSnackBar) { 
  }

  userEmail:string;

  ngOnInit(): void {
  }

}
