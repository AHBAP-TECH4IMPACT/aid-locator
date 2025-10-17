import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonPipe } from '@angular/common';
import { LocationList } from '../location-list/location-list';
import { Map } from '../map/map';
import { Listing, ListingService } from '../services/listing-service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [JsonPipe, LocationList, Map],
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.css']
})
export class LandingPage {
  private listingService = inject(ListingService);
  private http = inject(HttpClient);

  // Signals
  listings = signal<Listing[]>([]);
  activeFilters = signal<string[]>([]);
  healthResult = signal<any | null>(null);
  healthError = signal<string>('');
  isLoading = signal<boolean>(false);

  filterTags = ['food','shelter','water','toilets','disabled-access','pet-friendly','child-safe','free-wifi'];


  // Computed: filtered listings
  filteredListings = computed(() => {
    const tags = this.activeFilters();
    if (tags.length === 0) return this.listings();
    return this.listings().filter(listing => {
      const services = listing.servicesOffered.toLowerCase().split(',').map(s => s.trim());
      return tags.some(tag => services.includes(tag.toLowerCase()));
    });
  });

  // Filter display names
  serviceTypes = [
    { key: 'food', label: 'Food', icon: '🍽️' },
    { key: 'shelter', label: 'Shelter', icon: '🏠' },
    { key: 'water', label: 'Water', icon: '💧' },
    { key: 'toilets', label: 'Toilets', icon: '🚻' },
    { key: 'disabled', label: 'Disabled Access', icon: '♿' },
    { key: 'pet', label: 'Pet-Friendly', icon: '🐕' },
    { key: 'child', label: 'Child-Safe', icon: '👶' },
    { key: 'wifi', label: 'Free Wi-Fi', icon: '📶' }
  ];

  constructor() {
    this.loadListings();
  }

  // Load listings from service
  loadListings() {
    this.listingService.getAllListings().subscribe(data => {
      this.listings.set(data);
    });
  }

  // Filter methods
  toggleFilter(tag: string) {
    const filters = this.activeFilters();
    if (filters.includes(tag)) {
      this.activeFilters.set(filters.filter(f => f !== tag));
    } else {
      this.activeFilters.set([...filters, tag]);
    }
  }

  isFilterActive(tag: string) {
    return this.activeFilters().includes(tag);
  }

  clearAllFilters() {
    this.activeFilters.set([]);
  }

  getFilterDisplayName(tag: string): string {
    const service = this.serviceTypes.find(s => {
      // match tag with key, considering some tag differences
      return tag.startsWith(s.key); // handles cases like 'disabled-access' -> 'disabled'
    });
    if (!service) return tag;
    
    return `${service.icon} ${service.label}`;
  }

  // Health check
  checkHealth() {
    this.healthResult.set(null);
    this.healthError.set('');
    this.isLoading.set(true);

    this.http.get('/api/health').subscribe({
      next: (res) => {
        this.healthResult.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.healthError.set(`Failed to connect: ${err.message || 'Unknown error'}`);
        this.isLoading.set(false);
      }
    });
  }

  clearHealthResult() {
    this.healthResult.set(null);
    this.healthError.set('');
  }

  // Handle listing selection from map/list
  onListingSelected(listing: Listing) {
    console.log('Selected listing:', listing);
  }
}
