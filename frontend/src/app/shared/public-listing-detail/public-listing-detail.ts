import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AidListing, getServiceIcon, ListingFeedback } from '../../models/location.models';
import { FeedbackService } from '../../services/feedback.service';

@Component({
  selector: 'app-public-listing-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './public-listing-detail.html',
  styleUrls: ['./public-listing-detail.css']
})
export class PublicListingDetailComponent implements OnInit {
  @Input() location!: AidListing;
  
  newComment: string = '';
  feedbacks: ListingFeedback[] = [];
  isPostingComment: boolean = false;
  feedbackError: string = '';
  feedbackSuccess: string = '';
  showReportIssues: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private feedbackService: FeedbackService
  ) {}

  ngOnInit(): void {
    this.loadFeedbacks();
  }

  loadFeedbacks(): void {
    if (!this.location?.id) return;
    
    // Use existing feedbacks from location
    if (this.location.feedbacks) {
      this.feedbacks = [...this.location.feedbacks];
    } else {
      this.feedbacks = [];
    }
  }

  postComment(): void {
    if (!this.newComment.trim() || !this.location?.id) {
      return;
    }

    this.isPostingComment = true;
    this.feedbackError = '';
    this.feedbackSuccess = '';

    this.feedbackService.postFeedback(this.location.id, this.newComment).subscribe({
      next: (feedback) => {
        // Add the new feedback to the beginning of the list
        this.feedbacks.unshift(feedback);
        // Update the location's feedbacks array
        if (this.location.feedbacks) {
          this.location.feedbacks.unshift(feedback);
        } else {
          this.location.feedbacks = [feedback];
        }
        // Clear the input
        this.newComment = '';
        this.isPostingComment = false;
        this.feedbackSuccess = 'Thank you for reporting the issue!';
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          this.feedbackSuccess = '';
        }, 5000);
      },
      error: (error) => {
        console.error('Error posting comment:', error);
        this.feedbackError = 'Failed to post comment. Please try again.';
        this.isPostingComment = false;
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(',', ',');
  }

  getServiceIcon(serviceName: string): string {
    return getServiceIcon(serviceName);
  }

  close(): void {
    this.activeModal.dismiss('close');
  }

  toggleReportIssues(): void {
    this.showReportIssues = !this.showReportIssues;
    // Clear any previous messages when toggling
    if (!this.showReportIssues) {
      this.feedbackError = '';
      this.feedbackSuccess = '';
      this.newComment = '';
    }
  }

  reportIssue(): void {
    console.log('Report issue for location:', this.location.name);
    // TODO: Implement report issue functionality
    alert('Report issue functionality will be implemented soon.');
  }
}
