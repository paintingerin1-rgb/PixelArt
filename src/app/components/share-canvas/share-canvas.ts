import { Component, input, OnInit, signal } from '@angular/core';
import { CanvasService } from '../../services/canvas';
import { AuthService } from '../../services/auth';
import { CanvasViewer } from '../../models/canvas-viewer';

@Component({
  selector: 'app-share-canvas',
  standalone: true,
  imports: [],
  templateUrl: './share-canvas.html',
  styleUrls: ['./share-canvas.css'],
})
export class ShareCanvas implements OnInit {
  canvasId = input.required<string>();

  searchQuery = signal('');
  results = signal<{ id: string; email: string }[]>([]);
  errorMessage = signal('');
  addedEmails = signal<string[]>([]);
  pending = signal<string[]>([]);
  viewers = signal<CanvasViewer[]>([]);

  constructor(
    private canvasService: CanvasService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadViewers();
  }

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
    const currentUser = await this.authService.waitForSession();

    if (!currentUser) {
      this.errorMessage.set('You must be signed in to add viewers.');
      return;
    }

    // prevent duplicate adds or concurrent requests for the same user
    if (this.addedEmails().includes(email)) return;
    if (this.pending().includes(userId)) return;

    this.pending.set([...this.pending(), userId]);

    try {
      await this.canvasService.addViewer(this.canvasId(), userId);
      this.addedEmails.set([...this.addedEmails(), email]);
      await this.loadViewers();
    } catch (err) {
      console.error('Failed to add viewer', err, {
        currentUserId: currentUser.id,
        canvasId: this.canvasId(),
        addedUserId: userId,
      });
      this.errorMessage.set('Could not add this user. Please confirm you are the canvas owner.');
    } finally {
      this.pending.set(this.pending().filter((id) => id !== userId));
    }
  }

  async loadViewers() {
    try {
      const data = await this.canvasService.getViewers(this.canvasId());
      this.viewers.set(data);
    } catch (err) {
      this.errorMessage.set('Could not load viewers.');
    }
  }

  async toggleEdit(userId: string, currentValue: boolean) {
    try {
      await this.canvasService.setCanEdit(this.canvasId(), userId, !currentValue);
      await this.loadViewers();
    } catch (err) {
      this.errorMessage.set('Could not update permission.');
    }
  }

  get shareableUrl() {
    return `${window.location.origin}/canvas/${this.canvasId()}`;
  }

  async copyLink() {
    await navigator.clipboard.writeText(this.shareableUrl);
  }

  clearSearch() {
    this.searchQuery.set('');
    this.onSearch();
  }
}
