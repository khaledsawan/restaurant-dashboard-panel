import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Observable, catchError, defer, map, of, startWith } from 'rxjs';

import {
  AlertComponent,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  SpinnerComponent,
} from '@coreui/angular';
import { AuthFacade } from '../../../core/auth/auth.facade';
import { CurrentUserDto } from '../../../shared/service-proxies';

interface ProfileState {
  loading: boolean;
  user: CurrentUserDto | null;
  errorMessage: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  imports: [
    AsyncPipe,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    SpinnerComponent,
    AlertComponent,
  ],
})
export class ProfileComponent {
  constructor(private readonly authFacade: AuthFacade) {}

  readonly profileState$: Observable<ProfileState> = defer(() =>
    this.authFacade.me().pipe(
      map((user) => ({ loading: false, user, errorMessage: '' })),
      catchError(() =>
        of({
          loading: false,
          user: null,
          errorMessage: 'Failed to load profile.',
        }),
      ),
    ),
  ).pipe(startWith({ loading: true, user: null, errorMessage: '' }));
}
