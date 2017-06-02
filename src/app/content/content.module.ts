import { NgModule } from '@angular/core'

import { SharedModule } from '../shared'
import { SearchModule } from '../search/search.module'
import { LibraryComponent } from './library/library.component'
import { LibraryItemComponent } from './library/library-item.component'
import { PublicationComponent } from './publication/publication.component'
import { ArticleComponent } from './article/article.component'
import { ArticleCoreComponent } from './article/article-core.component'
import { ArticleResolver } from './article/article.resolver'
import { FlashCardComponent } from './flashcard/flashcard.component'
import { FlashCardService } from './flashcard/flashcard.service'
import { ContentHttp } from './content-http.service'
import { NavigationModule } from '../navigation/navigation.module'
import { ContentRoutingModule } from './content-routing.module'

@NgModule({
  imports: [
    SearchModule,
    SharedModule,
    NavigationModule,
    ContentRoutingModule
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
    ContentHttp,
    FlashCardService,
    ArticleResolver
  ]
})

export class ContentModule { }
