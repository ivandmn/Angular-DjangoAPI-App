import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'ddMmYyyyHHMMDate'
})
export class DdMmYyyyHHMMDatePipe extends DatePipe implements PipeTransform {

  override transform(value: any, args?: any): any {
    return super.transform(value, 'dd/MM/YYYY HH:mm');
  }

}
