import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-more-info',
  templateUrl: './more-info.component.html',
  styleUrls: ['./more-info.component.css']
})
export class MoreInfoComponent {

  created:Date;
  modified_at:Date;
  constructor(public dialogRef: MatDialogRef<MoreInfoComponent>,@Inject(MAT_DIALOG_DATA) public data: any) {


    if(data.element.size < 1024){
      data.element.size = Number(data.element.size/1024).toFixed(2)+" Bytes";
    }else if(data.element.size > 1024 && data.element.size < (1024*1024)-1){
      data.element.size = Number(data.element.size/1024).toFixed(2)+" KBytes";
    }else if(data.element.size > (1024*1024) && data.element.size < (1024*1024*1024)-1){
      data.element.size = Number(data.element.size/1024/1024).toFixed(2)+" MBytes";
    }else if(data.element.size > (1024*1024*1024) && data.element.size < (1024*1024*1024*1024)-1){
      data.element.size = Number(data.element.size/1024/1024/1024).toFixed(2)+" GBytes";
    }else if(data.element.size > (1024*1024*1024*1024) && data.element.size < (1024*1024*1024*1024*1024)-1){
      data.element.size = Number(data.element.size/1024/1024/1024/1024).toFixed(2)+" TBytes";
    }

    /*
    //Fix date
    this.created = data.element.created_at;
    this.modified_at = data.element.modified_at;
    */
  }
  
  /*
  ngOnInit(): void {
    console.log(this.data.element);
  }
  */

}
