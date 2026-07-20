# Components Documentation

## Overview
Two independent, reusable components have been created for your Playwright frontend application:

---

## 1. CodeEditor Component

**Location:** `src/components/CodeEditor.tsx`

### Purpose
A Monaco Editor-based code editor for writing and editing Playwright scripts with syntax highlighting, minimap, and automatic layout.

### Props
```typescript
interface CodeEditorProps {
  value: string                          // Current code content
  onChange: (value: string) => void      // Callback when code changes
  language?: string                      // Language for syntax highlighting (default: 'javascript')
  height?: string                        // Editor height (default: '400px')
  theme?: 'light' | 'vs-dark'           // Editor theme (default: 'vs-dark')
  readOnly?: boolean                     // Make editor read-only (default: false)
}
```

### Features
- Monaco Editor with syntax highlighting
- Automatic layout adjustment
- Minimap visualization
- Customizable height and theme
- Read-only mode support
- Monospace font for code readability

### Usage Example
```tsx
import { useState } from 'react'
import { CodeEditor } from '@/components/CodeEditor'

export function MyComponent() {
  const [code, setCode] = useState('')
  
  return (
    <CodeEditor
      value={code}
      onChange={setCode}
      language="javascript"
      height="600px"
      theme="vs-dark"
    />
  )
}
```

### Example Implementation
See `src/examples/CodeEditorExample.tsx` for a complete working example.

---

## 2. Button Component

**Location:** `src/components/Button.tsx`

### Purpose
A versatile, reusable button component based on shadcn/ui design patterns with multiple variants and sizes.

### Props
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  isLoading?: boolean                    // Show loading spinner
  icon?: React.ReactNode                 // Icon to display before text
  disabled?: boolean                     // Disable the button
}
```

### Variants
- **default**: Primary action button (dark background)
- **destructive**: For dangerous actions (red background)
- **outline**: Secondary action with border
- **secondary**: Alternative primary action
- **ghost**: Minimal styling, hover effect only
- **link**: Text-only button with underline on hover

### Sizes
- **sm**: Small (9px height)
- **default**: Standard (10px height)
- **lg**: Large (11px height)
- **icon**: Square button for icons only

### Features
- Built with CVA (Class Variance Authority)
- Supports loading state with animated spinner
- Icon support
- Full keyboard accessibility
- Focus ring styles
- Hover and disabled states

### Usage Examples
```tsx
import { Button } from '@/components/Button'

// Basic button
<Button>Click me</Button>

// With variant and size
<Button variant="destructive" size="lg">Delete</Button>

// With loading state
<Button isLoading>Processing...</Button>

// With icon
<Button icon="🚀">Launch</Button>

// Different variants
<Button variant="outline">Secondary</Button>
<Button variant="ghost">Subtle</Button>
<Button variant="link">Link Button</Button>
```

### Example Implementation
See `src/examples/ButtonExample.tsx` for a complete showcase of all variants and sizes.

---

## Dependencies Installed

### Libraries
- `@monaco-editor/react` - Code editor component
- `class-variance-authority` - CSS-in-JS variant system
- `clsx` - Conditional class names
- `tailwind-merge` - Tailwind CSS class merging
- `shadcn-ui` - Component library (CLI installed)

### Dev Dependencies
- `tailwindcss` - Utility-first CSS framework
- `postcss` - CSS transformation tool
- `autoprefixer` - CSS vendor prefixes

### Configuration Files Created
- `tailwind.config.js` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration
- `src/globals.css` - Tailwind directives and CSS variables
- `src/lib/utils.ts` - Utility functions (`cn` for class merging)

---

## File Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── CodeEditor.tsx       (Code editor component)
│   │   ├── Button.tsx           (Button component)
│   │   └── index.ts             (Component exports)
│   ├── examples/
│   │   ├── CodeEditorExample.tsx (CodeEditor demo)
│   │   └── ButtonExample.tsx     (Button demo)
│   ├── lib/
│   │   └── utils.ts             (Utility functions)
│   ├── globals.css              (Tailwind + CSS variables)
│   ├── main.tsx                 (Updated entry point)
│   └── ...
├── tailwind.config.js
├── postcss.config.js
└── ...
```

---

## Next Steps
Once you review these components:
1. Provide feedback or modifications needed
2. When ready, we can combine them into a unified interface
3. Connect to the backend API endpoint (`/test`)

Both components are completely independent and can be used separately or together as needed.
