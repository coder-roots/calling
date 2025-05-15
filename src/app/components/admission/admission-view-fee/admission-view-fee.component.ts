import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AdmissionService } from 'src/app/services/admission/admission.service';
import { CalculateFeeService } from 'src/app/services/calculateFee/calculate-fee.service';
import { FeeService } from 'src/app/services/fee/fee.service';
import { ExtraService } from '../../../services/extra/extra.service';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-admission-view-fee',
  templateUrl: './admission-view-fee.component.html',
  styleUrls: ['./admission-view-fee.component.css']
})
export class AdmissionViewFeeComponent implements OnInit {

  admissionId: any
  displayedColumns: string[] = ['index', 'name', 'courseType', 'fee', 'minimumRegistrationFee', 'duration']
  dataSource = new MatTableDataSource<any>([]);
  feeData: any = {}
  totalPaid: number = 0
  constructor(
    private admissionService: AdmissionService,
    private calculateFeeService: CalculateFeeService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private feeService: FeeService,
    private _extra: ExtraService,
    private DatePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.admissionId = this.activatedRoute.snapshot.paramMap.get('id')
    this.getSingleAdmission(this.admissionId)
    this.getFeeData(this.admissionId)
    this.getFeeReceipts(this.admissionId)
    this.dataSource.data = []
  }

  admissionData: any;

  monthArray:any = [
    { monthIndex: 1, monthName: 'January' },
    { monthIndex: 2, monthName: 'February' },
    { monthIndex: 3, monthName: 'March' },
    { monthIndex: 4, monthName: 'April' },
    { monthIndex: 5, monthName: 'May' },
    { monthIndex: 6, monthName: 'June' },
    { monthIndex: 7, monthName: 'July' },
    { monthIndex: 8, monthName: 'August' },
    { monthIndex: 9, monthName: 'September' },
    { monthIndex: 10, monthName: 'October' },
    { monthIndex: 11, monthName: 'November' },
    { monthIndex: 12, monthName: 'December' }
  ]

  getSingleAdmission(id: any) {
    this.admissionService.singleAdmission({ _id: id }).subscribe({
      next: (v: any) => {
        var result = v
        if (result.success) {
          this.admissionData = v.data
          // console.log(this.admissionData)
          this.dataSource.data = [...this.dataSource.data, ...(this.admissionData.technologies || [])];
        }
        else {
          this.toastr.error(v.message, 'Error')
        }
      },
      error: (e) => {
        this.spinner.hide()
        this.toastr.error(e.error.message)
      },
      complete: () => { this.spinner.hide() }
    })
  }

  getFeeData(admissionId: any) {
    this.calculateFeeService.fetchAdmissionCalculatedFee({ admissionId: admissionId }).subscribe({
      next: (v: any) => {
        if (v.success) {
         
          // this.toastr.success(v.message, 'Success')
          // this.router.navigateByUrl('/admin/enquiries')
          this.feeData = v.data
          // console.log(this.feeData);
          this.totalPaid += this.feeData.registrationFeePaid
          for (let x of this.feeData.installments) {
            this.totalPaid += x.paidAmount
          }
        }
        else {
          this.toastr.error(v.message, 'Error')
        }
      },
      error: (e: any) => {
        this.spinner.hide()
        this.toastr.error(e.error.message, 'Error')
      },
      complete: () => { this.spinner.hide() }
    })
  }

  receiptList: any[] = []
  getFeeReceipts(admissionId: any) {

    this.feeService.getAllFeeReceipt({ admissionId: admissionId, removeSession: 'true' }).subscribe({
      next: (result) => {
        this.spinner.hide()
        if (result.success) {
          this.receiptList = result.data

        }
        else {
          this.spinner.hide()
          this.toastr.error(result.message)
        }
      },
      error: (e) => {
        this.spinner.hide()
        this.toastr.error(e)

      },
      complete: () => {
        this.spinner.hide()
      }
    })
  }

  printDetail() {
    window.print()
  }

  getPaidAmount(installment: any) {
    let paid = installment?.paidAmount
    for (let i of installment.balancePayments)
      paid += i.paidAmount || 0

    return paid
  }

  goToReceipt(data: any) {
    this.router.navigate(['/print-receipt', data?._id], {
      state: {
        data: data,
        id: data?._id,
        type: ''
      }
    })
  }

  getRegistrationPaidAmount(){
    return this.feeData?.registrationFeePaid > this.feeData?.registrationFeePayable ? this.feeData?.registrationFeePayable : this.feeData?.registrationFeePaid
  }

  // generate excel of receipts
  generateExcel() {
    var header = ['Sr.', 'Slip ID', 'Slip Type', 'Paid Amount', 'Paid At', 'Collected By', 'Payment Method', 'Remarks'];
    //console.log(this.data)
    if (this.receiptList?.length == 0) {
      return
    }
    // var excelName = `${this.result.title}`
    var excelName = `${this.admissionData?.studentId.studentName}-${this.admissionData?.studentId.studentAutoId}`;

    const excelData: any = []
    var i = 0
    this.receiptList.forEach((e: any) => {
      i = i + 1
      var tempObj: any = [];
      tempObj.push(i);
      tempObj.push(`${e?.feeReceiptAutoId} ${e?.receiptType == 1 ? '( ' + e?.manualReceiptNumber + ' )' : ''}`)
      tempObj.push(`${e?.isRegistrationSlip ? "Registration" : "Installment " + e?.installmentNumber}`)
      tempObj.push(`${e?.amountPaid}`)
      let collectedAt = this.DatePipe.transform(e?.collectedOn, 'dd/MM/yyyy HH:mm a');
      tempObj.push(`${collectedAt}`);
      tempObj.push(`${e?.collectedBy?.name.toUpperCase()}`)
      tempObj.push(`${e?.paymentMethod}`)
      tempObj.push(`${e?.remarks}`);
      excelData.push(tempObj);
    });

    this._extra.generateExcel(excelData, `${excelName} `, header, this.feeData?.totalBalance);
  }

}
