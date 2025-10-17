// location-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

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
  selector: 'app-location-card',
  templateUrl: './location-card.html',
  styleUrls: ['./location-card.css']
})
export class LocationCard {
  @Input() listing!: Listing;
  @Output() viewDetails = new EventEmitter<Listing>();

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

  getServicesList(servicesOffered: string): any[] {
    const services = servicesOffered.toLowerCase().split(',').map(s => s.trim());
    return this.serviceTypes.filter(type => 
      services.some(service => service.includes(type.key))
    );
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }) + ', ' + date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  onViewDetails() {
    this.viewDetails.emit(this.listing);
  }
}