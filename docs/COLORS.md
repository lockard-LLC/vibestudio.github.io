# VibeStudio Color System

## Design Philosophy
Bright, clean, modern with excellent contrast for accessibility.

## Light Mode Palette
```css
:root {
  /* Primary Colors */
  --color-primary: #FFFFFF;        /* Bright white backgrounds */
  --color-secondary: #E3F2FD;      /* Light blue accents */
  --color-accent: #2196F3;         /* Vibrant blue highlights */
  
  /* Text Colors */
  --color-text-primary: #000000;   /* Main text */
  --color-text-secondary: #424242; /* Secondary text */
  --color-text-muted: #757575;     /* Muted text */
  
  /* Border & Dividers */
  --color-border: #E0E0E0;         /* Light borders */
  --color-divider: #F0F0F0;        /* Subtle dividers */
  
  /* Status Colors */
  --color-success: #4CAF50;        /* Success states */
  --color-warning: #FF9800;        /* Warning states */
  --color-error: #F44336;          /* Error states */
  --color-info: #2196F3;           /* Info states */
}
```

## Dark Mode Palette
```css
:root[data-theme="dark"] {
  /* Primary Colors */
  --color-primary: #1A1A1A;        /* Dark backgrounds */
  --color-secondary: #2D3748;      /* Dark blue-gray */
  --color-accent: #64B5F6;         /* Lighter blue for dark */
  
  /* Text Colors */
  --color-text-primary: #FFFFFF;   /* Main text */
  --color-text-secondary: #E0E0E0; /* Secondary text */
  --color-text-muted: #BDBDBD;     /* Muted text */
  
  /* Border & Dividers */
  --color-border: #374151;         /* Dark borders */
  --color-divider: #4B5563;        /* Dark dividers */
  
  /* Status Colors */
  --color-success: #66BB6A;        /* Success states */
  --color-warning: #FFB74D;        /* Warning states */
  --color-error: #EF5350;          /* Error states */
  --color-info: #64B5F6;           /* Info states */
}
```

## Usage Guidelines

### Accessibility
- Minimum contrast ratio: 4.5:1 for normal text
- Minimum contrast ratio: 3:1 for large text
- All interactive elements have focus indicators

### Implementation
- Use CSS custom properties for consistency
- Implement theme switching with data attributes
- Test both themes thoroughly

### Component Examples
```css
/* Button Primary */
.btn-primary {
  background-color: var(--color-accent);
  color: var(--color-primary);
}

/* Panel Background */
.panel {
  background-color: var(--color-primary);
  border: 1px solid var(--color-border);
}
```
