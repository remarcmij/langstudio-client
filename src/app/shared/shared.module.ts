import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { Ng2BootstrapModule } from 'ng2-bootstrap/ng2-bootstrap'

import { SimpleNavbarComponent } from './simple-navbar.component'
import { SidePanelComponent } from './sidepanel/sidepanel.component'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        Ng2BootstrapModule
    ],
    declarations: [
        SimpleNavbarComponent,
        SidePanelComponent
    ],
    providers: [],
    exports: [
        CommonModule,
        FormsModule,
        Ng2BootstrapModule,
        SimpleNavbarComponent,
        SidePanelComponent
    ]
})

export class SharedModule { }
