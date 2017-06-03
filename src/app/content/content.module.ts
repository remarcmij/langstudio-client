import { NgModule } from '@angular/core'

import { SharedModule } from '../shared'
import { LibraryComponent } from './library/library.component'
import { LibraryItemComponent } from './library/library-item.component'
import { PublicationComponent } from './publication/publication.component'
import { ArticleComponent } from './article/article.component'
import { ArticleCoreComponent } from './article/article-core.component'
import { ArticleResolver } from './article/article.resolver'
import { NavigationModule } from '../navigation/navigation.module'
import { DictPopoverModule } from './dict-popover/dict-popover.module'
import { ContentApi } from './content-api.service'
import { SearchApi } from './search-api.service'
import { LanguageService } from './language/language.service'
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
    ArticleCoreComponent,
  ],
  providers: [
    ContentApi,
    SearchApi,
    LanguageService,
    ArticleResolver
  ]
})
export class ContentModule { }
