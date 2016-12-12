import { ModuleWithProviders } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { LibraryComponent } from './library/library.component'
import { PublicationComponent } from './publication/publication.component'
import { ArticleComponent } from './article/article.component'
import { FlashCardComponent } from './flashcard/flashcard.component'

import { CanDeactivateGuard } from '../core'

const libraryRoutes: Routes = [
    { path: 'library/:publication/:chapter/flashcards', component: FlashCardComponent },
    { path: 'library/:publication/:chapter', component: ArticleComponent, canDeactivate: [CanDeactivateGuard] },
    { path: 'library/:publication', component: PublicationComponent, canDeactivate: [CanDeactivateGuard] },
    { path: 'library', component: LibraryComponent, canDeactivate: [CanDeactivateGuard] }
]

export const libraryRouting: ModuleWithProviders = RouterModule.forChild(libraryRoutes)
