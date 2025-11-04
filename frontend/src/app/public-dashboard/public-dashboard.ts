import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { HealthCheckService } from '../services/health-check.service';
import { AidListing, getServiceIcon } from '../models/location.models';
import { MapViewComponent } from './map-view/map-view';
import { LocationsListComponent } from './locations-list/locations-list';

@Component({
  selector: 'app-public-dashboard',
  standalone: true,
  imports: [CommonModule, MapViewComponent, LocationsListComponent],
  templateUrl: './public-dashboard.html',
  styleUrl: './public-dashboard.css'
})
export class PublicDashboardComponent implements OnInit, OnDestroy {
  healthResult: any = null;
  healthError: string = '';
  isLoading: boolean = false;
  
  // Filter related properties
  activeFilters: string[] = [];
  activeRadiusKm: number | null = null;
  userLocation: { lat: number; lng: number } | null = null;
  
  // Mobile map view toggle
  showMapViewOnMobile: boolean = false;
  
  // Filter accordion state
  isFilterCollapsed: boolean = false;
  
  // Locations data - loaded from API
  locations: AidListing[] = [];
  isLoadingListings: boolean = true;
  listingsError: string = '';
  
  private healthCheckSubscription?: Subscription;
  
  // Filter display names mapping
  private filterDisplayNames: { [key: string]: string } = {
    'food': 'Food',
    'shelter': 'Shelter',
    'water': 'Water',
    'toilets': 'Toilets',
    'disabled-access': 'Disabled Access',
    'pet-friendly': 'Pet-Friendly',
    'child-safe': 'Child-Safe',
    'free-wifi': 'Free Wi-Fi'
  };

  constructor(private http: HttpClient, private healthCheckService: HealthCheckService) {}

  ngOnInit() {
    // Load listings on component initialization
    this.loadListings();
    
    // Get user location for radius filtering
    this.getUserLocation();
    
    // Subscribe to health check requests from header
    this.healthCheckSubscription = this.healthCheckService.healthCheckRequest$.subscribe(() => {
      this.checkHealth();
    });
  }

  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
        },
        (error) => {
          console.warn('Error getting user location:', error);
        }
      );
    }
  }

  loadListings() {
    this.isLoadingListings = true;
    this.listingsError = '';

    this.http.get<any[]>('/api/public/listings').subscribe({
      next: (response) => {
        this.locations = response.map(listing => this.mapBackendToAidListing(listing));
        this.isLoadingListings = false;
      },
      error: (error) => {
        this.listingsError = `Failed to load listings: ${error.message || 'Unknown error'}`;
        this.isLoadingListings = false;
        console.error('Error loading listings:', error);
      }
    });
  }

  private mapBackendToAidListing(backendListing: any): AidListing {
    return {
      id: backendListing.id,
      name: backendListing.name || '',
      address: backendListing.address || '',
      latitude: backendListing.gpsLat || '0',
      longitude: backendListing.gpsLng || '0',
      services: backendListing.servicesOffered 
        ? backendListing.servicesOffered.split(',').map((s: string) => s.trim()).filter((s: string) => s) 
        : [],
      capacity: backendListing.capacity || 'N/A',
      status: backendListing.status || 'closed',
      description: backendListing.description || 'No description available',
      contactPerson: backendListing.contactPerson || '',
      contactPhone: backendListing.contactPhone || '',
      contactEmail: backendListing.contactEmail || '',
      provider: backendListing.provider || '',
      verificationStatus: backendListing.verificationStatus || 'pending',
      feedbacks: backendListing.feedbacks || []
    };
  }

  checkHealth() {
    // Reset previous results
    this.healthResult = null;
    this.healthError = '';
    this.isLoading = true;

    // Make API call to health endpoint
    this.http.get('/api/health').subscribe({
      next: (result) => {
        this.healthResult = result;
        this.isLoading = false;
      },
      error: (error) => {
        this.healthError = `Failed to connect to backend: ${error.message || 'Unknown error'}`;
        this.isLoading = false;
      }
    });
  }

  clearHealthResult() {
    this.healthResult = null;
    this.healthError = '';
  }
  
  // Filter methods
  toggleFilter(filter: string) {
    const index = this.activeFilters.indexOf(filter);
    if (index > -1) {
      this.activeFilters.splice(index, 1);
    } else {
      this.activeFilters.push(filter);
    }
  }
  
  isFilterActive(filter: string): boolean {
    return this.activeFilters.includes(filter);
  }
  
  removeFilter(filter: string) {
    const index = this.activeFilters.indexOf(filter);
    if (index > -1) {
      this.activeFilters.splice(index, 1);
    }
  }
  
  clearAllFilters() {
    this.activeFilters = [];
    this.activeRadiusKm = null;
  }
  
  // Radius filter methods
  toggleRadiusFilter(radiusKm: number) {
    if (this.activeRadiusKm === radiusKm) {
      this.activeRadiusKm = null; // Toggle off if same radius clicked
    } else {
      this.activeRadiusKm = radiusKm;
    }
  }
  
  isRadiusFilterActive(radiusKm: number): boolean {
    return this.activeRadiusKm === radiusKm;
  }
  
  // Calculate distance between two points using Haversine formula (in km)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
  
  getFilterDisplayName(filter: string): string {
    return this.filterDisplayNames[filter] || filter;
  }
  
  // Get filtered locations based on active filters
  get filteredLocations(): AidListing[] {
    let filtered = this.locations;

    // Apply service filters
    if (this.activeFilters.length > 0) {
      filtered = filtered.filter(location => {
        // Location must have at least one service that matches the active filters
        return this.activeFilters.some(filter =>
          location.services.includes(filter)
        );
      });
    }

    // Apply radius filter
    if (this.activeRadiusKm !== null && this.userLocation) {
      filtered = filtered.filter(location => {
        if (!location.latitude || !location.longitude) {
          return false;
        }
        
        const lat = parseFloat(location.latitude);
        const lng = parseFloat(location.longitude);
        
        // Skip invalid coordinates
        if (isNaN(lat) || isNaN(lng)) {
          return false;
        }
        
        const distance = this.calculateDistance(
          this.userLocation!.lat,
          this.userLocation!.lng,
          lat,
          lng
        );
        
        return distance <= this.activeRadiusKm!;
      });
    }

    return filtered;
  }

  toggleMapView(): void {
    this.showMapViewOnMobile = !this.showMapViewOnMobile;
  }

  toggleFilterAccordion(): void {
    this.isFilterCollapsed = !this.isFilterCollapsed;
  }

  ngOnDestroy(): void {
    if (this.healthCheckSubscription) {
      this.healthCheckSubscription.unsubscribe();
    }
  }

  getServiceIcon(serviceName: string): string {
    return getServiceIcon(serviceName);
  }
}
