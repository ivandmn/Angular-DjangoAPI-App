import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'hhMmDate'
})
export class HhMmDatePipe  extends DatePipe implements PipeTransform {

  override transform(value: any, args?: any): any {
    return super.transform(value, 'HH:mm');
  }
}