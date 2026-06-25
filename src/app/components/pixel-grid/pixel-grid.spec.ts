import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PixelGrid } from './pixel-grid';

describe('PixelGrid', () => {
  let component: PixelGrid;
  let fixture: ComponentFixture<PixelGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PixelGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(PixelGrid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
