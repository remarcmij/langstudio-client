import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'my-child-toolbar',
  templateUrl: './child-toolbar.component.html',
  styles: []
})
export class ChildToolbarComponent implements OnInit {

  @Input() showMore = false
  @Input() title = ''
  @Output() action = new EventEmitter<string>()

  constructor() { }

  ngOnInit() {
  }

}
