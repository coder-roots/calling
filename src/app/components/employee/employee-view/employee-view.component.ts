import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BASE_IMAGE_URL } from 'src/app/endpoints';
import { EmployeeService } from 'src/app/services/employee/employee.service';

@Component({
  selector: 'app-employee-view',
  templateUrl: './employee-view.component.html',
  styleUrls: ['./employee-view.component.css']
})
export class EmployeeViewComponent implements OnInit {

  employeeId:any
  constructor(
    private employeeService:EmployeeService, 
    private activatedRoute:ActivatedRoute,
    private toastr:ToastrService,
    private spinner:NgxSpinnerService
    ) { }

  ngOnInit(): void {
    this.employeeId = this.activatedRoute.snapshot.paramMap.get('id')
    this.getSingleEmployee(this.employeeId)
  }

  employeeData: any


  getImageUrl(path:any){
    return BASE_IMAGE_URL+path
  }
  getSingleEmployee(id:any) {
    this.employeeService.singleEmployee({ _id: id }).subscribe({
      next: (v: any) => {
        var result = v
        if (result.success) {
          this.employeeData = v.data
          // console.log(this.employeeData);
          
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

}
