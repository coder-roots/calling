import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { EmployeeService } from 'src/app/services/employee/employee.service';

@Component({
  selector: 'app-employee-add',
  templateUrl: './employee-add.component.html',
  styleUrls: ['./employee-add.component.css']
})
export class EmployeeAddComponent implements OnInit {

  fileName: any = ''
  type: string = "Add"
  id: any = ''
  employeeList: any[] = []
  employeeForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    contact: new FormControl('', Validators.required),
    // familyContact : new FormControl('', Validators.required),
    birthDate: new FormControl('', Validators.required),
    address: new FormControl("", [Validators.required]),
    aadharCard: new FormControl('', [Validators.required]),
    panNo: new FormControl('', [Validators.required]),
    employee_image: new FormControl(null),
    // specialInterests:new FormControl(''),
    learningInstitutions: new FormArray([
      new FormGroup({
        course: new FormControl(''),
        institution: new FormControl('')
      })
    ]),

    maritalStatus: new FormControl('Unmarried', [Validators.required]),
    spouseName: new FormControl(''),
    spouseEmployer: new FormControl(''),


    joiningDate: new FormControl('', [Validators.required]),
    jobTitle: new FormControl('', [Validators.required]),
    employeeId: new FormControl('', [Validators.required]),
    department: new FormControl('', [Validators.required]),
    supervisor: new FormControl('', [Validators.required]),
    workLocation: new FormControl(''),
    workEmail: new FormControl('', [Validators.required]),
    // workNumber:new FormControl(''),
    startDateSalary: new FormControl(''),

    personName: new FormControl(''),
    personAddress: new FormControl(''),
    personContact: new FormControl(''),
    relationship: new FormControl(''),
    healthCondition: new FormControl(''),

