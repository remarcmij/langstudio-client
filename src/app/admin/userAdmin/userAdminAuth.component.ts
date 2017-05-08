import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
import { Subscription } from 'rxjs/Subscription'

import { UserAdminHttpService, Group } from './userAdminHttp.service'
import { ContentAdminHttp } from '../contentAdmin/contentAdminHttp.service'
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
  selector: 'my-user-admin-auth',
  templateUrl: './userAdminAuth.component.html',
  styles: []
})
export class UserAdminAuthComponent implements OnInit, OnDestroy {

  user: User
  groups: TopicGroup[]
  isDirty = false
  httpError = false

  private subscription: Subscription

  constructor(
    private activatedRoute: ActivatedRoute,
    private adminHttpService: UserAdminHttpService,
    private libraryHttpService: ContentAdminHttp
  ) { }

  ngOnInit() {
    this.subscription = this.activatedRoute.params
      .mergeMap(params => this.adminHttpService.getUser(params['id']))
      .mergeMap(user => this.adminHttpService.getGroups().map(groups => ({ groups, user })))
      .mergeMap((result: IntermediateResult) =>
        this.libraryHttpService.getTopics().map(topics => {
          result.topics = topics.filter(topic => topic.chapter === 'index')
          return result
        }))
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
    this.subscription.unsubscribe()

    if (!this.isDirty) {
      return
    }

    const groupNames = this.groups
      .filter(group => group.selected)
      .map(group => group.name)

    const subscription = this.adminHttpService.saveGroups(this.user._id, groupNames)
      .subscribe(ok => {
        if (!ok) {
          this.errorAlert()
        }
        if (subscription) {
          subscription.unsubscribe()
        }
      }, () => {
        this.httpError = true
        this.errorAlert()
      })
  }

  restoreSelection() {
    this.groups.forEach(group => group.selected = this.wasSelected(group.name))
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
      if (group.selected !== this.wasSelected(group.name)) {
        this.isDirty = true
      }
    })
  }

  private wasSelected(groupName: string): boolean {
    return this.user.groups.indexOf(groupName) !== -1
  }

  private errorAlert() {
    window.alert('Could not save authorization changes.')
  }
}
