import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionBarComponent } from './action-bar.component';

describe('ActionBarComponent', () => {
  let component: ActionBarComponent;
  let fixture: ComponentFixture<ActionBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display three action buttons', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(3);
  });

  it('should emit refresh event when refresh button clicked', (done) => {
    spyOn(component.refresh, 'emit');
    const button = fixture.nativeElement.querySelector('.btn-primary');
    button.click();

    expect(component.refresh.emit).toHaveBeenCalled();
    done();
  });

  it('should emit logWork event when log work button clicked', (done) => {
    spyOn(component.logWork, 'emit');
    const buttons = fixture.nativeElement.querySelectorAll('.btn-secondary');
    buttons[0].click();

    expect(component.logWork.emit).toHaveBeenCalled();
    done();
  });

  it('should emit newProject event when new project button clicked', (done) => {
    spyOn(component.newProject, 'emit');
    const buttons = fixture.nativeElement.querySelectorAll('.btn-secondary');
    buttons[1].click();

    expect(component.newProject.emit).toHaveBeenCalled();
    done();
  });

  it('should disable refresh button while loading', (done) => {
    component.isLoading = true;
    fixture.detectChanges();
    const primaryButton = fixture.nativeElement.querySelector('.btn-primary');
    expect(primaryButton.disabled).toBe(true);

    component.isLoading = false;
    fixture.detectChanges();
    expect(primaryButton.disabled).toBe(false);
    done();
  });

  it('should display loading text when isLoading is true', () => {
    component.isLoading = true;
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.btn-primary');
    expect(button.textContent).toContain('Loading');
  });

  it('should display refresh text when isLoading is false', () => {
    component.isLoading = false;
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.btn-primary');
    expect(button.textContent).toContain('Refresh');
  });
});
