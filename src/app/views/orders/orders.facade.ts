import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { OrderSummaryDto, OrdersService } from '../../shared/service-proxies';
import { API_VERSION } from '../../core/config/api.config';
import { OrdersQuery } from './orders-query.model';

@Injectable({ providedIn: 'root' })
export class OrdersFacade {
  constructor(private readonly ordersService: OrdersService) {}

  getActiveOrders(): Observable<OrderSummaryDto[]> {
    return this.ordersService.apiOrdersActiveGet(API_VERSION);
  }

  getHistory(query: OrdersQuery): Observable<OrderSummaryDto[]> {
    return this.ordersService.apiOrdersHistoryGet(query.dateFrom, query.dateTo, API_VERSION);
  }
}
