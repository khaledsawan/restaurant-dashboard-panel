import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, take } from 'rxjs';

import {
  AlertComponent,
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  FormControlDirective,
  FormLabelDirective,
  FormSelectDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  PageItemComponent,
  PageLinkDirective,
  PaginationComponent,
  RowComponent,
  SpinnerComponent,
  TableDirective
} from '@coreui/angular';

import {
  AdminUserDetailDto,
  AdminUserDto,
  AdminUserDtoPaginatedList,
  CreateAdminUserRequest,
  UserRole
} from '../../shared/service-proxies';
import { AdminUsersFacade, AdminUsersQuery } from './admin-users.facade';

type ActionStateMap = Record<number, boolean>;

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
  imports: [
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    TableDirective,
    SpinnerComponent,
    AlertComponent,
    BadgeComponent,
    ButtonDirective,
    PaginationComponent,
    PageItemComponent,
    PageLinkDirective,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    ModalBodyComponent,
    ModalFooterComponent,
    FormControlDirective,
    FormSelectDirective,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    FormsModule,
    ReactiveFormsModule,
    DatePipe
  ]
})
export class AdminUsersComponent implements OnInit {
  users: AdminUserDto[] = [];
  pagination: AdminUserDtoPaginatedList = { items: [], pageNumber: 1, pageSize: 10 };

  loading = false;
  errorMessage = '';
  successMessage = '';

  roleUpdating: ActionStateMap = {};
  statusUpdating: ActionStateMap = {};
  deleting: ActionStateMap = {};

  detailVisible = false;
  detailLoading = false;
  selectedUser: AdminUserDetailDto | null = null;

  createModalVisible = false;
  creating = false;

  readonly roles = Object.values(UserRole);

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly changeDetector = inject(ChangeDetectorRef);

  readonly filtersForm = this.formBuilder.group({
    search: '',
    role: '',
    isActive: '',
    emailConfirmed: '',
    createdFrom: '',
    createdTo: '',
    pageSize: 10
  });

  readonly createForm = this.formBuilder.group({
    email: this.formBuilder.control('', { validators: [Validators.required, Validators.email] }),
    password: this.formBuilder.control('', { validators: [Validators.required, Validators.minLength(6)] }),
    firstName: this.formBuilder.control(''),
    lastName: this.formBuilder.control(''),
    role: this.formBuilder.control('', { validators: [Validators.required] })
  });

  constructor(private readonly adminUsersFacade: AdminUsersFacade) { }

  ngOnInit(): void {
    this.loadUsers(1);
  }

  loadUsers(pageNumber?: number): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const rawFilters = this.filtersForm.getRawValue();
    const query: AdminUsersQuery = {
      search: rawFilters.search,
      role: rawFilters.role as '' | UserRole,
      isActive: rawFilters.isActive as '' | 'true' | 'false',
      emailConfirmed: rawFilters.emailConfirmed as '' | 'true' | 'false',
      createdFrom: rawFilters.createdFrom,
      createdTo: rawFilters.createdTo,
      pageNumber: pageNumber ?? this.pagination.pageNumber ?? 1,
      pageSize: Number(rawFilters.pageSize ?? 10)
    };

