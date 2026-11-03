/**
 * Ares Vault - Frosted Glassmorphic Credential Synthesizer Logic
 * Inspired by Reference UI (Lifestats Glass Console)
 * 100% Client-Side Privacy, Zero Network Calls, Deterministic Hashing
 */

(function () {
  'use strict';

  // Constants & Storage Keys
  const THEME_STORAGE_KEY = 'ares_vault_theme';

  // DOM Elements - Navigation & Theme
  const dockBtnVault = document.getElementById('dock-btn-vault');
  const dockBtnAnchors = document.getElementById('dock-btn-anchors');
  const dockBtnArchetypes = document.getElementById('dock-btn-archetypes');
  const dockBtnTheme = document.getElementById('dock-btn-theme');
  const dockBtnGuide = document.getElementById('dock-btn-guide');
  const iconSun = document.querySelector('.icon-sun');
  const iconMoon = document.querySelector('.icon-moon');

  // DOM Elements - Inputs
  const inputName = document.getElementById('seed-name');
  const inputDob = document.getElementById('seed-dob');
  const inputColor = document.getElementById('seed-color');
  const inputCustom = document.getElementById('seed-custom');

  // DOM Elements - Options
  const optLeet = document.getElementById('opt-leet');
  const optSymbols = document.getElementById('opt-symbols');
  const optSalt = document.getElementById('opt-salt');
  const optUpper = document.getElementById('opt-upper');
  const optSeparator = document.getElementById('opt-separator');

  // DOM Elements - Scrubber & Swatches
  const eraCapsules = document.querySelectorAll('.era-capsule-btn');
  const btnEraPrev = document.getElementById('btn-era-prev');
  const btnEraNext = document.getElementById('btn-era-next');
  const matteSwatches = document.querySelectorAll('.matte-swatch');
  const presetPills = document.querySelectorAll('.preset-pill');
  const btnShuffleWord = document.getElementById('btn-shuffle-word');

  // DOM Elements - Header & Actions
  const btnDemoTrigger = document.getElementById('btn-demo-trigger');
  const btnResetTrigger = document.getElementById('btn-reset-trigger');
  const btnSecurityInfo = document.getElementById('btn-security-info');

  // DOM Elements - Primary Display
  const primaryDisplay = document.getElementById('primary-password-text');
  const activeCredentialBadge = document.getElementById('active-credential-badge');
  const btnToggleVisibility = document.getElementById('btn-toggle-visibility');
  const iconEyeOpen = document.getElementById('icon-eye-open');
  const iconEyeClosed = document.getElementById('icon-eye-closed');
  const btnCopyPrimary = document.getElementById('btn-copy-primary');
  const copyPrimaryLabel = document.getElementById('copy-primary-label');
  const strengthValue = document.getElementById('strength-value');
  const strengthCrackTime = document.getElementById('strength-crack-time');
  const strengthEntropy = document.getElementById('strength-entropy');
  const strengthSegments = [
    document.getElementById('seg-1'),
    document.getElementById('seg-2'),
    document.getElementById('seg-3'),
    document.getElementById('seg-4')
  ];

  // DOM Elements - Format Stepper & Capsule Controls (Card 1)
  const archetypeCounterCurrent = document.getElementById('archetype-counter-current');
  const archetypeCounterTotal = document.getElementById('archetype-counter-total');
  const btnArchetypePrev = document.getElementById('btn-archetype-prev');
  const btnArchetypeNext = document.getElementById('btn-archetype-next');
  const archetypeName = document.getElementById('archetype-name');
  const archetypeDesc = document.getElementById('archetype-desc');
  const archetypeCategoryBadge = document.getElementById('archetype-category-badge');
  const archetypePipsTrack = document.getElementById('archetype-pips-track');
  const btnCopyAll = document.getElementById('btn-copy-all');
  const btnSaveHeroVault = document.getElementById('btn-save-hero-vault');

  // DOM Elements - Saved Credentials Vault (Card 2)
  const inputVaultLabel = document.getElementById('input-vault-label');
  const btnSaveCurrentToVault = document.getElementById('btn-save-current-to-vault');
  const vaultItemsList = document.getElementById('vault-items-list');
  const vaultCountBadge = document.getElementById('vault-count-badge');
  const vaultEmptyState = document.getElementById('vault-empty-state');
  const btnExportVault = document.getElementById('btn-export-vault');
  const btnClearVault = document.getElementById('btn-clear-vault');

  // Toast
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  // State
  let isPasswordMasked = false;
  let currentPrimaryPassword = '';
  let activeArchetypeIndex = 0;
  let generatedArchetypes = [];
  let toastTimer = null;

  // Curated High-Entropy Anchor Words
  const ANCHOR_WORDS = [
    'Titan', 'Obsidian', 'Vanguard', 'Krypton', 'Aegis',
    'Valiant', 'Phantom', 'Sentinel', 'Apex', 'Zenith',
    'Solstice', 'Tempest', 'Eclipse', 'Polaris', 'Orion'
  ];

  // Leet Map
  const LEET_MAP = {
    'a': '@', 'A': '4',
    'e': '3', 'E': '3',
    'i': '1', 'I': '1',
    'o': '0', 'O': '0',
    's': '$', 'S': '$',
    't': '7', 'T': '7',
    'b': '8', 'B': '8',
    'g': '9', 'G': '9'
  };

  // Initialize
  function init() {
    initTheme();
    setupEventListeners();
    setupEraScrubber();
    setupMatteSwatches();
    setupPresetPills();
    generate();
  }

  // Theme Management
  function initTheme() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlTheme = urlParams.get('theme');
    const savedTheme = urlTheme || localStorage.getItem(THEME_STORAGE_KEY) || document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(savedTheme);

    if (dockBtnTheme) {
      dockBtnTheme.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        showToast(`Switched to ${nextTheme === 'dark' ? 'Studio Dark' : 'Daylight'} mode`);
      });
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (iconSun && iconMoon) {
      if (theme === 'dark') {
        iconSun.style.display = 'block';
        iconMoon.style.display = 'none';
      } else {
        iconSun.style.display = 'none';
        iconMoon.style.display = 'block';
      }
    }
  }

  // Event Listeners
  function setupEventListeners() {
    // Inputs triggering live re-computation
    const liveInputs = [inputName, inputDob, inputColor, inputCustom];
    liveInputs.forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          syncInputsWithScrubber();
          generate();
        });
      }
    });

    // Options
    const liveOptions = [optLeet, optSymbols, optSalt, optUpper, optSeparator];
    liveOptions.forEach(opt => {
      if (opt) {
        opt.addEventListener('change', generate);
      }
    });

    // Shuffle word button
    if (btnShuffleWord) {
      btnShuffleWord.addEventListener('click', () => {
        const randomWord = ANCHOR_WORDS[Math.floor(Math.random() * ANCHOR_WORDS.length)];
        inputCustom.value = randomWord;
        generate();
        showToast(`Anchor shuffled to "${randomWord}"`);
      });
    }

    // Demo Data Button
    if (btnDemoTrigger) {
      btnDemoTrigger.addEventListener('click', () => {
        inputName.value = 'Ares';
        inputDob.value = '2000-05-15';
        inputColor.value = 'Crimson';
        inputCustom.value = 'Titan';
        syncInputsWithScrubber();
        syncSwatchesWithColor('Crimson');
        generate();
        showToast('Demo seed anchors loaded');
      });
    }

    // Reset Button
    if (btnResetTrigger) {
      btnResetTrigger.addEventListener('click', () => {
        inputName.value = '';
        inputDob.value = '';
        inputColor.value = '';
        inputCustom.value = '';
        generate();
        showToast('All anchors cleared');
      });
    }

    // Security Info Bell
    if (btnSecurityInfo) {
      btnSecurityInfo.addEventListener('click', () => {
        showToast('100% Client-Side Sandbox: Zero network calls');
      });
    }

    // Mask / Unmask Toggle
    if (btnToggleVisibility) {
      btnToggleVisibility.addEventListener('click', toggleVisibility);
    }

    // Copy Primary
    if (btnCopyPrimary) {
      btnCopyPrimary.addEventListener('click', copyPrimary);
    }

    // Prev / Next Archetype Navigation
    if (btnArchetypePrev) {
      btnArchetypePrev.addEventListener('click', () => {
        if (!generatedArchetypes.length) return;
        activeArchetypeIndex = (activeArchetypeIndex - 1 + generatedArchetypes.length) % generatedArchetypes.length;
        renderActiveArchetype();
      });
    }

    if (btnArchetypeNext) {
      btnArchetypeNext.addEventListener('click', () => {
        if (!generatedArchetypes.length) return;
        activeArchetypeIndex = (activeArchetypeIndex + 1) % generatedArchetypes.length;
        renderActiveArchetype();
      });
    }

    // Static Pip Buttons
    if (archetypePipsTrack) {
      const pipBtns = archetypePipsTrack.querySelectorAll('.archetype-pip-btn');
      pipBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
          activeArchetypeIndex = index;
          renderActiveArchetype();
          const item = generatedArchetypes[index];
          if (item) showToast(`Viewing ${item.name} (${index + 1}/8)`);
        });
      });
    }

    // Copy All
    if (btnCopyAll) {
      btnCopyAll.addEventListener('click', copyAllArchetypes);
    }

    // Save to Vault Handlers (Card 1 & Card 2)
    if (btnSaveHeroVault) {
      btnSaveHeroVault.addEventListener('click', () => saveActiveCredential());
    }

    if (btnSaveCurrentToVault) {
      btnSaveCurrentToVault.addEventListener('click', () => saveActiveCredential());
    }

    if (inputVaultLabel) {
      inputVaultLabel.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveActiveCredential();
        }
      });
    }

    if (btnExportVault) {
      btnExportVault.addEventListener('click', exportVault);
    }

    if (btnClearVault) {
      btnClearVault.addEventListener('click', clearVault);
    }

    // Initialize Saved Vault items from localStorage
    initSavedVault();

    // Dock Navigation Scroll
    if (dockBtnVault) {
      dockBtnVault.addEventListener('click', () => {
        setActiveDock(dockBtnVault);
        document.getElementById('section-hero')?.scrollIntoView({ behavior: 'smooth' });
      });
    }

    if (dockBtnAnchors) {
      dockBtnAnchors.addEventListener('click', () => {
        setActiveDock(dockBtnAnchors);
        document.getElementById('section-anchors')?.scrollIntoView({ behavior: 'smooth' });
      });
    }

    if (dockBtnArchetypes) {
      dockBtnArchetypes.addEventListener('click', () => {
        setActiveDock(dockBtnArchetypes);
        const targetSection = document.getElementById('section-vault') || document.getElementById('section-hero');
        targetSection?.scrollIntoView({ behavior: 'smooth' });
      });
    }

    if (dockBtnGuide) {
      dockBtnGuide.addEventListener('click', (e) => {
        e.preventDefault();
        setActiveDock(dockBtnGuide);
        document.getElementById('usage-guide')?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  function setActiveDock(activeBtn) {
    [dockBtnVault, dockBtnAnchors, dockBtnArchetypes, dockBtnGuide].forEach(btn => {
      if (btn) btn.classList.remove('active');
    });
    if (activeBtn) activeBtn.classList.add('active');
  }

  // Era Scrubber Setup
  function setupEraScrubber() {
    eraCapsules.forEach(capsule => {
      capsule.addEventListener('click', () => {
        eraCapsules.forEach(c => c.classList.remove('active'));
        capsule.classList.add('active');
        const dob = capsule.getAttribute('data-dob');
        if (dob && inputDob) {
          inputDob.value = dob;
          generate();
        }
      });
    });

    if (btnEraPrev && btnEraNext) {
      btnEraPrev.addEventListener('click', () => shiftEra(-1));
      btnEraNext.addEventListener('click', () => shiftEra(1));
    }
  }

  function shiftEra(direction) {
    const capsulesArr = Array.from(eraCapsules);
    const activeIndex = capsulesArr.findIndex(c => c.classList.contains('active'));
    let newIndex = activeIndex + direction;
    if (newIndex < 0) newIndex = capsulesArr.length - 1;
    if (newIndex >= capsulesArr.length) newIndex = 0;
    capsulesArr[newIndex].click();
  }

  function syncInputsWithScrubber() {
    if (!inputDob || !inputDob.value) return;
    const year = inputDob.value.split('-')[0];
    eraCapsules.forEach(capsule => {
      if (capsule.getAttribute('data-year') === year) {
        capsule.classList.add('active');
      } else {
        capsule.classList.remove('active');
      }
    });
  }

  // Matte Swatches Setup
  function setupMatteSwatches() {
    matteSwatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        matteSwatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        const colorName = swatch.getAttribute('data-color');
        if (colorName && inputColor) {
          inputColor.value = colorName;
          generate();
        }
      });
    });
  }

  function syncSwatchesWithColor(colorName) {
    matteSwatches.forEach(swatch => {
      if (swatch.getAttribute('data-color').toLowerCase() === (colorName || '').toLowerCase()) {
        swatch.classList.add('active');
      } else {
        swatch.classList.remove('active');
      }
    });
  }

  // Preset Pills Setup
  function setupPresetPills() {
    presetPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const name = pill.getAttribute('data-name');
        if (name && inputName) {
          inputName.value = name;
          generate();
        }
      });
    });
  }

  // Deterministic Hash Helper (FNV-1a 32-bit for client-side deterministic entropy salt)
  function fnv1a(str) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0;
    }
    return hash;
  }

  // Apply Leet Substitution
  function applyLeet(str) {
    return str.split('').map(char => LEET_MAP[char] || char).join('');
  }

  // Cognitive Mnemonic Helpers for "Complicated yet Remembrable" Credentials
  function toConsonants(word) {
    if (!word) return '';
    if (word.length <= 3) return word;
    // Keep first letter, strip internal unstressed vowels
    const first = word[0];
    const rest = word.slice(1).replace(/[aeiou]/gi, '');
    return first + rest;
  }

  function toMnemonicLeet(word, enableLeet) {
    if (!word) return '';
    if (!enableLeet) return word;
    // Replace internal vowels with classic leet numbers: a->4, e->3, i->1, o->0
    const leetVowels = {
      'a': '4', 'A': '4',
      'e': '3', 'E': '3',
      'i': '1', 'I': '1',
      'o': '0', 'O': '0'
    };
    return word.split('').map((c, i) => {
      if (i === 0) return c; // preserve first letter casing
      return leetVowels[c] || c;
    }).join('');
  }

  // Primary Synthesis Engine
  function generate() {
    const rawName = (inputName?.value || 'Ares').trim();
    const rawDob = (inputDob?.value || '2000-05-15').trim();
    const rawColor = (inputColor?.value || 'Crimson').trim();
    const rawCustom = (inputCustom?.value || 'Titan').trim();

    const useLeet = optLeet?.checked ?? true;
    const useSymbols = optSymbols?.checked ?? true;
    const useSalt = optSalt?.checked ?? true;
    const forceUpper = optUpper?.checked ?? false;
    const separator = optSeparator?.value !== undefined ? optSeparator.value : '-';

    // Parse DOB components
    const dobParts = rawDob.split('-');
    const year = dobParts[0] || '2000';
    const month = dobParts[1] || '05';
    const day = dobParts[2] || '15';
    const shortYear = year.slice(-2);
    const techYear = `2k${shortYear}`;

    // Compute deterministic salt token
    const combinedEntropySeed = `${rawName}:${rawDob}:${rawColor}:${rawCustom}`;
    const seedHash = fnv1a(combinedEntropySeed);
    const saltToken = seedHash.toString(36).slice(0, 3);

    // Cognitive Obfuscated Anchors (Complicated & Remembrable)
    const mName = toMnemonicLeet(rawName, useLeet);
    const mColor = toMnemonicLeet(rawColor, useLeet);
    const mCustom = toMnemonicLeet(rawCustom, useLeet);

    const cName = toConsonants(rawName);
    const cColor = toConsonants(rawColor);
    const cCustom = toConsonants(rawCustom);

    // 1. Fortress Tactical (Hero Archetype - Multi-set cryptographic diffusion)
    const sym1 = useSymbols ? '#' : '_';
    const sym2 = useSymbols ? '$!' : '-';
    const sym3 = useSymbols ? '$' : shortYear;
    const sym4 = useSymbols ? '@' : '.';
    const saltPart = useSalt ? `*${saltToken}` : '';

    let fortressBase = `${mColor}${sym1}${mName}${sym2}${shortYear}${sym3}${mCustom}${sym4}${saltPart}`;
    if (forceUpper) fortressBase = fortressBase.toUpperCase();

    // 2. Memorable Passphrase (Cognitively Compounded & Obfuscated)
    // Avoids naive dictionary words by using phonetic consonant/leet tokens
    const phraseParts = [mColor, mName, shortYear, mCustom];
    let memorablePassphrase = phraseParts.join(separator);
    if (useSymbols && separator === '-') memorablePassphrase += '!';
    if (forceUpper) memorablePassphrase = memorablePassphrase.toUpperCase();

    // 3. Enterprise Compliant (1 Upper, 1 Lower, 1 Digit, 1 Symbol - Un-guessable)
    // E.g. Ar3s.Crmsn@2k36
    const entSep1 = useSymbols ? '.' : '';
    const entSep2 = useSymbols ? '@' : '';
    let enterprise = `${mName}${entSep1}${cColor}${entSep2}${techYear}`;
    if (!useSymbols) enterprise += shortYear;
    if (forceUpper) enterprise = enterprise.toUpperCase();

    // 4. Kebab Identifier (Phonetic consonant slug)
    // E.g. ar3s-crmsn-ttn-36
    let kebab = `${mName.toLowerCase()}-${cColor.toLowerCase()}-${cCustom.toLowerCase()}-${shortYear}`;

    // 5. Developer CLI Token (API / Stripe format with obfuscated anchors & salt)
    // E.g. ar3s_live_2k36_crm_ttn_kff
    const devSalt = useSalt ? `_${saltToken}` : '';
    let devToken = `${mName.toLowerCase()}_live_${techYear}_${cColor.toLowerCase().slice(0, 3)}_${cCustom.toLowerCase()}${devSalt}`;
    if (forceUpper) devToken = devToken.toUpperCase();

    // 6. Alphanumeric PIN (Strictly symbols-free for legacy enterprise/banking)
    // Obfuscated with leet digits & consonant compaction so it's not a plain dictionary word
    let alphanumeric = `${mName}${cColor}${shortYear}${mCustom}`.replace(/[^a-zA-Z0-9]/g, '');
    if (forceUpper) alphanumeric = alphanumeric.toUpperCase();

    // 7. Ultra High-Entropy (Maximum symbol diffusion & salt interleave)
    let ultra = `#${mCustom}!${mName}!${saltToken}${mColor}${shortYear}*${cCustom.slice(0, 2)}`;
    if (forceUpper) ultra = ultra.toUpperCase();

    // 8. Compact Mobile (12 chars, keypad friendly, high entropy)
    const mobSym = useSymbols ? '!' : '';
    let mobile = `${mName.slice(0, 3)}${mobSym}${cColor.slice(0, 3)}${shortYear}*${cCustom.slice(0, 2)}`;
    if (forceUpper) mobile = mobile.toUpperCase();

    // Store generated variations
    generatedArchetypes = [
      {
        id: 'fortress',
        name: 'Fortress Tactical',
        category: 'Fortress',
        badgeClass: 'ongoing',
        value: fortressBase,
        description: 'Multi-set leet token with cryptographic seed salt',
        tokens: [
          { label: 'Color', val: mColor, type: 'chip-color' },
          { label: 'Salt', val: sym1, type: 'chip-salt' },
          { label: 'Handle', val: mName, type: 'chip-handle' },
          { label: 'Epoch', val: `${sym2}${shortYear}${sym3}`, type: 'chip-epoch' },
          { label: 'Anchor', val: mCustom, type: 'chip-word' },
          { label: 'Noise', val: `${sym4}${saltPart}`, type: 'chip-noise' }
        ]
      },
      {
        id: 'memorable',
        name: 'Memorable Passphrase',
        category: 'Memorable',
        badgeClass: 'complete',
        value: memorablePassphrase,
        description: 'Delimited cognitive shorthand (un-guessable from favorites)',
        tokens: [
          { label: 'Color', val: mColor, type: 'chip-color' },
          { label: 'Sep', val: separator, type: 'chip-salt' },
          { label: 'Handle', val: mName, type: 'chip-handle' },
          { label: 'Sep', val: separator, type: 'chip-salt' },
          { label: 'Epoch', val: shortYear, type: 'chip-epoch' },
          { label: 'Sep', val: separator, type: 'chip-salt' },
          { label: 'Anchor', val: mCustom, type: 'chip-word' }
        ]
      },
      {
        id: 'dev_token',
        name: 'Developer CLI Token',
        category: 'High Entropy',
        badgeClass: 'ongoing',
        value: devToken,
        description: 'Standardized underscore slug for API keys & CLI',
        tokens: [
          { label: 'Handle', val: mName.toLowerCase(), type: 'chip-handle' },
          { label: 'Tag', val: '_live_', type: 'chip-noise' },
          { label: 'Epoch', val: techYear, type: 'chip-epoch' },
          { label: 'Color', val: cColor.toLowerCase().slice(0, 3), type: 'chip-color' },
          { label: 'Anchor', val: cCustom.toLowerCase(), type: 'chip-word' },
          { label: 'Salt', val: devSalt, type: 'chip-salt' }
        ]
      },
      {
        id: 'alphanumeric',
        name: 'Alphanumeric PIN',
        category: 'Compatible',
        badgeClass: 'neutral',
        value: alphanumeric,
        description: 'Zero special symbols for legacy form requirements',
        tokens: [
          { label: 'Handle', val: mName, type: 'chip-handle' },
          { label: 'Color', val: cColor, type: 'chip-color' },
          { label: 'Epoch', val: shortYear, type: 'chip-epoch' },
          { label: 'Anchor', val: mCustom, type: 'chip-word' }
        ]
      },
      {
        id: 'ultra',
        name: 'Ultra High-Entropy',
        category: 'Maximum',
        badgeClass: 'ongoing',
        value: ultra,
        description: 'Maximum symbol diffusion and shuffled anchors',
        tokens: [
          { label: 'Prefix', val: '#', type: 'chip-salt' },
          { label: 'Anchor', val: mCustom, type: 'chip-word' },
          { label: 'Sep', val: '!', type: 'chip-salt' },
          { label: 'Handle', val: mName, type: 'chip-handle' },
          { label: 'Salt', val: saltToken, type: 'chip-noise' },
          { label: 'Color', val: mColor, type: 'chip-color' },
          { label: 'Epoch', val: shortYear, type: 'chip-epoch' }
        ]
      },
      {
        id: 'mobile',
        name: 'Compact Mobile',
        category: 'Compact',
        badgeClass: 'complete',
        value: mobile,
        description: 'Optimized length for virtual keyboard inputs',
        tokens: [
          { label: 'Handle', val: mName.slice(0, 3), type: 'chip-handle' },
          { label: 'Sym', val: mobSym, type: 'chip-salt' },
          { label: 'Color', val: cColor.slice(0, 3), type: 'chip-color' },
          { label: 'Epoch', val: shortYear, type: 'chip-epoch' },
          { label: 'Anchor', val: cCustom.slice(0, 2), type: 'chip-word' }
        ]
      },
      {
        id: 'enterprise',
        name: 'Enterprise Compliant',
        category: 'Standard',
        badgeClass: 'neutral',
        value: enterprise,
        description: 'Guarantees upper, lower, number and punctuation',
        tokens: [
          { label: 'Handle', val: mName, type: 'chip-handle' },
          { label: 'Sep', val: entSep1 || '.', type: 'chip-salt' },
          { label: 'Color', val: cColor, type: 'chip-color' },
          { label: 'Sep', val: entSep2 || '@', type: 'chip-noise' },
          { label: 'Epoch', val: techYear, type: 'chip-epoch' }
        ]
      },
      {
        id: 'kebab',
        name: 'Kebab Identifier',
        category: 'Memorable',
        badgeClass: 'complete',
        value: kebab,
        description: 'Clean hyphenated lowercase string',
        tokens: [
          { label: 'Handle', val: mName.toLowerCase(), type: 'chip-handle' },
          { label: 'Sep', val: '-', type: 'chip-salt' },
          { label: 'Color', val: cColor.toLowerCase(), type: 'chip-color' },
          { label: 'Sep', val: '-', type: 'chip-salt' },
          { label: 'Anchor', val: cCustom.toLowerCase(), type: 'chip-word' },
          { label: 'Sep', val: '-', type: 'chip-salt' },
          { label: 'Epoch', val: shortYear, type: 'chip-epoch' }
        ]
      }
    ];

    // Render Single Active Archetype Showcase & Synchronize Hero
    renderActiveArchetype();
  }

  // Render Single Active Archetype (Focused Switcher Deck)
  function renderActiveArchetype() {
    if (!generatedArchetypes.length) return;
    if (activeArchetypeIndex < 0) activeArchetypeIndex = 0;
    if (activeArchetypeIndex >= generatedArchetypes.length) activeArchetypeIndex = 0;

    const active = generatedArchetypes[activeArchetypeIndex];

    // 1. Counter "1 / 8"
    if (archetypeCounterCurrent) archetypeCounterCurrent.textContent = activeArchetypeIndex + 1;
    if (archetypeCounterTotal) archetypeCounterTotal.textContent = generatedArchetypes.length;

    // 2. Name & Description & Category Badge
    if (archetypeName) archetypeName.textContent = active.name;
    if (archetypeDesc) archetypeDesc.textContent = active.description;
    if (archetypeCategoryBadge) {
      archetypeCategoryBadge.textContent = active.category;
      archetypeCategoryBadge.className = `status-pill-badge pill-${active.badgeClass}`;
    }

    // 3. Synchronize Primary Hero Display and Metrics
    currentPrimaryPassword = active.value;
    if (primaryDisplay) {
      primaryDisplay.textContent = currentPrimaryPassword;
    }
    if (activeCredentialBadge) {
      activeCredentialBadge.textContent = active.name;
    }
    computeMetrics(currentPrimaryPassword);

    // 4. Update Numbered Capsule Pips in Track (1 to 8)
    renderArchetypePips();

    // 5. Ensure mask blur is synchronously applied
    applyMaskState();
  }

  // ==========================================================================
  // Saved Credentials Vault (Card 2)
  // ==========================================================================
  const VAULT_STORAGE_KEY = 'ares_saved_vault_items';
  let savedVaultItems = [];

  // Initialize Saved Vault
  function initSavedVault() {
    try {
      const stored = localStorage.getItem(VAULT_STORAGE_KEY);
      if (stored) {
        savedVaultItems = JSON.parse(stored);
      } else {
        // Pre-populate with 3 clean, practical starter items from current seeds
        savedVaultItems = [
          {
            id: 'sample-1',
            label: 'Google Account',
            format: 'Fortress Tactical',
            value: generatedArchetypes[0]?.value || 'Cr1ms0n#Ar3s$!00$T1t4n@*8rv',
            createdAt: new Date().toLocaleDateString()
          },
          {
            id: 'sample-2',
            label: 'GitHub Developer Token',
            format: 'Developer CLI Token',
            value: generatedArchetypes[2]?.value || 'ar3s_live_2k00_crm_ttn_8rv',
            createdAt: new Date().toLocaleDateString()
          },
          {
            id: 'sample-3',
            label: 'Home Wi-Fi Network',
            format: 'Memorable Passphrase',
            value: generatedArchetypes[1]?.value || 'Cr1ms0n-Ar3s-00-T1t4n!',
            createdAt: new Date().toLocaleDateString()
          }
        ];
        saveVaultToStorage();
      }
    } catch (e) {
      savedVaultItems = [];
    }
    renderVaultList();
  }

  function saveVaultToStorage() {
    try {
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(savedVaultItems));
    } catch (e) {}
  }

  // Render Saved Vault Items List
  function renderVaultList() {
    if (!vaultItemsList) return;
    vaultItemsList.innerHTML = '';

    const count = savedVaultItems.length;
    if (vaultCountBadge) {
      vaultCountBadge.textContent = `${count} Saved`;
    }

    if (count === 0) {
      if (vaultEmptyState) vaultEmptyState.style.display = 'flex';
      return;
    }

    if (vaultEmptyState) vaultEmptyState.style.display = 'none';

    savedVaultItems.forEach(item => {
      const row = document.createElement('div');
      row.className = 'vault-item-row';
      row.setAttribute('data-id', item.id);

      // Initial letters for avatar (e.g. "G" for Google, "GH" for GitHub)
      const words = item.label.split(/\s+/).filter(Boolean);
      let initial = words[0] ? words[0].slice(0, 1) : 'V';
      if (words.length > 1 && words[1]) {
        initial += words[1].slice(0, 1);
      }
      initial = initial.toUpperCase();

      row.innerHTML = `
        <div class="vault-item-left">
          <div class="vault-service-avatar">${escapeHtml(initial)}</div>
          <div class="vault-service-details">
            <div class="vault-service-title-row">
              <span class="vault-service-name">${escapeHtml(item.label)}</span>
              <span class="status-pill-badge pill-ongoing">${escapeHtml(item.format || 'Tactical')}</span>
            </div>
            <div class="vault-service-pwd-wrap">
              <span class="vault-pwd-masked">••••••••••••••••••••</span>
              <span class="vault-pwd-plain" style="display: none;">${escapeHtml(item.value)}</span>
            </div>
          </div>
        </div>
        <div class="vault-item-actions">
          <button type="button" class="btn-vault-action-small btn-vault-toggle-eye" title="Reveal / Hide Password">
            <svg class="eye-open-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <svg class="eye-closed-svg" style="display: none;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </button>
          <button type="button" class="copy-archetype-btn btn-vault-copy" title="Copy password">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span class="copy-label">Copy</span>
          </button>
          <button type="button" class="btn-vault-action-small btn-vault-delete" title="Delete credential">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      `;

      // Wire Eye Toggle
      const btnEye = row.querySelector('.btn-vault-toggle-eye');
      const pwdMasked = row.querySelector('.vault-pwd-masked');
      const pwdPlain = row.querySelector('.vault-pwd-plain');
      const iconOpen = row.querySelector('.eye-open-svg');
      const iconClosed = row.querySelector('.eye-closed-svg');

      btnEye?.addEventListener('click', () => {
        const isCurrentlyMasked = pwdPlain.style.display === 'none';
        pwdPlain.style.display = isCurrentlyMasked ? 'inline' : 'none';
        pwdMasked.style.display = isCurrentlyMasked ? 'none' : 'inline';
        if (iconOpen) iconOpen.style.display = isCurrentlyMasked ? 'none' : 'block';
        if (iconClosed) iconClosed.style.display = isCurrentlyMasked ? 'block' : 'none';
      });

      // Wire Copy Button
      const btnCopy = row.querySelector('.btn-vault-copy');
      const copyLabel = row.querySelector('.copy-label');
      btnCopy?.addEventListener('click', () => {
        copyToClipboard(item.value, () => {
          btnCopy.classList.add('copied');
          if (copyLabel) copyLabel.textContent = 'Copied';
          setTimeout(() => {
            btnCopy.classList.remove('copied');
            if (copyLabel) copyLabel.textContent = 'Copy';
          }, 1800);
          showToast(`Copied ${item.label} password`);
        });
      });

      // Wire Delete Button
      const btnDel = row.querySelector('.btn-vault-delete');
      btnDel?.addEventListener('click', () => {
        deleteVaultItem(item.id);
      });

      vaultItemsList.appendChild(row);
    });
  }

  // Save Active Credential into Saved Vault
  function saveActiveCredential(customLabel) {
    if (!currentPrimaryPassword) return;
    const active = generatedArchetypes[activeArchetypeIndex] || {};
    const inputVal = inputVaultLabel?.value.trim();
    const label = customLabel || inputVal || `${active.name || 'Credential'} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;

    const newItem = {
      id: `item-${Date.now()}`,
      label: label,
      format: active.name || 'Tactical',
      value: currentPrimaryPassword,
      createdAt: new Date().toLocaleDateString()
    };

    savedVaultItems.unshift(newItem);
    saveVaultToStorage();
    renderVaultList();

    if (inputVaultLabel) inputVaultLabel.value = '';
    showToast(`Saved "${label}" to vault!`);

    // Smooth scroll down to the saved vault card
    document.getElementById('section-vault')?.scrollIntoView({ behavior: 'smooth' });
  }

  // Delete Item
  function deleteVaultItem(id) {
    const item = savedVaultItems.find(i => i.id === id);
    savedVaultItems = savedVaultItems.filter(i => i.id !== id);
    saveVaultToStorage();
    renderVaultList();
    showToast(`Removed ${item ? item.label : 'credential'} from vault`);
  }

  // Clear Entire Vault
  function clearVault() {
    if (!savedVaultItems.length) return;
    savedVaultItems = [];
    saveVaultToStorage();
    renderVaultList();
    showToast('Saved vault cleared');
  }

  // Export Vault Backup
  function exportVault() {
    if (!savedVaultItems.length) {
      showToast('Vault is empty, nothing to export');
      return;
    }
    const dataStr = JSON.stringify(savedVaultItems, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ares-vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Vault backup downloaded');
  }

  // Render 8 numbered quick-switch capsules
  function renderArchetypePips() {
    if (!archetypePipsTrack) return;
    const pipBtns = archetypePipsTrack.querySelectorAll('.archetype-pip-btn');
    if (pipBtns.length === generatedArchetypes.length) {
      pipBtns.forEach((btn, index) => {
        const item = generatedArchetypes[index];
        const isActive = index === activeArchetypeIndex;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        if (item) btn.setAttribute('title', `Switch to format ${index + 1}: ${item.name}`);
      });
    } else {
      archetypePipsTrack.innerHTML = '';
      generatedArchetypes.forEach((item, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `archetype-pip-btn ${index === activeArchetypeIndex ? 'active' : ''}`;
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', index === activeArchetypeIndex ? 'true' : 'false');
        btn.setAttribute('title', `Switch to format ${index + 1}: ${item.name}`);
        btn.textContent = `${index + 1}`;
        btn.addEventListener('click', () => {
          activeArchetypeIndex = index;
          renderActiveArchetype();
          showToast(`Viewing ${item.name} (${index + 1}/8)`);
        });
        archetypePipsTrack.appendChild(btn);
      });
    }
  }

  // Calculate Shannon Entropy & Crack Resistance
  function computeMetrics(pwd) {
    if (!pwd) {
      updateMetricDisplays(0, 'Minimal', 'Instant');
      return;
    }

    let poolSize = 0;
    if (/[a-z]/.test(pwd)) poolSize += 26;
    if (/[A-Z]/.test(pwd)) poolSize += 26;
    if (/[0-9]/.test(pwd)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) poolSize += 33;
    if (poolSize === 0) poolSize = 26;

    const entropyBits = Math.round(pwd.length * (Math.log(poolSize) / Math.log(2)));

    let rating = 'Fortress';
    let crackTime = 'Centuries';
    let activeSegments = 4;

    if (entropyBits < 40) {
      rating = 'Weak';
      crackTime = 'Seconds';
      activeSegments = 1;
    } else if (entropyBits < 60) {
      rating = 'Moderate';
      crackTime = 'Hours';
      activeSegments = 2;
    } else if (entropyBits < 90) {
      rating = 'Strong';
      crackTime = 'Decades';
      activeSegments = 3;
    } else {
      rating = 'Fortress';
      crackTime = 'Centuries';
      activeSegments = 4;
    }

    updateMetricDisplays(entropyBits, rating, crackTime, activeSegments);
  }

  function updateMetricDisplays(entropyBits, rating, crackTime, activeSegments) {
    if (strengthValue) strengthValue.textContent = rating;
    if (strengthCrackTime) strengthCrackTime.textContent = crackTime;
    if (strengthEntropy) strengthEntropy.textContent = `${entropyBits} bits`;

    // Segmented bar
    strengthSegments.forEach((seg, i) => {
      if (!seg) return;
      if (i < activeSegments) {
        seg.className = 'strength-seg active';
      } else {
        seg.className = 'strength-seg';
      }
    });
  }

  // Visibility Toggle
  function toggleVisibility() {
    isPasswordMasked = !isPasswordMasked;
    applyMaskState();
    showToast(isPasswordMasked ? 'Credential masked' : 'Credential revealed');
  }

  // Apply Masking State
  function applyMaskState() {
    if (primaryDisplay) {
      primaryDisplay.classList.toggle('masked', isPasswordMasked);
    }
    if (iconEyeOpen && iconEyeClosed) {
      iconEyeOpen.style.display = isPasswordMasked ? 'none' : 'block';
      iconEyeClosed.style.display = isPasswordMasked ? 'block' : 'none';
    }
  }

  // Copy Active Primary Credential
  function copyPrimary() {
    if (!currentPrimaryPassword) return;
    copyToClipboard(currentPrimaryPassword, () => {
      if (btnCopyPrimary) {
        btnCopyPrimary.classList.add('copied');
        if (copyPrimaryLabel) copyPrimaryLabel.textContent = 'Copied';
        setTimeout(() => {
          btnCopyPrimary.classList.remove('copied');
          if (copyPrimaryLabel) copyPrimaryLabel.textContent = 'Copy';
        }, 1800);
      }
      const activeName = generatedArchetypes[activeArchetypeIndex]?.name || 'Credential';
      showToast(`${activeName} copied to clipboard`);
    });
  }

  // Copy All Archetypes
  function copyAllArchetypes() {
    if (!generatedArchetypes.length) return;
    const formatted = generatedArchetypes
      .map(item => `${item.name}:\n${item.value}`)
      .join('\n\n');

    copyToClipboard(formatted, () => {
      showToast('All 8 synthesized archetypes copied');
    });
  }

  // Generic Clipboard Wrapper
  function copyToClipboard(text, onSuccess) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(onSuccess).catch(() => fallbackCopy(text, onSuccess));
    } else {
      fallbackCopy(text, onSuccess);
    }
  }

  function fallbackCopy(text, onSuccess) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      if (onSuccess) onSuccess();
    } catch (e) {
      console.error('Clipboard copy failed', e);
    }
    document.body.removeChild(textarea);
  }

  // Subtle Toast
  function showToast(message) {
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;
    toast.classList.add('visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('visible');
    }, 2400);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
