import { Component } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
import { IconDirective } from '@coreui/icons-angular';
import { AuthFacade } from '../../../core/auth/auth.facade';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  imports: [
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    FormDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    IconDirective,
    FormControlDirective,
    ButtonDirective,
    ReactiveFormsModule,
    AlertComponent,
    RouterLink
  ]
})
export class ResetPasswordComponent {
  readonly form = this.fb.group({
    email: this.fb.control('', { validators: [Validators.required, Validators.email] }),
    code: this.fb.control('', { validators: [Validators.required] }),
    newPassword: this.fb.control('', { validators: [Validators.required, Validators.minLength(6)] })
  });

  submitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly fb: NonNullableFormBuilder,
    private readonly authFacade: AuthFacade,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    const email = this.route.snapshot.queryParamMap.get('email');
    const code = this.route.snapshot.queryParamMap.get('code');
    if (email || code) {
      this.form.patchValue({
        email: email ?? '',
        code: code ?? ''
      });
    }
  }

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authFacade
      .resetPassword(this.form.getRawValue())
      .pipe(
        take(1),
        finalize(() => (this.submitting = false))
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Password reset successful. Please log in.';
          setTimeout(() => {
            void this.router.navigate(['/login']);
          }, 800);
        },
        error: (error: { error?: { detail?: string; title?: string } }) => {
          this.errorMessage = error.error?.detail || error.error?.title || 'Reset failed.';
        }
      });
  }
}
