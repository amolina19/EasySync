import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileService } from 'src/app/_services/file.service';
import { MoreInfoComponent } from '../more-info/more-info.component';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.css']
})
export class DeleteDialogComponent implements OnInit {

  constructor(private fileService:FileService,public dialogRef: MatDialogRef<MoreInfoComponent>,@Inject(MAT_DIALOG_DATA) public data: any) { }

  moreThanOne:boolean = false;
  deleteButton:boolean;

  ngOnInit(): void {
    this.fileService.getChildMap().clear();
    let childs = this.fileService.hasChilds(this.data.element.id);
    if(childs.size > 1){
      this.moreThanOne = true;
      
    }
    //console.log(childs.size);
  }

}
