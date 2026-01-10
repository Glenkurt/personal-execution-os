# Task 07: Créer le composant Last Activity

## Overview

Développer le composant Angular qui affiche la dernière activité (dernier log de travail enregistré) avec la date, la description de la tâche, la description de l'output, le temps passé et le revenu généré.

## Estimate (days)

0.5 jour

## Component

Angular Component (Feature)

## Dependencies

- Task 01 (Initialiser le projet Angular) complétée
- Task 02 (Créer les modèles TypeScript) complétée

## API Contract

N/A (composant de présentation, reçoit données via @Input)

## Acceptance criteria

- [ ] Composant `LastActivityComponent` créé dans `src/app/features/dashboard/components/last-activity/`
- [ ] Syntaxe standalone
- [ ] Input pour recevoir le dernier log: `@Input() lastLog: DailyLogResponse | null`
- [ ] Affichage conditionnel:
  - Si `lastLog` existe: afficher date, task, output, temps, revenu
  - Si `lastLog` est null: afficher "No logs recorded yet"
- [ ] Format de date localisé avec jour de la semaine (ex: "Mon, Jan 6, 2026")
- [ ] Icônes pour temps (⏱️) et revenu (💰)
- [ ] Formatage monétaire pour le revenu
- [ ] Design responsive
- [ ] Documentation JSDoc

## Required tests

### Unit tests (last-activity.component.spec.ts)

- [ ] Test: composant se crée sans erreur
- [ ] Test: affiche "No logs recorded yet" quand lastLog est null
- [ ] Test: affiche la date formatée correctement
- [ ] Test: affiche la description de la tâche
- [ ] Test: affiche la description de l'output
- [ ] Test: affiche le temps passé en minutes
- [ ] Test: formate le revenu en devise USD
- [ ] Test: affiche les icônes ⏱️ et 💰

## Notes techniques

### Référence HTML actuel

Voir `wwwroot/index.html` lignes 93-98:

```html
<section class="dashboard-section">
  <h2>Last Activity</h2>
  <div id="last-activity" class="activity-card">
    <div class="no-activity">No logs recorded yet</div>
  </div>
</section>
```

### Référence JavaScript actuel

Voir `wwwroot/js/dashboard.js` lignes 288-305 (fonction `displayLastActivity`)

```javascript
function displayLastActivity(log) {
  const activityCard = document.getElementById("last-activity");
  const logDate = new Date(log.date).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  activityCard.innerHTML = `
        <div class="activity-item">
            <div class="activity-date">${logDate}</div>
            <div class="activity-description"><strong>${log.taskDescription}</strong></div>
            <div class="activity-description">${log.outputDescription}</div>
            <div class="activity-meta">
                <span>⏱️ ${log.timeSpentMinutes} min</span>
                <span>💰 $${log.revenueGenerated.toFixed(2)}</span>
            </div>
        </div>
    `;
}
```

### Structure du composant

```
src/app/features/dashboard/components/last-activity/
├── last-activity.component.ts
├── last-activity.component.html
├── last-activity.component.css
└── last-activity.component.spec.ts
```

## Quick examples

### last-activity.component.ts

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { DailyLogResponse } from '../../../../models';

/**
 * Composant affichant la dernière activité (dernier log)
 */
@Component({
  selector: 'app-last-activity',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe],
  templateUrl: './last-activity.component.html',
  styleUrls: ['./last-activity.component.css']
})
export class LastActivityComponent {
  /**
   * Dernier log à afficher (null si aucune activité)
   */
  @Input() lastLog: DailyLogResponse | null = null;
}
```

### last-activity.component.html

```html
<section class="last-activity-section">
  <h2>Last Activity</h2>

  <!-- Cas: aucune activité -->
  <div *ngIf="!lastLog" class="activity-card">
    <div class="no-activity">No logs recorded yet</div>
  </div>

  <!-- Cas: activité existante -->
  <div *ngIf="lastLog" class="activity-card">
    <div class="activity-item">
      <div class="activity-date">
        {{ lastLog.date | date: 'EEE, MMM d, y' }}
      </div>
      <div class="activity-description">
        <strong>{{ lastLog.taskDescription }}</strong>
      </div>
      <div class="activity-description">
        {{ lastLog.outputDescription }}
      </div>
      <div class="activity-meta">
        <span class="activity-meta-item">
          ⏱️ {{ lastLog.timeSpentMinutes }} min
        </span>
        <span class="activity-meta-item">
          💰 {{ lastLog.revenueGenerated | currency: 'USD':'symbol':'1.2-2' }}
        </span>
      </div>
    </div>
  </div>
</section>
```

### last-activity.component.css

```css
.last-activity-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
}

.last-activity-section h2 {
  font-size: 1.25rem;
  margin-bottom: 16px;
  color: #111827;
  font-weight: 600;
}

.activity-card {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
}

.no-activity {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  padding: 40px 20px;
}

.activity-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-date {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: capitalize;
}

.activity-description {
  font-size: 0.875rem;
  color: #111827;
  line-height: 1.5;
}

.activity-description strong {
  font-weight: 600;
  color: #2563eb;
}

