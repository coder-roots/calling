import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth-guard/auth.guard';

import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { LoginComponent } from './components/auth/login/login.component';

import { CustomerAddComponent } from './components/customers/customer-add/customer-add.component';
import { CustomersComponent } from './components/customers/customers.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ErrorComponent } from './components/error/error.component';

import { LayoutComponent } from './components/layout/layout.component';

import { NotificationListComponent } from './components/notification/notification-list/notification-list.component';
import { AddRolesPermissionsComponent } from './components/roles-permissions/add-roles-permissions/add-roles-permissions.component';
import { RolesPermissionsComponent } from './components/roles-permissions/roles-permissions.component';
import { UserAddComponent } from './components/users/user-add/user-add.component';
import { UsersComponent } from './components/users/users.component';
import { DurationComponent } from './components/duration/duration.component';
import { CollegeComponent } from './components/college/college.component';
import { CourseComponent } from './components/course/course.component';
import { CourseAddComponent } from './components/course/course-add/course-add.component';
import { EnquiryComponent } from './components/enquiry/enquiry.component';
import { EnquiryAddComponent } from './components/enquiry/enquiry-add/enquiry-add.component';
import { EnquiryViewComponent } from './components/enquiry/enquiry-view/enquiry-view.component';
import { EmployeeComponent } from './components/employee/employee.component';
import { EmployeeAddComponent } from './components/employee/employee-add/employee-add.component';
import { EmployeeViewComponent } from './components/employee/employee-view/employee-view.component';
import { CalculateFeeComponent } from './components/calculate-fee/calculate-fee.component';
import { CalculateFeeViewComponent } from './components/calculate-fee/calculate-fee-view/calculate-fee-view.component';
import { AdmissionComponent } from './components/admission/admission.component';
import { AdmissionAddComponent } from './components/admission/admission-add/admission-add.component';
import { AdmissionViewComponent } from './components/admission/admission-view/admission-view.component';
import { AdmissionViewFeeComponent } from './components/admission/admission-view-fee/admission-view-fee.component';
import { StudentComponent } from './components/student/student.component';
import { StudentAddComponent } from './components/student/student-add/student-add.component';
import { TimeSlotComponent } from './components/time-slot/time-slot.component';
import { TimeSlotAddComponent } from './components/timeSlot/time-slot-add/time-slot-add.component';
import { LabComponent } from './components/lab/lab.component';
import { LabAddComponent } from './components/lab/lab-add/lab-add.component';
import { ClientComponent } from './components/client/client.component';
import { ClientAddComponent } from './components/client/client-add/client-add.component';
import { CallComponent } from './components/call/call.component';
import { CallAddComponent } from './components/enquiry/call-add/call-add.component';
import { CallAddMultipleComponent } from './components/call/call-add-multiple/call-add-multiple.component';
import { CallSheetAddComponent } from './components/call/call-sheet-add/call-sheet-add.component';
import { CollegeCourseComponent } from './components/college-course/college-course.component';
import { CollegeAddComponent } from './components/college/college-add/college-add.component';
import { CollegeCourseAddComponent } from './components/college-course/college-course-add/college-course-add.component';
import { CertificateComponent } from './components/certificate/certificate.component';
import { CertificateAddComponent } from './components/certificate/certificate-add/certificate-add.component';
import { AvailabilityComponent } from './components/availability/availability.component';
import { StoreManagementComponent } from './components/store-management/store-management.component';
import { SessionYearComponent } from './components/session-year/session-year.component';
import { ChangeCourseComponent } from './components/admission/change-course-dialog/change-course-dialog.component';
import { CertificateSheetComponent } from './components/certificate/certificate-sheet/certificate-sheet.component';
import { PrintReceiptsComponent } from './components/print-receipts/print-receipts.component';
import { CompleteAdmissionListComponent } from './components/admission/complete-admission-list/complete-admission-list.component';
import { RegDefaulterListComponent } from './components/reports/reg-defaulter-list/reg-defaulter-list.component';
import { DaybookComponent } from './components/reports/daybook/daybook.component';
import { DaybookSummaryComponent } from './components/reports/daybook-summary/daybook-summary.component';
import { OverallBalanceReportComponent } from './components/reports/overall-balance-report/overall-balance-report.component';
import { DropReportComponent } from './components/reports/drop-report/drop-report.component';
import { AdmissionUpdateComponent } from './components/admission/admission-update/admission-update.component';
import { EnquiryDropComponent } from './components/reports/enquiry-drop/enquiry-drop.component';


