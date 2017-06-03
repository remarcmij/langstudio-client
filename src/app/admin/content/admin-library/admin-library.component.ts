import { Component, OnInit, OnDestroy } from '@angular/core'
import { MdDialog, MdDialogConfig } from '@angular/material'
import { Router } from '@angular/router'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component'
import { AdminContentApi } from '../admin-content-api.service'
import { Topic } from '../../../shared'

@Component({
  selector: 'my-admin-library',
  templateUrl: './admin-library.component.html',
  styles: []
})
export class AdminLibraryComponent implements OnInit, OnDestroy {

  topics: Topic[] = []
  private _ngUnsubscribe = new Subject<void>()

  get indexTopics() { return this.topics.filter(topic => topic.chapter === 'index') }

  constructor(
    private _dialog: MdDialog,
    private _router: Router,
    private _adminContentApi: AdminContentApi
  ) { }

  ngOnInit() {
    this._getTopics()
      .takeUntil(this._ngUnsubscribe)
      .subscribe(topics => this.topics = topics)
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  confirmDelete(ev: MouseEvent, publication: string) {
    ev.stopPropagation()
    const config = new MdDialogConfig()
    config.data = {
      title: 'Delete Publication',
      message: `Are you sure you wish to delete publication '${publication}'?`,
      confirmButtonLabel: 'CONFIRM'
    }
    const dialogRef = this._dialog.open(ConfirmDialogComponent, config)
    dialogRef.afterClosed()
      .takeUntil(this._ngUnsubscribe)
      .subscribe(result => {
        if (result === 'confirm') {
          this.deletePublication(publication)
        }
      })
  }

  deletePublication(publication: string) {
    Observable.from(this.topics)
      .filter(topic => topic.publication === publication)
      .map(topic => this._adminContentApi.deleteTopic(topic.fileName))
      .mergeAll(4)
      .takeUntil(this._ngUnsubscribe)
      .subscribe(success => {
        if (success) {
          this._getTopics()
        } else {
          window.alert('An error occurred while attempting to remove the publication.')
        }
      }, () => {
        window.alert('An error occurred while attempting to remove the publication.')
      })
  }

  openPublication(publication: string) {
    this._router.navigate(['/admin', 'library', publication])
  }

  onAction(action: string) {
    switch (action) {
      case 'back':
        this._router.navigate(['/library'])
        break
    }
  }

  private _getTopics(): Observable<Topic[]> {
    return this._adminContentApi.getTopics()
      .map(topics => topics.filter(topic => topic.type === 'article'))
  }
}

