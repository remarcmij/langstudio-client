import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
import { Subscription } from 'rxjs/Subscription'

import { UserAdminHttpService, Group } from './user-admin-http.service'
import { LibraryAdminHttpService } from '../library-admin/library-admin-http.service'
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
    selector: 'ls-user-admin-auth',
    templateUrl: './user-admin-auth.component.html',
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
        private libraryHttpService: LibraryAdminHttpService
    ) {
    }

    ngOnInit(): void {
        this.subscription = this.activatedRoute.params
            .mergeMap(params => {
                let id = params['id']
                return this.adminHttpService
                    .getUser(id)
            })
            .mergeMap(user => {
                return this.adminHttpService.getGroups()
                    .map(groups => { return { groups, user } })
            })
            .mergeMap((result: IntermediateResult) => {
                return this.libraryHttpService.getTopics()
                    .map(topics => {
                        result.topics = topics.filter(topic => topic.chapter === 'index')
                        return result
                    })
            })
            .subscribe((result: IntermediateResult) => {
                let groups: TopicGroup[] = result.groups.map(group => {
                    return {
                        name: group.name,
                        publications: group.publications,
                        topics: result.topics.filter((topic: Topic) => group.publications.indexOf(topic.publication) !== -1)
                    }
                })
                this.user = result.user
                this.groups = groups
                this.restoreSelection()
            }, () => {
                this.httpError = true
            })
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe()

        if (!this.isDirty) {
            return
        }

        let groupNames = this.groups
            .filter(group => group.selected)
            .map(group => group.name)

        let subscription = this.adminHttpService.saveGroups(this.user._id, groupNames)
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

    restoreSelection(): void {
        this.groups.forEach(group => {
            group.selected = this.wasSelected(group.name)
        })
        this.isDirty = false
    }

    selectAll(): void {
        this.groups.forEach(group => group.selected = true)
        this.onModelChange()
    }

    selectNone(): void {
        this.groups
            .filter(group => group.name !== 'public')
            .forEach(group => group.selected = false)
        this.onModelChange()
    }

    onModelChange(): void {
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

    private errorAlert(): void {
        window.alert('Could not save authorization changes.')
    }
}
