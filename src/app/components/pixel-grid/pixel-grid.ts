import { Component, Input, OnInit, signal } from '@angular/core';
import { CanvasService } from '../../services/canvas';

@Component({
  selector: 'app-pixel-grid',
  imports: [],
  templateUrl: './pixel-grid.html',
  styleUrl: './pixel-grid.css',
})
export class PixelGrid implements OnInit {
  @Input() canvasId!: string;

  gridSize: number = 16;
  grid = signal<string[][]>([]);
  palette: string[] = [
    '#000000',
    '#FFFFFF',
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FFFF00',
    '#FF00FF',
    '#00FFFF',
  ];
  selectedColor = signal('#000000');

  constructor(private canvasService: CanvasService) {}

  ngOnInit() {
    const initialGrid: string[][] = [];
    for (let i = 0; i < this.gridSize; i++) {
      const row: string[] = [];
      for (let j = 0; j < this.gridSize; j++) {
        row.push('#FFFFFF');
      }
      initialGrid.push(row);
    }
    this.grid.set(initialGrid);

    this.loadExistingPixels();
  }

  async loadExistingPixels() {
    const pixels = await this.canvasService.loadPixels(this.canvasId);
    const currentGrid = this.grid();
    for (const pixel of pixels) {
      currentGrid[pixel.y][pixel.x] = pixel.colour;
    }
    this.grid.set([...currentGrid]);
  }

  async onPixelClick(rowIndex: number, colIndex: number) {
    const colour = this.selectedColor();
    const currentGrid = this.grid();
    currentGrid[rowIndex][colIndex] = colour;
    this.grid.set([...currentGrid]);

    await this.canvasService.savePixel(this.canvasId, colIndex, rowIndex, colour);
  }

  selectColor(color: string) {
    this.selectedColor.set(color);
  }
}
