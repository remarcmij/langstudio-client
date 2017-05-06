import { NgModule } from '@angular/core'

import { SharedModule } from '../shared'
import { DictionaryModule } from '../dictionary/dictionary.module'
import { HashTagModule } from '../hashtag/hashtag.module'
import { LibraryComponent } from './library/library.component'
import { LibraryItemComponent } from './library/library-item.component'
import { PublicationComponent } from './publication/publication.component'
import { ArticleComponent } from './article/article.component'
import { ArticleCoreComponent } from './article/article-core.component'
import { ArticleResolver } from './article/article.resolver'
import { FlashCardComponent } from './flashcard/flashcard.component'
import { FlashCardService } from './flashcard/flashcard.service'
import { contentRouting } from './content.routing'
import { ContentService } from './content.service'
import { ContentHttp } from './content-http.service'
import { NavigationModule } from '../navigation/navigation.module'

@NgModule({
  imports: [
    DictionaryModule,
    HashTagModule,
    SharedModule,
    NavigationModule,
    contentRouting
  ],
  declarations: [
    LibraryComponent,
    LibraryItemComponent,
    PublicationComponent,
    ArticleComponent,
    ArticleCoreComponent,
    FlashCardComponent,
  ],
  providers: [
    ContentService,
    ContentHttp,
    FlashCardService,
    ArticleResolver
  ]
})

export class ContentModule { }
