import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { EnquiryService } from '../../../services/enquiry/enquiry.service';
import { BASE_IMAGE_URL } from '../../../endpoints';
import { read, utils } from 'xlsx';

@Component({
  selector: 'app-enquiry-add-multiple',
  templateUrl: './enquiry-add-multiple.component.html',
  styleUrls: ['./enquiry-add-multiple.component.css']
})
export class EnquiryAddMultipleComponent implements OnInit {


  collegeId:any = ''
  multipleEnqForm:any
  fileName: any = ''
  collegeList:any[]=[]
  constructor(@Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<EnquiryAddMultipleComponent>,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private enquiryService: EnquiryService
    ) {
      this.collegeList = JSON.parse(sessionStorage.getItem('colleges') ?? '')
      this.multipleEnqForm = this.data.form
    
  }

  ngOnInit(): void {
  }


  downloadFormat(){
    return BASE_IMAGE_URL+"excelSheet/EnquirySheetFormat.xlsx"
  }



  enqArray:any[]=[]
  uploadFile(event: any) {
    if(this.collegeId == ''){
      this.toastr.error("Choose College")
    }
    else{
      this.enqArray = []
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
              obj['technologies'] = []
              obj['college'] = this.collegeId
              let currentline = lines[i].split(",");
              if(!currentline[0])
                continue
              for (let j = 0; j < headers.length; j++) {
                if(j<13)
                obj[headers[j]] = currentline[j];
                else{
                  let techArray = currentline[j].split(".")
                  // console.log("techArray",techArray);
                  if(techArray.length==3){
                    let obj1 = {
                      course:techArray[0],
                      enquiryTakenBy:techArray[1],
                      duration:'',
                      installments:'',
                      fee:'',
                      minimumRegistrationFee:'',
                      discount:Number(techArray[2]),
                    }
                    obj['technologies'].push(obj1)
                  }
                  
                }
              }
              this.enqArray.push(obj);
            }
            // console.log("array",this.enqArray);

            for(let x of this.enqArray){
              x.enquiryDate = this.parseDMY(x.enquiryDate)
            }
            this.multipleEnqForm.patchValue({enqArray:this.enqArray})

          }
        }
        reader.readAsArrayBuffer(file)
      }
    }

  }

  parseDMY = (s:any) => {
    let [d, m, y] = s.split(/\D/);
    return new Date(y, m-1, d);
  };


  submit(){
    // console.log(this.multipleEnqForm.value);
    // return 
    this.spinner.show()
    this.enquiryService.addEnquiryMultiple(this.multipleEnqForm.value).subscribe({
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
