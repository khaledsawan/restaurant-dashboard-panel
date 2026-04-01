import { Component } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
  RowComponent
} from '@coreui/angular';
import { AuthFacade } from '../../../core/auth/auth.facade';

@Component({
  selector: 'app-change-email',
  templateUrl: './change-email.component.html',
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
    AlertComponent
  ]
})
export class ChangeEmailComponent {
  readonly requestForm = this.fb.group({
    newEmail: this.fb.control('', { validators: [Validators.required, Validators.email] })
  });

  readonly confirmForm = this.fb.group({
    newEmail: this.fb.control('', { validators: [Validators.required, Validators.email] }),
    code: this.fb.control('', { validators: [Validators.required] })
  });

  requesting = false;
  confirming = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly fb: NonNullableFormBuilder,
    private readonly authFacade: AuthFacade
  ) {}

  submitRequest(): void {
    if (this.requestForm.invalid || this.requesting) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.requesting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = this.requestForm.getRawValue();

    this.authFacade
      .requestEmailChange(payload)
      .pipe(
        take(1),
        finalize(() => (this.requesting = false))
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Email change requested. Check your inbox for the code.';
          this.confirmForm.patchValue({ newEmail: payload.newEmail });
        },
        error: (error: { error?: { detail?: string; title?: string } }) => {
          this.errorMessage = error.error?.detail || error.error?.title || 'Request failed.';
        }
      });
  }

  submitConfirm(): void {
    if (this.confirmForm.invalid || this.confirming) {
      this.confirmForm.markAllAsTouched();
      return;
    }

    this.confirming = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authFacade
      .confirmEmailChange(this.confirmForm.getRawValue())
      .pipe(
        take(1),
        finalize(() => (this.confirming = false))
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Email updated successfully.';
          this.requestForm.reset({ newEmail: '' });
          this.confirmForm.reset({ newEmail: '', code: '' });
        },
        error: (error: { error?: { detail?: string; title?: string } }) => {
          this.errorMessage = error.error?.detail || error.error?.title || 'Confirmation failed.';
        }
      });
  }
}
