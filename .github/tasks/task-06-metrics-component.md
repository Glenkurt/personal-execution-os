# Task 06: Créer le composant Metrics (This Week's Metrics)

## Overview

Développer le composant Angular qui affiche les métriques de la semaine dans une grille de 4 cartes: Time Spent, Total Revenue, Days Worked, et Execution Streak. Le composant doit formater les données de manière lisible et afficher des indicateurs visuels (ex: 🔥 pour le streak).

## Estimate (days)

0.75 jour

## Component

Angular Component (Feature)

## Dependencies

- Task 01 (Initialiser le projet Angular) complétée
- Task 02 (Créer les modèles TypeScript) complétée

## API Contract

N/A (composant de présentation, reçoit données via @Input)

## Acceptance criteria

- [ ] Composant `MetricsComponent` créé dans `src/app/features/dashboard/components/metrics/`
- [ ] Syntaxe standalone
- [ ] Input pour recevoir les métriques: `@Input() metrics: MetricsResponse | null`
- [ ] Grid responsive avec 4 cartes:
  1. **Time Spent**: affiche minutes + conversion heures/minutes
  2. **Total Revenue**: format monétaire + revenu/heure
  3. **Days Worked**: nombre de jours distincts
  4. **Execution Streak**: nombre de jours consécutifs + emoji 🔥 si > 0
- [ ] Gestion état null/undefined (afficher 0 par défaut)
- [ ] Pipes Angular pour formatage (DecimalPipe, CurrencyPipe)
- [ ] Méthode helper pour convertir minutes en format "Xh Ym"
- [ ] Design responsive (grid 2x2 sur desktop, colonne sur mobile)
- [ ] Documentation JSDoc

## Required tests

### Unit tests (metrics.component.spec.ts)

- [ ] Test: composant se crée sans erreur
- [ ] Test: affiche 0 pour toutes les métriques quand metrics est null
- [ ] Test: affiche correctement le temps en minutes et en heures/minutes
- [ ] Test: formate le revenu en devise USD
- [ ] Test: affiche le revenu par heure correctement
- [ ] Test: affiche le nombre de jours travaillés
- [ ] Test: affiche le streak avec emoji 🔥 quand > 0
- [ ] Test: n'affiche pas emoji 🔥 quand streak = 0
- [ ] Test: méthode `formatTimeAsHoursMinutes()` retourne format correct

## Notes techniques

### Référence HTML actuel

Voir `wwwroot/index.html` lignes 50-90:

```html
<section class="dashboard-section">
  <h2>This Week's Metrics</h2>
  <div class="metrics-grid">
    <!-- Time Spent -->
    <div class="metric-card">
      <div class="metric-label">Time Spent This Week</div>
      <div class="metric-value">
        <span id="time-value">0</span>
        <span class="metric-unit">minutes</span>
      </div>
      <div class="metric-detail" id="time-hours">0h 0m</div>
    </div>
    <!-- ... autres cartes ... -->
  </div>
</section>
```

### Référence JavaScript actuel

Voir `wwwroot/js/dashboard.js` lignes 250-285 (fonction `displayMetrics`)

### Référence CSS

Voir `wwwroot/css/dashboard.css` pour les classes `.metrics-grid`, `.metric-card`, `.metric-label`, `.metric-value`, `.metric-unit`, `.metric-detail`

### Structure du composant

```
src/app/features/dashboard/components/metrics/
├── metrics.component.ts
├── metrics.component.html
├── metrics.component.css
└── metrics.component.spec.ts
```

## Quick examples

### metrics.component.ts

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
import { MetricsResponse } from '../../../../models';

/**
 * Composant affichant les métriques de la semaine
 */
@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [CommonModule, DecimalPipe, CurrencyPipe],
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.css']
})
export class MetricsComponent {
  /**
   * Métriques à afficher (null si aucune donnée)
   */
  @Input() metrics: MetricsResponse | null = null;

  /**
   * Retourne le temps total en minutes (0 si null)
   */
  get totalTimeMinutes(): number {
    return this.metrics?.totalTimeMinutes ?? 0;
  }

