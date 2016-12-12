import { Component, OnInit } from '@angular/core'

import { AppConstants } from '../app.constants'


@Component({
    selector: 'ls-about',
    templateUrl: './about.component.html',
    styles: []
})
export class AboutComponent implements OnInit {

    appTitle = AppConstants.appTitle

    constructor(
    ) {
    }

    ngOnInit(): void {
    }
}
