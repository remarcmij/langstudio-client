import { Component } from '@angular/core'

@Component({
  selector: 'my-flex-container',
  template: `
    <div fxLayout="row">
      <div fxFlex="100" fxFlexOffset fxFlexOffset.gt-sm="15" fxFlex.gt-sm="70">
        <ng-content></ng-content>
      </div>
    </div>`
})
export class FlexContainerComponent { }
