import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payment-callback',
  standalone: true,
  template: `<div class='container text-center py-5'><h2>Processing Payment...</h2><p>Please wait, you will be redirected automatically.</p></div>`,
  styles: []
})
export class PaymentCallbackComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      const paymobId = params['id'];
      if (paymobId) {
        console.log('Sending paymobId to confirm:', paymobId);
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const response = await fetch('https://localhost:7152/api/payment/paymob-confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': 'Bearer ' + token } : {})
          },
          body: JSON.stringify(paymobId)
        });
        const result = await response.json();
        console.log('Confirm response:', result);
        this.router.navigate(['/my-properties']);
      }
    });
  }
} 