import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import dateFormat from 'dateformat';
import { FileService } from 'src/app/_services/file.service';


@Component({
  selector: 'app-more-info',
  templateUrl: './more-info.component.html',
  styleUrls: ['./more-info.component.css']
})
export class MoreInfoComponent {

  createdString:String;
  modified_atString:String;
  constructor(public dialogRef: MatDialogRef<MoreInfoComponent>,@Inject(MAT_DIALOG_DATA) public data: any,private fileService:FileService) {

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

    this.createdString = dateFormat(new Date(data.element.created_at),'dddd dd mmm, yyyy HH:MM:ss');
    this.modified_atString = dateFormat(new Date(data.element.modified_at),'dddd dd mmmm yyyy HH:MM:ss');

    if(data.element.isFolder){
      this.fileService.hasChilds(data.element.id);
      data.element.size = this.fileService.getSizeOfFolder();
      //this.fileService.getMap().clear();
    }

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
    //console.log(this.data.element);
  }
  */

}
