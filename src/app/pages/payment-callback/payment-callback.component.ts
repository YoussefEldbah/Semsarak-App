import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payment-callback',
  standalone: true,
  template: `
    <div class="container text-center py-5">
      <div *ngIf="isProcessing" class="processing-container">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <h2 class="text-primary mb-3">جاري معالجة الدفع...</h2>
        <p class="text-muted">يرجى الانتظار، سيتم تحويلك تلقائياً</p>
        <div class="progress mt-3" style="height: 4px;">
          <div class="progress-bar progress-bar-striped progress-bar-animated" 
               role="progressbar" 
               style="width: 100%"></div>
        </div>
      </div>

      <div *ngIf="isSuccess" class="success-container">
        <div class="text-success mb-3">
          <i class="fas fa-check-circle fa-3x"></i>
        </div>
        <h2 class="text-success mb-3">تم تأكيد الدفع بنجاح! ✅</h2>
        <p class="text-muted">سيتم تحويلك إلى صفحة العقارات خلال لحظات...</p>
      </div>

      <div *ngIf="isError" class="error-container">
        <div class="text-danger mb-3">
          <i class="fas fa-exclamation-triangle fa-3x"></i>
        </div>
        <h2 class="text-danger mb-3">حدث خطأ في تأكيد الدفع ❌</h2>
        <p class="text-muted mb-3">{{ errorMessage }}</p>
        <button class="btn btn-primary" (click)="retryPayment()">
          <i class="fas fa-redo me-2"></i>إعادة المحاولة
        </button>
        <button class="btn btn-outline-secondary ms-2" (click)="goToProperties()">
          <i class="fas fa-home me-2"></i>العودة للعقارات
        </button>
      </div>
    </div>
  `,
  styles: [`
    .processing-container, .success-container, .error-container {
      max-width: 500px;
      margin: 0 auto;
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    
    .processing-container {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }
    
    .success-container {
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
    }
    
    .error-container {
      background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
    }
    
    .spinner-border {
      width: 3rem;
      height: 3rem;
    }
    
    .progress {
      border-radius: 10px;
      background-color: #e9ecef;
    }
    
    .progress-bar {
      background: linear-gradient(90deg, #007bff, #0056b3);
    }
  `]
})
export class PaymentCallbackComponent implements OnInit {
  isProcessing: boolean = true;
  isSuccess: boolean = false;
  isError: boolean = false;
  errorMessage: string = '';
  paymobId: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      this.paymobId = params['id'];
      if (this.paymobId) {
        console.log('Processing payment with ID:', this.paymobId);
        await this.confirmPayment();
      } else {
        this.showError('لم يتم العثور على معرف الدفع');
      }
    });
  }

  async confirmPayment() {
    try {
      // Manual confirmation only
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (!token) {
        this.showError('لم يتم العثور على رمز المصادقة');
        return;
      }

      const confirmResponse = await fetch('https://localhost:7152/api/payment/paymob-confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(this.paymobId)
      });

      const result = await confirmResponse.json();
      console.log('Payment confirmation response:', result);

      if (confirmResponse.ok) {
        this.showSuccess();
        setTimeout(() => {
          this.router.navigate(['/my-properties']);
        }, 3000);
      } else {
        this.showError(result?.message || 'فشل في تأكيد الدفع');
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      this.showError('حدث خطأ في الاتصال بالخادم');
    }
  }

  showSuccess() {
    this.isProcessing = false;
    this.isSuccess = true;
    this.isError = false;
  }

  showError(message: string) {
    this.isProcessing = false;
    this.isSuccess = false;
    this.isError = true;
    this.errorMessage = message;
  }

  retryPayment() {
    this.isProcessing = true;
    this.isSuccess = false;
    this.isError = false;
    this.confirmPayment();
  }

  goToProperties() {
    this.router.navigate(['/my-properties']);
  }
} 