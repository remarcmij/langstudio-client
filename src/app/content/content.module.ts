import { NgModule } from '@angular/core'

import { SharedModule } from '../shared'
import { LibraryComponent } from './library/library.component'
import { LibraryItemComponent } from './library/library-item.component'
import { PublicationComponent } from './publication/publication.component'
import { ArticleComponent } from './article/article.component'
import { ArticleBodyComponent } from './article/article-body.component'
import { ArticleResolverService } from './article/article-resolver.service'
import { NavigationModule } from '../navigation/navigation.module'
import { DictPopoverModule } from './dict-popover/dict-popover.module'
import { ContentApiService } from './services/content-api.service'
import { SearchApiService } from './services/search-api.service'
import { ContentService } from './services/content.service'
import { LanguageService } from './services/language.service'
import { MarkdownService } from './services/markdown.service'
import { ContentRoutingModule } from './content-routing.module'

@NgModule({
  imports: [
    SharedModule,
    NavigationModule,
    DictPopoverModule,
    ContentRoutingModule
  ],
  declarations: [
    LibraryComponent,
    LibraryItemComponent,
    PublicationComponent,
    ArticleComponent,
    ArticleBodyComponent,
  ],
  providers: [
    ContentApiService,
    SearchApiService,
    ContentService,
    LanguageService,
    MarkdownService,
    ArticleResolverService
  ]
})
export class ContentModule { }
