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
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
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
export class ConfirmEmailComponent {
  readonly form = this.fb.group({
    email: this.fb.control('', { validators: [Validators.required, Validators.email] }),
    token: this.fb.control('', { validators: [Validators.required] })
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
    const token = this.route.snapshot.queryParamMap.get('token');
    if (email || token) {
      this.form.patchValue({
        email: email ?? '',
        token: token ?? ''
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
      .confirmEmail(this.form.getRawValue())
      .pipe(
        take(1),
        finalize(() => (this.submitting = false))
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Email confirmed. You can now log in.';
          setTimeout(() => {
            void this.router.navigate(['/login']);
          }, 800);
        },
        error: (error: { error?: { detail?: string; title?: string } }) => {
          this.errorMessage = error.error?.detail || error.error?.title || 'Confirmation failed.';
        }
      });
  }
}
