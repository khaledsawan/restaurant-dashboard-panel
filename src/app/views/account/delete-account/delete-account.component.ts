import { Component } from '@angular/core';
import { finalize, take } from 'rxjs';

import {
  AlertComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent
} from '@coreui/angular';
import { AuthFacade } from '../../../core/auth/auth.facade';
import { AuthSessionService } from '../../../core/auth/auth-session.service';

@Component({
  selector: 'app-delete-account',
  templateUrl: './delete-account.component.html',
  imports: [RowComponent, ColComponent, CardComponent, CardHeaderComponent, CardBodyComponent, ButtonDirective, AlertComponent]
})
export class DeleteAccountComponent {
  submitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly authFacade: AuthFacade,
    private readonly authSession: AuthSessionService
  ) {}

  deleteAccount(): void {
    const confirmed = window.confirm('This will permanently delete your account. Continue?');
    if (!confirmed || this.submitting) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authFacade
      .deleteAccount()
      .pipe(
        take(1),
        finalize(() => (this.submitting = false))
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Account deleted.';
          this.authSession.logout(true).pipe(take(1)).subscribe();
        },
        error: (error: { error?: { detail?: string; title?: string } }) => {
          this.errorMessage = error.error?.detail || error.error?.title || 'Delete failed.';
        }
      });
  }
}
