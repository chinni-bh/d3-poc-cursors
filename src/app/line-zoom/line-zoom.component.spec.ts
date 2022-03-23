import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineZoomComponent } from './line-zoom.component';

describe('LineZoomComponent', () => {
  let component: LineZoomComponent;
  let fixture: ComponentFixture<LineZoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LineZoomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LineZoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
