import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { PouchdbService } from "./pouchdb.service";
import { Ng4FilesModule } from './angular4-files-upload';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DataTableModule, SharedModule } from 'primeng/primeng';
import { MatTabsModule, MatDialogModule, MatButtonModule, MatInputModule, MatTableModule, MatSortModule } from '@angular/material';
import { DbnamedialogComponent } from './dbnamedialog/dbnamedialog.component';

@NgModule({
  declarations: [
    AppComponent,
    DbnamedialogComponent
  ],
  entryComponents: [
    DbnamedialogComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    Ng4FilesModule,
    BrowserAnimationsModule,
    DataTableModule,
    SharedModule,
    MatTabsModule,
    MatDialogModule,
    MatButtonModule, 
    MatInputModule,
    MatTableModule,
    MatSortModule
  ],
  exports: [ MatTabsModule, MatDialogModule, MatButtonModule, MatInputModule, MatTableModule, MatSortModule ],
  providers: [PouchdbService],
  bootstrap: [AppComponent]
})

export class AppModule { }
