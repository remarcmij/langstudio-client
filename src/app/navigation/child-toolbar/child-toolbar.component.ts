import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'my-child-toolbar',
  templateUrl: './child-toolbar.component.html',
  styles: []
})
export class ChildToolbarComponent {
  @Input() showMore = false
  @Input() hideSearch = false
  @Input() title = ''
  @Output() action = new EventEmitter<string>()
}
