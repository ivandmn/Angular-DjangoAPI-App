import { Directive, Output, EventEmitter, Input, SimpleChange} from '@angular/core';

@Directive({
  selector: '[onCreate]'
})
export class OnCreateDirective {

  @Output() onCreate: EventEmitter<any> = new EventEmitter<any>();
  constructor() {}
  ngOnInit() {      
     this.onCreate.emit('dummy'); 
  } 

}
