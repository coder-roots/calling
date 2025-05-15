import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '../../../services/report/report.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl, FormGroup } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DatePipe } from '@angular/common';
import { CreateExcelService } from '../../../services/excel/create-excel.service';

@Component({
  selector: 'app-overall-balance-report',
  templateUrl: './overall-balance-report.component.html',
  styleUrls: ['./overall-balance-report.component.css']
})
export class OverallBalanceReportComponent implements OnInit {

  courseList: any[] = [];

  constructor(private report: ReportService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private DatePipe: DatePipe,
    private excelService: CreateExcelService

  ) {
    this.courseList = JSON.parse(sessionStorage.getItem('courses') ?? '');
  }

  displayedColumns: string[] = [
    'Sr',
    'company',
    'admNo',
    'name',
    'course',
    'startDate',
    'trainingType',
    'collegeCourse',
    'totalFee',
    'discount',
    'totalFeePayable',
    'regPayable',
    'regPending',
    'feePaid',
    'tbalance',
    'extra',
    'installmentNo',
    'i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7', 'i8', 'i9', 'i10'
  ];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  userType: any;
  companies: any[] = [];
  company: any = null;


  ngOnInit(): void {
    const userData = JSON.parse(sessionStorage.getItem('user_data') ?? '{}');
    this.userType = userData.data.userType;

    // Prefill companies
    let companies = JSON.parse(sessionStorage.getItem('companies') ?? '[]');
    this.companies = companies;

    if (companies.length > 0) {
      this.company = companies[0];
    } else {
      this.toastr.warning('No companies available. Please set up companies.');
    }
    this.getReport();
  }


  filterForm = new FormGroup({
    startDate: new FormControl(new Date()),
    endDate: new FormControl(new Date())
  })



  courseId: any;


  getReport() {
    let data: any = {};
    if (!!this.filterForm.value.startDate && !!this.filterForm.value.endDate) {
      data.startDate = this.filterForm.value.startDate
      data.endDate = this.filterForm.value.endDate
    } else {
      return;
    }
    data.sessionYearId = sessionStorage.getItem('session_year')
    if (!!this.company) {
      data.company = this.company
    }
    if (!!this.courseId) {
      data.courseId = this.courseId
    }
    this.report.getOverallBalance(data).subscribe({
      next: (v: any) => {
        this.spinner.hide();
        if (v.success) {
          this.toastr.success(v.message, 'Success')
          this.dataSource.data = v.data;
        } else {
          this.toastr.error(v.message, 'Error');
        }
      },
      error: (e: any) => {
        this.spinner.hide()
        this.toastr.error(e.error.message)
      },
      complete: () => { this.spinner.hide() }
    })
  }

  header = [
    [
      'Sr',
      "company",
      'admNo',
      'name',
      'course',
      'startDate',
      'Type',
      'Course',
      'Fee',
      'Discount',
      'Fee Payable',
      'Payable',
      'Pending',
      'Paid',
      'Balance',
      'Extra',
      'I.No',
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'

    ]]





    generatePdf() {
      var pdf = new jsPDF('l', 'pt', 'a4');
  
      // Add Company Header
      if (!!this.company) {
          const companyName = `Company: ${this.company}`;
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "bold");
          pdf.text(companyName, pdf.internal.pageSize.width / 2, 30, { align: "center" });
      }
  
      // Add Report Title
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      let filter: any = {};
      if (!!this.courseId) {
          const selectedCourse = this.courseList.find((course: any) => course._id === this.courseId);
          if (selectedCourse) filter['Course'] = selectedCourse.name;
      }
  
      let reportTitle = `Overall Balance Report : ${this.DatePipe.transform(this.filterForm.value.startDate, 'dd/MM/YYYY')} - ${this.DatePipe.transform(this.filterForm.value.endDate, 'dd/MM/YYYY')}`;
      if (Object.keys(filter).length > 0) {
          reportTitle += ' | ' + Object.keys(filter)
              .map((key) => `${key}: ${filter[key]}`)
              .join(', ');
      }
  
      pdf.text(reportTitle, 40, 50);
  
      const currentDate = new Date().toLocaleString();
      pdf.setFontSize(8);
      pdf.text(`Date: ${currentDate}`, 40, 60);
  
