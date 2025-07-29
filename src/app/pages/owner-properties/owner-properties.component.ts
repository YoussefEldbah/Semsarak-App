import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-owner-properties',
  templateUrl: './owner-properties.component.html',
  styleUrl: './owner-properties.component.css',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class OwnerPropertiesComponent implements OnInit {
  myProperties: any[] = [];
  editProperty: any = null;
  editPropertyForm: FormGroup;
  user: any = null;
  errorMessage: string = '';
  successMessage: string = '';
  pendingDeleteId: number | null = null;
  
  // Image editing properties
  editingImagesProperty: any = null;
  newImages: any[] = [];
  uploadingImages: boolean = false;
  deletingImageIndex: number | null = null;
  imagesSuccessMessage: string = '';
  imagesErrorMessage: string = '';
  showDeleteImageModal: boolean = false;
  imageToDeleteIndex: number | null = null;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

  advertiseModalProperty: any = null;
  advertiseFee: number = 100; // مثال: 100 جنيه أو حسب المطلوب
  advertiseIframeUrl: SafeResourceUrl | null = null;
  advertiseLoading: boolean = false;
  showAdvertiseConfirmModal: boolean = false;
  advertiseTransactionId: string = '';
  advertiseConfirmLoading: boolean = false;
  advertiseConfirmSuccess: boolean = false;
  advertiseConfirmError: string = '';
  currentPaymentId: number | null = null;

  constructor(private fb: FormBuilder, private router: Router, private sanitizer: DomSanitizer) {
    this.editPropertyForm = this.fb.group({}); // فورم فارغ كبداية
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          this.user = JSON.parse(userStr);
        } catch {
          this.user = null;
        }
      }
    }
  }

  async ngOnInit() {
    await this.fetchMyProperties();
    // Listen for payment callback message
    if (typeof window !== 'undefined') {
      window.addEventListener('message', async (event) => {
        if (event.data && event.data.payment === 'success' && event.data.transactionId) {
          // Confirm payment automatically
          try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://localhost:7152/api/payment/paymob-confirm', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': 'Bearer ' + token } : {})
              },
              body: JSON.stringify(event.data.transactionId)
            });
            if (res.ok) {
              this.successMessage = 'Payment confirmed!';
              await this.fetchMyProperties();
              setTimeout(() => { this.successMessage = ''; }, 3000);
            } else {
              this.errorMessage = 'Failed to confirm payment.';
              setTimeout(() => { this.errorMessage = ''; }, 3000);
            }
          } catch {
            this.errorMessage = 'Failed to confirm payment.';
            setTimeout(() => { this.errorMessage = ''; }, 3000);
          }
        }
      });
    }
  }

  async fetchMyProperties() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    try {
      const res = await fetch('https://localhost:7152/api/Property/my-properties', {
        headers: token ? { 'Authorization': 'Bearer ' + token } : {}
      });
      this.myProperties = await res.json();
    } catch (err) {
      this.myProperties = [];
      console.error('Error fetching my properties:', err);
    }
  }

  getImageUrl(path?: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `https://localhost:7152/${path.replace(/^\\?/, '')}`;
  }

  startEditProperty(property: any) {
    this.editProperty = property;
    this.editPropertyForm = this.fb.group({
      title: [property.title, Validators.required],
      price: [property.price, Validators.required],
      city: [property.city, Validators.required],
      region: [property.region, Validators.required],
      description: [property.description],
      roomsCount: [property.roomsCount],
      genderPreference: [property.genderPreference],
      street: [property.street],
      status: [property.status]
    });
  }

  async saveEditProperty() {
    if (!this.editPropertyForm.valid || !this.editProperty) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    try {
      const response = await fetch(`https://localhost:7152/api/Property/${this.editProperty.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {})
        },
        body: JSON.stringify(this.editPropertyForm.value)
      });
      if (response.ok) {
        await this.fetchMyProperties();
        this.editProperty = null;
        this.editPropertyForm = this.fb.group({});
      } else {
        alert('Failed to update property');
      }
    } catch (err) {
      alert('Failed to update property');
    }
  }

  async deleteProperty(id: number) {
    this.pendingDeleteId = id;
  }

  async confirmDelete() {
    if (this.pendingDeleteId == null) return;
    const id = this.pendingDeleteId;
    this.pendingDeleteId = null;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    try {
      const response = await fetch(`https://localhost:7152/api/Property/${id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': 'Bearer ' + token } : {}
      });
      if (response.ok) {
        await this.fetchMyProperties();
        this.successMessage = 'Property deleted successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      } else {
        this.errorMessage = 'Failed to delete property.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    } catch (err) {
      this.errorMessage = 'Failed to delete property.';
      setTimeout(() => this.errorMessage = '', 3000);
    }
  }

  cancelDelete() {
    this.pendingDeleteId = null;
  }

  goToAddProperty() {
    this.router.navigate(['/add-property']);
  }

  // Image editing methods
  async startEditImages(property: any) {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`https://localhost:7152/api/property/${property.id}/images`, {
        headers: token ? { 'Authorization': 'Bearer ' + token } : {}
      });
      if (res.ok) {
        const images = await res.json(); // يجب أن يكون [{id, imagePath}]
        property.images = images;
      } else {
        property.images = [];
      }
    } catch (err) {
      property.images = [];
    }
    this.editingImagesProperty = { ...property };
    this.newImages = [];
    this.imagesSuccessMessage = '';
    this.imagesErrorMessage = '';
  }

  cancelEditImages() {
    this.editingImagesProperty = null;
    this.newImages = [];
    this.imagesSuccessMessage = '';
    this.imagesErrorMessage = '';
  }

  onNewImagesSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.newImages.push({
              file: file,
              preview: e.target.result
            });
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }

  removeNewImage(index: number) {
    this.newImages.splice(index, 1);
  }

  openDeleteImageModal(index: number) {
    this.imageToDeleteIndex = index;
    this.showDeleteImageModal = true;
  }

  closeDeleteImageModal() {
    this.showDeleteImageModal = false;
    this.imageToDeleteIndex = null;
  }

  async confirmDeleteImage() {
    if (this.imageToDeleteIndex == null) return;
    await this.removeImage(this.imageToDeleteIndex, true);
    this.closeDeleteImageModal();
  }

  // عدل removeImage ليأخذ confirm=false (افتراضي) ولا يحذف إلا إذا كان confirm=true
  async removeImage(index: number, confirmed: boolean = false) {
    if (!confirmed) {
      this.openDeleteImageModal(index);
      return;
    }
    if (!this.editingImagesProperty || !this.editingImagesProperty.images) return;
    const imageObj = this.editingImagesProperty.images[index];
    if (!imageObj || !imageObj.id) {
      this.toastMessage = 'Cannot delete this image: No image ID found.';
      this.toastType = 'error';
      setTimeout(() => this.toastMessage = '', 3000);
      return;
    }
    this.deletingImageIndex = index;
    const imageId = imageObj.id;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const url = `https://localhost:7152/api/property/image/${imageId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      if (response.ok) {
        this.editingImagesProperty.images.splice(index, 1);
        this.imagesSuccessMessage = 'Image deleted successfully!';
        this.toastMessage = 'Image deleted successfully!';
        this.toastType = 'success';
        setTimeout(() => this.toastMessage = '', 3000);
      } else {
        const errorText = await response.text();
        this.imagesErrorMessage = `Failed to delete image: ${response.status} ${response.statusText}`;
        this.toastMessage = 'Failed to delete image!';
        this.toastType = 'error';
        setTimeout(() => this.toastMessage = '', 3000);
      }
    } catch (error) {
      this.imagesErrorMessage = 'Failed to delete image. Please try again.';
      this.toastMessage = 'Failed to delete image!';
      this.toastType = 'error';
      setTimeout(() => this.toastMessage = '', 3000);
    } finally {
      this.deletingImageIndex = null;
    }
  }

  async saveImages() {
    if (!this.editingImagesProperty || this.newImages.length === 0) return;
    
    this.uploadingImages = true;
    this.imagesSuccessMessage = '';
    this.imagesErrorMessage = '';
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const formData = new FormData();
      
      // Add new images to form data
      this.newImages.forEach(image => {
        formData.append('Images', image.file);
      });
      
      const response = await fetch(`https://localhost:7152/api/property/${this.editingImagesProperty.id}/images`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        body: formData
      });
      
      if (response.ok) {
        this.imagesSuccessMessage = 'Images uploaded successfully!';
        // Refresh the properties list to show updated images
        await this.fetchMyProperties();
        // Update the editing property with new data
        const updatedProperty = this.myProperties.find(p => p.id === this.editingImagesProperty.id);
        if (updatedProperty) {
          this.editingImagesProperty = { ...updatedProperty };
        }
        // Close modal after 2 seconds
        setTimeout(() => {
          this.cancelEditImages();
        }, 2000);
      } else {
        const errorText = await response.text();
        this.imagesErrorMessage = errorText || 'Failed to upload images';
      }
    } catch (error) {
      this.imagesErrorMessage = 'Failed to upload images. Please try again.';
    } finally {
      this.uploadingImages = false;
    }
  }

  openAdvertiseModal(property: any) {
    this.advertiseModalProperty = property;
    this.advertiseIframeUrl = null;
    this.advertiseLoading = false;
  }

  closeAdvertiseModal() {
    this.advertiseModalProperty = null;
    this.advertiseIframeUrl = null;
    this.advertiseLoading = false;
  }

  // عند إنشاء دفعة إعلان
  async initiateAdvertisePayment() {
    if (!this.advertiseModalProperty) return;
    this.advertiseLoading = true;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch('https://localhost:7152/api/payment/advertise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {})
        },
        body: JSON.stringify({ propertyId: this.advertiseModalProperty.id })
      });
      const data = await res.json();
      this.currentPaymentId = data.PaymentId;
      // افتح نافذة جديدة للدفع
      window.open(data.iframeUrl, '_blank', 'width=600,height=800');
      this.closeAdvertiseModal();
    } catch (err) {
      this.toastMessage = 'Failed to initiate payment!';
      this.toastType = 'error';
      setTimeout(() => this.toastMessage = '', 3000);
    } finally {
      this.advertiseLoading = false;
    }
  }

  openAdvertiseConfirmModal() {
    this.showAdvertiseConfirmModal = true;
    this.advertiseTransactionId = '';
    this.advertiseConfirmLoading = false;
    this.advertiseConfirmSuccess = false;
    this.advertiseConfirmError = '';
  }

  closeAdvertiseConfirmModal() {
    this.showAdvertiseConfirmModal = false;
    this.advertiseTransactionId = '';
    this.advertiseConfirmLoading = false;
    this.advertiseConfirmSuccess = false;
    this.advertiseConfirmError = '';
  }

  // عند تأكيد الدفع
  async confirmAdvertisePayment(transactionId: string) {
    if (!this.currentPaymentId) return;
    this.advertiseConfirmLoading = true;
    this.advertiseConfirmSuccess = false;
    this.advertiseConfirmError = '';
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch('https://localhost:7152/api/payment/paymob-confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {})
        },
        body: JSON.stringify({ paymentId: this.currentPaymentId, transactionId })
      });
      if (res.ok) {
        this.advertiseConfirmSuccess = true;
        // تحديث حالة العقار في القائمة
        const idx = this.myProperties.findIndex(p => p.id === this.advertiseModalProperty.id);
        if (idx !== -1) {
          this.myProperties[idx].status = 'Available';
        }
        setTimeout(() => {
          this.closeAdvertiseConfirmModal();
          this.closeAdvertiseModal();
        }, 2000);
      } else {
        const errorText = await res.text();
        this.advertiseConfirmError = errorText || 'Failed to confirm payment.';
      }
    } catch (err) {
      this.advertiseConfirmError = 'Failed to confirm payment. Please try again.';
    } finally {
      this.advertiseConfirmLoading = false;
    }
  }
}
