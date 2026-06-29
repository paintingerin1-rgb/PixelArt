import { Component, input, signal } from '@angular/core';
import { CanvasService } from '../../services/canvas';

@Component({
  selector: 'app-share-canvas',
  imports: [],
  templateUrl: './share-canvas.html',
  styleUrl: './share-canvas.css',
})
export class ShareCanvas {
  canvasId = input.required<string>();

  searchQuery = signal('');
  results = signal<{ id: string; email: string }[]>([]);
  errorMessage = signal('');
  addedEmails = signal<string[]>([]);

  constructor(private canvasService: CanvasService) {}

  async onSearch() {
    this.errorMessage.set('');
    const query = this.searchQuery();

    if (!query) {
      this.results.set([]);
      return;
    }

    try {
      const data = await this.canvasService.searchUsersByEmail(query);
      this.results.set(data);
    } catch (err) {
      this.errorMessage.set('Could not search users right now.');
    }
  }

  async addAsViewer(userId: string, email: string) {
    try {
      await this.canvasService.addViewer(this.canvasId(), userId);
      this.addedEmails.set([...this.addedEmails(), email]);
    } catch (err) {
      this.errorMessage.set('Could not add this user.');
    }
  }

  get shareableUrl() {
    return `${window.location.origin}/canvas/${this.canvasId()}`;
  }

  async copyLink() {
    await navigator.clipboard.writeText(this.shareableUrl);
  }
}
