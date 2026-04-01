import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  AdminUserDetailDto,
  AdminUserDto,
  AdminUserDtoPaginatedList,
  AdminUsersService,
  CreateAdminUserRequest,
  UpdateUserRoleRequest,
  UpdateUserStatusRequest,
  UserRole
} from '../../shared/service-proxies';
import { API_VERSION } from '../../core/config/api.config';

export interface AdminUsersQuery {
  search?: string;
  role?: UserRole | '';
  isActive?: boolean | '' | 'true' | 'false';
  emailConfirmed?: boolean | '' | 'true' | 'false';
  createdFrom?: string;
  createdTo?: string;
  pageNumber?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class AdminUsersFacade {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  getUsers(query: AdminUsersQuery): Observable<AdminUserDtoPaginatedList> {
    return this.adminUsersService.apiAdminUsersGet(
      this.normalizeRole(query.role),
      this.normalizeBoolean(query.isActive),
      this.normalizeBoolean(query.emailConfirmed),
      this.normalizeString(query.createdFrom),
      this.normalizeString(query.createdTo),
      this.normalizeString(query.search),
      query.pageNumber,
      query.pageSize,
      API_VERSION
    );
  }

  getUserDetail(id: number): Observable<AdminUserDetailDto> {
    return this.adminUsersService.apiAdminUsersIdGet(id, API_VERSION);
  }

  createUser(payload: CreateAdminUserRequest): Observable<AdminUserDto> {
    return this.adminUsersService.apiAdminUsersPost(API_VERSION, payload);
  }

  updateRole(id: number, role: UserRole): Observable<{}> {
    const body: UpdateUserRoleRequest = { role };
    return this.adminUsersService.apiAdminUsersIdRolePatch(id, API_VERSION, body);
  }

  updateStatus(id: number, isActive: boolean): Observable<{}> {
    const body: UpdateUserStatusRequest = { isActive };
    return this.adminUsersService.apiAdminUsersIdStatusPatch(id, API_VERSION, body);
  }

  deleteUser(id: number): Observable<{}> {
    return this.adminUsersService.apiAdminUsersIdDelete(id, API_VERSION);
  }

  private normalizeString(value?: string | null): string | undefined {
    if (!value) {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  private normalizeBoolean(value?: boolean | '' | 'true' | 'false' | null): boolean | undefined {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    return value;
  }

  private normalizeRole(value?: UserRole | '' | null): UserRole | undefined {
    if (!value) {
      return undefined;
    }
    return value;
  }
}
