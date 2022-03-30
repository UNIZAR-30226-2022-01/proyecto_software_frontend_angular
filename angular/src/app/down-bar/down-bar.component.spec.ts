import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownBarComponent } from './down-bar.component';

describe('DownBarComponent', () => {
  let component: DownBarComponent;
  let fixture: ComponentFixture<DownBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DownBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DownBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
