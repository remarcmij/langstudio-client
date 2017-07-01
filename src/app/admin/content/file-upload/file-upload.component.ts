import { Component, OnDestroy } from '@angular/core'
import { Router } from '@angular/router'
import { FileUploader } from 'ng2-file-upload'

import { AuthService } from '../../../core'
import { AdminContentApi } from '../admin-content-api.service'
import { environment } from '../../../../environments/environment'

@Component({
  selector: 'my-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnDestroy {
  uploader: FileUploader
  hasBaseDropZoneOver = false
  hasAnotherDropZoneOver = false

  constructor(
    private router: Router,
    private auth: AuthService,
    private api: AdminContentApi
  ) {
    this.uploader = new FileUploader({
      url: `${environment.api.host}${environment.api.path}/upload`,
      authToken: 'Bearer ' + this.auth.token,
      isHTML5: true
    })
  }

  fileOverBase(e: any) {
    this.hasBaseDropZoneOver = e
  }

  fileOverAnother(e: any) {
    this.hasAnotherDropZoneOver = e
  }

  ngOnDestroy() {
    this.api.clearCache()
  }

  onAction(action: string) {
    switch (action) {
      case 'back':
        this.router.navigate(['/library'])
        break
    }
  }
}
