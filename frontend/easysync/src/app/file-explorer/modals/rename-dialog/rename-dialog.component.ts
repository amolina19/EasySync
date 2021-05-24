import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from 'src/app/_services/user.service';
import { MoreInfoComponent } from '../more-info/more-info.component';

@Component({
  selector: 'app-renameDialog',
  templateUrl: './rename-dialog.component.html',
  styleUrls: ['./rename-dialog.component.css']
})
export class RenameDialogComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<MoreInfoComponent>,@Inject(MAT_DIALOG_DATA) public data: any) {
    this.folderName = data.element.name;
  }

  folderName: string;

  ngOnInit() {}
}