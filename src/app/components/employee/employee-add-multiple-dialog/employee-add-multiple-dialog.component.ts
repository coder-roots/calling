import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { EmployeeService } from '../../../services/employee/employee.service';
import { BASE_IMAGE_URL } from '../../../endpoints';
import { read, utils } from 'xlsx';

@Component({
  selector: 'app-employee-add-multiple-dialog',
  templateUrl: './employee-add-multiple-dialog.component.html',
  styleUrls: ['./employee-add-multiple-dialog.component.css']
})
export class EmployeeAddMultipleDialogComponent implements OnInit {

  multipleEmpForm:any
  fileName: any = ''
  constructor(@Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<EmployeeAddMultipleDialogComponent>,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private employeeService: EmployeeService
    ) {

    this.multipleEmpForm = this.data.form
    
  }

  ngOnInit(): void {
  }


  downloadFormat(){
    return BASE_IMAGE_URL+"excelSheet/EmployeeSheetFormat.xlsx"
  }

  empArray:any[]=[]
  uploadFile(event: any) {
    this.empArray = []
    const files = event.target.files
    if (files.length) {
      const file = files[0]
      this.fileName= file.name
      const reader = new FileReader()
      reader.onload = (event: any) => {
        const wb = read(event.target.result)
        const sheets = wb.SheetNames
        if (sheets.length) {
          const rows = utils.sheet_to_csv(wb.Sheets[sheets[0]])
          let sheetData: any;
          sheetData = rows
          // console.log("Students CSV",sheetData);

          let lines = sheetData.split('\n')
          // console.log("Split ", lines);

          var headers = lines[0].split(",");
          
          for (var i = 1; i < lines.length; i++) {
            let obj:any = {};
            obj['learningInstitutions'] = []
            let currentline = lines[i].split(",");
            if(!currentline[0])
              continue
            for (let j = 0; j < headers.length; j++) {
              if(j<24)
              obj[headers[j]] = currentline[j];
              else{
                
                let qualificationArray = currentline[j].split("/")
                // console.log("qualificationArray",qualificationArray);
                if(qualificationArray.length==2){
                  let obj1 = {
                    course:qualificationArray[0],
                    institution:qualificationArray[1]
                  }
                  obj['learningInstitutions'].push(obj1)
                }
                
              }
            }
            this.empArray.push(obj);
          }
          // console.log("array",this.empArray);

          for(let x of this.empArray){
            x.birthDate = this.parseDMY(x.birthDate)
            x.joiningDate = this.parseDMY(x.joiningDate)
          }
          this.multipleEmpForm.patchValue({empArray:this.empArray})

        }
      }
      reader.readAsArrayBuffer(file)
    }


  }

  parseDMY = (s:any) => {
    let [d, m, y] = s.split(/\D/);
    return new Date(y, m-1, d);
  };


  submit(){
    // console.log(this.multipleEmpForm.value);
    // return 
    this.spinner.show()
    this.employeeService.addEmployeeMultiple(this.multipleEmpForm.value).subscribe({
      next: (v: any) => {
        if (v.success) {
          this.spinner.hide()
          this.toastr.success(v.message, 'Success')
          this.dialogRef.close(true)
        }
        else {
          this.toastr.error(v.message, 'Error')
          this.spinner.hide()
        }
      },
      error: (e: any) => {
        this.spinner.hide()
        this.toastr.error(e.error.message, 'Error')
      },
      complete: () => { this.spinner.hide() }
    })

  }
}
