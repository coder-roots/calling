import { Component, OnInit, QueryList, ViewChildren, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { RolePermissionService } from 'src/app/services/role-permission/role-permission.service';

@Component({
  selector: 'app-add-roles-permissions',
  templateUrl: './add-roles-permissions.component.html',
  styleUrls: ['./add-roles-permissions.component.css']
})
export class AddRolesPermissionsComponent implements OnInit {

  roleForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    permissions: new FormControl(''),
    _id: new FormControl("")
  })

  allSelected: boolean = false;
  items = [
    { name: 'DASHBOARD-MANAGE', checked: false },

    { name: 'ROLES-PERMISSION-MANAGE', checked: false },
    { name: 'USER-MANAGE', checked: false },
    { name: 'USER-DELETE', checked: false }, //
    { name: 'CLIENTS-MANAGE', checked: false },
    { name: 'CLIENTS-DELETE', checked: false }, //
    { name: 'EMPLOYEE-MANAGE', checked: false },
    { name: 'EMPLOYEE-DELETE', checked: false }, //
    { name: 'AVAILABILITY-MANAGE', checked: false },

    { name: 'COURSE-MANAGE', checked: false },
    { name: 'COURSE-DELETE', checked: false }, //
    { name: 'COLLEGE-COURSE-MANAGE', checked: false },
    { name: 'COLLEGE-COURSE-DELETE', checked: false }, //
    { name: 'DURATION-MANAGE', checked: false },
    { name: 'DURATION-DELETE', checked: false }, //
    { name: 'COLLEGE-MANAGE', checked: false },
    { name: 'COLLEGE-DELETE', checked: false }, //
    { name: 'TIMESLOT-MANAGE', checked: false },
    { name: 'TIMESLOT-DELETE', checked: false }, //
    { name: 'LAB-MANAGE', checked: false },
    { name: 'LAB-DELETE', checked: false }, //
    { name: 'STORE-ITEMS-MANAGE', checked: false },
    { name: 'STORE-ITEMS-DELETE', checked: false }, //
    { name: 'SESSIONYEAR-MANAGE', checked: false },

    { name: 'BATCH-MANAGE', checked: false },
    { name: 'BATCH-DELETE', checked: false }, //
    { name: 'ENQUIRY-MANAGE', checked: false },
    { name: 'ENQUIRY-DELETE', checked: false }, //
    { name: 'ADMISSION-MANAGE', checked: false },
    { name: 'ADMISSION-DELETE', checked: false }, //
    { name: 'STUDENT-MANAGE', checked: false },
    { name: 'STUDENT-DELETE', checked: false }, //
    { name: 'CERTIFICATE-MANAGE', checked: false },
    { name: 'CERTIFICATE-DELETE', checked: false }, //
    { name: 'CALL-MANAGE', checked: false },
    { name: 'CALL-DELETE', checked: false },  //
    { name: 'FEE-MANAGE', checked: false },
    { name: 'FEE-DELETE', checked: false }, //
    { name: 'PRINT-RECEIPT-MANAGE', checked: false },
    { name: 'REPORT-MANAGE', checked: false },
    { name: 'DROP-ENQUIRY', checked: false },
  ]

  permissions: any = []
  type: string = 'Add'

  constructor(private toastr: ToastrService, private spinner: NgxSpinnerService, private router: Router, private _roleService: RolePermissionService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(param => {
      if (param.get('id') != undefined && param.get('id') != null) {
        this.type = 'Update'
        this.roleForm.patchValue({ _id: param.get('id') ?? undefined })
        this.getSingleRole(param.get('id'))
      } else {
        this.roleForm.patchValue({ _id: undefined })
      }
    })
  }

  getSingleRole(id: any) {
    this.spinner.show()
    this._roleService.singleRole({ _id: id }).subscribe({
      next: (v: any) => {
        if (v.success) {
          this.roleForm.patchValue({ name: v.data?.name })

          this.permissions = v.data?.permissions
          this.roleForm.patchValue({ 'permissions': this.permissions })

          this.permissions.forEach((x: any) => {
            var a = this.items.findIndex((y: any) => y.name == x)
            if (a != -1) this.items[a].checked = true
          })
          if (this.permissions.length == this.items.length) this.allSelected = true
        } else {
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



  submit() {
    if (this.permissions.length <= 0) {
      this.toastr.error('Please Select atleast one permission', 'Error')
      return
    }
    this.roleForm.patchValue({ 'permissions': this.permissions })
    this.spinner.show()
    if (this.type == 'Add') {
      this._roleService.addRole(this.roleForm.value).subscribe({
        next: (v: any) => {
          var result = v
          if (result.success) {
            this.toastr.success(result.message, 'Success')
            this.router.navigateByUrl('/admin/roles')
          } else {
            this.toastr.error(result.message, 'Error')
            this.router.navigateByUrl('/admin/home')
          }

        }, error: (error) => { this.toastr.error(error.error.message); this.spinner.hide(); }, complete: () => { this.spinner.hide(); }
      })
    } else {
      this._roleService.updateRole(this.roleForm.value).subscribe({
        next: (v: any) => {
          var result = v
          if (result.success) {
            this.toastr.success(result.message, 'Success')
            this.router.navigateByUrl('/admin/roles')
          } else {
            this.toastr.error(result.message, 'Error')
            this.router.navigateByUrl('/admin/home')
          }

        }, error: (error) => { this.toastr.error(error.error.message); this.spinner.hide(); }, complete: () => { this.spinner.hide(); }
      })
    }

  }


  checkValue(per: any) {
    var a = this.permissions.filter((x: any) => x == per.name)
    if (a.length > 0) return true
    else return false
  }

  updateAllComplete(name: any, event: any) {
    if (event) {
      this.permissions.push(name)
    } if (!event) {
      this.permissions.forEach((value: any, index: any) => {
        if (value == name) this.permissions.splice(index, 1);
      });
    }
    this.allSelected = this.items != null && this.items.every(t => t.checked);
  }



  setAll(completed: boolean) {

    this.allSelected = completed;
    if (this.items == null) {
      return;
    }
    if (completed) {
      this.permissions = this.items.map((x: any) => x.name)
    }
    else {
      this.permissions = []
    }
    this.items.forEach(t => (t.checked = completed));
  }
}
