import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'paymentType'
})
export class PaymentTypePipe implements PipeTransform {

  transform(value: unknown): unknown {
    switch (value) {
      case 1: return "Cash"
      case 2: return "Cheque"
      case 3: return "e Transfer"
      case 4: return "Draft"
      default: return ""
    }

  }

}
