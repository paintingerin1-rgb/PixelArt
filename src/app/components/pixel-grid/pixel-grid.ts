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
    '#4A3B5C',
    '#FFFFFF',
    '#FF8FC2',
    '#7FE0B5',
    '#7FB8E8',
    '#FFE066',
    '#C896F7',
    '#FFAD6B',
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
