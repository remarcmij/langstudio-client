import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { Subject } from 'rxjs/Subject'

import { AdminUserApi, Group } from './admin-user-api.service'
import { AdminContentApi } from '../content/admin-content-api.service'
import { Topic } from '../../shared'
import { User } from '../../core'

export interface TopicGroup extends Group {
  topics?: Topic[]
  selected?: boolean
}

interface IntermediateResult {
  groups: Group[],
  user: User,
  topics?: Topic[]
}

@Component({
  selector: 'my-admin-user-detail',
  templateUrl: './admin-user-detail.component.html',
  styles: []
})
export class AdminUserDetailComponent implements OnInit, OnDestroy {

  user: User
  groups: TopicGroup[]
  isDirty = false
  httpError = false

  private _ngUnsubscribe = new Subject<void>()

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userApi: AdminUserApi,
    private contentApi: AdminContentApi
  ) {
  }

  ngOnInit() {
    const params = this.activatedRoute.snapshot.params
    this.userApi.getUser(params['id'])
      .mergeMap(user => this.userApi.getGroups().map(groups => ({ groups, user })))
      .mergeMap((result: IntermediateResult) =>
        this.contentApi.getTopics().map(topics => {
          result.topics = topics.filter(topic => topic.chapter === 'index')
          return result
        }))
      .takeUntil(this._ngUnsubscribe)
      .subscribe((result: IntermediateResult) => {
        this.user = result.user
        this.groups = result.groups.map(group => ({
          name: group.name,
          publications: group.publications,
          topics: result.topics.filter((topic: Topic) => group.publications.indexOf(topic.publication) !== -1)
        }))
        this.restoreSelection()
      }, () => this.httpError = true)
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()

    if (!this.isDirty) {
      return
    }

    const groupNames = this.groups
      .filter(group => group.selected)
      .map(group => group.name)

    this.userApi.saveGroups(this.user._id, groupNames)
      .takeUntil(this._ngUnsubscribe)
      .subscribe(ok => {
        if (!ok) {
          this._errorAlert()
        }
      }, () => {
        this.httpError = true
        this._errorAlert()
      })
  }

  restoreSelection() {
    this.groups.forEach(group => group.selected = this._wasSelected(group.name))
    this.isDirty = false
  }

  selectAll() {
    this.groups.forEach(group => group.selected = true)
    this.onModelChange()
  }

  selectNone() {
    this.groups
      .filter(group => group.name !== 'public')
      .forEach(group => group.selected = false)
    this.onModelChange()
  }

  onModelChange() {
    this.isDirty = false
    this.groups.forEach(group => {
      if (group.selected !== this._wasSelected(group.name)) {
        this.isDirty = true
      }
    })
  }

  onAction(action: string) {
    switch (action) {
      case 'back':
        this.router.navigate(['/admin/user'])
        break
    }
  }

  private _wasSelected(groupName: string): boolean {
    return this.user.groups.indexOf(groupName) !== -1
  }

  private _errorAlert() {
    window.alert('Could not save authorization changes.')
  }
}
