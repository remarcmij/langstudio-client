import { Routes, RouterModule } from '@angular/router'

import { HashTagCloudComponent } from './hashtag-cloud.component'
import { CanDeactivateGuard } from '../core'

const hashTagRoutes: Routes = [
  { path: 'hashtag', component: HashTagCloudComponent, canDeactivate: [CanDeactivateGuard] }
]

export const hashTagRouting = RouterModule.forChild(hashTagRoutes)
