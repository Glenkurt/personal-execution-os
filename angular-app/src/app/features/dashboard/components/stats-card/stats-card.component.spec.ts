import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatsCardComponent } from './stats-card.component';

describe('StatsCardComponent', () => {
  let component: StatsCardComponent;
  let fixture: ComponentFixture<StatsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display provided value and label', () => {
    component.value = 42;
    component.label = 'Test Metric';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('42');
    expect(compiled.textContent).toContain('Test Metric');
  });

  it('should display icon when provided', () => {
    component.value = 10;
    component.label = 'Hours';
    component.icon = '⏱️';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('⏱️');
  });

  it('should not display icon when not provided', () => {
    component.value = 10;
    component.label = 'Hours';
    component.icon = null;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('.stat-icon');
    expect(icon?.textContent).toBe('');
  });

  it('should format string values correctly', () => {
    component.value = '$1,234.56';
    component.label = 'Total Revenue';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('$1,234.56');
  });
});
