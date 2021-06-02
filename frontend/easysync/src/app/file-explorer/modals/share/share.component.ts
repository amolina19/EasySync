import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.css']
})
export class ShareComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ShareComponent>,@Inject(MAT_DIALOG_DATA) public data: any) { 
  }

  userEmail:string;

  ngOnInit(): void {
  }

}
