import { Component, OnInit, OnDestroy } from '@angular/core'
import { FileUploader } from 'ng2-file-upload'

import { AuthService } from '../../core'
import { LibraryAdminHttpService } from './library-admin-http.service'
import { AppConstants } from '../../app.constants'

@Component({
    selector: 'ls-file-upload',
    templateUrl: './file-upload.component.html'
})
export class FileUploadComponent implements OnInit, OnDestroy {
    uploader: FileUploader
    hasBaseDropZoneOver = false
    hasAnotherDropZoneOver = false

    constructor(
        private authService: AuthService,
        private httpService: LibraryAdminHttpService
    ) {
    }

    ngOnInit(): void {
        this.uploader = new FileUploader({
            url: AppConstants.apiEndPoint + '/api/upload',
            authToken: 'Bearer ' + this.authService.token,
            isHTML5: true
        })
    }

    fileOverBase(e: any): void {
        this.hasBaseDropZoneOver = e
    }

    fileOverAnother(e: any): void {
        this.hasAnotherDropZoneOver = e
    }

    ngOnDestroy(): void {
        this.httpService.clearCache()
    }
}
