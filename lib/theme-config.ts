export interface ThemeColors {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  input: string;
  ring: string;
  destructive: string;
  destructiveForeground: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  isCustom?: boolean;
}

// Convert hex to HSL
export function hexToHSL(hex: string): string {
  // Remove the hash if present
  hex = hex.replace('#', '');

  // Convert hex to RGB
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  const hDegrees = Math.round(h * 360);
  const sPercent = Math.round(s * 100);
  const lPercent = Math.round(l * 100);

  return `${hDegrees} ${sPercent}% ${lPercent}%`;
}

// Convert HSL to hex
export function hslToHex(hsl: string): string {
  const [h, s, l] = hsl.split(' ').map((v, i) => {
    const num = parseFloat(v);
    return i === 0 ? num : num / 100;
  });

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Preset themes
export const PRESET_THEMES: Theme[] = [
  {
    id: 'c360-blue',
    name: 'C360 Blue',
    description: 'Professional blue theme from C360 Design System',
    colors: {
      light: {
        primary: hexToHSL('#2970FF'),
        primaryForeground: '0 0% 100%',
        secondary: hexToHSL('#F3F4F6'),
        secondaryForeground: hexToHSL('#1C2536'),
        accent: hexToHSL('#E5E7EB'),
        accentForeground: hexToHSL('#1C2536'),
        background: hexToHSL('#FFFFFF'),
        foreground: hexToHSL('#111927'),
        card: hexToHSL('#FFFFFF'),
        cardForeground: hexToHSL('#111927'),
        popover: hexToHSL('#FFFFFF'),
        popoverForeground: hexToHSL('#111927'),
        muted: hexToHSL('#F8F9FA'),
        mutedForeground: hexToHSL('#6C737F'),
        border: hexToHSL('#E5E7EB'),
        input: hexToHSL('#E5E7EB'),
        ring: hexToHSL('#2970FF'),
        destructive: hexToHSL('#F04438'),
        destructiveForeground: '0 0% 100%',
      },
      dark: {
        primary: hexToHSL('#2970FF'),
        primaryForeground: '0 0% 100%',
        secondary: hexToHSL('#2F3746'),
        secondaryForeground: hexToHSL('#F3F4F6'),
        accent: hexToHSL('#4D5761'),
        accentForeground: hexToHSL('#F3F4F6'),
        background: hexToHSL('#111927'),
        foreground: hexToHSL('#F8F9FA'),
        card: hexToHSL('#1C2536'),
        cardForeground: hexToHSL('#F8F9FA'),
        popover: hexToHSL('#1C2536'),
        popoverForeground: hexToHSL('#F8F9FA'),
        muted: hexToHSL('#2F3746'),
        mutedForeground: hexToHSL('#9DA4AE'),
        border: hexToHSL('#2F3746'),
        input: hexToHSL('#2F3746'),
        ring: hexToHSL('#2970FF'),
        destructive: hexToHSL('#F04438'),
        destructiveForeground: '0 0% 100%',
      }
    }
  },
  {
    id: 'c360-green',
    name: 'C360 Green',
    description: 'Fresh green theme from C360 Design System',
    colors: {
      light: {
        primary: hexToHSL('#16B364'),
        primaryForeground: '0 0% 100%',
        secondary: hexToHSL('#F3F4F6'),
        secondaryForeground: hexToHSL('#1C2536'),
        accent: hexToHSL('#E5E7EB'),
        accentForeground: hexToHSL('#1C2536'),
        background: hexToHSL('#FFFFFF'),
        foreground: hexToHSL('#111927'),
        card: hexToHSL('#FFFFFF'),
        cardForeground: hexToHSL('#111927'),
        popover: hexToHSL('#FFFFFF'),
        popoverForeground: hexToHSL('#111927'),
        muted: hexToHSL('#F8F9FA'),
        mutedForeground: hexToHSL('#6C737F'),
        border: hexToHSL('#E5E7EB'),
        input: hexToHSL('#E5E7EB'),
        ring: hexToHSL('#16B364'),
        destructive: hexToHSL('#F04438'),
        destructiveForeground: '0 0% 100%',
      },
      dark: {
        primary: hexToHSL('#16B364'),
        primaryForeground: '0 0% 100%',
        secondary: hexToHSL('#2F3746'),
        secondaryForeground: hexToHSL('#F3F4F6'),
        accent: hexToHSL('#4D5761'),
        accentForeground: hexToHSL('#F3F4F6'),
        background: hexToHSL('#111927'),
        foreground: hexToHSL('#F8F9FA'),
        card: hexToHSL('#1C2536'),
        cardForeground: hexToHSL('#F8F9FA'),
        popover: hexToHSL('#1C2536'),
        popoverForeground: hexToHSL('#F8F9FA'),
        muted: hexToHSL('#2F3746'),
        mutedForeground: hexToHSL('#9DA4AE'),
        border: hexToHSL('#2F3746'),
        input: hexToHSL('#2F3746'),
        ring: hexToHSL('#16B364'),
        destructive: hexToHSL('#F04438'),
        destructiveForeground: '0 0% 100%',
      }
    }
  },
  {
    id: 'c360-indigo',
    name: 'C360 Indigo',
    description: 'Modern indigo theme from C360 Design System',
    colors: {
      light: {
        primary: hexToHSL('#6366F1'),
        primaryForeground: '0 0% 100%',
        secondary: hexToHSL('#F3F4F6'),
        secondaryForeground: hexToHSL('#1C2536'),
        accent: hexToHSL('#E5E7EB'),
        accentForeground: hexToHSL('#1C2536'),
        background: hexToHSL('#FFFFFF'),
        foreground: hexToHSL('#111927'),
        card: hexToHSL('#FFFFFF'),
        cardForeground: hexToHSL('#111927'),
        popover: hexToHSL('#FFFFFF'),
        popoverForeground: hexToHSL('#111927'),
        muted: hexToHSL('#F8F9FA'),
        mutedForeground: hexToHSL('#6C737F'),
        border: hexToHSL('#E5E7EB'),
        input: hexToHSL('#E5E7EB'),
        ring: hexToHSL('#6366F1'),
        destructive: hexToHSL('#F04438'),
        destructiveForeground: '0 0% 100%',
      },
      dark: {
        primary: hexToHSL('#6366F1'),
        primaryForeground: '0 0% 100%',
        secondary: hexToHSL('#2F3746'),
        secondaryForeground: hexToHSL('#F3F4F6'),
        accent: hexToHSL('#4D5761'),
        accentForeground: hexToHSL('#F3F4F6'),
        background: hexToHSL('#111927'),
        foreground: hexToHSL('#F8F9FA'),
        card: hexToHSL('#1C2536'),
        cardForeground: hexToHSL('#F8F9FA'),
        popover: hexToHSL('#1C2536'),
        popoverForeground: hexToHSL('#F8F9FA'),
        muted: hexToHSL('#2F3746'),
        mutedForeground: hexToHSL('#9DA4AE'),
        border: hexToHSL('#2F3746'),
        input: hexToHSL('#2F3746'),
        ring: hexToHSL('#6366F1'),
        destructive: hexToHSL('#F04438'),
        destructiveForeground: '0 0% 100%',
      }
    }
  },
  {
    id: 'c360-purple',
    name: 'C360 Purple',
    description: 'Elegant purple theme from C360 Design System',
    colors: {
      light: {
        primary: hexToHSL('#9E77ED'),
        primaryForeground: '0 0% 100%',
        secondary: hexToHSL('#F3F4F6'),
        secondaryForeground: hexToHSL('#1C2536'),
        accent: hexToHSL('#E5E7EB'),
        accentForeground: hexToHSL('#1C2536'),
        background: hexToHSL('#FFFFFF'),
        foreground: hexToHSL('#111927'),
        card: hexToHSL('#FFFFFF'),
        cardForeground: hexToHSL('#111927'),
        popover: hexToHSL('#FFFFFF'),
        popoverForeground: hexToHSL('#111927'),
        muted: hexToHSL('#F8F9FA'),
        mutedForeground: hexToHSL('#6C737F'),
        border: hexToHSL('#E5E7EB'),
        input: hexToHSL('#E5E7EB'),
        ring: hexToHSL('#9E77ED'),
        destructive: hexToHSL('#F04438'),
        destructiveForeground: '0 0% 100%',
      },
      dark: {
        primary: hexToHSL('#9E77ED'),
        primaryForeground: '0 0% 100%',
        secondary: hexToHSL('#2F3746'),
        secondaryForeground: hexToHSL('#F3F4F6'),
        accent: hexToHSL('#4D5761'),
        accentForeground: hexToHSL('#F3F4F6'),
        background: hexToHSL('#111927'),
        foreground: hexToHSL('#F8F9FA'),
        card: hexToHSL('#1C2536'),
        cardForeground: hexToHSL('#F8F9FA'),
        popover: hexToHSL('#1C2536'),
        popoverForeground: hexToHSL('#F8F9FA'),
        muted: hexToHSL('#2F3746'),
        mutedForeground: hexToHSL('#9DA4AE'),
        border: hexToHSL('#2F3746'),
        input: hexToHSL('#2F3746'),
        ring: hexToHSL('#9E77ED'),
        destructive: hexToHSL('#F04438'),
        destructiveForeground: '0 0% 100%',
      }
    }
  },
  {
    id: 'default',
    name: 'Construction Blue',
    description: 'Professional blue theme for construction management',
    colors: {
      light: {
        primary: '217 91% 60%',
        primaryForeground: '0 0% 98%',
        secondary: '217 19% 90%',
        secondaryForeground: '217 91% 20%',
        accent: '217 19% 80%',
        accentForeground: '217 91% 20%',
        background: '0 0% 100%',
        foreground: '217 20% 15%',
        card: '0 0% 100%',
        cardForeground: '217 20% 15%',
        popover: '0 0% 100%',
        popoverForeground: '217 20% 15%',
        muted: '217 19% 95%',
        mutedForeground: '217 10% 40%',
        border: '217 20% 90%',
        input: '217 20% 90%',
        ring: '217 91% 60%',
        destructive: '0 84% 60%',
        destructiveForeground: '0 0% 98%',
      },
      dark: {
        primary: '217 91% 60%',
        primaryForeground: '0 0% 98%',
        secondary: '217 19% 20%',
        secondaryForeground: '0 0% 98%',
        accent: '217 19% 25%',
        accentForeground: '0 0% 98%',
        background: '217 20% 10%',
        foreground: '0 0% 98%',
        card: '217 20% 13%',
        cardForeground: '0 0% 98%',
        popover: '217 20% 13%',
        popoverForeground: '0 0% 98%',
        muted: '217 19% 20%',
        mutedForeground: '217 10% 60%',
        border: '217 20% 20%',
        input: '217 20% 20%',
        ring: '217 91% 60%',
        destructive: '0 84% 60%',
        destructiveForeground: '0 0% 98%',
      }
    }
  },
  {
    id: 'emerald',
    name: 'Emerald Green',
    description: 'Fresh green theme with nature-inspired colors',
    colors: {
      light: {
        primary: '160 84% 39%',
        primaryForeground: '0 0% 98%',
        secondary: '160 60% 90%',
        secondaryForeground: '160 84% 15%',
        accent: '160 60% 80%',
        accentForeground: '160 84% 15%',
        background: '0 0% 100%',
        foreground: '160 20% 15%',
        card: '0 0% 100%',
        cardForeground: '160 20% 15%',
        popover: '0 0% 100%',
        popoverForeground: '160 20% 15%',
        muted: '160 30% 95%',
        mutedForeground: '160 10% 40%',
        border: '160 20% 90%',
        input: '160 20% 90%',
        ring: '160 84% 39%',
        destructive: '0 84% 60%',
        destructiveForeground: '0 0% 98%',
      },
      dark: {
        primary: '160 84% 39%',
        primaryForeground: '0 0% 98%',
        secondary: '160 30% 20%',
        secondaryForeground: '0 0% 98%',
        accent: '160 30% 25%',
        accentForeground: '0 0% 98%',
        background: '160 20% 10%',
        foreground: '0 0% 98%',
        card: '160 20% 13%',
        cardForeground: '0 0% 98%',
        popover: '160 20% 13%',
        popoverForeground: '0 0% 98%',
        muted: '160 30% 20%',
        mutedForeground: '160 10% 60%',
        border: '160 20% 20%',
        input: '160 20% 20%',
        ring: '160 84% 39%',
        destructive: '0 84% 60%',
        destructiveForeground: '0 0% 98%',
      }
    }
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    description: 'Warm orange and red tones for a vibrant look',
    colors: {
      light: {
        primary: '25 95% 53%',
        primaryForeground: '0 0% 98%',
        secondary: '25 60% 90%',
        secondaryForeground: '25 95% 20%',
        accent: '25 60% 80%',
        accentForeground: '25 95% 20%',
        background: '0 0% 100%',
        foreground: '25 20% 15%',
        card: '0 0% 100%',
        cardForeground: '25 20% 15%',
        popover: '0 0% 100%',
        popoverForeground: '25 20% 15%',
        muted: '25 30% 95%',
        mutedForeground: '25 10% 40%',
        border: '25 20% 90%',
        input: '25 20% 90%',
        ring: '25 95% 53%',
        destructive: '0 84% 60%',
        destructiveForeground: '0 0% 98%',
      },
      dark: {
        primary: '25 95% 53%',
        primaryForeground: '0 0% 98%',
        secondary: '25 30% 20%',
        secondaryForeground: '0 0% 98%',
        accent: '25 30% 25%',
        accentForeground: '0 0% 98%',
        background: '25 20% 10%',
        foreground: '0 0% 98%',
        card: '25 20% 13%',
        cardForeground: '0 0% 98%',
        popover: '25 20% 13%',
        popoverForeground: '0 0% 98%',
        muted: '25 30% 20%',
        mutedForeground: '25 10% 60%',
        border: '25 20% 20%',
        input: '25 20% 20%',
        ring: '25 95% 53%',
        destructive: '0 84% 60%',
        destructiveForeground: '0 0% 98%',
      }
    }
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    description: 'Elegant purple theme with rich, sophisticated colors',
    colors: {
      light: {
        primary: '271 91% 65%',
        primaryForeground: '0 0% 98%',
        secondary: '271 60% 90%',
        secondaryForeground: '271 91% 20%',
        accent: '271 60% 80%',
        accentForeground: '271 91% 20%',
        background: '0 0% 100%',
        foreground: '271 20% 15%',
        card: '0 0% 100%',
        cardForeground: '271 20% 15%',
        popover: '0 0% 100%',
        popoverForeground: '271 20% 15%',
        muted: '271 30% 95%',
        mutedForeground: '271 10% 40%',
        border: '271 20% 90%',
        input: '271 20% 90%',
        ring: '271 91% 65%',
        destructive: '0 84% 60%',
        destructiveForeground: '0 0% 98%',
      },
      dark: {
        primary: '271 91% 65%',
        primaryForeground: '0 0% 98%',
        secondary: '271 30% 20%',
        secondaryForeground: '0 0% 98%',
        accent: '271 30% 25%',
        accentForeground: '0 0% 98%',
        background: '271 20% 10%',
        foreground: '0 0% 98%',
        card: '271 20% 13%',
        cardForeground: '0 0% 98%',
        popover: '271 20% 13%',
        popoverForeground: '0 0% 98%',
        muted: '271 30% 20%',
        mutedForeground: '271 10% 60%',
        border: '271 20% 20%',
        input: '271 20% 20%',
        ring: '271 91% 65%',
        destructive: '0 84% 60%',
        destructiveForeground: '0 0% 98%',
      }
    }
  },
  {
    id: 'neutral',
    name: 'Neutral Gray',
    description: 'Clean, minimalist theme with neutral colors',
    colors: {
      light: {
        primary: '0 0% 25%',
        primaryForeground: '0 0% 98%',
        secondary: '0 0% 90%',
        secondaryForeground: '0 0% 15%',
        accent: '0 0% 85%',
        accentForeground: '0 0% 15%',
        background: '0 0% 100%',
        foreground: '0 0% 10%',
        card: '0 0% 100%',
        cardForeground: '0 0% 10%',
        popover: '0 0% 100%',
        popoverForeground: '0 0% 10%',
        muted: '0 0% 95%',
        mutedForeground: '0 0% 40%',
        border: '0 0% 90%',
        input: '0 0% 90%',
        ring: '0 0% 25%',
        destructive: '0 84% 60%',
        destructiveForeground: '0 0% 98%',
      },
      dark: {
        primary: '0 0% 85%',
        primaryForeground: '0 0% 10%',
        secondary: '0 0% 20%',
        secondaryForeground: '0 0% 98%',
        accent: '0 0% 25%',
        accentForeground: '0 0% 98%',
        background: '0 0% 10%',
        foreground: '0 0% 98%',
        card: '0 0% 12%',
        cardForeground: '0 0% 98%',
        popover: '0 0% 12%',
        popoverForeground: '0 0% 98%',
        muted: '0 0% 20%',
        mutedForeground: '0 0% 60%',
        border: '0 0% 20%',
        input: '0 0% 20%',
        ring: '0 0% 85%',
        destructive: '0 84% 60%',
        destructiveForeground: '0 0% 98%',
      }
    }
  }
];