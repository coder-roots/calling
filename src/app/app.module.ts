import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutComponent } from './components/layout/layout.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';
import { TopbarComponent } from './components/layout/topbar/topbar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ErrorComponent } from './components/error/error.component';
import { ToastrModule } from 'ngx-toastr';
import { LoginComponent } from './components/auth/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { InterceptorServiceService } from './auth-guard/interceptor/interceptor-service.service';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RolesPermissionsComponent } from './components/roles-permissions/roles-permissions.component';
import { AddRolesPermissionsComponent } from './components/roles-permissions/add-roles-permissions/add-roles-permissions.component';
import { HasRoleDirective } from './directives/has-role.directive';
import { DeleteDialogComponent } from './components/delete-dialog/delete-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { UsersComponent } from './components/users/users.component';
import { UserAddComponent } from './components/users/user-add/user-add.component';
import { UserSingleComponent } from './components/users/user-single/user-single.component';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { ChangePasswordComponent } from './components/users/change-password/change-password.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CustomersComponent } from './components/customers/customers.component';
import { CustomerAddComponent } from './components/customers/customer-add/customer-add.component';
import { MatChipsModule } from '@angular/material/chips';
import { NgSelectModule } from '@ng-select/ng-select';
import { YesNoPipe } from './pipe/yes-no/yes-no.pipe';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DatePipe, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { NgxUsefulSwiperModule } from 'ngx-useful-swiper';
import { NotificationListComponent } from './components/notification/notification-list/notification-list.component';

import { EditorModule } from '@tinymce/tinymce-angular';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { MonthNamePipe } from './pipe/month-name/month-name.pipe';
import { PaymentTypePipe } from './pipe/payment-type/payment-type.pipe';
import { DurationComponent } from './components/duration/duration.component';
import { DurationAddComponent } from './components/duration/duration-add/duration-add.component';
import { CollegeComponent } from './components/college/college.component';
import { CollegeAddComponent } from './components/college/college-add/college-add.component';
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
import { MatMenuModule } from '@angular/material/menu';
import { CallAddMultipleComponent } from './components/call/call-add-multiple/call-add-multiple.component';
import { CollegeCourseComponent } from './components/college-course/college-course.component';
import { CollegeCourseAddComponent } from './components/college-course/college-course-add/college-course-add.component';
import { CertificateComponent } from './components/certificate/certificate.component';
import { CertificateAddComponent } from './components/certificate/certificate-add/certificate-add.component';
import { CertificateSheetComponent } from './components/certificate/certificate-sheet/certificate-sheet.component';
import { AvailabilityComponent } from './components/availability/availability.component';
import { StoreManagementComponent } from './components/store-management/store-management.component';
import { ItemAddComponent } from './components/store-management/item-add/item-add.component';
import { CallSheetAddComponent } from './components/call/call-sheet-add/call-sheet-add.component';
import { CallHistoryComponent } from './components/call/call-sheet-add/call-history/call-history.component';
import { SessionYearComponent } from './components/session-year/session-year.component';
import { SessionYearAddComponent } from './components/session-year/session-year-add/session-year-add.component';
import { EnquiryConfirmAdmissionComponent } from './components/enquiry/enquiry-confirm-admission/enquiry-confirm-admission.component';
import { ChangeCourseComponent } from './components/admission/change-course-dialog/change-course-dialog.component';
import { CertificateAddDialogComponent } from './components/certificate/certificate-add/certificate-add-dialog/certificate-add-dialog.component';
import { PrintReceiptsComponent } from './components/print-receipts/print-receipts.component';
import { CompleteAdmissionListComponent } from './components/admission/complete-admission-list/complete-admission-list.component';
import { EmployeeAddMultipleDialogComponent } from './components/employee/employee-add-multiple-dialog/employee-add-multiple-dialog.component';
import { EnquiryAddMultipleComponent } from './components/enquiry/enquiry-add-multiple/enquiry-add-multiple.component';
import { RegDefaulterListComponent } from './components/reports/reg-defaulter-list/reg-defaulter-list.component';
import { DaybookComponent } from './components/reports/daybook/daybook.component';
import { DaybookSummaryComponent } from './components/reports/daybook-summary/daybook-summary.component';
import { DropReportComponent } from './components/reports/drop-report/drop-report.component';
import { OverallBalanceReportComponent } from './components/reports/overall-balance-report/overall-balance-report.component';
import { AdmissionUpdateComponent } from './components/admission/admission-update/admission-update.component';
import { EnquiryDropComponent } from './components/reports/enquiry-drop/enquiry-drop.component';




@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    FooterComponent,
    SidebarComponent,
    TopbarComponent,
    ErrorComponent,
    LoginComponent,
    DashboardComponent,
    RolesPermissionsComponent,
    AddRolesPermissionsComponent,
    HasRoleDirective,
    DeleteDialogComponent,
    ForgotPasswordComponent,
    UsersComponent,
    UserAddComponent,
    UserSingleComponent,
    ChangePasswordComponent,
    CustomersComponent,
    CustomerAddComponent,
    YesNoPipe,
    NotificationListComponent,
    MonthNamePipe,
    PaymentTypePipe,
    DurationComponent,
    DurationAddComponent,
    CollegeComponent,
    CollegeAddComponent,
    CourseComponent,
    CourseAddComponent,
    EnquiryComponent,
    EnquiryAddComponent,
    EnquiryViewComponent,
    EmployeeComponent,
    EmployeeAddComponent,
    EmployeeViewComponent,
    CalculateFeeComponent,
    CalculateFeeViewComponent,
    AdmissionComponent,
    AdmissionAddComponent,
    AdmissionViewComponent,
    AdmissionViewFeeComponent,
    StudentComponent,
    StudentAddComponent,
    TimeSlotComponent,
    TimeSlotAddComponent,
    LabComponent,
    LabAddComponent,
    ClientComponent,
    ClientAddComponent,
    CallComponent,
    CallAddComponent,
    CallAddMultipleComponent,
    CollegeCourseComponent,
    CollegeCourseAddComponent,
    CertificateComponent,
    CertificateAddComponent,
    AvailabilityComponent,
    StoreManagementComponent,
    ItemAddComponent,
    CallSheetAddComponent,
    CallHistoryComponent,
    SessionYearComponent,
    SessionYearAddComponent,
    EnquiryConfirmAdmissionComponent,
    ChangeCourseComponent,
    CertificateAddDialogComponent,
    CertificateSheetComponent,
    PrintReceiptsComponent,
    CompleteAdmissionListComponent,
    EmployeeAddMultipleDialogComponent,
    EnquiryAddMultipleComponent,
    RegDefaulterListComponent,
    DaybookComponent,
    DaybookSummaryComponent,
    DropReportComponent,
    OverallBalanceReportComponent,
    AdmissionUpdateComponent,
    EnquiryDropComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
    ToastrModule.forRoot({ maxOpened: 1, autoDismiss: true }), // ToastrModule added
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatCheckboxModule,
    NgOtpInputModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatSlideToggleModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatMenuModule,
    MatAutocompleteModule,
    NgSelectModule,
    MatDatepickerModule,
    MatExpansionModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatRadioModule,
    NgxUsefulSwiperModule,
    EditorModule,
    ClipboardModule,
    MatSnackBarModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorServiceService, multi: true },
    DatePipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
