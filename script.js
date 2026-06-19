/**
 * Quantum Calc — Calculator Logic
 * CodeAlpha Internship Project
 * Basireddy Lokeswara Reddy
 *
 * Concepts demonstrated:
 *  - DOM Manipulation
 *  - Event Listeners (click + keyboard)
 *  - JavaScript Functions & Closures
 *  - State machine for calculator flow
 */

'use strict';

/* =====================================================
   STATE
   ===================================================== */
const state = {
  currentValue:   '0',      // what's shown on the display
  previousValue:  '',       // left-hand operand
  operator:       null,     // pending operator symbol
  waitingForOperand: false, // true right after operator pressed
  justEvaled:     false,    // true right after = pressed
  expression:     '',       // human-readable expression string
  history:        [],       // array of { expr, result }
};

/* =====================================================
   DOM REFERENCES
   ===================================================== */
const resultDisplay    = document.getElementById('resultDisplay');
const expressionDisplay = document.getElementById('expressionDisplay');
const historyPanel     = document.getElementById('historyPanel');
const historyList      = document.getElementById('historyList');
const historyEmpty     = document.getElementById('historyEmpty');
const clearHistoryBtn  = document.getElementById('clearHistoryBtn');
const displayPanel     = document.querySelector('.display-panel');

/* =====================================================
   DISPLAY HELPERS
   ===================================================== */

/**
 * Format a number for display: add commas, limit decimals.
 * Returns the raw string for very large/small numbers (scientific notation).
 */
function formatDisplay(value) {
  if (value === 'Error' || value === 'Infinity' || value === '-Infinity') return value;

  const num = parseFloat(value);
  if (isNaN(num)) return value; // mid-entry string

  // Already has a trailing dot — keep as-is so user can type decimals
  if (value.endsWith('.')) return value;

  // Scientific threshold
  if (Math.abs(num) > 1e15 || (Math.abs(num) < 1e-7 && num !== 0)) {
    return num.toPrecision(9).replace(/\.?0+$/, '');
  }

  // Limit decimal places to avoid floating-point noise
  const [intPart, decPart] = value.split('.');
  const formattedInt = parseInt(intPart, 10).toLocaleString('en-US');

  if (decPart !== undefined) {
    return `${formattedInt}.${decPart}`;
  }
  return formattedInt;
}

/**
 * Render state → DOM.
 */
function updateDisplay(animate = false) {
  const formatted = formatDisplay(state.currentValue);
  resultDisplay.textContent = formatted;

  // Dynamic font sizing based on character length
  const len = formatted.length;
  resultDisplay.className = 'result-value';
  if (len > 16)      resultDisplay.classList.add('size-xxl');
  else if (len > 12) resultDisplay.classList.add('size-xl');
  else if (len > 9)  resultDisplay.classList.add('size-lg');

  if (animate) {
    resultDisplay.classList.add('animate-in');
    resultDisplay.addEventListener('animationend', () => {
      resultDisplay.classList.remove('animate-in');
    }, { once: true });
  }

  // Error styling
  if (state.currentValue === 'Error') {
    resultDisplay.classList.add('error');
    shakeDisplay();
  } else {
    resultDisplay.classList.remove('error');
  }

  expressionDisplay.textContent = state.expression;
}

/** Shake the display panel (visual error feedback). */
function shakeDisplay() {
  displayPanel.classList.remove('shake');
  // Force reflow to restart animation
  void displayPanel.offsetWidth;
  displayPanel.classList.add('shake');
  displayPanel.addEventListener('animationend', () => {
    displayPanel.classList.remove('shake');
  }, { once: true });
}

/* =====================================================
   OPERATOR SYMBOL HIGHLIGHT
   ===================================================== */
const operatorBtns = document.querySelectorAll('.btn-operator');

function highlightOperator(op) {
  operatorBtns.forEach(btn => {
    btn.classList.toggle('active-op', btn.dataset.value === op);
  });
}

function clearOperatorHighlight() {
  operatorBtns.forEach(btn => btn.classList.remove('active-op'));
}

/* =====================================================
   CORE CALCULATOR LOGIC
   ===================================================== */

/**
 * Input a digit string ('0'–'9').
 */
function inputDigit(digit) {
  if (state.waitingForOperand) {
    state.currentValue = digit;
    state.waitingForOperand = false;
  } else if (state.justEvaled) {
    // Start fresh after equals
    state.currentValue = digit;
    state.expression = '';
    state.justEvaled = false;
  } else {
    // Prevent leading zeros (unless decimal)
    if (state.currentValue === '0' && digit !== '.') {
      state.currentValue = digit;
    } else if (state.currentValue.length < 16) {
      state.currentValue += digit;
    }
  }
  updateDisplay();
}

/**
 * Input the decimal point '.'.
 */
