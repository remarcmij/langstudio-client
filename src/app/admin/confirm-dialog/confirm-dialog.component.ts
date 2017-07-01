import { Component, Inject } from '@angular/core'
import { MdDialogRef, MD_DIALOG_DATA } from '@angular/material'

@Component({
  selector: 'my-confirm-dialog',
  templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent {

  constructor(
    public dialogRef: MdDialogRef<ConfirmDialogComponent>,
    @Inject(MD_DIALOG_DATA) public data: any
  ) {
  }

}
