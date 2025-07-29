import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Property {
  id: number;
  title: string;
  description?: string;
  price: number;
  roomsCount?: number;
  genderPreference?: string;
  city?: string;
  region?: string;
  street?: string;
  imagePaths?: string[];
  [key: string]: any;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  properties: Property[] = [];
  allProperties: Property[] = [];
  user: any = null;
  location: string = '';
  propertyType: string = '';
  priceRange: string = '';
  roomsCount: number | null = null;
  region: string = '';

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;
  paginatedProperties: Property[] = [];

  // Math object for template
  Math = Math;

  async ngOnInit() {
    this.user = this.getUserFromLocalStorage();
    await this.fetchProperties();
  }

  getUserFromLocalStorage() {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  async fetchProperties() {
    try {
      let url = 'https://localhost:7152/api/Property';
      let headers: any = {};
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      // Only call /my-properties if user is Owner
      if (this.user && (this.user.role === 'Owner' || (this.user.roles && this.user.roles.includes('Owner')))) {
        url = 'https://localhost:7152/api/Property/my-properties';
        if (token) headers['Authorization'] = 'Bearer ' + token;
      } else if (token) {
        headers['Authorization'] = 'Bearer ' + token;
      }
      const res = await fetch(url, { headers });
      if (!res.ok) {
        this.properties = [];
        this.allProperties = [];
        console.error('Error fetching properties:', res.status, await res.text());
        return;
      }
      this.allProperties = await res.json();
      this.properties = [...this.allProperties];
      console.log('properties from API:', this.properties);
      this.updatePagination();
    } catch (err) {
      this.properties = [];
      this.allProperties = [];
      console.error('Error fetching properties:', err);
    }
  }

  getImageUrl(path?: string): string {
    if (!path) return 'https://via.placeholder.com/400x250';
    if (path.startsWith('http')) return path;
    return `https://localhost:7152${path}`;
  }

  searchProperties() {
    this.properties = this.allProperties.filter(p => {
      const matchesLocation = !this.location || (p.city && p.city.toLowerCase().includes(this.location.toLowerCase()));
      const matchesRegion = !this.region || (p.region && p.region.toLowerCase().includes(this.region.toLowerCase()));
      let matchesPrice = true;
      if (this.priceRange) {
        let price: number = 0;
        if (typeof p.price === 'string') {
          price = Number((p.price as string).replace(/[^\d.]/g, ''));
        } else if (typeof p.price === 'number') {
          price = p.price;
        }
        if (isNaN(price)) matchesPrice = false;
        else if (this.priceRange === '$100k - $200k') matchesPrice = price >= 100000 && price <= 200000;
        else if (this.priceRange === '$200k - $500k') matchesPrice = price > 200000 && price <= 500000;
        else if (this.priceRange === '$500k - $1M') matchesPrice = price > 500000 && price <= 1000000;
        else if (this.priceRange === '$1M+') matchesPrice = price > 1000000;
      }
      let matchesRooms = true;
      if (this.roomsCount && !isNaN(this.roomsCount)) {
        let propRooms = typeof p.roomsCount === 'string' ? Number(p.roomsCount) : p.roomsCount;
        if (typeof propRooms !== 'number' || isNaN(propRooms)) propRooms = 0;
        matchesRooms = propRooms >= Number(this.roomsCount);
      }
      return matchesLocation && matchesRegion && matchesPrice;
    });
    this.currentPage = 1; // Reset to first page when searching
    this.updatePagination();
  }

  // Pagination methods
  updatePagination() {
    this.totalPages = Math.ceil(this.properties.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    if (this.currentPage < 1) this.currentPage = 1;
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProperties = this.properties.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let start = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
      let end = Math.min(this.totalPages, start + maxVisiblePages - 1);
      
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  viewPropertyDetails(propertyId: number) {
    // TODO: Navigate to property details page
    console.log('Viewing property:', propertyId);
  }

  sendContactMessage() {
    // TODO: Implement contact form submission
    console.log('Sending contact message...');
  }
}