function inputDecimal() {
  if (state.waitingForOperand) {
    state.currentValue = '0.';
    state.waitingForOperand = false;
    updateDisplay();
    return;
  }
  if (state.justEvaled) {
    state.currentValue = '0.';
    state.expression = '';
    state.justEvaled = false;
    updateDisplay();
    return;
  }
  if (!state.currentValue.includes('.')) {
    state.currentValue += '.';
    updateDisplay();
  }
}

/**
 * Map display operator symbols to JS operators.
 */
function resolveOperator(op) {
  const map = { '÷': '/', '×': '*', '−': '-', '+': '+' };
  return map[op] || op;
}

/**
 * Perform arithmetic with precision fix.
 */
function calculate(a, op, b) {
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  let result;

  switch (op) {
    case '+': result = numA + numB; break;
    case '-': result = numA - numB; break;
    case '*': result = numA * numB; break;
    case '/':
      if (numB === 0) return 'Error';
      result = numA / numB;
      break;
    default: return b;
  }

  // Fix floating-point precision (e.g. 0.1 + 0.2)
  const precision = 1e10;
  return String(Math.round(result * precision) / precision);
}

/**
 * Handle an operator button press (+, −, ×, ÷).
 */
function handleOperator(op) {
  const displayOp = op;   // e.g. '÷'
  const jsOp = resolveOperator(op);

  if (state.operator && state.waitingForOperand) {
    // Just replace the pending operator
    state.operator = jsOp;
    state.expression = state.expression.replace(/[+\-×÷*/]$/, displayOp + ' ');
    highlightOperator(displayOp);
    return;
  }

  if (state.previousValue !== '' && state.operator && !state.waitingForOperand) {
    // Chain calculation
    const result = calculate(state.previousValue, state.operator, state.currentValue);
    if (result === 'Error') {
      state.currentValue = 'Error';
      state.previousValue = '';
      state.operator = null;
      state.expression = '';
      state.waitingForOperand = false;
      updateDisplay(true);
      clearOperatorHighlight();
      return;
    }
    state.currentValue = result;
    state.expression = `${formatDisplay(result)} ${displayOp} `;
    updateDisplay(true);
  } else {
    state.expression = `${formatDisplay(state.currentValue)} ${displayOp} `;
  }

  state.previousValue = state.currentValue;
  state.operator = jsOp;
  state.waitingForOperand = true;
  state.justEvaled = false;
  highlightOperator(displayOp);
}

/**
 * Evaluate the pending expression (= pressed).
 */
function handleEquals() {
  if (!state.operator || state.previousValue === '') return;

  const prev = state.previousValue;
  const curr = state.currentValue;
  const op   = state.operator;

  // Build expression string for history
  const displayOp = Object.entries({ '÷':'/', '×':'*', '−':'-', '+':'+' })
    .find(([,v]) => v === op)?.[0] || op;
  const exprStr = `${formatDisplay(prev)} ${displayOp} ${formatDisplay(curr)}`;

  const result = calculate(prev, op, curr);

  if (result === 'Error') {
    state.currentValue = 'Error';
    state.expression = `${exprStr} =`;
    state.previousValue = '';
    state.operator = null;
    state.waitingForOperand = false;
    updateDisplay(true);
    clearOperatorHighlight();
    return;
  }

  // Save to history
  addHistory(exprStr, result);

  state.expression = `${exprStr} =`;
  state.currentValue = result;
  state.previousValue = '';
  state.operator = null;
  state.waitingForOperand = false;
  state.justEvaled = true;

  updateDisplay(true);
  clearOperatorHighlight();
}

/**
 * Clear all state (C button).
 */
function handleClear() {
  state.currentValue   = '0';
  state.previousValue  = '';
  state.operator       = null;
  state.waitingForOperand = false;
  state.justEvaled     = false;
  state.expression     = '';
  updateDisplay();
  clearOperatorHighlight();
}

/**
 * Backspace — delete last character.
 */
function handleBackspace() {
  if (state.waitingForOperand || state.justEvaled) return;
  if (state.currentValue === 'Error') {
    handleClear();
    return;
  }

  if (state.currentValue.length === 1 ||
     (state.currentValue.length === 2 && state.currentValue.startsWith('-'))) {
    state.currentValue = '0';
  } else {
    state.currentValue = state.currentValue.slice(0, -1);
  }
  updateDisplay();
}

/**
 * Toggle positive/negative sign.
 */
function handleToggleSign() {
  if (state.currentValue === '0' || state.currentValue === 'Error') return;
  if (state.currentValue.startsWith('-')) {
    state.currentValue = state.currentValue.slice(1);
  } else {
    state.currentValue = '-' + state.currentValue;
  }
  updateDisplay();
}

/**
 * Convert to percentage.
 */
