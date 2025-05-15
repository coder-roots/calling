import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { RolePermissionService } from 'src/app/services/role-permission/role-permission.service';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-roles-permissions',
  templateUrl: './roles-permissions.component.html',
  styleUrls: ['./roles-permissions.component.css']
})
export class RolesPermissionsComponent implements OnInit {

  roleData:any
  constructor(private spinner: NgxSpinnerService, private toastr: ToastrService, private roleService: RolePermissionService, private router: Router, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getAllRoles()
  }

  getAllRoles(){
    this.spinner.show()
    this.roleService.getRole({}).subscribe({
      next: (v:any) =>{
        if (v.success){
          this.roleData = v.data
        }else{
          this.toastr.error(v.message, 'Error')
          this.router.navigateByUrl('/admin/home')
        }
      },
      error: (e:any) =>{
        this.spinner.hide()
        this.toastr.error(e.error.message, 'Error')
      },
      complete: () => { this.spinner.hide() }
    })
  }

  openDeleteDialog(roleId:any){
    const dialogRef = this.dialog.open(DeleteDialogComponent, {data: {'message': 'Are you sure, you really want to delete it?'}})
      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.spinner.show()
          this.roleService.deleteRole({ _id: roleId }).subscribe({
            next: (v:any) => {
              var result = v
              if (result.success) {
                this.toastr.success(result.message, 'Success')
              }
              if (!result.success) {
                this.toastr.error(result.message, 'Error')
              }
              this.getAllRoles()
            },
            error: (e) => {
              this.spinner.hide()
              this.toastr.error(e.error.message)
            },
            complete: () => { this.spinner.hide() }
          })
        }
      });
  }

  copyRole(role:any){
    const dialogRef = this.dialog.open(DeleteDialogComponent, {data: {'message': 'Are you sure, you want to copy the role ?'}})
      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed) {
          var data = {name: `${role.name} - Copy`, permissions: role.permissions}
          this.roleService.addRole(data).subscribe({
            next: (v:any) =>{
              if (v.success){
                this.toastr.success(v.message, 'Success')
                this.getAllRoles()
              }else{
                this.toastr.error(v.message, 'Error')
                this.router.navigateByUrl('/admin/home')
              }
            },
            error: (e:any) =>{
              this.spinner.hide()
              this.toastr.error(e.error.message, 'Error')
            },
            complete: () => { this.spinner.hide() }
          })
        }
      })
  }

}
