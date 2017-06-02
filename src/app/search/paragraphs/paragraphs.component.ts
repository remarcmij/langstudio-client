import { Component, OnInit, OnDestroy } from '@angular/core'
import { Subject } from 'rxjs/Subject'

import { SearchApi, SearchRequest, SearchResult, SearchParams } from '../search-api.service'

@Component({
  selector: 'my-paragraphs',
  templateUrl: './paragraphs.component.html',
  styles: []
})
export class ParagraphsComponent implements OnInit {

  private _ngUnsubscribe = new Subject<void>()

  constructor(
    private _search: SearchApi
  ) {
  }

  ngOnInit() {
    this._search.searchSubject
      .takeUntil(this._ngUnsubscribe)
      .subscribe(target => {
        if (target) {
          this.wordLangSearch(target)
        }
      })
  }

  wordLangSearch(searchTarget: SearchParams) {
  }
}
