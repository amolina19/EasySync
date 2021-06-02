import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { NewFolderDialogComponent } from './modals/new-folder-dialog/new-folder-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { RenameDialogComponent } from './modals/rename-dialog/rename-dialog.component';
import { FileExplorerComponent } from './file-explorer.component';
import { MoreInfoComponent } from './modals/more-info/more-info.component';
import { ShareComponent } from './modals/share/share.component';
import { MatCardModule } from '@angular/material/card';
import { MatList, MatListItem, MatListModule } from '@angular/material/list';
import { DeleteDialogComponent } from './modals/delete-dialog/delete-dialog.component';
import { DownloadComponent } from './modals/download/download.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RestoreComponent } from './modals/restore/restore.component';
import { GenerateUrlComponent } from './modals/generate-url/generate-url.component';
import {ClipboardModule} from '@angular/cdk/clipboard';

@NgModule({
  imports: [
    CommonModule,
    MatToolbarModule,
    FlexLayoutModule,
    MatIconModule,
    MatGridListModule,
    MatListModule,
    MatCardModule,
    MatMenuModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatProgressBarModule,
    ClipboardModule
  ],
  declarations: [FileExplorerComponent, NewFolderDialogComponent, RenameDialogComponent, MoreInfoComponent, ShareComponent, DeleteDialogComponent, DownloadComponent, RestoreComponent, GenerateUrlComponent],
  exports: [FileExplorerComponent],
  entryComponents: [NewFolderDialogComponent, RenameDialogComponent]
})
export class FileExplorerModule {}