  /**
   * Retourne le revenu total (0 si null)
   */
  get totalRevenue(): number {
    return this.metrics?.totalRevenue ?? 0;
  }

  /**
   * Retourne le revenu par heure (0 si null)
   */
  get revenuePerHour(): number {
    return this.metrics?.revenuePerHour ?? 0;
  }

  /**
   * Retourne le nombre de jours travaillés (0 si null)
   */
  get daysWorked(): number {
    return this.metrics?.daysWorked ?? 0;
  }

  /**
   * Retourne le streak actuel (0 si null)
   */
  get currentStreak(): number {
    return this.metrics?.currentStreak ?? 0;
  }

  /**
   * Retourne true si le streak est actif (> 0)
   */
  get hasActiveStreak(): boolean {
    return this.currentStreak > 0;
  }

  /**
   * Convertit les minutes en format "Xh Ym"
   * @param minutes Nombre de minutes
   * @returns Format "Xh Ym"
   */
  formatTimeAsHoursMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
}
```

### metrics.component.html

```html
<section class="metrics-section">
  <h2>This Week's Metrics</h2>
  
  <div class="metrics-grid">
    <!-- Time Spent Card -->
    <div class="metric-card">
      <div class="metric-label">Time Spent This Week</div>
      <div class="metric-value">
        <span>{{ totalTimeMinutes }}</span>
        <span class="metric-unit">minutes</span>
      </div>
      <div class="metric-detail">
        {{ formatTimeAsHoursMinutes(totalTimeMinutes) }}
      </div>
    </div>

    <!-- Total Revenue Card -->
    <div class="metric-card">
      <div class="metric-label">Total Revenue</div>
      <div class="metric-value">
        {{ totalRevenue | currency: 'USD':'symbol':'1.2-2' }}
      </div>
      <div class="metric-detail">
        {{ revenuePerHour | currency: 'USD':'symbol':'1.2-2' }}/hr
      </div>
    </div>

    <!-- Days Worked Card -->
    <div class="metric-card">
      <div class="metric-label">Days Worked</div>
      <div class="metric-value">{{ daysWorked }}</div>
      <div class="metric-detail">distinct days</div>
    </div>

    <!-- Execution Streak Card -->
    <div class="metric-card">
      <div class="metric-label">Execution Streak</div>
      <div class="metric-value streak-value">
        <span>{{ currentStreak }}</span>
        <span *ngIf="hasActiveStreak" class="streak-icon">🔥</span>
      </div>
      <div class="metric-detail">consecutive days</div>
    </div>
  </div>
</section>
```

### metrics.component.css

```css
.metrics-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
}

