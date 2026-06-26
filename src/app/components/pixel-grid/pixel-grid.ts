import { Component, OnInit, signal } from '@angular/core';
import { CanvasService } from '../../services/canvas';
import { input } from '@angular/core';

@Component({
  selector: 'app-pixel-grid',
  imports: [],
  templateUrl: './pixel-grid.html',
  styleUrl: './pixel-grid.css',
})
export class PixelGrid implements OnInit {
  canvasId = input.required<string>();
  gridSize = input.required<number>();
  grid = signal<string[][]>([]);

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

  selectedColor = signal('#4A3B5C');

  constructor(private canvasService: CanvasService) {}

  ngOnInit() {
    const initialGrid: string[][] = [];
    for (let i = 0; i < this.gridSize(); i++) {
      const row: string[] = [];
      for (let j = 0; j < this.gridSize(); j++) {
        row.push('#FFFFFF');
      }
      initialGrid.push(row);
    }
    this.grid.set(initialGrid);

    this.loadExistingPixels();
  }

  async loadExistingPixels() {
    const pixels = await this.canvasService.loadPixels(this.canvasId());

    const freshGrid: string[][] = [];
    for (let i = 0; i < this.gridSize(); i++) {
      freshGrid.push(new Array(this.gridSize()).fill('#FFFFFF'));
    }

    for (const pixel of pixels) {
      freshGrid[pixel.y][pixel.x] = pixel.colour;
    }

    this.grid.set(freshGrid);
  }

  async onPixelClick(rowIndex: number, colIndex: number) {
    const colour = this.selectedColor();
    const currentGrid = this.grid();
    currentGrid[rowIndex][colIndex] = colour;
    this.grid.set([...currentGrid]);

    await this.canvasService.savePixel(this.canvasId(), colIndex, rowIndex, colour);
  }

  selectColor(color: string) {
    this.selectedColor.set(color);
  }
}
