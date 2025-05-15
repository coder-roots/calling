import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BASE_IMAGE_URL } from 'src/app/endpoints';
import { RolePermissionService } from 'src/app/services/role-permission/role-permission.service';
import { UserServiceService } from 'src/app/services/userService/user-service.service';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { EmployeeService } from 'src/app/services/employee/employee.service';


@Component({
  selector: 'app-user-add',
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.css'],
})
export class UserAddComponent implements OnInit {
  type: string = 'Add';
  id: string = '';
  imageError: boolean = false;
  imageFile: any = '';

  acceptedImage = ['image/webp'];

  @ViewChild('inputOFiles') inputFiles: ElementRef = {} as ElementRef;

  roleList: any = [];

  BaseUrl = BASE_IMAGE_URL;

  employeeList: any[] = [];
  userForm = new FormGroup({
    name: new FormControl('', Validators.required),
    phone: new FormControl('', [Validators.required]),
    // phone: new FormControl('', [Validators.required, Validators.pattern('[0-9]{7,13}')]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
    employeeId: new FormControl('', Validators.required),
    userType: new FormControl(2),
    role: new FormControl(''),
    assignedCompanies: new FormControl(''),
    _id: new FormControl(''),
  });

  singleUserData: any;

  constructor(
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private _userService: UserServiceService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private roleService: RolePermissionService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.employeeList = JSON.parse(sessionStorage.getItem('employees') ?? '');
    this.route.paramMap.subscribe((param) => {
      this.id = param.get('id') ?? '';
      this.type = this.id == '' ? 'Add' : 'Update';

      if (this.type == 'Update') {
        this.getSingleUser();
        this.userForm.get('password')?.clearValidators();
        // this.userForm.get('countryCode')?.clearValidators()
        this.userForm.updateValueAndValidity();
      }
      // this.getCountries()
      this.getRoles();
    });
  }

  selectEmployee(evt: any) {
    let emp = this.employeeList.filter((x) => {
      return evt == x._id;
    });
    this.userForm.patchValue({
      name: emp[0]?.name,
      email: emp[0]?.workEmail,
      phone: emp[0]?.contact,
    });
  }

  getRoles() {
    this.spinner.show();
    this.roleService.getRole({}).subscribe({
      next: (v: any) => {
        if (v.success) {
          this.roleList = v.data;
        } else {
          this.toastr.error(v.message, 'Error');
          this.router.navigateByUrl('/admin/home');
        }
      },
      error: (e: any) => {
        this.spinner.hide();
        this.toastr.error(e.error.message, 'Error');
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  getSingleUser() {
    this.spinner.show();
    this._userService.singleUser({ _id: this.id }).subscribe({
      next: (v: any) => {
        if (v.success) {
          this.singleUserData = v.data;
          this.imageFile = v.data?.image;
          this.userForm.patchValue({
            _id: this.id,
            name: v.data.name,
            email: v.data?.email,
            phone: v.data?.phone,
            employeeId: v.data?.employeeId,
            userType: v.data?.userType,
            role: v.data?.role,
            assignedCompanies: v.data?.assignedCompanies,
          });
          // this.userForm.patchValue({ socialLinks: { facebook: v.data?.socialLinks?.facebook, twitter: v.data?.socialLinks?.twitter, instagram: v.data?.socialLinks?.instagram, telegram: v.data?.socialLinks?.telegram, whatsapp: v.data?.whatsapp, youtube: v.data.socialLinks?.youtube } });
        } else {
          this.toastr.error(v.message, 'Error');
          this.router.navigateByUrl('/admin/home');
        }
      },
      error: (e: any) => {
        this.spinner.hide();
        this.toastr.error(e.error.message, 'Error');
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  companies: any = ['Jain Student Provider','VSS Immi','Manu Sharma'];

  submit() {

    this.spinner.show();
    if (this.type == 'Add') {
      this.userForm.patchValue({ _id: undefined });

      this._userService.addUser(this.userForm.value).subscribe({
        next: (v: any) => {
          if (v.success) {
            this.toastr.success(v.message, 'Success');
            // this.router.navigateByUrl('/admin/users')
            this.router.navigate(['/admin/users']);
          } else {
            this.toastr.error(v.message, 'Error');
          }
        },
        error: (e: any) => {
          this.spinner.hide();
          this.toastr.error(e.error.message, 'Error');
        },
        complete: () => {
          this.spinner.hide();
        },
      });
    } else {
      // console.log("form value is ", this.userForm.value)
      // this.userForm.patchValue({  })

      this._userService.updateUsers(this.userForm.value).subscribe({
        next: (v: any) => {
          if (v.success) {
            this.toastr.success(v.message, 'Success');
            this.router.navigate(['/admin/users']);
          } else {
            this.toastr.error(v.message, 'Error');
          }
        },
        error: (e: any) => {
          this.spinner.hide();
          this.toastr.error(e.error.message, 'Error');
        },
        complete: () => {
          this.spinner.hide();
        },
      });
    }
  }

  openChangeDialog() {
    var data = {
      _id: '',
      oldPassword: '',
      newPassword: '',
    };
    data._id = this.id;
    let dialogRef = this.dialog.open(ChangePasswordComponent, {
      width: '80%',
      data: data,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'true') {
      }
    });
  }
}
