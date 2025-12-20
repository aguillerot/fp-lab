---
applyTo: '**/*.{ts,html}'
---

# Instructions Angular

## Documentation officielle

> **Note Copilot** : Pour des informations détaillées et à jour sur Angular :
>
> 1. **Utiliser l'outil `mcp_angular-cli_get_best_practices`** pour obtenir le guide des bonnes pratiques Angular
> 2. **Utiliser l'outil `mcp_angular-cli_search_documentation`** pour rechercher dans la documentation Angular
> 3. Si besoin de plus de contexte, utiliser `fetch_webpage` avec l'URL : https://angular.dev/assets/context/llms-full.txt

## Conventions Angular

- **Toujours utiliser des standalone components** (pas de NgModules)
- Utiliser la syntaxe de control flow moderne : `@if`, `@for`, `@switch`, `@defer`
- Privilégier les **signals** aux observables quand possible
- Utiliser `inject()` au lieu de l'injection par constructeur
- Utiliser `input()`, `output()`, `model()` pour les inputs/outputs des composants
- Préférer `viewChild()` et `contentChild()` aux décorateurs

## Exemple de composant

```typescript
// ✅ Bon
@Component({
  selector: 'tt-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isLoading()) {
      <spinner />
    } @else {
      @for (item of items(); track item.id) {
        <item-card [item]="item" />
      }
    }
  `,
})
export class ExampleComponent {
  private readonly service = inject(ExampleService);

  readonly items = input.required<Item[]>();
  readonly isLoading = input(false);
  readonly itemSelected = output<Item>();
}
```

## Performance

- Utiliser `trackBy` / `track` dans les boucles `@for`
- Utiliser `ChangeDetectionStrategy.OnPush` par défaut
- Utiliser `@defer` pour le lazy loading de composants lourds
- Éviter les calculs dans les templates, utiliser `computed()` signals

## Accessibilité

- Toujours ajouter des attributs ARIA appropriés
- Utiliser des labels pour les formulaires
- Assurer la navigation au clavier

## Internationalisation

- Utiliser Transloco pour les traductions
- Ne jamais hardcoder de texte affiché à l'utilisateur

## À éviter

- ❌ NgModules (utiliser standalone components)
- ❌ Décorateurs `@Input()`, `@Output()` (utiliser `input()`, `output()`)
- ❌ `*ngIf`, `*ngFor` (utiliser `@if`, `@for`)
- ❌ Injection par constructeur (utiliser `inject()`)
- ❌ `async` pipe excessif (privilégier les signals)