const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  { path:'print-receipt/:id', component:PrintReceiptsComponent,canActivate:[AuthGuard], data: { role: ['PRINT-RECEIPT-MANAGE']} },

  {
    path: 'admin', component: LayoutComponent, canActivate: [AuthGuard], children: [
      { path: 'home', component: DashboardComponent },

      { path: 'roles', component: RolesPermissionsComponent, canActivate: [AuthGuard], data: { role: ['ROLES-PERMISSION-MANAGE'] } },
      { path: 'roles/add', component: AddRolesPermissionsComponent, canActivate: [AuthGuard], data: { role: ['ROLES-PERMISSION-MANAGE'] } },
      { path: 'roles/edit/:id', component: AddRolesPermissionsComponent, canActivate: [AuthGuard], data: { role: ['ROLES-PERMISSION-MANAGE'] } },

      { path: 'users', component: UsersComponent, canActivate: [AuthGuard], data: { role: ['USER-MANAGE'] } },
      { path: 'users/add', component: UserAddComponent, canActivate: [AuthGuard], data: { role: ['USER-MANAGE'] } },
      { path: 'users/edit/:id', component: UserAddComponent, canActivate: [AuthGuard], data: { role: ['USER-MANAGE'] } },

      { path: 'availability', component: AvailabilityComponent, canActivate: [AuthGuard], data: { role: ['AVAILABILITY-MANAGE'] } },



      { path: 'clients', component: ClientComponent, canActivate: [AuthGuard], data: { role: ['CLIENTS-MANAGE'] } },
      { path: 'client/add', component: ClientAddComponent, canActivate: [AuthGuard], data: { role: ['CLIENTS-MANAGE'] } },
      { path: 'client/edit/:id', component: ClientAddComponent, canActivate: [AuthGuard], data: { role: ['CLIENTS-MANAGE'] } },

      { path: 'durations', component: DurationComponent, canActivate: [AuthGuard], data: { role: ['Duration-MANAGE'] } },
      { path: 'sessionYears', component: SessionYearComponent, canActivate: [AuthGuard], data: { role: ['SESSIONYEAR-MANAGE'] } },
      { path: 'storeItems', component: StoreManagementComponent, canActivate: [AuthGuard], data: { role: ['STORE_ITEMS-MANAGE'] } },

      { path: 'colleges', component: CollegeComponent, canActivate: [AuthGuard], data: { role: ['COLLEGE-MANAGE'] } },

      { path: 'courses', component: CourseComponent, canActivate: [AuthGuard], data: { role: ['COURSE-MANAGE'] } },
      { path: 'course/add', component: CourseAddComponent, canActivate: [AuthGuard], data: { role: ['COURSE-MANAGE'] } },
      { path: 'course/edit/:id', component: CourseAddComponent, canActivate: [AuthGuard], data: { role: ['COURSE-MANAGE'] } },

      { path: 'collegeCourses', component: CollegeCourseComponent, canActivate: [AuthGuard], data: { role: ['COLLEGE-COURSE-MANAGE'] } },
      { path: 'collegeCourse/add', component: CollegeCourseAddComponent, canActivate: [AuthGuard], data: { role: ['COLLEGE-COURSE-MANAGE'] } },
      { path: 'collegeCourse/edit/:id', component: CollegeCourseAddComponent, canActivate: [AuthGuard], data: { role: ['COLLEGE-COURSE-MANAGE'] } },


      { path: 'employees', component: EmployeeComponent, canActivate: [AuthGuard], data: { role: ['EMPLOYEE-MANAGE'] } },
      { path: 'employee/add', component: EmployeeAddComponent, canActivate: [AuthGuard], data: { role: ['EMPLOYEE-MANAGE'] } },
      { path: 'employee/edit/:id', component: EmployeeAddComponent, canActivate: [AuthGuard], data: { role: ['EMPLOYEE-MANAGE'] } },
      { path: 'employee/view/:id', component: EmployeeViewComponent, canActivate: [AuthGuard], data: { role: ['EMPLOYEE-MANAGE'] } },

      { path: 'enquiries', component: EnquiryComponent, canActivate: [AuthGuard], data: { role: ['ENQUIRY-MANAGE'] } },
      { path: 'enquiry/add', component: EnquiryAddComponent, canActivate: [AuthGuard], data: { role: ['ENQUIRY-MANAGE'] } },
      { path: 'enquiry/edit/:id', component: EnquiryAddComponent, canActivate: [AuthGuard], data: { role: ['ENQUIRY-MANAGE'] } },
      { path: 'enquiry/view/:id', component: EnquiryViewComponent, canActivate: [AuthGuard], data: { role: ['ENQUIRY-MANAGE'] } },
      { path: 'enquiry/calculateFee/:id', component: CalculateFeeComponent, canActivate: [AuthGuard], data: { role: ['ENQUIRY-MANAGE'] } },
      { path: 'enquiry/viewFee/:id', component: CalculateFeeViewComponent, canActivate: [AuthGuard], data: { role: ['ENQUIRY-MANAGE'] } },

      { path: 'calls', component: CallComponent, canActivate: [AuthGuard], data: { role: ['CALL-MANAGE'] } },
      { path: 'call/add-multiple/:data', component: CallAddMultipleComponent, canActivate: [AuthGuard], data: { role: ['CALL-MANAGE'] } },
      { path: 'call/add-sheet', component: CallSheetAddComponent, canActivate: [AuthGuard], data: { role: ['CALL-MANAGE'] } },
      { path: 'call/edit-sheet/:id', component: CallSheetAddComponent, canActivate: [AuthGuard], data: { role: ['CALL-MANAGE'] } },
      { path: 'call/add/:id', component: CallAddComponent, canActivate: [AuthGuard], data: { role: ['ENQUIRY-MANAGE'] } },

      { path: 'enquiry/add', component: EnquiryAddComponent, canActivate: [AuthGuard], data: { role: ['ENQUIRY-MANAGE'] } },
      { path: 'enquiry/edit/:id', component: EnquiryAddComponent, canActivate: [AuthGuard], data: { role: ['ENQUIRY-MANAGE'] } },

      { path: 'admissions', component: AdmissionComponent, canActivate: [AuthGuard], data: { role: ['ADMISSION-MANAGE'] } },
      { path: 'admissions/complete', component: CompleteAdmissionListComponent, canActivate: [AuthGuard], data: { role: ['ADMISSION-MANAGE'] } },
      { path: 'admission/add', component: AdmissionAddComponent, canActivate: [AuthGuard], data: { role: ['ADMISSION-MANAGE'] } },
      { path: 'admission/edit/:id', component: AdmissionUpdateComponent, canActivate: [AuthGuard], data: { role: ['ADMISSION-MANAGE'] } },
      { path: 'admission/changeCourse/:id', component: ChangeCourseComponent, canActivate: [AuthGuard], data: { role: ['ADMISSION-MANAGE'] } },
      { path: 'admission/view/:id', component: AdmissionViewComponent, canActivate: [AuthGuard], data: { role: ['ADMISSION-MANAGE'] } },
      { path: 'admission/viewFee/:id', component: AdmissionViewFeeComponent, canActivate: [AuthGuard], data: { role: ['ADMISSION-MANAGE'] } },

      { path: 'certificates', component: CertificateComponent, canActivate: [AuthGuard], data: { role: ['CERTIFICATE-MANAGE'] } },
      { path: 'certificate/add', component: CertificateAddComponent, canActivate: [AuthGuard], data: { role: ['CERTIFICATE-MANAGE'] } },
      { path: 'certificate/sheet', component: CertificateSheetComponent, canActivate: [AuthGuard], data: { role: ['CERTIFICATE-MANAGE'] } },
      { path: 'certificate/sheet/view/:id', component: CertificateSheetComponent, canActivate: [AuthGuard], data: { role: ['CERTIFICATE-MANAGE'] } },

      { path: 'students', component: StudentComponent, canActivate: [AuthGuard], data: { role: ['STUDENT-MANAGE'] } },
      { path: 'student/add', component: StudentAddComponent, canActivate: [AuthGuard], data: { role: ['STUDENT-MANAGE'] } },
      { path: 'student/edit/:id', component: StudentAddComponent, canActivate: [AuthGuard], data: { role: ['STUDENT-MANAGE'] } },

      { path: 'timeSlots', component: TimeSlotComponent, canActivate: [AuthGuard], data: { role: ['TIMESLOT-MANAGE'] } },
      { path: 'timeSlot/add', component: TimeSlotAddComponent, canActivate: [AuthGuard], data: { role: ['TIMESLOT-MANAGE'] } },
      { path: 'timeSlot/edit/:id', component: TimeSlotAddComponent, canActivate: [AuthGuard], data: { role: ['TIMESLOT-MANAGE'] } },

      { path: 'labs', component: LabComponent, canActivate: [AuthGuard], data: { role: ['LAB-MANAGE'] } },
      { path: 'lab/add', component: LabAddComponent, canActivate: [AuthGuard], data: { role: ['LAB-MANAGE'] } },
      { path: 'lab/edit/:id', component: LabAddComponent, canActivate: [AuthGuard], data: { role: ['LAB-MANAGE'] } },

      
      { path: 'notification', component: NotificationListComponent, canActivate: [AuthGuard], data: { role: ['NOTIFICATION-MANAGE'] } },


      // report routes
      { path: 'report/registerationDefaulter', component: RegDefaulterListComponent, canActivate: [AuthGuard], data: { role: ['REPORT-MANAGE'] } },
      { path: 'report/daybook', component: DaybookComponent, canActivate: [AuthGuard], data: { role: ['REPORT-MANAGE'] } },
      { path: 'report/daybookSummary', component: DaybookSummaryComponent, canActivate: [AuthGuard], data: { role: ['REPORT-MANAGE'] } },
      { path:'report/overallBalance',component:OverallBalanceReportComponent,canActivate:[AuthGuard],  data: { role:['REPORT-MANAGE'] }},
      { path:'report/dropReport',component:DropReportComponent,canActivate:[AuthGuard],  data: { role:['REPORT-MANAGE'] }},
      { path:'report/enquiry/DropList',component:EnquiryDropComponent,canActivate:[AuthGuard],  data: { role:['REPORT-MANAGE'] }}
    ]
  },

  { path: '**', component: ErrorComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
