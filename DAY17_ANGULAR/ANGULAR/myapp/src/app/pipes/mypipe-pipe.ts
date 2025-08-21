import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mypipe',
  standalone: false
})
export class MypipePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
