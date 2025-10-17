// services/listing.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

// listing.model.ts
export interface Comment {
  author: string;
  content: string;
  date: string;
}
export interface Listing {
  id: number;
  name: string;
  description: string;
  active: boolean;
  servicesOffered: string;
  gpsLat: string;
  gpsLng: string;
  status: string;
  pin: boolean;
  capacity: string;
  address?: string;
  updatedAt?: string;
  peopleCapacity?: number;
  availableServices?: string[];
  comments?: Comment[];
}

@Injectable({
  providedIn: 'root'
})
export class ListingService {
  private apiUrl = 'http://localhost:8080/api/public';
  private useMockData = true; // Set to false to use real API

  
  // Mock data for development
  private mockListings: Listing[] = [
    {
      id: 1,
      name: 'Central Community Center',
      description: 'Large community center with full kitchen facilities and sleeping areas.',
      active: true,
      servicesOffered: 'food, shelter, water, child-safe',
      gpsLat: '40.7128',
      gpsLng: '-74.0060',
      status: 'approved',
      pin: true,
      capacity: '200',
      address: '123 Main St, Downtown',
      updatedAt: '2024-01-15T13:30:00',
      peopleCapacity: 200,
      availableServices: ['Food', 'Shelter', 'Water', 'Child-Safe'],
      comments: [
        { author: 'Anonymous', content: 'Great facilities, very helpful staff.', date: '2024-01-15T20:00:00' },
        { author: 'User', content: 'Could use more blankets, but food service is excellent.', date: '2024-01-15T22:15:00' },
      ],
    },
    {
      id: 2,
      name: 'Riverside Emergency Shelter',
      description: 'Temporary shelter with accessible facilities.',
      active: true,
      servicesOffered: 'shelter, water, toilets, disabled',
      gpsLat: '40.7489',
      gpsLng: '-73.9680',
      status: 'approved',
      pin: true,
      capacity: '150',
      address: '456 River Rd, Riverside',
      updatedAt: '2024-01-15T16:00:00',
      peopleCapacity: 150,
      availableServices: ['Food', 'Shelter', 'Water', 'Child-Safe'],
      comments: [
        { author: 'Anonymous', content: 'Great facilities, very helpful staff.', date: '2024-01-15T20:00:00' },
        { author: 'User', content: 'Could use more blankets, but food service is excellent.', date: '2024-01-15T22:15:00' },
      ],
    },
    {
      id: 3,
      name: 'Food Distribution Point',
      description: 'Daily food distribution for families.',
      active: true,
      servicesOffered: 'food, water, pet',
      gpsLat: '40.7306',
      gpsLng: '-73.9352',
      status: 'approved',
      pin: true,
      capacity: '100',
      address: '789 Oak Ave, Westside',
      updatedAt: '2024-01-15T14:00:00',
      peopleCapacity: 100,
      availableServices: ['Food', 'Shelter', 'Water', 'Child-Safe'],
      comments: [
        { author: 'Anonymous', content: 'Great facilities, very helpful staff.', date: '2024-01-15T20:00:00' },
        { author: 'User', content: 'Could use more blankets, but food service is excellent.', date: '2024-01-15T22:15:00' },
      ],
    },
    {
      id: 4,
      name: 'Northside Aid Station',
      description: 'Comprehensive aid station with multiple services.',
      active: true,
      servicesOffered: 'food, shelter, water, wifi, child-safe',
      gpsLat: '40.7589',
      gpsLng: '-73.9851',
      status: 'approved',
      pin: true,
      capacity: '80',
      address: '321 North Blvd, Northside',
      updatedAt: '2024-01-15T12:00:00',
      peopleCapacity: 80,
      availableServices: ['Food', 'Shelter', 'Water', 'Child-Safe'],
      comments: [
        { author: 'Anonymous', content: 'Great facilities, very helpful staff.', date: '2024-01-15T20:00:00' },
        { author: 'User', content: 'Could use more blankets, but food service is excellent.', date: '2024-01-15T22:15:00' },
      ],
    }
  ];

  constructor(private http: HttpClient) {}

  // Get all listings
  getAllListings(): Observable<Listing[]> {
    if (this.useMockData) {
      return of(this.mockListings);
    }
    return this.http.get<Listing[]>(`${this.apiUrl}/listings`);
  }

  // Get listings by tags
  getListingsByTags(tags: string[]): Observable<Listing[]> {
    if (this.useMockData) {
      const filtered = this.mockListings.filter(listing => {
        const services = listing.servicesOffered.toLowerCase().split(',').map(s => s.trim());
        return tags.some(tag => 
          services.some(service => service.includes(tag.toLowerCase()))
        );
      });
      return of(filtered);
    }
    const tagsParam = tags.join(',');
    return this.http.get<Listing[]>(`${this.apiUrl}/listingsByTags?tags=${tagsParam}`);
  }

  // Submit feedback
  submitFeedback(feedback: any): Observable<any> {
    if (this.useMockData) {
      console.log('Mock feedback submitted:', feedback);
      return of({ success: true, message: 'Feedback submitted successfully' });
    }
    return this.http.post(`${this.apiUrl.replace('public', 'reporting')}/feedback`, feedback);
  }

  // Submit analytics
  submitAnalytics(analytics: any): Observable<any> {
    if (this.useMockData) {
      console.log('Mock analytics submitted:', analytics);
      return of({ success: true });
    }
    return this.http.post(`${this.apiUrl.replace('public', 'reporting')}/analytics`, analytics);
  }

  getListingDetails(id: number): Observable<Listing> {
    const listing = this.mockListings.find(l => l.id === id);
    return of(listing!);
  }
}