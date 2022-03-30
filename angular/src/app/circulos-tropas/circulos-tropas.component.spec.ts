import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CirculosTropasComponent } from './circulos-tropas.component';

describe('CirculosTropasComponent', () => {
  let component: CirculosTropasComponent;
  let fixture: ComponentFixture<CirculosTropasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CirculosTropasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CirculosTropasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
