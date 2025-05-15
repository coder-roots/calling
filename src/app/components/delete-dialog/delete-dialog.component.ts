import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.css']
})
export class DeleteDialogComponent implements OnInit {

  message: string = ''
  constructor(@Inject(MAT_DIALOG_DATA) private data: any, private dialogRef: MatDialogRef<DeleteDialogComponent>) {
    this.message = data.message
  }

  ngOnInit(): void {
  }

  onConfirmClick(): void {
    this.dialogRef.close(true);
  }

}
