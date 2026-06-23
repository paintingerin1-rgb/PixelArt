import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pixel-grid',
  imports: [FormsModule, CommonModule],
  templateUrl: './pixel-grid.html',
  styleUrl: './pixel-grid.css',
})
export class PixelGrid {
  gridSize: number = 16;
  grid: string[][] = [];

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
    const newColor = this.grid[rowIndex][colIndex] === '#FFFFFF' ? '#000000' : '#FFFFFF';
    this.grid[rowIndex][colIndex] = newColor;
  }
}
