import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButton, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-dbnamedialog',
  templateUrl: './dbnamedialog.component.html',
  styleUrls: ['./dbnamedialog.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class DbnamedialogComponent implements OnInit {

  ngOnInit() {
  }

  constructor(
    public dialogRef: MatDialogRef<DbnamedialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }
  
  onYesClick(): void {
    this.dialogRef.close(this.data.dbname);
  }
  onNoClick(): void {
    this.dialogRef.close(false);
  }
}
