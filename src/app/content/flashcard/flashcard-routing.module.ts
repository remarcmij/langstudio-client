import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { FlashCardComponent } from './flashcard.component'

const flashcardRoutes: Routes = [
  {
    path: ':publication/:chapter',
    component: FlashCardComponent
  },
]

@NgModule({
  imports: [
    RouterModule.forChild(flashcardRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class FlashcardRoutingModule { }