    _id: new FormControl(''),
  })

  get learningInstitutions(): FormArray {
    return this.employeeForm.get('learningInstitutions') as FormArray
  }


  lastDisabled: any
  addLearningInstitution(event: any): void {
    event.target.disabled = true
    this.lastDisabled = event
    const institution = this.formBuilder.group({
      course: new FormControl(''),
      institution: new FormControl(''),
    })
    this.learningInstitutions.push(institution);
    // console.log("added",this.learningInstitutions.value);

  }

  removeLearningInstitution(index: number) {
    if (index != 0) {
      this.learningInstitutions.removeAt(index);
      this.lastDisabled.target.disabled = false
    }
  }

  durationList: any = []

  selectFormControl = new FormControl();
  searchTextboxControl = new FormControl();
  selectedValues: any = [];

  filteredOptions: Observable<any[]> | undefined;
  @ViewChild('search') searchTextBox: ElementRef = {} as ElementRef;


  data: any[] = [
    { 'name': '' }
  ]

  _id: any
  employeeData: any

  constructor(private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {
  }

  ngOnInit(): void {
    // this.getDurations()
    this.employeeList = JSON.parse(sessionStorage.getItem('employees') ?? '')
    this.route.paramMap.subscribe(param => {
      this.id = param.get('id') ?? ""
      this.type = this.id == "" ? 'Add' : 'Update'
      if (this.type == 'Update') {
        this.getSingleEmployee()
      }
    })
  }

  uploadImage(event: any) {
    // console.log("event",event)
    this.employeeForm.patchValue({ "employee_image": event.target.files[0] })
    // console.log(this.employeeForm.value.employee_image);
    this.fileName = event.target.files[0]?.name

  }



  getSingleEmployee() {
    this.spinner.show()
    this.employeeService.singleEmployee({ _id: this.id }).subscribe({
      next: (v: any) => {
        var result = v
        if (result.success) {
          this.employeeData = v.data
          this.employeeForm.patchValue({
            _id: v.data?._id,
            name: v.data?.name,
            email: v.data?.email,
            contact: v.data?.contact,
            // familyContact: v.data?.familyContact,
            birthDate: v.data?.birthDate,
            address: v.data?.address,
            aadharCard: v.data?.aadharCard,
            panNo: v.data?.panNo,
            // specialInterests:v.data?.specialInterests,
            maritalStatus: v.data?.maritalStatus,
            spouseName: v.data?.spouseName,
            spouseEmployer: v.data?.spouseEmployer,

            joiningDate: v.data?.joiningDate,
            jobTitle: v.data?.jobTitle,
            employeeId: v.data?.employeeId,
            department: v.data?.department,
            supervisor: v.data?.supervisor._id,
            workLocation: v.data?.workLocation,
            workEmail: v.data?.workEmail,
            // workNumber:v.data?.workNumber,
            startDateSalary: v.data?.startDateSalary,

            personName: v.data?.personName,
            personAddress: v.data?.personAddress,
            personContact: v.data?.personContact,
            relationship: v.data?.relationship,
            healthCondition: v.data?.healthCondition
          })

          let array = v.data?.learningInstitutions
          console.log("array", array);
          for (let value of array) {
            const institution = this.formBuilder.group({
              course: new FormControl(value.course),
              institution: new FormControl(value.institution),
            })
            this.learningInstitutions.push(institution);
          }
          this.learningInstitutions.removeAt(0)
          console.log("form", this.employeeForm.value);
          this.spinner.hide()
        }
        else {
          this.toastr.error(v.message, 'Error')
          this.spinner.hide()
        }
      },
      error: (e) => {
        this.spinner.hide()
        this.toastr.error(e.error.message)
      },
      complete: () => { this.spinner.hide() }
    })
  }

  submit() {
    // console.log("Learning Institutions", this.learningInstitutions.value);
    
    this.spinner.show()
    let apiData = new FormData()
    apiData.append("name", this.employeeForm.value.name ?? '')
    apiData.append("email", this.employeeForm.value.email ?? '')
    apiData.append("contact", this.employeeForm.value.contact ?? '')
    // apiData.append("familyContact", this.employeeForm.value.familyContact ?? '')
    apiData.append("birthDate", this.employeeForm.value.birthDate ?? '')
    apiData.append("address", this.employeeForm.value.address ?? '')
    apiData.append("aadharCard", this.employeeForm.value.aadharCard ?? '')
    apiData.append("panNo", this.employeeForm.value.panNo ?? '')
    // apiData.append("specialInterests", this.employeeForm.value.specialInterests ?? '')    
    apiData.append("learningInstitutions", JSON.stringify(this.learningInstitutions.value) ?? '')
    apiData.append("maritalStatus", this.employeeForm.value.maritalStatus ?? '')
    if (this.employeeForm.value.maritalStatus == 'Unmarried') {
      apiData.append("spouseName", '')
      apiData.append("spouseEmployer", '')
    }
    else {
      apiData.append("spouseName", this.employeeForm.value.spouseName ?? '')
      apiData.append("spouseEmployer", this.employeeForm.value.spouseEmployer ?? '')
    }

    apiData.append("jobTitle", this.employeeForm.value.jobTitle ?? '')
    apiData.append("joiningDate", this.employeeForm.value.joiningDate ?? '')
    apiData.append("employeeId", this.employeeForm.value.employeeId ?? '')
    apiData.append("department", this.employeeForm.value.department ?? '')
    apiData.append("supervisor", this.employeeForm.value.supervisor ?? '')
    apiData.append("workLocation", this.employeeForm.value.workLocation ?? '')
    apiData.append("workEmail", this.employeeForm.value.workEmail ?? '')
    // apiData.append("workNumber", this.employeeForm.value.workNumber ?? '')
    apiData.append("startDateSalary", this.employeeForm.value.startDateSalary ?? '')
    apiData.append("personName", this.employeeForm.value.personName ?? '')
    apiData.append("personAddress", this.employeeForm.value.personAddress ?? '')
    apiData.append("personContact", this.employeeForm.value.personContact ?? '')
    apiData.append("relationship", this.employeeForm.value.relationship ?? '')
    apiData.append("healthCondition", this.employeeForm.value.healthCondition ?? '')

    if (this.employeeForm.value.employee_image != null)
      apiData.append("employee_image", this.employeeForm.value.employee_image ?? '')
    if (this.type == 'Add') {
      if (this.employeeForm.value.employee_image != null) {
        this.employeeService.addEmployee(apiData).subscribe({
          next: (v: any) => {
            if (v.success) {
              this.toastr.success(v.message, 'Success')
              this.router.navigateByUrl('/admin/employees')
              this.spinner.hide()
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
      else {
        this.spinner.hide()
        this.toastr.error("Employee Image is Required",)

      }
    }
    else {
      apiData.append('_id', this.employeeForm.value._id ?? '')
      this.employeeService.updateEmployee(apiData).subscribe({
        next: (v: any) => {
          if (v.success) {
            this.toastr.success(v.message, 'Success')
            this.router.navigateByUrl('/admin/employees')
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
  }

}
