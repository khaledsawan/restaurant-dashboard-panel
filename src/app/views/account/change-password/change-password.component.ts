import { Component, inject } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize, take } from 'rxjs';

import {
  AlertComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  FormControlDirective,
  FormDirective,
  RowComponent,
} from '@coreui/angular';
import { AuthFacade } from '../../../core/auth/auth.facade';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  imports: [
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    FormDirective,
    FormControlDirective,
    ButtonDirective,
    ReactiveFormsModule,
    AlertComponent,
  ],
})
export class ChangePasswordComponent {
  
  private readonly fb = inject(NonNullableFormBuilder);

  readonly form = this.fb.group({
    currentPassword: this.fb.control('', { validators: [Validators.required] }),
    newPassword: this.fb.control('', {
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  submitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(private readonly authFacade: AuthFacade) {}

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authFacade
      .changePassword(this.form.getRawValue())
      .pipe(
        take(1),
        finalize(() => (this.submitting = false)),
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Password updated successfully.';
          this.form.reset({ currentPassword: '', newPassword: '' });
        },
        error: (error: { error?: { detail?: string; title?: string } }) => {
          this.errorMessage =
            error.error?.detail ||
            error.error?.title ||
            'Password update failed.';
        },
      });
  }
}
