import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileService } from 'src/app/_services/file.service';

@Component({
  selector: 'app-restore',
  templateUrl: './restore.component.html',
  styleUrls: ['./restore.component.css']
})
export class RestoreComponent implements OnInit {

  moreThanOne:boolean = false;
  restoreButton:boolean;
  constructor(private fileService:FileService,public dialogRef: MatDialogRef<RestoreComponent>,@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {

    this.fileService.getChildMap().clear();
    let childs = this.fileService.hasChilds(this.data.element.id);
    if(childs.size > 1){
      this.moreThanOne = true;
    }
  }

}
