import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-call-history',
  templateUrl: './call-history.component.html',
  styleUrls: ['./call-history.component.css']
})
export class CallHistoryComponent implements OnInit {
  callHistory:any;
  studentName:any;
  displayedColumns: string[] = ['srNo', 'callerName', 'callDate','callStatus']
  dataSource = new MatTableDataSource<any>([]);

  constructor(
    @Inject(MAT_DIALOG_DATA) private data:any,
    private dialogRef:MatDialogRef<CallHistoryComponent>
    ) {
      this.callHistory = this.data.array
      this.studentName = this.data.studentName
   }

  ngOnInit(): void {
    this.dataSource.data = this.callHistory
  }

  close(){
    this.dialogRef.close(true)
  }

}
