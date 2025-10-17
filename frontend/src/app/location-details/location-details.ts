import { Component, Inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Listing, ListingService } from '../services/listing-service';
import { DatePipe } from '@angular/common';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';

@Component({
  selector: 'app-location-details',
  templateUrl: './location-details.html',
  styleUrls: ['./location-details.css'],
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    DatePipe
  ],
})
export class LocationDetails {
  // Use signal instead of regular property
  listing = signal<Listing | null>(null);

  constructor(
    private listingService: ListingService,
    private dialogRef: MatDialogRef<LocationDetails>,
    @Inject(MAT_DIALOG_DATA) public data: { listingId: number }
  ) {}

  ngOnInit() {
    this.fetchDetails();
  }

  fetchDetails() {
    this.listingService.getListingDetails(this.data.listingId).subscribe(data => {
      this.listing.set(data); // set the signal value
      console.log(" == ", data);
    });
  }

  closeModal() {
    this.dialogRef.close();
  }
}
