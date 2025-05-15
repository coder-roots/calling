import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { UserDataService } from '../services/userData/user-data.service';

@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective {
  @Input()
  appHasRole!: string[];
  isVisible = false;

  constructor(private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    private authService: UserDataService) { }

    ngOnInit() {
      const userRoles = this.authService.getPermissions()
      // console.log(this.appHasRole)
      // const userRoles = ['Pages.Wip']
      // console.log(userRoles)
      // if no roles clear the view container ref
      if (!userRoles) {
        this.viewContainerRef.clear();
      }
  
      // console.log("this"+ this.appHasRole)
      // if user has role needed then render the element
      if (this.authService.getData()?.data?.userType == 1 || this.authService.roleMatch(this.appHasRole)) {
        if (!this.isVisible) {
          this.isVisible = true;
          this.viewContainerRef.createEmbeddedView(this.templateRef);
        } else {
          this.isVisible = false;
          this.viewContainerRef.clear();
        }
      }
    }
}
