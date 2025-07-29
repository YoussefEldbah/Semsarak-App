import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css'],
  standalone: true
})
export class PaymentSuccessComponent implements OnInit {
  transactionId: string = '';
  confirmLoading: boolean = false;
  confirmSuccess: boolean = false;
  confirmError: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const transactionId = params['transactionId'];
      if (transactionId) {
        this.transactionId = transactionId;
        this.confirmPayment(transactionId);
      } else {
        this.confirmError = 'No transactionId found in URL.';
      }
    });
  }

  async confirmPayment(transactionId: string) {
    this.confirmLoading = true;
    this.confirmSuccess = false;
    this.confirmError = '';
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch('https://localhost:7152/api/payment/paymob-confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {})
        },
        body: JSON.stringify(transactionId)
      });
      if (res.ok) {
        this.confirmSuccess = true;
        console.log('Redirecting to /my-properties');
        try {
          this.router.navigate(['/my-properties']);
        } catch (e) {
          window.location.href = '/my-properties';
        }
      } else {
        const errorText = await res.text();
        this.confirmError = errorText || 'Failed to confirm payment.';
      }
    } catch (err) {
      this.confirmError = 'Failed to confirm payment. Please try again.';
    } finally {
      this.confirmLoading = false;
    }
  }
} 