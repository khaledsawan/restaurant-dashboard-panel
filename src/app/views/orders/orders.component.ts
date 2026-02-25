import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';

import {
  AlertComponent,
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  SpinnerComponent,
  TableDirective
} from '@coreui/angular';

import { OrderStatus, OrderSummaryDto } from '../../shared/service-proxies';
import { OrdersFacade } from './orders.facade';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
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
    DatePipe,
    DecimalPipe
  ]
})
export class OrdersComponent implements OnInit {
  orders: OrderSummaryDto[] = [];
  loading = false;
  errorMessage = '';

  constructor(private readonly ordersFacade: OrdersFacade) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.errorMessage = '';

    this.ordersFacade
      .getActiveOrders()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (orders) => {
          this.orders = orders;
        },
        error: () => {
          this.errorMessage = 'Failed to load orders. Please try again.';
        }
      });
  }

  statusBadgeColor(status: OrderStatus | undefined): 'warning' | 'info' | 'primary' | 'success' | 'danger' | 'secondary' {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'preparing':
        return 'primary';
      case 'ready':
        return 'success';
      case 'outForDelivery':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}
