import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatsCardComponent } from './stats-card.component';

describe('StatsCardComponent', () => {
  let component: StatsCardComponent;
  let fixture: ComponentFixture<StatsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StatsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display provided value', () => {
    component.value = 42;
    fixture.detectChanges();

    const valueElement = fixture.nativeElement.querySelector('.stats-value');
    expect(valueElement.textContent).toBe('42');
  });

  it('should display provided label', () => {
    component.label = 'Total Projects';
    fixture.detectChanges();

    const labelElement = fixture.nativeElement.querySelector('.stats-label');
    expect(labelElement.textContent).toBe('TOTAL PROJECTS');
  });

  it('should display icon when provided', () => {
    component.icon = '📊';
    fixture.detectChanges();

    const iconElement = fixture.nativeElement.querySelector('.stats-icon');
    expect(iconElement).toBeTruthy();
    expect(iconElement.textContent).toBe('📊');
  });

  it('should not display icon when not provided', () => {
    component.icon = null;
    fixture.detectChanges();

    const iconElement = fixture.nativeElement.querySelector('.stats-icon');
    expect(iconElement).toBeNull();
  });

  it('should handle string values', () => {
    component.value = '95.5%';
    fixture.detectChanges();

    const valueElement = fixture.nativeElement.querySelector('.stats-value');
    expect(valueElement.textContent).toBe('95.5%');
  });
});
