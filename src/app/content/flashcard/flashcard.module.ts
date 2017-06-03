import { NgModule } from '@angular/core'

import { SharedModule } from '../../shared'
import { NavigationModule } from '../../navigation/navigation.module'
import { FlashCardComponent } from './flashcard.component'
import { FlashcardService } from './flashcard.service'
import { FlashcardRoutingModule } from './flashcard-routing.module'

@NgModule({
  imports: [
    SharedModule,
    NavigationModule,
    FlashcardRoutingModule
  ],
  declarations: [
    FlashCardComponent
  ],
  providers: [
    FlashcardService
  ]
})
export class FlashcardModule { }
