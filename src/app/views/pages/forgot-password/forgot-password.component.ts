import { Component } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs';

import {
  AlertComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  FormControlDirective,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent
} from '@coreui/angular';
import { AuthFacade } from '../../../core/auth/auth.facade';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  imports: [
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    FormDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    FormControlDirective,
    ButtonDirective,
    ReactiveFormsModule,
    AlertComponent,
    RouterLink
  ]
})
export class ForgotPasswordComponent {
  readonly form = this.fb.group({
    email: this.fb.control('', { validators: [Validators.required, Validators.email] })
  });

  submitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly fb: NonNullableFormBuilder,
    private readonly authFacade: AuthFacade,
    private readonly router: Router
  ) {}

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authFacade
      .forgotPassword(this.form.getRawValue())
      .pipe(
        take(1),
        finalize(() => (this.submitting = false))
      )
      .subscribe({
        next: () => {
          this.successMessage = 'If the email exists, a reset code has been sent.';
          setTimeout(() => {
            void this.router.navigate(['/reset-password'], { queryParams: { email: this.form.value.email } });
          }, 800);
        },
        error: (error: { error?: { detail?: string; title?: string } }) => {
          this.errorMessage = error.error?.detail || error.error?.title || 'Request failed.';
        }
      });
  }
}
