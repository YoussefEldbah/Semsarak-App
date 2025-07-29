import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  users: any[] = [];
  loading = true;
  error: string = '';

  // Tabs and properties state
  activeTab: 'users' | 'properties' = 'users';
  properties: any[] = [];
  propertiesLoading = false;
  propertiesError = '';

  constructor() {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers() {
    this.loading = true;
    this.error = '';
    const token = localStorage.getItem('token');
    console.log('Fetching users with token:', token ? 'Present' : 'Missing');
    
    fetch('https://localhost:7152/api/Admin/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
      .then(res => {
        console.log('Users API response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Users data received:', data);
        this.users = data;
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        this.error = `فشل في جلب المستخدمين: ${error.message}`;
      })
      .finally(() => {
        this.loading = false;
      });
  }

  onTabChange(tab: 'users' | 'properties') {
    this.activeTab = tab;
    if (tab === 'properties' && this.properties.length === 0) {
      this.fetchProperties();
    }
  }

  fetchProperties() {
    this.propertiesLoading = true;
    this.propertiesError = '';
    const token = localStorage.getItem('token');
    console.log('Fetching properties with token:', token ? 'Present' : 'Missing');
    
    fetch('https://localhost:7152/api/Admin/properties', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
      .then(res => {
        console.log('Properties API response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Properties data received:', data);
        this.properties = data;
      })
      .catch((error) => {
        console.error('Error fetching properties:', error);
        this.propertiesError = `فشل في جلب العقارات: ${error.message}`;
      })
      .finally(() => {
        this.propertiesLoading = false;
      });
  }
} 