      // Prepare Table Data
      var prepare: any[][] = [];
      var i = 0;
      this.dataSource.data.forEach((element: any) => {
          i++;
          var tempObj: any = [];
          tempObj.push(i);
          tempObj.push(element?.admissionId?.company );
          tempObj.push(element?.admissionId?.admissionAutoId );
          tempObj.push(element?.admissionId?.studentId?.studentName );
          const courseNames = element?.admissionId?.technologies?.map((tech: any) => tech?.course?.name).join(', ') ;
          tempObj.push(courseNames);
          tempObj.push(this.DatePipe.transform(element?.courseStartDate, "dd/MM/YYYY") );
          tempObj.push(element?.admissionId?.trainingType );
          tempObj.push(element?.admissionId?.collegeCourse );
          tempObj.push(element?.totalFeesApplicable );
          tempObj.push(element?.discount );
          tempObj.push(element?.totalFeeToBePaid );
          tempObj.push(element?.registrationFeePayable );
          tempObj.push(element?.registrationFeePending );
          tempObj.push(element?.totalFeePaid );
          tempObj.push(element?.totalBalance );
          tempObj.push(element?.extra );
          tempObj.push(element?.totalInstallments );
          for (let j = 0; j < 10; j++) {
              tempObj.push((element?.installments[j]?.balance) ?? '-');
          }
          prepare.push(tempObj);
      });
  
      // Add Empty Row
      var tempObj: any = [];
      i += 1;
      prepare.push(tempObj);
  
      // Add Table
      autoTable(pdf, {
          head: this.header,
          body: prepare,
          theme: 'grid',
          startY: 65,
          styles: {
              overflow: 'linebreak',
              fontSize: 7,
              valign: 'middle',
          },
          margin: { left: 40 },
      });

      pdf.output('dataurlnewwindow');
  }
  

  generateExcel() {
    
    var header = [
      'Sr.',
      "company",
      'Adm No.',
      'St. Name',
      'Course',
      'Start Date',
      'Type',
      'College Course',
      'Fee',
      'Discount',
      'Total Fee',
      'Reg. Fee',
      'Reg. Pending',
      '	T. Fee Paid',
      'T. Bal',
      'Extra Fee',
      'T. Ins.',
      'i-1', 'i-2', 'i-3', 'i-4', 'i-5', 'i-6', 'i-7', 'i-8', 'i-9', 'i-10'

    ];
    if (this.dataSource.data?.length == 0) {
      return
    }


    let filter: any = {};

    if (!!this.company) {
      filter.company = this.company;
    }

    if (!!this.courseId) {
      const selectedCourse = this.courseList.find((course: any) => course._id === this.courseId);
      if (selectedCourse) {
        filter.course = selectedCourse.name;
      }
    }

    let heading = {
      title: "Overall Balance Report",
      dateRange: `${this.DatePipe.transform(this.filterForm.value.startDate, 'dd/MM/YYYY')} - ${this.DatePipe.transform(this.filterForm.value.endDate, 'dd/MM/YYYY')}`,
      filters: filter,
    };

    var excelData: any[][] = [];
    var i = 0
    this.dataSource.data.forEach((element: any) => {
      i = i + 1
      var tempObj: any = [];
      tempObj.push(i);
      tempObj.push(element?.admissionId?.company)
      tempObj.push(element?.admissionId?.admissionAutoId);
      tempObj.push(element?.admissionId?.studentId?.studentName);
      const courseNames = element?.admissionId?.technologies?.map((tech: any) => tech?.course?.name).join(', ');
      tempObj.push(courseNames);
      tempObj.push(this.DatePipe.transform(element?.courseStartDate, "dd/MM/YYYY"))
      tempObj.push(element?.admissionId?.trainingType);
      tempObj.push(element?.admissionId?.collegeCourse);
      tempObj.push(element?.totalFeesApplicable)
      tempObj.push(element?.discount)
      tempObj.push(element?.totalFeeToBePaid)
      tempObj.push(element?.registrationFeePayable)
      tempObj.push(element?.registrationFeePending)
      tempObj.push(element?.totalFeePaid)
      tempObj.push(element?.totalBalance)
      tempObj.push(element?.extra)
      tempObj.push(element?.totalInstallments)
      tempObj.push((element?.installments[0]?.balance) ?? '-')
      tempObj.push((element?.installments[1]?.balance) ?? '-')
      tempObj.push((element?.installments[2]?.balance) ?? '-')
      tempObj.push((element?.installments[3]?.balance) ?? '-')
      tempObj.push((element?.installments[4]?.balance) ?? '-')
      tempObj.push((element?.installments[5]?.balance) ?? '-')
      tempObj.push((element?.installments[6]?.balance) ?? '-')
      tempObj.push((element?.installments[7]?.balance) ?? '-')
      tempObj.push((element?.installments[8]?.balance) ?? '-')
      tempObj.push((element?.installments[9]?.balance) ?? '-')
      excelData.push(tempObj);
    });
    var tempObj: any = [];
    i += 1
    excelData.push(tempObj);
    this.excelService.generateExcel({ excelData, header, heading });


  }




}
