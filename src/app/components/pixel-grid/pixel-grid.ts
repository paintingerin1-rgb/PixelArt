import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { signal } from '@angular/core';

@Component({
  selector: 'app-pixel-grid',
  imports: [FormsModule, CommonModule],
  templateUrl: './pixel-grid.html',
  styleUrl: './pixel-grid.css',
})
export class PixelGrid {
  gridSize: number = 16;
  grid: string[][] = [];
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

  constructor() {
    for (let index = 0; index < this.gridSize; index++) {
      const row: string[] = [];
      for (let j = 0; j < this.gridSize; j++) {
        row.push('#FFFFFF');
      }
      this.grid.push(row);
    }
  }
  onPixelClick(rowIndex: number, colIndex: number) {
    this.grid[rowIndex][colIndex] = this.selectedColor();
  }

  selectColor(color: string) {
    this.selectedColor.set(color);
  }
}
