/* Small browser adaptations of public portfolio projects. No data leaves this page. */
(function () {
  'use strict';

  function calculateBmi(weight, height, units = 'imperial') {
    if (!Number.isFinite(weight) || !Number.isFinite(height) || weight <= 0 || height <= 0) {
      throw new Error('Enter a positive weight and height.');
    }
    if (units === 'metric') return weight / ((height / 100) ** 2);
    if (units !== 'imperial') throw new Error('Choose metric or US units.');
    return (weight * 703) / (height * height);
  }

  function estimatePay(hours, rate, taxPercent) {
    if (![hours, rate, taxPercent].every(Number.isFinite) || hours < 0 || rate < 0 || taxPercent < 0 || taxPercent > 100) {
      throw new Error('Enter valid hours, rate, and tax percentage.');
    }
    const regular = Math.min(hours, 40) * rate;
    const overtime = Math.max(hours - 40, 0) * rate * 1.5;
    const gross = regular + overtime;
    const tax = gross * taxPercent / 100;
    return { regular, overtime, gross, tax, net: gross - tax };
  }

  function encodeText(input) {
    const normalized = input.replace(/[\s\p{P}]/gu, '').toLowerCase();
    if (!normalized || /[^a-z]/.test(normalized)) {
      throw new Error('Enter text containing A–Z letters; numbers and symbols are not supported.');
    }
    const shifted = [...normalized].map(char =>
      String.fromCharCode(((char.charCodeAt(0) - 97 + 4) % 26) + 65)
    );
    const reordered = shifted.filter((_, index) => index % 2 === 0)
      .concat(shifted.filter((_, index) => index % 2 === 1));
    const hex = reordered.map(char => '0x' + char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'));
    const lines = [];
    for (let i = 0; i < hex.length; i += 5) lines.push(hex.slice(i, i + 5).join(' '));
    return lines.join('\n');
  }

  function decodeText(input) {
    const tokens = input.trim().split(/\s+/);
    if (!tokens.length || tokens.some(token => !/^0x[0-9a-f]{2}$/i.test(token))) {
      throw new Error('Enter hexadecimal bytes such as 0x4C 0x50 0x53.');
    }
    const values = tokens.map(token => Number.parseInt(token.slice(2), 16));
    if (values.some(value => value < 65 || value > 90)) {
      throw new Error('Only encoded A–Z letters are supported.');
    }
    const firstHalf = values.slice(0, Math.ceil(values.length / 2));
    const secondHalf = values.slice(Math.ceil(values.length / 2));
    const ordered = [];
    firstHalf.forEach((value, index) => {
      ordered.push(value);
      if (index < secondHalf.length) ordered.push(secondHalf[index]);
    });
    return ordered.map(value =>
      String.fromCharCode(((value - 65 - 4 + 26) % 26) + 97)
    ).join('');
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculateBmi, estimatePay, encodeText, decodeText };
  }
  if (typeof document === 'undefined') return;

  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const forms = [...document.querySelectorAll('.demo-form')];
  const placeholders = new Map();
  function clearResult(form) {
    const result = form.querySelector('output');
    result.textContent = placeholders.get(form);
    result.classList.remove('is-error');
    form.querySelector('[data-copy]').disabled = true;
    form.querySelector('.copy-status').textContent = '';
    form.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
  }
  function showResult(form, text, error = false) {
    const result = form.querySelector('output');
    result.textContent = text;
    result.classList.toggle('is-error', error);
    form.querySelector('[data-copy]').disabled = error;
    form.querySelector('.copy-status').textContent = '';
  }
  forms.forEach(form => {
    const result = form.querySelector('output');
    placeholders.set(form, result.textContent);
    form.noValidate = true;
    form.querySelector('.demo-submit').disabled = false;
    form.querySelectorAll('input, select, textarea').forEach(input => input.setAttribute('aria-describedby', result.id));
    form.addEventListener('input', () => clearResult(form));
    form.addEventListener('invalid', event => {
      event.target.setAttribute('aria-invalid', 'true');
      showResult(form, event.target.validationMessage, true);
    }, true);
    form.addEventListener('reset', () => setTimeout(() => clearResult(form), 0));
    form.querySelector('[data-copy]').addEventListener('click', async () => {
      const status = form.querySelector('.copy-status');
      try {
        await navigator.clipboard.writeText(result.textContent);
        status.textContent = 'Copied.';
      } catch {
        status.textContent = 'Select the result to copy it manually.';
      }
    });
  });
  function bindCalculation(id, calculation) {
    const form = document.getElementById(id);
    if (!form) return;
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      try {
        showResult(form, calculation(new FormData(form)));
      } catch (error) {
        showResult(form, error.message, true);
      }
    });
  }
  bindCalculation('bmi-form', values => {
    const bmi = calculateBmi(Number(values.get('weight')), Number(values.get('height')), values.get('units'));
    return `Your BMI is ${bmi.toFixed(1)}.`;
  });
  const bmiForm = document.getElementById('bmi-form');
  if (bmiForm) {
    const units = bmiForm.elements.namedItem('units');
    const weight = bmiForm.elements.namedItem('weight');
    const height = bmiForm.elements.namedItem('height');
    let previousUnits = units.value;
    const updateUnits = () => {
      const metric = units.value === 'metric';
      document.getElementById('weight-unit').textContent = metric ? 'kg' : 'pounds';
      document.getElementById('height-unit').textContent = metric ? 'cm' : 'inches';
      weight.max = metric ? '700' : '1500';
      height.max = metric ? '300' : '120';
      previousUnits = units.value;
    };
    units.addEventListener('change', () => {
      if (units.value !== previousUnits) {
        const metric = units.value === 'metric';
        if (weight.value && Number.isFinite(weight.valueAsNumber)) weight.value = (weight.valueAsNumber * (metric ? 0.45359237 : 1 / 0.45359237)).toFixed(2);
        if (height.value && Number.isFinite(height.valueAsNumber)) height.value = (height.valueAsNumber * (metric ? 2.54 : 1 / 2.54)).toFixed(2);
      }
      updateUnits();
      clearResult(bmiForm);
    });
    bmiForm.addEventListener('reset', () => setTimeout(updateUnits, 0));
  }
  bindCalculation('pay-form', values => {
    const pay = estimatePay(Number(values.get('hours')), Number(values.get('rate')), Number(values.get('tax')));
    return `Regular pay: ${currency.format(pay.regular)}\nOvertime pay: ${currency.format(pay.overtime)}\nGross pay: ${currency.format(pay.gross)}\nEstimated tax: ${currency.format(pay.tax)}\nEstimated take-home: ${currency.format(pay.net)}`;
  });
  bindCalculation('cipher-form', values => values.get('mode') === 'encode' ? encodeText(values.get('text')) : decodeText(values.get('text')));
  const cipherForm = document.getElementById('cipher-form');
  if (cipherForm) {
    const mode = cipherForm.elements.namedItem('mode');
    const input = cipherForm.elements.namedItem('text');
    const drafts = { encode: input.value, decode: encodeText(input.value) };
    let previousMode = mode.value;
    input.addEventListener('input', () => { drafts[mode.value] = input.value; });
    mode.addEventListener('change', () => {
      drafts[previousMode] = input.value;
      if (previousMode === 'encode') {
        try { drafts.decode = encodeText(input.value); } catch { /* Keep the last valid example. */ }
      }
      input.value = drafts[mode.value];
      previousMode = mode.value;
      clearResult(cipherForm);
    });
    cipherForm.addEventListener('reset', () => setTimeout(() => {
      previousMode = mode.value;
      drafts.encode = input.value;
      drafts.decode = encodeText(input.value);
    }, 0));
  }
})();
