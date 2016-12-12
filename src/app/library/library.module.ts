import { NgModule } from '@angular/core'

import { SharedModule } from '../shared'
import { DictionaryModule } from '../dictionary/dictionary.module'
import { HashTagModule } from '../hashtag/hashtag.module'
import { LibraryComponent } from './library/library.component'
import { LibraryItemComponent } from './library/library-item.component'
import { PublicationComponent } from './publication/publication.component'
import { PublicationItemComponent } from './publication/publication-item.component'
import { ArticleComponent } from './article/article.component'
import { ArticleCoreComponent } from './article/article-core.component'
import { FlashCardComponent } from './flashcard/flashcard.component'
import { FlashCardService } from './flashcard/flashcard.service'
import { libraryRouting } from './library.routing'
import { LibraryService } from './library.service'
import { LibraryHttpService } from './library-http.service'

@NgModule({
    imports: [
        DictionaryModule,
        HashTagModule,
        SharedModule,
        libraryRouting
    ],
    declarations: [
        LibraryComponent,
        LibraryItemComponent,
        PublicationComponent,
        PublicationItemComponent,
        ArticleComponent,
        ArticleCoreComponent,
        FlashCardComponent,
    ],
    providers: [
        LibraryService,
        LibraryHttpService,
        FlashCardService
    ]
})

export class LibraryModule { }
