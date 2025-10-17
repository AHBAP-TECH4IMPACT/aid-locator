// location-list.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LocationCard } from '../location-card/location-card';
import { LocationDetails } from '../location-details/location-details';
import { MatDialog } from '@angular/material/dialog';

interface Listing {
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
}

@Component({
  selector: 'app-location-list',
  templateUrl: './location-list.html',
  styleUrls: ['./location-list.css'],
  imports: [LocationCard]
})
export class LocationList {
  @Input() listings: Listing[] = [];
  
  constructor(private dialog: MatDialog) {}

  onViewDetails(listing: Listing) {
    this.dialog.open(LocationDetails, {
      width: '600px',
      data: { listingId: listing.id } // pass ID to modal
    });
  }
}