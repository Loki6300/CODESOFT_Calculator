# ⚡ Quantum Calc — Codesoft Internship Project

A **premium glassmorphism calculator** built with pure HTML, CSS, and JavaScript.

> **Internship Project** · Basireddy Lokeswara Reddy · Codesoft

---

## 🚀 Features

### Core Features
| Feature | Status |
|---|---|
| Number buttons (0–9) | ✅ |
| Arithmetic operations (+, −, ×, ÷) | ✅ |
| Decimal point (.) | ✅ |
| Equals (=) | ✅ |
| Clear (C) | ✅ |
| Display screen | ✅ |

### Bonus Features
| Feature | Status |
|---|---|
| Backspace / Delete (⌫) | ✅ |
| Keyboard support | ✅ |
| Responsive design (mobile-first) | ✅ |
| History panel | ✅ |
| Percentage (%) | ✅ |
| Sign toggle (±) | ✅ |
| Chained calculations | ✅ |
| Division by zero protection | ✅ |
| Floating-point precision fix | ✅ |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `0`–`9` | Input digit |
| `.` | Decimal point |
| `+` `-` `*` `/` | Operators |
| `Enter` or `=` | Equals |
| `Backspace` | Delete last digit |
| `Escape` / `Delete` | Clear all |
| `%` | Percentage |
| `F9` | Toggle sign |
| `H` | Toggle history |

---

## 🎨 Design

- **Glassmorphism** shell with `backdrop-filter: blur`
- **Animated background orbs** (ambient lighting effect)
- **Micro-animations**: button press, result pop, error shake
- **Dynamic font sizing**: display auto-scales for long numbers
- **JetBrains Mono** for the numeric display
- **Inter** for UI text
- **Full accessibility**: ARIA labels, `aria-live` regions, keyboard navigation

---

## 📂 Project Structure

```
CodeAlpha_Calculator/
├── index.html   ← Structure & semantic HTML
├── style.css    ← Glassmorphism design system
├── script.js    ← Calculator state machine & logic
└── README.md    ← This file
```

---

## 🧠 Concepts Demonstrated

- **DOM Manipulation** — updating display, building history list dynamically
- **Event Listeners** — click delegation on button grid, `keydown` on document
- **JavaScript Functions** — modular design: `inputDigit`, `handleOperator`, `handleEquals`, etc.
- **State Machine** — clean calculator state (`waitingForOperand`, `justEvaled`) prevents double-operator bugs
- **CSS Custom Properties** — full design token system for consistent theming
- **CSS Animations** — `@keyframes` for orbs, button flash, error shake, result pop
- **Responsive CSS Grid** — button layout adapts from 360px to desktop

---

## 🏃 How to Run

Just open `index.html` in any modern browser — **no build step needed**.

```bash
# Option 1: Direct open
start index.html

# Option 2: Live server (VS Code extension)
# Right-click index.html → Open with Live Server
```

---

*Built with ❤️ for the CodeAlpha Internship Program*
