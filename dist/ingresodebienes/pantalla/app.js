'use strict';

(function () {

  let currentStep = 1;
  const TOTAL = 4;

  
  const btnNext = document.getElementById('btnNext');
  const btnPrev = document.getElementById('btnPrev');
  const formNav = document.getElementById('formNav');
  const btnNew = document.getElementById('btnNewRecord');
  const stepEls = document.querySelectorAll('.step');
  const sections = document.querySelectorAll('.form-section:not(#sectionSuccess)');
  const successSec = document.getElementById('sectionSuccess');

 
  const stepFields = {
    1: [
      { id: 'rif', label: 'RIF', validator: validateRIF },
      { id: 'nombre', label: 'Nombre de la Institución' },
      { id: 'direccion', label: 'Dirección' }
    ],
    2: [
      { id: 'tipoAdquisicion', label: 'Tipo de Adquisición' },
      { id: 'fechaIngreso', label: 'Fecha de Ingreso' },
      { id: 'proveedor', label: 'Origen / Proveedor' }
    ],
    3: [
      { id: 'numDocumento', label: 'Número de Documento' },
      { id: 'fechaEmision', label: 'Fecha de Emisión' }
    ],
    4: [
      { id: 'codigoInventario', label: 'Código de Inventario' },
      { id: 'marca', label: 'Marca' },
      { id: 'modelo', label: 'Modelo' },
      { id: 'serial', label: 'Número de Serial' },
      { id: 'estado', label: 'Estado' }
    ]
  };

  
  function validateRIF(value) {
    if (!/^[JVEGPC]-\d{8}-\d$/.test(value)) {
      return 'El RIF debe tener el formato J-00000000-0';
    }
    return null;
  }

 
  function applyRIFMask() {
    const rifInput = document.getElementById('rif');
    rifInput.addEventListener('input', function () {
      let raw = this.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      if (raw.length > 0 && !/^[JVEGPC]/.test(raw)) raw = 'J' + raw.slice(1);
      let f = '';
      if (raw.length >= 1) f += raw[0];
      if (raw.length >= 2) f += '-' + raw.substring(1, 9);
      if (raw.length >= 10) f += '-' + raw[9];
      this.value = f;
    });
  }

  
  function validateStep(step) {
    let valid = true;
    let firstInvalid = null;

    stepFields[step].forEach(function (field) {
      const el = document.getElementById(field.id);
      const val = el.value.trim();
      clearError(el);

      if (!val) {
        showError(el, `El campo "${field.label}" es obligatorio.`);
        valid = false;
        if (!firstInvalid) firstInvalid = el;
        return;
      }

      if (field.validator) {
        const msg = field.validator(val);
        if (msg) {
          showError(el, msg);
          valid = false;
          if (!firstInvalid) firstInvalid = el;
        }
      }
    });

   
    if (step === 3) {
      const fileEl = document.getElementById('archivoDigital');
      const errEl = document.getElementById('error-archivoDigital');
      if (fileEl.files.length > 0 && fileEl.files[0].size > 10 * 1024 * 1024) {
        fileEl.classList.add('error');
        errEl.textContent = 'El archivo no debe superar los 10 MB.';
        valid = false;
        if (!firstInvalid) firstInvalid = fileEl;
      }
    }

    if (firstInvalid) firstInvalid.focus();
    return valid;
  }

  function showError(el, msg) {
    el.classList.add('error');
    const errEl = document.getElementById('error-' + el.id);
    if (errEl) errEl.textContent = msg;
  }

  function clearError(el) {
    el.classList.remove('error');
    const errEl = document.getElementById('error-' + el.id);
    if (errEl) errEl.textContent = '';
  }

 
  function handleNext() {
    if (!validateStep(currentStep)) return;
    if (currentStep < TOTAL) {
      currentStep++;
      updateUI();
    } else {
      showSuccess();
    }
  }

  function handlePrev() {
    if (currentStep > 1) { currentStep--; updateUI(); }
  }

  function updateUI() {
    sections.forEach(function (sec, i) {
      sec.classList.toggle('active', i + 1 === currentStep);
    });

    stepEls.forEach(function (el, i) {
      const n = i + 1;
      el.classList.remove('active', 'completed');
      if (n === currentStep) el.classList.add('active');
      else if (n < currentStep) el.classList.add('completed');
    });

    btnPrev.disabled = currentStep === 1;

    if (currentStep === TOTAL) {
      btnNext.textContent = 'Registrar ✓';
      btnNext.classList.add('submit');
    } else {
      btnNext.textContent = 'Siguiente →';
      btnNext.classList.remove('submit');
    }
  }

  function showSuccess() {
    sections.forEach(function (sec) { sec.classList.remove('active'); });
    successSec.classList.add('active');
    formNav.style.display = 'none';
    stepEls.forEach(function (el) {
      el.classList.remove('active');
      el.classList.add('completed');
    });
  }

  function resetForm() {
    form.reset();
    currentStep = 1;
    successSec.classList.remove('active');
    formNav.style.display = 'flex';
    document.querySelectorAll('input, textarea, select').forEach(clearError);
    updateUI();
  }

 
  document.addEventListener('DOMContentLoaded', function () {
    applyRIFMask();
    updateUI();

    btnNext.addEventListener('click', handleNext);
    btnPrev.addEventListener('click', handlePrev);
    btnNew.addEventListener('click', resetForm);

    document.querySelectorAll('input, textarea, select').forEach(function (el) {
      el.addEventListener('input', function () { clearError(el); });
      el.addEventListener('change', function () { clearError(el); });
    });
  });

})();
