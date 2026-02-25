import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import {
  AlertComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardGroupComponent,
  ColComponent,
  ContainerComponent,
  FormControlDirective,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent
} from '@coreui/angular';
import { finalize } from 'rxjs';
import { AuthSessionService } from '../../../core/auth/auth-session.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [ContainerComponent, RowComponent, ColComponent, CardGroupComponent, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective, ReactiveFormsModule, RouterLink, AlertComponent]
})
export class LoginComponent {
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  submitting = false;
  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authSession: AuthSessionService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    this.authSession
      .login(this.form.getRawValue())
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
          void this.router.navigateByUrl(returnUrl);
        },
        error: (error: { error?: { detail?: string; title?: string } }) => {
          this.errorMessage = error.error?.detail || error.error?.title || 'Invalid credentials.';
        }
      });
  }
}
