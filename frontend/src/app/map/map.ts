// map.component.ts
import { JsonPipe } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { GoogleMap, GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';

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
  selector: 'app-map',
  templateUrl: './map.html',
  styleUrls: ['./map.css'],
  imports: [GoogleMapsModule, JsonPipe]
})
export class Map implements OnInit {
  @Input() listings: Listing[] = [];
  @Output() listingSelected = new EventEmitter<Listing>();
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  selectedListing: Listing | null = null;
  
  // Map options
  center: google.maps.LatLngLiteral = { lat: 40.7128, lng: -74.0060 }; // New York
  zoom = 12;
  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    maxZoom: 20,
    minZoom: 8,
  };

  markers: any[] = [];

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

  ngOnInit() {
    this.updateMarkers();
  }

  ngOnChanges() {
    this.updateMarkers();
  }

  updateMarkers() {
    this.markers = this.listings.map(listing => ({
      position: {
        lat: parseFloat(listing.gpsLat) || 40.7128,
        lng: parseFloat(listing.gpsLng) || -74.0060
      },
      title: listing.name,
      options: {
        animation: google.maps.Animation.DROP,
      },
      listing: listing,
      id: listing.id
    }));

    // Center map on first marker or default
    if (this.markers.length > 0) {
      this.center = this.markers[0].position;
    }
  }

  openInfoWindow(marker: MapMarker, listing: Listing) {
    this.selectedListing = listing;
    this.infoWindow.open(marker);
    this.listingSelected.emit(listing);
  }

  closeInfoWindow() {
    this.selectedListing = null;
  }

  getServicesList(servicesOffered: string): any[] {
    const services = servicesOffered.toLowerCase().split(',').map(s => s.trim());
    return this.serviceTypes.filter(type => 
      services.some(service => service.includes(type.key))
    );
  }
}