.metrics-section h2 {
  font-size: 1.25rem;
  margin-bottom: 16px;
  color: #111827;
  font-weight: 600;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.metric-card {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.metric-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
  font-weight: 500;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
  line-height: 1;
}

.metric-unit {
  font-size: 0.875rem;
  font-weight: 400;
  color: #6b7280;
  margin-left: 4px;
}

.metric-detail {
  font-size: 0.875rem;
  color: #9ca3af;
}

.streak-value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.streak-icon {
  font-size: 1.5rem;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .metric-value {
    font-size: 1.75rem;
  }
}

@media (max-width: 640px) {
  .metric-value {
    font-size: 1.5rem;
  }
}
```

### metrics.component.spec.ts

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetricsComponent } from './metrics.component';
import { MetricsResponse } from '../../../../models';

describe('MetricsComponent', () => {
  let component: MetricsComponent;
  let fixture: ComponentFixture<MetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MetricsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display 0 for all metrics when metrics is null', () => {
    component.metrics = null;
    fixture.detectChanges();

    expect(component.totalTimeMinutes).toBe(0);
    expect(component.totalRevenue).toBe(0);
    expect(component.revenuePerHour).toBe(0);
    expect(component.daysWorked).toBe(0);
    expect(component.currentStreak).toBe(0);
  });

  it('should display time in minutes correctly', () => {
    const mockMetrics: MetricsResponse = {
      projectId: '123',
      totalTimeMinutes: 150,
      totalRevenue: 300,
      revenuePerHour: 120,
      daysWorked: 3,
      currentStreak: 2
    };

    component.metrics = mockMetrics;
    fixture.detectChanges();

    const timeValue = fixture.nativeElement.querySelector('.metric-card:first-child .metric-value span:first-child');
    expect(timeValue.textContent.trim()).toBe('150');
  });

  it('should format time as hours and minutes correctly', () => {
    expect(component.formatTimeAsHoursMinutes(0)).toBe('0h 0m');
    expect(component.formatTimeAsHoursMinutes(45)).toBe('0h 45m');
    expect(component.formatTimeAsHoursMinutes(60)).toBe('1h 0m');
    expect(component.formatTimeAsHoursMinutes(125)).toBe('2h 5m');
  });

  it('should display revenue with currency format', () => {
    const mockMetrics: MetricsResponse = {
      projectId: '123',
      totalTimeMinutes: 120,
      totalRevenue: 500.50,
      revenuePerHour: 250.25,
      daysWorked: 2,
      currentStreak: 1
    };

    component.metrics = mockMetrics;
    fixture.detectChanges();

    const revenueCard = fixture.nativeElement.querySelectorAll('.metric-card')[1];
    const revenueValue = revenueCard.querySelector('.metric-value');
    
    expect(revenueValue.textContent).toContain('$');
    expect(revenueValue.textContent).toContain('500.50');
  });

  it('should display streak with fire emoji when streak > 0', () => {
    const mockMetrics: MetricsResponse = {
      projectId: '123',
      totalTimeMinutes: 120,
      totalRevenue: 300,
      revenuePerHour: 150,
      daysWorked: 3,
      currentStreak: 5
    };

    component.metrics = mockMetrics;
    fixture.detectChanges();

    const streakIcon = fixture.nativeElement.querySelector('.streak-icon');
    expect(streakIcon).toBeTruthy();
    expect(streakIcon.textContent).toBe('🔥');
  });

  it('should not display fire emoji when streak is 0', () => {
    const mockMetrics: MetricsResponse = {
      projectId: '123',
      totalTimeMinutes: 120,
      totalRevenue: 300,
      revenuePerHour: 150,
      daysWorked: 2,
      currentStreak: 0
    };

    component.metrics = mockMetrics;
    fixture.detectChanges();

    const streakIcon = fixture.nativeElement.querySelector('.streak-icon');
    expect(streakIcon).toBeFalsy();
  });

  it('should return correct hasActiveStreak value', () => {
    component.metrics = null;
    expect(component.hasActiveStreak).toBe(false);

    component.metrics = {
      projectId: '123',
      totalTimeMinutes: 0,
      totalRevenue: 0,
      revenuePerHour: 0,
      daysWorked: 0,
      currentStreak: 0
    };
    expect(component.hasActiveStreak).toBe(false);

    component.metrics = {
      ...component.metrics,
      currentStreak: 3
    };
    expect(component.hasActiveStreak).toBe(true);
  });

  it('should display all 4 metric cards', () => {
    component.metrics = {
      projectId: '123',
      totalTimeMinutes: 100,
      totalRevenue: 200,
      revenuePerHour: 120,
      daysWorked: 2,
      currentStreak: 1
    };
    fixture.detectChanges();

    const metricCards = fixture.nativeElement.querySelectorAll('.metric-card');
    expect(metricCards.length).toBe(4);
  });
});
```

## Handoff checklist

- [ ] Composant créé et compile sans erreurs
- [ ] Les 4 cartes de métriques s'affichent correctement
- [ ] Formatage du temps (minutes + heures/minutes) fonctionnel
- [ ] Formatage monétaire correct (devise USD)
- [ ] Emoji 🔥 s'affiche uniquement si streak > 0
- [ ] Gestion de metrics null (affichage 0)
- [ ] Tests unitaires écrits et passent (100% coverage)
- [ ] Design responsive testé (desktop 2x2, mobile colonne)
- [ ] Animation du streak icon fonctionnelle
