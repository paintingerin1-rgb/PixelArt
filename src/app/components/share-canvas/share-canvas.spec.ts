import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareCanvas } from './share-canvas';

describe('ShareCanvas', () => {
  let component: ShareCanvas;
  let fixture: ComponentFixture<ShareCanvas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareCanvas],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareCanvas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