function handlePercent() {
  if (state.currentValue === 'Error') return;
  const num = parseFloat(state.currentValue);
  if (isNaN(num)) return;
  const precision = 1e10;
  state.currentValue = String(Math.round((num / 100) * precision) / precision);
  updateDisplay();
}

/* =====================================================
   HISTORY
   ===================================================== */

function addHistory(expr, result) {
  state.history.unshift({ expr, result });
  if (state.history.length > 20) state.history.pop();
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = '';
  if (state.history.length === 0) {
    historyEmpty.style.display = 'block';
    return;
  }
  historyEmpty.style.display = 'none';
  state.history.forEach(({ expr, result }, i) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.setAttribute('role', 'button');
    li.setAttribute('tabindex', '0');
    li.setAttribute('aria-label', `${expr} = ${formatDisplay(result)}`);
    li.innerHTML = `<span class="hi-expr">${expr}</span><span class="hi-result">= ${formatDisplay(result)}</span>`;
    // Click to recall result
    li.addEventListener('click', () => {
      state.currentValue = result;
      state.justEvaled   = false;
      state.expression   = expr + ' =';
      updateDisplay();
    });
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') li.click();
    });
    historyList.appendChild(li);
  });
}

function toggleHistory() {
  historyPanel.classList.toggle('open');
}

clearHistoryBtn.addEventListener('click', () => {
  state.history = [];
  renderHistory();
});

document.getElementById('btnHistory').addEventListener('click', toggleHistory);

/* =====================================================
   EVENT DELEGATION — Button Grid Click
   ===================================================== */
document.getElementById('btnGrid').addEventListener('click', (e) => {
  const btn = e.target.closest('.calc-btn');
  if (!btn) return;

  flashBtn(btn);

  const { action, value } = btn.dataset;

  if (value && !action) {
    // Digit button
    inputDigit(value);
    return;
  }

  switch (action) {
    case 'clear':     handleClear();             break;
    case 'toggle':    handleToggleSign();         break;
    case 'percent':   handlePercent();            break;
    case 'decimal':   inputDecimal();             break;
    case 'backspace': handleBackspace();          break;
    case 'equals':    handleEquals();             break;
    case 'operator':  handleOperator(value);      break;
    case 'history':   /* handled separately */   break;
  }

  // digit buttons within operator action (e.g., btn-zero has data-value)
  if (action === undefined && value !== undefined) {
    inputDigit(value);
  }
});

/* =====================================================
   KEYBOARD SUPPORT
   ===================================================== */
const keyMap = {
  '0':'0','1':'1','2':'2','3':'3','4':'4',
  '5':'5','6':'6','7':'7','8':'8','9':'9',
  '.': 'decimal',
  'Enter': 'equals', '=': 'equals',
  '+': 'op+', '-': 'op−', '*': 'op×', '/': 'op÷',
  'Backspace': 'backspace', 'Delete': 'clear',
  'Escape': 'clear',
  '%': 'percent',
  'F9': 'toggle',
  'h': 'history', 'H': 'history',
};

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.altKey || e.metaKey) return;

  const mapped = keyMap[e.key];
  if (!mapped) return;

  e.preventDefault();

  if (/^\d$/.test(mapped)) {
    const btn = document.getElementById(`btn${mapped}`);
    if (btn) flashBtn(btn);
    inputDigit(mapped);
  } else if (mapped === 'decimal') {
    flashBtn(document.getElementById('btnDot'));
    inputDecimal();
  } else if (mapped === 'equals') {
    flashBtn(document.getElementById('btnEquals'));
    handleEquals();
  } else if (mapped === 'backspace') {
    flashBtn(document.getElementById('btnBack'));
    handleBackspace();
  } else if (mapped === 'clear') {
    flashBtn(document.getElementById('btnClear'));
    handleClear();
  } else if (mapped === 'percent') {
    flashBtn(document.getElementById('btnPercent'));
    handlePercent();
  } else if (mapped === 'toggle') {
    flashBtn(document.getElementById('btnToggle'));
    handleToggleSign();
  } else if (mapped === 'history') {
    flashBtn(document.getElementById('btnHistory'));
    toggleHistory();
  } else if (mapped.startsWith('op')) {
    const opSymbol = mapped.replace('op', '');
    const opBtn = [...operatorBtns].find(b => b.dataset.value === opSymbol);
    if (opBtn) flashBtn(opBtn);
    handleOperator(opSymbol);
  }
});

/* =====================================================
   BUTTON FLASH (visual keyboard feedback)
   ===================================================== */
function flashBtn(btn) {
  if (!btn) return;
  btn.classList.remove('key-flash');
  void btn.offsetWidth; // reflow
  btn.classList.add('key-flash');
  btn.addEventListener('animationend', () => btn.classList.remove('key-flash'), { once: true });
}

/* =====================================================
   INIT
   ===================================================== */
renderHistory();
updateDisplay();