.activity-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.activity-meta-item {
  font-size: 0.875rem;
  color: #6b7280;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* Responsive */
@media (max-width: 640px) {
  .activity-meta {
    flex-direction: column;
    gap: 8px;
  }
}
```

### last-activity.component.spec.ts

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LastActivityComponent } from './last-activity.component';
import { DailyLogResponse } from '../../../../models';

describe('LastActivityComponent', () => {
  let component: LastActivityComponent;
  let fixture: ComponentFixture<LastActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LastActivityComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LastActivityComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display "No logs recorded yet" when lastLog is null', () => {
    component.lastLog = null;
    fixture.detectChanges();

    const noActivity = fixture.nativeElement.querySelector('.no-activity');
    expect(noActivity).toBeTruthy();
    expect(noActivity.textContent.trim()).toBe('No logs recorded yet');
  });

  it('should display activity date when lastLog is provided', () => {
    const mockLog: DailyLogResponse = {
      id: '123',
      date: '2026-01-06',
      projectId: 'proj-123',
      taskDescription: 'Test task',
      outputDescription: 'Test output',
      timeSpentMinutes: 60,
      revenueGenerated: 100,
      note: null,
      createdAt: '2026-01-06T00:00:00Z'
    };

    component.lastLog = mockLog;
    fixture.detectChanges();

    const activityDate = fixture.nativeElement.querySelector('.activity-date');
    expect(activityDate).toBeTruthy();
    expect(activityDate.textContent).toContain('Jan');
  });

  it('should display task description', () => {
    const mockLog: DailyLogResponse = {
      id: '123',
      date: '2026-01-06',
      projectId: 'proj-123',
      taskDescription: 'Implement feature X',
      outputDescription: 'Feature completed',
      timeSpentMinutes: 120,
      revenueGenerated: 200,
      note: null,
      createdAt: '2026-01-06T00:00:00Z'
    };

    component.lastLog = mockLog;
    fixture.detectChanges();

    const descriptions = fixture.nativeElement.querySelectorAll('.activity-description');
    const taskDescription = descriptions[0];
    
    expect(taskDescription.textContent.trim()).toContain('Implement feature X');
  });

  it('should display output description', () => {
    const mockLog: DailyLogResponse = {
      id: '123',
      date: '2026-01-06',
      projectId: 'proj-123',
      taskDescription: 'Test task',
      outputDescription: 'Successfully delivered',
      timeSpentMinutes: 90,
      revenueGenerated: 150,
      note: null,
      createdAt: '2026-01-06T00:00:00Z'
    };

    component.lastLog = mockLog;
    fixture.detectChanges();

    const descriptions = fixture.nativeElement.querySelectorAll('.activity-description');
    const outputDescription = descriptions[1];
    
    expect(outputDescription.textContent.trim()).toBe('Successfully delivered');
  });

  it('should display time spent in minutes', () => {
    const mockLog: DailyLogResponse = {
      id: '123',
      date: '2026-01-06',
      projectId: 'proj-123',
      taskDescription: 'Test',
      outputDescription: 'Test',
      timeSpentMinutes: 75,
      revenueGenerated: 100,
      note: null,
      createdAt: '2026-01-06T00:00:00Z'
    };

    component.lastLog = mockLog;
    fixture.detectChanges();

    const metaItems = fixture.nativeElement.querySelectorAll('.activity-meta-item');
    const timeItem = metaItems[0];
    
    expect(timeItem.textContent).toContain('⏱️');
    expect(timeItem.textContent).toContain('75 min');
  });

  it('should format revenue as USD currency', () => {
    const mockLog: DailyLogResponse = {
      id: '123',
      date: '2026-01-06',
      projectId: 'proj-123',
      taskDescription: 'Test',
      outputDescription: 'Test',
      timeSpentMinutes: 60,
      revenueGenerated: 250.50,
      note: null,
      createdAt: '2026-01-06T00:00:00Z'
    };

    component.lastLog = mockLog;
    fixture.detectChanges();

    const metaItems = fixture.nativeElement.querySelectorAll('.activity-meta-item');
    const revenueItem = metaItems[1];
    
    expect(revenueItem.textContent).toContain('💰');
    expect(revenueItem.textContent).toContain('$');
    expect(revenueItem.textContent).toContain('250.50');
  });

  it('should display icons for time and revenue', () => {
    const mockLog: DailyLogResponse = {
      id: '123',
      date: '2026-01-06',
      projectId: 'proj-123',
      taskDescription: 'Test',
      outputDescription: 'Test',
      timeSpentMinutes: 60,
      revenueGenerated: 100,
      note: null,
      createdAt: '2026-01-06T00:00:00Z'
    };

    component.lastLog = mockLog;
    fixture.detectChanges();

    const metaSection = fixture.nativeElement.querySelector('.activity-meta');
    expect(metaSection.textContent).toContain('⏱️');
    expect(metaSection.textContent).toContain('💰');
  });
});
```

## Handoff checklist

- [ ] Composant créé et compile sans erreurs
- [ ] Affichage conditionnel fonctionne (activité vs. aucune activité)
- [ ] Formatage de date correct (avec jour de la semaine)
- [ ] Task et output descriptions affichées
- [ ] Temps et revenu affichés avec formatage approprié
- [ ] Icônes présentes (⏱️ et 💰)
- [ ] Tests unitaires écrits et passent (100% coverage)
- [ ] Design responsive testé
