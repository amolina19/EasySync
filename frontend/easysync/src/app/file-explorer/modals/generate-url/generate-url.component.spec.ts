import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateUrlComponent } from './generate-url.component';

describe('GenerateUrlComponent', () => {
  let component: GenerateUrlComponent;
  let fixture: ComponentFixture<GenerateUrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateUrlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
