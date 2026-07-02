import { Component, OnDestroy, OnInit, input, signal } from '@angular/core';
import { CanvasService } from '../../services/canvas';
import { SupabaseService } from '../../services/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

@Component({
  selector: 'app-pixel-grid',
  standalone: true,
  imports: [],
  templateUrl: './pixel-grid.html',
  styleUrls: ['./pixel-grid.css'],
})
export class PixelGrid implements OnInit, OnDestroy {
  private realtimeChannel: RealtimeChannel | null = null;

  canvasId = input.required<string>();
  gridSize = input.required<number>();
  canEdit = input.required<boolean>();

  grid = signal<string[][]>([]);
  selectedColor = signal('#4A3B5C');

  palette = [
    { name: 'black', hex: '#4A3B5C' },
    { name: 'white', hex: '#FFFFFF' },
    { name: 'pink', hex: '#FF8FC2' },
    { name: 'green', hex: '#7FE0B5' },
    { name: 'blue', hex: '#7FB8E8' },
    { name: 'yellow', hex: '#FFE066' },
    { name: 'purple', hex: '#C896F7' },
    { name: 'orange', hex: '#FFAD6B' },
  ];

  constructor(
    private canvasService: CanvasService,
    private supabaseService: SupabaseService,
  ) {}

  ngOnInit() {
    this.initGrid();
    this.loadExistingPixels();
    this.subscribeToPixelChanges();
  }

  private initGrid() {
    const size = this.gridSize();
    const initialGrid: string[][] = [];
    for (let i = 0; i < size; i++) {
      const row: string[] = [];
      for (let j = 0; j < size; j++) {
        row.push('#FFFFFF');
      }
      initialGrid.push(row);
    }
    this.grid.set(initialGrid);
  }

  async loadExistingPixels() {
    const pixels = await this.canvasService.loadPixels(this.canvasId());
    const size = this.gridSize();
    const freshGrid: string[][] = [];
    for (let i = 0; i < size; i++) {
      freshGrid.push(new Array(size).fill('#FFFFFF'));
    }
    for (const pixel of pixels) {
      freshGrid[pixel.y][pixel.x] = pixel.colour;
    }
    this.grid.set(freshGrid);
  }

  async onPixelClick(rowIndex: number, colIndex: number) {
    if (!this.canEdit()) return;
    const colour = this.selectedColor();
    const currentGrid = this.grid();
    currentGrid[rowIndex][colIndex] = colour;
    this.grid.set([...currentGrid]);
    await this.canvasService.savePixel(this.canvasId(), colIndex, rowIndex, colour);
  }

  selectColor(color: string) {
    this.selectedColor.set(color);
  }

  subscribeToPixelChanges() {
    const client = this.supabaseService.getClient();
    this.realtimeChannel = client
      .channel(`canvas-${this.canvasId()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pixels',
          filter: `canvas_id=eq.${this.canvasId()}`,
        },
        (payload) => {
          const pixel = payload.new as { x: number; y: number; colour: string };
          if (pixel?.x === undefined || pixel?.y === undefined) return;
          const current = this.grid();
          current[pixel.y][pixel.x] = pixel.colour;
          this.grid.set([...current]);
        },
      )
      .subscribe();
  }

  ngOnDestroy() {
    if (this.realtimeChannel) {
      this.realtimeChannel.unsubscribe();
    }
  }
}
