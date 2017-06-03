import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { MdDialog, MdDialogConfig } from '@angular/material'
import { Router } from '@angular/router'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import { Subject } from 'rxjs/Subject'

import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component'
import { AdminContentApi } from '../admin-content-api.service'
import { Topic } from '../../../shared'

@Component({
  selector: 'my-admin-publication',
  templateUrl: './admin-publication.component.html',
  styles: []
})
export class AdminPublicationComponent implements OnInit, OnDestroy {

  publication: string
  topics: Topic[] = []
  private _ngUnsubscribe = new Subject<void>()

  get indexTopics() { return this.topics.filter(topic => topic.chapter === 'index') }

  constructor(
    private _dialog: MdDialog,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _adminContentApi: AdminContentApi
  ) {
  }

  ngOnInit() {
    this.publication = this._activatedRoute.snapshot.params['publication']
    this._getTopics()
      .takeUntil(this._ngUnsubscribe)
      .subscribe(topics => this.topics = topics)
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  confirmDelete(ev: MouseEvent, topic: Topic) {
    ev.stopPropagation()
    const config = new MdDialogConfig()
    config.data = {
      title: 'Delete Article',
      message: `Are you sure you wish to delete article '${topic.title}'?`,
      confirmButtonLabel: 'CONFIRM'
    }
    const dialogRef = this._dialog.open(ConfirmDialogComponent, config)
    dialogRef.afterClosed()
      .takeUntil(this._ngUnsubscribe)
      .subscribe(result => {
        if (result === 'confirm') {
          this.deleteArticle(topic)
        }
      })
  }

  deleteArticle(topic: Topic) {
    this._adminContentApi.deleteTopic(topic.fileName)
      .mergeMap(() => this._getTopics())
      .takeUntil(this._ngUnsubscribe)
      .subscribe(topics => {
        this.topics = topics
      }, () => {
        this._getTopics()
      }, () => {
        window.alert('An error occurred while attempting to remove the article.')
      })
  }

  onAction(action: string) {
    switch (action) {
      case 'back':
        this._router.navigate(['/admin', 'library'])
        break
    }
  }

  private _getTopics(): Observable<Topic[]> {
    return this._adminContentApi.getTopics()
      .map(topics => topics.filter(topic => topic.publication === this.publication && topic.chapter !== 'index'))
  }
}
