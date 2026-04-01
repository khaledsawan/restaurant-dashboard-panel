import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { finalize, take } from 'rxjs';

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

  private readonly changeDetector = inject(ChangeDetectorRef);

  constructor(private readonly ordersFacade: OrdersFacade) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.errorMessage = '';

    this.ordersFacade
      .getActiveOrders()
      .pipe(
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (orders) => {
          this.loading = false;
          this.orders = orders;
          this.changeDetector.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Failed to load orders. Please try again.';
          this.changeDetector.detectChanges();
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
