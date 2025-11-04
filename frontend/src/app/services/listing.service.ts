import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AidListing, ListingFeedback } from '../models/location.models';

export interface ListingApproval {
  id: number;
  verificationStatus: string;
}

interface ListingResponse {
  id: number;
  name: string;
  description: string;
  address: string;
  servicesOffered: string;
  gpsLat: string;
  gpsLng: string;
  status: string;
  capacity: string;
  createdAt: string;
  provider: string;
  verificationStatus: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  feedbacks?: ListingFeedback[];
}

@Injectable({
  providedIn: 'root'
})
export class ListingService {
  private apiUrl = '/api/private';

  constructor(private http: HttpClient) {}

  /**
   * Get all pending listings for review (Admin only)
   */
  getAllPendingListings(): Observable<AidListing[]> {
    return this.http.get<ListingResponse[]>(`${this.apiUrl}/listingsReview`)
      .pipe(
        map(responses => responses
          .map(this.mapToAidListing)
          .filter(listing => listing.verificationStatus === 'pending')
        ),
        catchError(this.handleError)
      );
  }

  /**
   * Get all listings (Admin only)
   */
  getAllListings(): Observable<AidListing[]> {
    return this.http.get<ListingResponse[]>(`${this.apiUrl}/listingsReview`)
      .pipe(
        map(responses => responses.map(this.mapToAidListing)),
        catchError(this.handleError)
      );
  }

  /**
   * Get a single listing by ID (Admin only)
   */
  getListingById(id: number): Observable<AidListing | null> {
    return this.http.get<ListingResponse[]>(`${this.apiUrl}/listingsReview`)
      .pipe(
        map(responses => {
          const listing = responses.find(r => r.id === id);
          return listing ? this.mapToAidListing(listing) : null;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Map backend response to AidListing format
   */
  private mapToAidListing(response: ListingResponse): AidListing {
    return {
      id: response.id,
      name: response.name,
      address: response.address || 'Address not provided',
      latitude: response.gpsLat,
      longitude: response.gpsLng,
      services: response.servicesOffered ? response.servicesOffered.split(',').map(s => s.trim()) : [],
      capacity: response.capacity || 'Not specified',
      status: (response.status?.toLowerCase() as 'open' | 'closed' | 'full') || 'open',
      description: response.description || '',
      provider: response.provider,
      submitted: response.createdAt ? new Date(response.createdAt).toLocaleString() : '',
      verificationStatus: (response.verificationStatus?.toLowerCase() as 'verified' | 'pending' | 'rejected') || 'pending',
      contactPerson: response.contactPerson,
      contactPhone: response.contactPhone,
      contactEmail: response.contactEmail,
      feedbacks: response.feedbacks || []
    };
  }

  /**
   * Approve or reject a listing (Admin only)
   */
  approveListing(listingApproval: ListingApproval): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/listingApprove`, listingApproval)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error ${error.status}: ${error.message}`;
    }
    
    console.error('ListingService error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
