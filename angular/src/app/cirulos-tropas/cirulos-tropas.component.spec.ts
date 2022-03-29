import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CirulosTropasComponent } from './cirulos-tropas.component';

describe('CirulosTropasComponent', () => {
  let component: CirulosTropasComponent;
  let fixture: ComponentFixture<CirulosTropasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CirulosTropasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CirulosTropasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