    this.adminUsersFacade
      .getUsers(query)
      .pipe(
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (result) => {
          this.loading = false;
          this.pagination = result;
          this.users = result.items ?? [];
          this.changeDetector.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Failed to load admin users. Please try again.';
          this.changeDetector.detectChanges();
        }
      });
  }

  applyFilters(): void {
    this.loadUsers(1);
  }

  resetFilters(): void {
    this.filtersForm.reset({
      search: '',
      role: '',
      isActive: '',
      emailConfirmed: '',
      createdFrom: '',
      createdTo: '',
      pageSize: this.filtersForm.value.pageSize ?? 10
    });
    this.loadUsers(1);
  }

  changePage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > (this.pagination.totalPages ?? 1)) {
      return;
    }
    this.loadUsers(pageNumber);
  }

  openDetail(userId: number | undefined): void {
    if (!userId) {
      return;
    }
    this.detailVisible = true;
    this.detailLoading = true;
    this.selectedUser = null;

    this.adminUsersFacade
      .getUserDetail(userId)
      .pipe(
        take(1),
        finalize(() => (this.detailLoading = false))
      )
      .subscribe({
        next: (detail) => {
          this.detailLoading = false;
          this.selectedUser = detail;
          this.changeDetector.detectChanges();
        },
        error: () => {
          this.detailLoading = false;
          this.errorMessage = 'Failed to load user detail.';
          this.detailVisible = false;
          this.changeDetector.detectChanges();
        }
      });
  }

  closeDetail(): void {
    this.detailVisible = false;
    this.selectedUser = null;
  }

  openCreateModal(): void {
    this.createForm.reset({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: ''
    });
    this.createModalVisible = true;
  }

  closeCreateModal(): void {
    this.createModalVisible = false;
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.creating = true;
    this.errorMessage = '';
    const rawCreate = this.createForm.getRawValue();
    const payload: CreateAdminUserRequest = {
      email: this.normalizeOptionalString(rawCreate.email),
      password: this.normalizeOptionalString(rawCreate.password),
      firstName: this.normalizeOptionalString(rawCreate.firstName),
      lastName: this.normalizeOptionalString(rawCreate.lastName),
      role: rawCreate.role as UserRole
    };

    this.adminUsersFacade
      .createUser(payload)
      .pipe(
        take(1),
        finalize(() => (this.creating = false))
      )
      .subscribe({
        next: () => {
          this.creating = false;
          this.createModalVisible = false;
          this.successMessage = 'Admin user created successfully.';
          this.loadUsers(1);
          this.changeDetector.detectChanges();
        },
        error: () => {
          this.creating = false;
          this.errorMessage = 'Failed to create admin user.';
          this.changeDetector.detectChanges();
        }
      });
  }

  updateRole(user: AdminUserDto, role: string): void {
    const userId = user.id;
    if (!userId) {
      return;
    }
    if (!role || this.roleUpdating[userId]) {
      return;
    }
    this.roleUpdating[userId] = true;

    this.adminUsersFacade
      .updateRole(userId, role as UserRole)
      .pipe(
        take(1),
        finalize(() => (this.roleUpdating[userId] = false))
      )
      .subscribe({
        next: () => {
          this.roleUpdating[userId] = false;
          user.roles = [role];
          this.successMessage = 'User role updated.';
          this.changeDetector.detectChanges();
        },
        error: () => {
          this.roleUpdating[userId] = false;
          this.errorMessage = 'Failed to update role.';
          this.changeDetector.detectChanges();
        }
      });
  }

  updateStatus(user: AdminUserDto, isActive: boolean): void {
    const userId = user.id;
    if (!userId || this.statusUpdating[userId]) {
      return;
    }
    this.statusUpdating[userId] = true;

    this.adminUsersFacade
      .updateStatus(userId, isActive)
      .pipe(
        take(1),
        finalize(() => (this.statusUpdating[userId] = false))
      )
      .subscribe({
        next: () => {
          this.statusUpdating[userId] = false;
          user.isActive = isActive;
          this.successMessage = 'User status updated.';
          this.changeDetector.detectChanges();
        },
        error: () => {
          this.statusUpdating[userId] = false;
          this.errorMessage = 'Failed to update status.';
          this.changeDetector.detectChanges();
        }
      });
  }

  deleteUser(user: AdminUserDto): void {
    const userId = user.id;
    if (!userId || this.deleting[userId]) {
      return;
    }
    const confirmed = window.confirm(`Delete admin user ${user.email ?? ''}?`);
    if (!confirmed) {
      return;
    }
    this.deleting[userId] = true;

    this.adminUsersFacade
      .deleteUser(userId)
      .pipe(
        take(1),
        finalize(() => (this.deleting[userId] = false))
      )
      .subscribe({
        next: () => {
          this.deleting[userId] = false;
          this.successMessage = 'Admin user deleted.';
          this.users = this.users.filter((item) => item.id !== userId);
          if (this.pagination.totalCount !== undefined) {
            this.pagination = {
              ...this.pagination,
              totalCount: Math.max(0, this.pagination.totalCount - 1)
            };
          }
          if (this.users.length === 0 && (this.pagination.pageNumber ?? 1) > 1) {
            this.loadUsers((this.pagination.pageNumber ?? 1) - 1);
            return;
          }
          this.loadUsers(this.pagination.pageNumber ?? 1);
          this.changeDetector.detectChanges();
        },
        error: () => {
          this.deleting[userId] = false;
          this.errorMessage = 'Failed to delete admin user.';
          this.changeDetector.detectChanges();
        }
      });
  }

  getRoleLabel(role?: string | null): string {
    if (!role) {
      return 'unknown';
    }
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  getDisplayedRole(user: AdminUserDto): string {
    const role = user.roles?.[0];
    if (!role) {
      return '';
    }
    const match = this.roles.find((value) => value.toLowerCase() === role.toLowerCase());
    return match ?? role;
  }

  getTotalPages(): number {
    return this.pagination.totalPages ?? 1;
  }

  getPageNumbers(): number[] {
    const total = this.getTotalPages();
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.createForm.get(controlName);
    return !!control && control.touched && control.hasError(errorName);
  }

  private normalizeOptionalString(value: string): string | null {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
}
