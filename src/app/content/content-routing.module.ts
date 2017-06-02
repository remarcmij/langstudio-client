import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { LibraryComponent } from './library/library.component'
import { PublicationComponent } from './publication/publication.component'
import { ArticleComponent } from './article/article.component'
import { FlashCardComponent } from './flashcard/flashcard.component'
import { ArticleResolver } from './article/article.resolver'

import { CanDeactivateGuard } from '../core'

const contentRoutes: Routes = [
  {
    path:
    'library/:publication/:chapter/flashcards',
    component: FlashCardComponent
  },
  {
    path: 'library/:publication/:chapter',
    component: ArticleComponent,
    resolve: { article: ArticleResolver },
    canDeactivate: [CanDeactivateGuard]
  },
  {
    path: 'library/:publication',
    component: PublicationComponent,
    canDeactivate: [CanDeactivateGuard]
  },
  {
    path: 'library',
    component: LibraryComponent,
    canDeactivate: [CanDeactivateGuard]
  }
]

@NgModule({
  imports: [
    RouterModule.forChild(contentRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class ContentRoutingModule { }
