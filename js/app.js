/**
 * CS:GO Food Edition - Core Application Logic
 */

class CaseOpeningApp {
    constructor() {
        this.currentCase = window.CASES_DATA[0];
        this.isSpinning = false;
        this.cardWidth = 200; // px
        this.cardGap = 12; // px
        this.totalCards = 75;
        this.winIndex = 62; // Winning card index in the reel
        this.currentRollItems = [];
        this.winningItem = null;
        this.winningDetails = null;
        this.currentInspectedItem = null;

        // Settings & Filters
        this.mode = 'standard'; // 'standard' or 'balanced'
        this.fastSpin = false;
        this.soundMuted = false;
        this.budgetFilter = 'all'; // 'all', 'under35', '35to70', 'above70'

        // Load persisted custom dishes into CASES_DATA before initializing
        this.loadAndApplyCustomItems();

        // Inventory & StatTrak
        this.inventory = this.loadInventory();
        this.statTrakCounts = this.loadStatTrakCounts();

        this.spinAnimId = null;
        this.currentMapItem = null;

        // DOM elements
        this.dom = {
            reelTrack: document.getElementById('reel-track'),
            reelViewport: document.getElementById('reel-viewport'),
            needle: document.querySelector('.needle-indicator'),
            openBtn: document.getElementById('open-case-btn'),
            quickOpenBtn: document.getElementById('quick-open-btn'),
            caseSelect: document.getElementById('case-select'),
            budgetChipsGroup: document.getElementById('budget-chips'),
            budgetActiveTag: document.getElementById('budget-active-tag'),
            caseBanner: document.getElementById('case-banner'),
            caseTitle: document.getElementById('case-title'),
            caseTag: document.getElementById('case-tag'),
            caseDesc: document.getElementById('case-desc'),
            caseItemsList: document.getElementById('case-items-list'),
            inspectModal: document.getElementById('inspect-modal'),
            inspectCard: document.getElementById('inspect-card'),
            modalCloseBtn: document.getElementById('modal-close-btn'),
            modalOpenAgainBtn: document.getElementById('modal-open-again-btn'),
            mapsModal: document.getElementById('maps-modal'),
            mapsCloseBtn: document.getElementById('maps-close-btn'),
            mapsSearchInput: document.getElementById('maps-search-input'),
            mapsSearchBtn: document.getElementById('maps-search-submit-btn'),
            mapsGeoBtn: document.getElementById('maps-geo-btn'),
            inventoryList: document.getElementById('inventory-list'),
            inventoryCount: document.getElementById('inventory-count'),
            inventoryTotalPrice: document.getElementById('inventory-total-price'),
            shareBillBtn: document.getElementById('share-bill-btn'),
            clearInvBtn: document.getElementById('clear-inventory-btn'),
            soundToggleBtn: document.getElementById('sound-toggle-btn'),
            soundIcon: document.getElementById('sound-icon'),
            oddsToggleBtn: document.getElementById('odds-toggle-btn'),
            fastSpinToggle: document.getElementById('fast-spin-toggle'),
            addCustomItemBtn: document.getElementById('add-custom-item-btn'),
            customItemModal: document.getElementById('custom-item-modal'),
            closeCustomModalBtn: document.getElementById('close-custom-modal'),
            customItemForm: document.getElementById('custom-item-form')
        };

        this.init();
    }

    // Tactile button click sound feedback
    playSoundClick() {
        if (window.soundEngine && !this.soundMuted) {
            window.soundEngine.playButton();
        }
    }

    init() {
        this.bindEvents();
        this.renderCaseHeader();
        this.renderCaseContents();
        this.renderInitialReel();
        this.renderInventory();
    }

    bindEvents() {
        // Open Case Button
        this.dom.openBtn.addEventListener('click', () => {
            this.playSoundClick();
            if (!this.isSpinning) this.startSpin();
        });

        if (this.dom.quickOpenBtn) {
            this.dom.quickOpenBtn.addEventListener('click', () => {
                this.playSoundClick();
                this.fastSpin = true;
                if (this.dom.fastSpinToggle) this.dom.fastSpinToggle.checked = true;
                if (!this.isSpinning) this.startSpin();
            });
        }

        // Case selection
        this.dom.caseSelect.addEventListener('change', (e) => {
            if (this.isSpinning) return;
            this.playSoundClick();
            const foundCase = window.CASES_DATA.find(c => c.id === e.target.value);
            if (foundCase) {
                this.currentCase = foundCase;
                this.renderCaseHeader();
                this.renderCaseContents();
                this.renderInitialReel();
            }
        });

        // Budget Filter Chips
        if (this.dom.budgetChipsGroup) {
            this.dom.budgetChipsGroup.addEventListener('click', (e) => {
                const chip = e.target.closest('.budget-chip');
                if (!chip) return;
                const budget = chip.dataset.budget || 'all';
                this.setBudgetFilter(budget);
            });
        }

        // Fast spin toggle
        if (this.dom.fastSpinToggle) {
            this.dom.fastSpinToggle.addEventListener('change', (e) => {
                this.playSoundClick();
                this.fastSpin = e.target.checked;
            });
        }

        // Sound toggle
        this.dom.soundToggleBtn.addEventListener('click', () => {
            this.playSoundClick();
            this.soundMuted = !this.soundMuted;
            window.soundEngine.setMuted(this.soundMuted);
            this.dom.soundToggleBtn.classList.toggle('active', !this.soundMuted);
            this.dom.soundIcon.textContent = this.soundMuted ? '🔇' : '🔊';
        });

        // Odds Mode Toggle (Standard Odds vs Balanced Odds)
        this.dom.oddsToggleBtn.addEventListener('click', () => {
            if (this.isSpinning) return;
            this.playSoundClick();
            this.mode = this.mode === 'standard' ? 'balanced' : 'standard';
            this.dom.oddsToggleBtn.textContent = this.mode === 'standard' 
                ? '⚖️ Tỉ lệ: Tiêu Chuẩn (0.26% Vàng)' 
                : '⚖️ Tỉ lệ: Cân Bằng (Dễ Trúng)';
            this.dom.oddsToggleBtn.classList.toggle('btn-primary-glow', this.mode === 'balanced');
        });

        // Modal close
        this.dom.modalCloseBtn.addEventListener('click', () => {
            this.playSoundClick();
            this.closeInspectModal();
        });

        this.dom.modalOpenAgainBtn.addEventListener('click', () => {
            this.playSoundClick();
            this.closeInspectModal();
            setTimeout(() => this.startSpin(), 250);
        });

        // Close modal on background click
        this.dom.inspectModal.addEventListener('click', (e) => {
            if (e.target === this.dom.inspectModal) {
                this.playSoundClick();
                this.closeInspectModal();
            }
        });

        // Google Maps Modal Events
        if (this.dom.mapsCloseBtn) {
            this.dom.mapsCloseBtn.addEventListener('click', () => {
                this.playSoundClick();
                this.closeMapsModal();
            });
        }

        if (this.dom.mapsModal) {
            this.dom.mapsModal.addEventListener('click', (e) => {
                if (e.target === this.dom.mapsModal) {
                    this.playSoundClick();
                    this.closeMapsModal();
                }
            });
        }

        if (this.dom.mapsSearchBtn) {
            this.dom.mapsSearchBtn.addEventListener('click', () => {
                this.playSoundClick();
                const val = (this.dom.mapsSearchInput?.value || '').trim();
                if (val) this.updateMapIframe(val);
            });
        }

        if (this.dom.mapsSearchInput) {
            this.dom.mapsSearchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.playSoundClick();
                    const val = this.dom.mapsSearchInput.value.trim();
                    if (val) this.updateMapIframe(val);
                }
            });
        }

        if (this.dom.mapsGeoBtn) {
            this.dom.mapsGeoBtn.addEventListener('click', () => {
                this.playSoundClick();
                this.handleLocateNearby();
            });
        }

        // Group Share Bill
        if (this.dom.shareBillBtn) {
            this.dom.shareBillBtn.addEventListener('click', () => {
                this.handleShareBill();
            });
        }

        // Clear inventory
        this.dom.clearInvBtn.addEventListener('click', () => {
            this.playSoundClick();
            if (confirm('Bạn có chắc muốn làm sạch tủ lạnh / kho đồ ăn này không?')) {
                this.inventory = [];
                this.saveInventory();
                this.renderInventory();
            }
        });

        // Custom Item Modal
        if (this.dom.addCustomItemBtn) {
            this.dom.addCustomItemBtn.addEventListener('click', () => {
                this.playSoundClick();
                this.dom.customItemModal.classList.add('active');
            });
        }
        if (this.dom.closeCustomModalBtn) {
            this.dom.closeCustomModalBtn.addEventListener('click', () => {
                this.playSoundClick();
                this.closeCustomModal();
            });
        }
        if (this.dom.customItemForm) {
            this.dom.customItemForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddCustomItem();
            });
        }

        // Global Keyboard Shortcuts (Space, M, Esc)
        window.addEventListener('keydown', (e) => {
            const activeEl = document.activeElement;
            const isTyping = activeEl && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName);
            if (isTyping) return;

            // Esc: Close any active modal
            if (e.key === 'Escape') {
                this.closeInspectModal();
                this.closeCustomModal();
                this.closeMapsModal();
                return;
            }

            // Space: Trigger spin or spin again
            if (e.key === ' ' || e.code === 'Space') {
                e.preventDefault();
                if (this.dom.inspectModal && this.dom.inspectModal.classList.contains('active')) {
                    this.playSoundClick();
                    this.closeInspectModal();
                    setTimeout(() => this.startSpin(), 200);
                } else if (!this.isSpinning && 
                           (!this.dom.mapsModal || !this.dom.mapsModal.classList.contains('active')) &&
                           (!this.dom.customItemModal || !this.dom.customItemModal.classList.contains('active'))) {
                    this.playSoundClick();
                    this.startSpin();
                }
                return;
            }

            // M: View Google Maps for inspected dish or latest win
            if (e.key === 'm' || e.key === 'M') {
                if (this.dom.mapsModal && this.dom.mapsModal.classList.contains('active')) {
                    this.playSoundClick();
                    this.closeMapsModal();
                } else {
                    const targetDish = this.currentInspectedItem || this.winningItem || this.currentCase.items[0];
                    if (targetDish) {
                        this.playSoundClick();
                        this.openMapsModal(targetDish);
                    }
                }
                return;
            }
        });
    }

    // Set & Apply Budget Filter
    setBudgetFilter(budget) {
        this.playSoundClick();
        this.budgetFilter = budget;
        if (this.dom.budgetChipsGroup) {
            this.dom.budgetChipsGroup.querySelectorAll('.budget-chip').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.budget === budget);
            });
        }
        if (this.dom.budgetActiveTag) {
            const labels = {
                'all': 'Tất Cả Món',
                'under35': '< 35k (Bình dân)',
                '35to70': '35k - 70k (Tiêu chuẩn)',
                'above70': '> 70k (Thịnh soạn)'
            };
            this.dom.budgetActiveTag.textContent = labels[budget] || 'Tất Cả Món';
        }
        this.renderCaseContents();
        this.renderInitialReel();
    }

    // Price extraction helper (e.g. "35.000 đ" -> 35000, "25.000 - 35.000 đ" -> 25000)
    parsePrice(priceStr) {
        if (!priceStr) return 0;
        const match = priceStr.toString().match(/(\d{1,3}(?:\.\d{3})+|\d+)/);
        if (match) {
            return parseInt(match[0].replace(/\./g, ''), 10) || 0;
        }
        return 0;
    }

    matchesBudget(item) {
        if (!this.budgetFilter || this.budgetFilter === 'all') return true;
        const p = this.parsePrice(item.price);
        if (this.budgetFilter === 'under35') return p < 35000;
        if (this.budgetFilter === '35to70') return p >= 35000 && p <= 70000;
        if (this.budgetFilter === 'above70') return p > 70000;
        return true;
    }

    getAvailableItems() {
        const filtered = this.currentCase.items.filter(item => this.matchesBudget(item));
        return filtered.length > 0 ? filtered : this.currentCase.items;
    }

    renderCaseHeader() {
        this.dom.caseTitle.textContent = this.currentCase.name;
        this.dom.caseTag.textContent = this.currentCase.tag;
        this.dom.caseDesc.textContent = this.currentCase.description;
        if (this.currentCase.banner) {
            this.dom.caseBanner.src = this.currentCase.banner;
        }
    }

    renderCaseContents() {
        this.dom.caseItemsList.innerHTML = '';
        
        const filteredItems = this.currentCase.items.filter(item => this.matchesBudget(item));

        if (filteredItems.length === 0) {
            this.dom.caseItemsList.innerHTML = `
                <div style="grid-column: 1 / -1; padding: 2.5rem 1rem; text-align: center; background: rgba(15, 20, 29, 0.6); border: 1px dashed rgba(229, 169, 60, 0.3); border-radius: 8px;">
                    <span style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem;">🔍</span>
                    <h4 style="color: #fff; margin-bottom: 0.5rem; font-family: var(--font-tactical);">Không có món nào trong phân khúc giá này!</h4>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.25rem;">Hãy bấm nút bên dưới để đặt lại bộ lọc hoặc chọn hòm khác.</p>
                    <button class="btn btn-quick" id="btn-reset-budget" style="font-size: 0.85rem; padding: 0.5rem 1.2rem;">
                        🔄 Hiển Thị Tất Cả Món
                    </button>
                </div>
            `;
            const resetBtn = document.getElementById('btn-reset-budget');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    this.setBudgetFilter('all');
                });
            }
            return;
        }

        // Group items by rarity for CS:GO case preview style
        const sortedItems = [...filteredItems].sort((a, b) => {
            const order = { 'gold': 5, 'covert': 4, 'classified': 3, 'restricted': 2, 'mil-spec': 1 };
            return (order[b.rarity] || 0) - (order[a.rarity] || 0);
        });

        sortedItems.forEach(item => {
            const rarity = window.RARITY_TYPES[item.rarity];
            const itemEl = document.createElement('div');
            itemEl.className = `case-content-card rarity-${item.rarity}`;
            itemEl.style.setProperty('--rarity-color', rarity.color);
            itemEl.style.setProperty('--rarity-glow', rarity.glow);

            itemEl.innerHTML = `
                <div class="card-glow-bar"></div>
                <div class="card-thumb">
                    ${item.image 
                        ? `<img src="${item.image}" alt="${item.name}" loading="lazy" />` 
                        : window.getFoodSvg(item.icon || 'noodle', rarity.color)}
                </div>
                <div class="card-info">
                    <span class="weapon-name">${item.weapon}</span>
                    <span class="item-name">${item.name}</span>
                </div>
                <div class="card-badge" style="background: ${rarity.color}22; color: ${rarity.color}">
                    ${rarity.name.split(' ')[0]}
                </div>
            `;

            itemEl.addEventListener('click', () => {
                this.playSoundClick();
                this.showInspectModal(item, {
                    isStatTrak: false,
                    wear: window.WEAR_CONDITIONS[0],
                    float: '0.0152428',
                    isInspectionOnly: true
                });
            });

            this.dom.caseItemsList.appendChild(itemEl);
        });
    }

    // Luôn luôn trúng Pizza Hut theo yêu cầu người dùng
    pickWinningItem() {
        // Tìm món Pizza Hut trong hòm hiện tại
        let pizzaHut = this.currentCase.items.find(it => 
            (it.id && it.id.includes('pizza-hut')) || 
            (it.name && it.name.toLowerCase().includes('pizza hut'))
        );

        // Nếu không có trong hòm hiện tại, tìm trong bất kỳ hòm nào
        if (!pizzaHut && window.CASES_DATA) {
            for (const c of window.CASES_DATA) {
                pizzaHut = c.items.find(it => 
                    (it.id && it.id.includes('pizza-hut')) || 
                    (it.name && it.name.toLowerCase().includes('pizza hut'))
                );
                if (pizzaHut) break;
            }
        }

        if (pizzaHut) {
            return pizzaHut;
        }

        // Fallback an toàn
        const items = this.getAvailableItems();
        return items[0];
    }

    // Pick random item for reel decoration
    pickRandomItem() {
        const pool = this.getAvailableItems();
        const rand = Math.random() * 100;
        let rarity = 'mil-spec';
        if (rand < 1.5) rarity = 'gold';
        else if (rand < 5.0) rarity = 'covert';
        else if (rand < 15.0) rarity = 'classified';
        else if (rand < 40.0) rarity = 'restricted';

        const filtered = pool.filter(i => i.rarity === rarity);
        if (filtered.length > 0) {
            return filtered[Math.floor(Math.random() * filtered.length)];
        }
        return pool[Math.floor(Math.random() * pool.length)];
    }

    renderInitialReel() {
        if (this.spinAnimId) {
            cancelAnimationFrame(this.spinAnimId);
            this.spinAnimId = null;
        }
        this.dom.reelTrack.style.transition = 'none';
        this.dom.reelTrack.style.transform = 'translate3d(0px, 0px, 0px)';
        this.dom.reelTrack.innerHTML = '';
        this.currentRollItems = [];

        // Fill initial 15 items for static display
        for (let i = 0; i < 15; i++) {
            const item = this.pickRandomItem();
            this.currentRollItems.push(item);
            const cardEl = this.createReelCard(item, i);
            this.dom.reelTrack.appendChild(cardEl);
        }
    }

    createReelCard(item, index) {
        const rarity = window.RARITY_TYPES[item.rarity];
        const card = document.createElement('div');
        card.className = `reel-card rarity-${item.rarity}`;
        card.id = `reel-card-${index}`;
        card.style.setProperty('--rarity-color', rarity.color);
        card.style.setProperty('--rarity-glow', rarity.glow);

        card.innerHTML = `
            <div class="card-glow-bar"></div>
            <div class="card-thumb">
                ${item.image 
                    ? `<img src="${item.image}" alt="${item.name}" />` 
                    : window.getFoodSvg(item.icon || 'noodle', rarity.color)}
            </div>
            <div class="card-info">
                <span class="weapon-name">${item.weapon}</span>
                <span class="item-name">${item.name}</span>
            </div>
        `;
        return card;
    }

    startSpin() {
        if (this.isSpinning) return;
        this.isSpinning = true;

        if (this.spinAnimId) {
            cancelAnimationFrame(this.spinAnimId);
            this.spinAnimId = null;
        }

        // Button states
        this.dom.openBtn.disabled = true;
        this.dom.openBtn.classList.add('spinning');
        if (this.dom.quickOpenBtn) this.dom.quickOpenBtn.disabled = true;

        // Play case unlock latch sound
        window.soundEngine.playCaseOpen();

        // 1. Pick winner and calculate conditions
        this.winningItem = this.pickWinningItem();
        
        // 10% chance of StatTrak™
        const isStatTrak = Math.random() < 0.10;
        
        // Wear condition and exact float
        const wearCond = window.WEAR_CONDITIONS[Math.floor(Math.random() * window.WEAR_CONDITIONS.length)];
        const floatVal = (wearCond.min + Math.random() * (wearCond.max - wearCond.min)).toFixed(7);

        // Update StatTrak counter
        if (isStatTrak) {
            this.statTrakCounts[this.winningItem.id] = (this.statTrakCounts[this.winningItem.id] || 0) + 1;
            this.saveStatTrakCounts();
        }

        this.winningDetails = {
            isStatTrak,
            wear: wearCond,
            float: floatVal,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };

        // 2. Generate Reel Items
        this.dom.reelTrack.style.transition = 'none';
        this.dom.reelTrack.style.transform = 'translate3d(0px, 0px, 0px)';
        this.dom.reelTrack.innerHTML = '';
        this.currentRollItems = [];

        for (let i = 0; i < this.totalCards; i++) {
            let item;
            if (i === this.winIndex) {
                item = this.winningItem;
            } else if (i === this.winIndex - 1 || i === this.winIndex + 1) {
                // Near-miss effect: high chance to show a Red or Gold card right next to winner!
                const rand = Math.random();
                if (rand < 0.4) {
                    const golds = this.currentCase.items.filter(x => x.rarity === 'gold');
                    const coverts = this.currentCase.items.filter(x => x.rarity === 'covert');
                    item = (golds.length > 0 && Math.random() < 0.5) 
                        ? golds[0] 
                        : (coverts.length > 0 ? coverts[0] : this.pickRandomItem());
                } else {
                    item = this.pickRandomItem();
                }
            } else {
                item = this.pickRandomItem();
            }

            this.currentRollItems.push(item);
            const cardEl = this.createReelCard(item, i);
            this.dom.reelTrack.appendChild(cardEl);
        }

        // Force browser reflow to reset layout
        void this.dom.reelTrack.offsetWidth;

        // 3. Calculate destination coordinates
        const viewportWidth = this.dom.reelViewport.offsetWidth;
        const cardStep = this.cardWidth + this.cardGap;
        
        // Winning card position relative to reel start
        const cardCenter = (this.winIndex * cardStep) + (this.cardWidth / 2);
        
        // Random Jitter inside the winning card (-38% to +38% card width)
        // Stopping near the border gives players that iconic CS:GO heart-stopping thrill!
        const maxJitter = this.cardWidth * 0.38;
        const randomJitter = (Math.random() * 2 - 1) * maxJitter;
        const finalCenter = cardCenter + randomJitter;

        // Target translateX
        const targetTranslateX = -(finalCenter - (viewportWidth / 2));

        // 4. CS:GO Authentic Physics Engine:
        // "Quay nhanh rồi chậm từ từ chứ ko phải đùng cái là dừng luôn"
        // Phase 1 (0 -> tAccel): Tăng tốc nhanh mượt mà
        // Phase 2 (tAccel -> tCoast): Quay tốc độ cao liên tục (các món lướt vèo vèo qua indicator)
        // Phase 3 (tCoast -> totalDuration): Giảm tốc mượt mà từ từ qua hàm lũy thừa liên tục
        const isFast = this.fastSpin;
        const totalDuration = isFast ? 2.8 : 6.4; // seconds
        const tAccel = isFast ? 0.2 : 0.35; // seconds
        const tCoast = isFast ? 0.75 : 2.0; // seconds
        const tDecel = totalDuration - tCoast;
        const p = isFast ? 2.2 : 2.4; // Exponent for gradual deceleration

        // Total normalized distance area = 1.0
        const area = 0.5 * tAccel + (tCoast - tAccel) + tDecel / (p + 1);
        const vMax = 1.0 / area;

        // Progress function mapping time t (seconds) to position progress [0, 1]
        const getProgress = (t) => {
            if (t <= 0) return 0.0;
            if (t <= tAccel) {
                return 0.5 * vMax * (t * t / tAccel);
            }
            if (t <= tCoast) {
                return 0.5 * vMax * tAccel + vMax * (t - tAccel);
            }
            if (t < totalDuration) {
                const tau = (t - tCoast) / tDecel;
                const distAccel = 0.5 * vMax * tAccel;
                const distCoast = vMax * (tCoast - tAccel);
                const distDecel = vMax * tDecel * (1.0 - Math.pow(1.0 - tau, p + 1)) / (p + 1);
                return distAccel + distCoast + distDecel;
            }
            return 1.0;
        };

        const centerLineOffset = viewportWidth / 2;
        let lastPassedCardIndex = -1;
        let lastFrameTime = null;
        let elapsed = 0;

        const animate = (currentTime) => {
            if (!this.isSpinning) return;

            if (lastFrameTime === null) {
                lastFrameTime = currentTime;
            }

            // Delta time capped at 50ms to prevent glitches if tab is inactive
            const deltaSec = Math.min((currentTime - lastFrameTime) / 1000, 0.05);
            lastFrameTime = currentTime;
            elapsed += deltaSec;

            const t = Math.min(elapsed, totalDuration);
            const progress = getProgress(t);
            const currentX = targetTranslateX * progress;

            // Direct GPU-accelerated transform without layout thrashing
            this.dom.reelTrack.style.transform = `translate3d(${currentX}px, 0px, 0px)`;

            // Card boundary tracking for mechanical click ticks
            const currentCenterPoint = -currentX + centerLineOffset;
            const currentCardIndex = Math.floor(currentCenterPoint / cardStep);

            if (currentCardIndex !== lastPassedCardIndex && currentCardIndex >= 0) {
                lastPassedCardIndex = currentCardIndex;

                // Modulate pitch slightly as it approaches stop to build suspense
                const tension = Math.min(1.0, t / totalDuration);
                const pitchMod = 0.95 + (tension * 0.35);
                window.soundEngine.playTick(pitchMod);

                // Needle kick micro-animation
                if (this.dom.needle) {
                    this.dom.needle.classList.remove('tick-kick');
                    void this.dom.needle.offsetWidth;
                    this.dom.needle.classList.add('tick-kick');
                }
            }

            if (t < totalDuration) {
                this.spinAnimId = requestAnimationFrame(animate);
            } else {
                // Ensure exact landing coordinate down to the pixel
                this.dom.reelTrack.style.transform = `translate3d(${targetTranslateX}px, 0px, 0px)`;
                this.spinAnimId = null;
                this.handleSpinComplete();
            }
        };

        this.spinAnimId = requestAnimationFrame(animate);
    }

    handleSpinComplete() {
        this.isSpinning = false;
        this.dom.openBtn.disabled = false;
        this.dom.openBtn.classList.remove('spinning');
        if (this.dom.quickOpenBtn) this.dom.quickOpenBtn.disabled = false;

        // Highlight winning card in reel
        const winCard = document.getElementById(`reel-card-${this.winIndex}`);
        if (winCard) {
            winCard.classList.add('winner-highlight');
        }

        // Play Win Fanfare according to Rarity!
        window.soundEngine.playWin(this.winningItem.rarity);

        // Shake viewport on Red or Gold
        if (this.winningItem.rarity === 'gold' || this.winningItem.rarity === 'covert') {
            this.triggerScreenShake();
            this.triggerSparks();
        }

        // Add to inventory
        this.addToInventory(this.winningItem, this.winningDetails);

        // Open inspection modal after a brief suspense pause (600ms)
        setTimeout(() => {
            this.showInspectModal(this.winningItem, this.winningDetails);
        }, 700);
    }

    triggerScreenShake() {
        document.body.classList.add('screen-shake');
        setTimeout(() => {
            document.body.classList.remove('screen-shake');
        }, 600);
    }

    triggerSparks() {
        const container = document.getElementById('particles-overlay');
        if (!container) return;
        container.innerHTML = '';
        container.classList.add('active');

        for (let i = 0; i < 40; i++) {
            const spark = document.createElement('div');
            spark.className = 'spark-particle';
            spark.style.left = `${Math.random() * 100}%`;
            spark.style.top = `${Math.random() * 100}%`;
            spark.style.animationDelay = `${Math.random() * 0.4}s`;
            spark.style.background = this.winningItem.rarity === 'gold' ? '#ffd700' : '#eb4b4b';
            container.appendChild(spark);
        }

        setTimeout(() => {
            container.classList.remove('active');
            container.innerHTML = '';
        }, 1800);
    }

    showInspectModal(item, details) {
        this.currentInspectedItem = item;
        const rarity = window.RARITY_TYPES[item.rarity];
        const isStatTrak = details.isStatTrak;
        const statCount = this.statTrakCounts[item.id] || 1;

        const statTrakHtml = isStatTrak 
            ? `<div class="stattrak-badge">⭐ MÓN TỦ ĐÃ ĂN: ${statCount} LẦN</div>` 
            : '';

        const namePrefix = isStatTrak 
            ? `<span class="stattrak-tag">⭐ Món Tủ</span> ` 
            : '';

        this.dom.inspectCard.style.setProperty('--rarity-color', rarity.color);
        this.dom.inspectCard.style.setProperty('--rarity-glow', rarity.glow);

        this.dom.inspectCard.innerHTML = `
            <div class="inspect-glow-circle"></div>
            <div class="inspect-header">
                ${statTrakHtml}
                <div class="inspect-rarity-pill" style="color: ${rarity.color}; border-color: ${rarity.color}">
                    ${rarity.name}
                </div>
            </div>

            <div class="inspect-image-wrapper">
                ${item.image 
                    ? `<img src="${item.image}" alt="${item.name}" class="inspect-food-image" />` 
                    : `<div class="inspect-svg-box">${window.getFoodSvg(item.icon || 'noodle', rarity.color)}</div>`}
            </div>

            <div class="inspect-details">
                <div class="inspect-weapon-label">${item.category || item.weapon}</div>
                <h2 class="inspect-item-title">${namePrefix}${item.name}</h2>
                
                <div class="inspect-meta-grid">
                    <div class="meta-item">
                        <span class="meta-label">Tình trạng chế biến</span>
                        <span class="meta-value">${details.wear.name}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Độ ẩm / Float</span>
                        <span class="meta-value float-mono">${details.float}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Giá thành tham khảo</span>
                        <span class="meta-value text-gold">${item.price}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Năng lượng</span>
                        <span class="meta-value">${item.calories}</span>
                    </div>
                </div>

                <div class="inspect-lore-quote">
                    "${item.lore || 'Món ăn đậm đà bản sắc, thưởng thức nóng để cảm nhận vị ngon nhất!'}"
                </div>

                <div class="inspect-actions">
                    <button class="btn btn-find-places" id="btn-find-places">
                        📍 Xem Tất Cả Quán "${item.name}" Gần Bạn (Google Maps) <kbd class="kbd-hint-inline">M</kbd>
                    </button>
                    <div class="inspect-sub-actions">
                        <button class="btn btn-eat-now" id="btn-eat-now">
                            🥢 Chọn ăn món này ngay!
                        </button>
                        <button class="btn btn-copy-dish" id="btn-copy-dish">
                            📋 Khoe bạn bè / Copy
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.dom.inspectModal.classList.add('active');

        // Find Places on Google Maps
        const findPlacesBtn = document.getElementById('btn-find-places');
        if (findPlacesBtn) {
            findPlacesBtn.addEventListener('click', () => {
                this.playSoundClick();
                this.openMapsModal(item);
            });
        }

        // Eat Now Action
        document.getElementById('btn-eat-now').addEventListener('click', () => {
            this.playSoundClick();
            alert(`🎉 Chúc mừng bạn đã chốt món: "${item.name}" cho bữa ăn hôm nay! Đi ăn thôi nào!`);
            this.closeInspectModal();
        });

        // Copy Share text
        document.getElementById('btn-copy-dish').addEventListener('click', () => {
            this.playSoundClick();
            const shareText = `🍽️ Vừa quay trúng món: [${item.name}] (${item.category || item.weapon}) - Giá ${item.price}! Hôm nay ăn món này nhé!`;
            navigator.clipboard.writeText(shareText).then(() => {
                alert('Đã sao chép vào clipboard để gửi bạn bè: \n\n' + shareText);
            }).catch(() => {
                prompt('Sao chép dòng sau:', shareText);
            });
        });
    }

    closeInspectModal() {
        this.currentInspectedItem = null;
        this.dom.inspectModal.classList.remove('active');
    }

    closeCustomModal() {
        if (this.dom.customItemModal) {
            this.dom.customItemModal.classList.remove('active');
        }
    }

    // =========================================================================
    // GOOGLE MAPS FOOD EXPLORER INTEGRATION
    // =========================================================================
    getDishSearchData(item) {
        const name = (item.name || '').replace(/★/g, '').replace(/Knife \|/g, '').replace(/Special Gold/g, '').trim();
        const low = name.toLowerCase();

        let defaultQuery = `Quán ${name} gần đây`;
        let shortTerm = name;
        let tags = [`Quán ${name} gần đây`];
        let chains = [];

        if (low.includes('cơm tấm')) {
            defaultQuery = 'Quán cơm tấm gần đây';
            shortTerm = 'cơm tấm';
            tags = ['Quán cơm tấm gần đây', 'Cơm tấm sườn bì chả', 'Cơm tấm đêm', 'Cơm tấm Phúc Lộc Thọ'];
            chains = [
                { name: 'Cơm Tấm Phúc Lộc Thọ', note: 'Hơn 50 chi nhánh toàn quốc' },
                { name: 'Cơm Tấm Ba Ghiền', note: 'Sườn khổng lồ nức tiếng' },
                { name: 'Cơm Tấm Cali', note: 'Chuỗi cơm tấm văn phòng máy lạnh' },
                { name: 'Cơm Tấm Thuận Kiều', note: 'Thương hiệu lâu đời đậm đà' }
            ];
        } else if (low.includes('cơm niêu')) {
            defaultQuery = 'Quán cơm niêu gần đây';
            shortTerm = 'cơm niêu';
            tags = ['Quán cơm niêu gần đây', 'Cơm niêu Singapore', 'Cơm đập cháy', 'Cơm niêu văn phòng'];
            chains = [
                { name: 'Cơm Niêu Kombo', note: 'Cơm niêu Singapore 2 mặt cháy' },
                { name: 'Cơm Niêu Sài Gòn', note: 'Đặc sản cơm đập truyền thống' },
                { name: 'Cơm Thố Cháy Anh Nguyễn', note: 'Cơm thố nóng giòn tiện lợi' }
            ];
        } else if (low.includes('cơm gà')) {
            defaultQuery = 'Quán cơm gà gần đây';
            shortTerm = 'cơm gà';
            tags = ['Quán cơm gà gần đây', 'Cơm gà xối mỡ', 'Cơm gà Hải Nam', 'Cơm gà xé Nha Trang'];
            chains = [
                { name: 'Cơm Gà Hải Nam', note: 'Gà luộc da vàng óng mượt mà' },
                { name: 'Cơm Gà Xối Mỡ 142', note: 'Đùi gà xối mỡ giòn rụm' },
                { name: 'Cơm Gà Bà Buội', note: 'Đặc sản cơm gà phố cổ' }
            ];
        } else if (low.includes('cơm rang')) {
            defaultQuery = 'Quán cơm rang gần đây';
            shortTerm = 'cơm rang';
            tags = ['Quán cơm rang gần đây', 'Cơm rang dưa bò', 'Cơm rang thập cẩm', 'Quán cơm bình dân'];
            chains = [
                { name: 'Cơm Rang Dưa Bò Mã Mây', note: 'Phố cổ Hà Nội đậm vị' },
                { name: 'Quán Cơm Rang Bình Dân', note: 'Phục vụ nhanh, nóng hổi' }
            ];
        } else if (low.includes('cơm')) {
            defaultQuery = 'Quán cơm gần đây';
            shortTerm = 'quán cơm';
            tags = ['Quán cơm gần đây', 'Cơm bình dân', 'Cơm văn phòng', 'Cơm tấm', 'Cơm niêu'];
            chains = [
                { name: 'Cơm Bình Dân & Văn Phòng', note: 'Đa dạng món nóng hổi' },
                { name: 'Cơm Tấm Phúc Lộc Thọ', note: 'Chuỗi cơm sạch tiện lợi' },
                { name: 'Cơm Thố Cháy', note: 'Cơm thố nhanh văn phòng' }
            ];
        } else if (low.includes('phở')) {
            defaultQuery = 'Quán phở bò gần đây';
            shortTerm = 'phở bò';
            tags = ['Quán phở bò gần đây', 'Phở tái lăn', 'Phở bò sốt vang', 'Phở gà', 'Phở đêm'];
            chains = [
                { name: 'Phở Thìn Lò Đúc', note: 'Phở tái lăn xào lăn trứ danh' },
                { name: 'Phở Lý Quốc Sư', note: 'Nước dùng trong veo ngọt thanh' },
                { name: 'Phở Bát Đàn', note: 'Hương vị phở cổ truyền chuẩn gốc' },
                { name: 'Phở 24', note: 'Hệ thống phở máy lạnh sạch sẽ' }
            ];
        } else if (low.includes('bún bò')) {
            defaultQuery = 'Quán bún bò Huế gần đây';
            shortTerm = 'bún bò Huế';
            tags = ['Quán bún bò Huế gần đây', 'Bún bò giò heo', 'Bún bò chả cua', 'Bún bò thập cẩm'];
            chains = [
                { name: 'Bún Bò Huế Đông Ba', note: 'Đậm vị mắm ruốc chuẩn Huế' },
                { name: 'Bún Bò Huế O Oanh', note: 'Nước dùng thanh, giò béo' },
                { name: 'Bún Bò Gốc Huế', note: 'Thơm lừng sa tế ớt cay' }
            ];
        } else if (low.includes('bún chả')) {
            defaultQuery = 'Quán bún chả gần đây';
            shortTerm = 'bún chả';
            tags = ['Quán bún chả gần đây', 'Bún chả Hà Nội', 'Bún chả nem rán', 'Bún thịt nướng'];
            chains = [
                { name: 'Bún Chả Hương Liên', note: 'Quán bún chả Obama ghé thăm' },
                { name: 'Bún Chả Sinh Từ', note: 'Chuỗi bún chả sạch hiện đại' },
                { name: 'Bún Chả Đắc Kim', note: 'Chả nướng than hoa đầy đặn' }
            ];
        } else if (low.includes('bánh mì')) {
            defaultQuery = 'Tiệm bánh mì gần đây';
            shortTerm = 'bánh mì';
            tags = ['Tiệm bánh mì gần đây', 'Bánh mì chảo', 'Bánh mì que', 'Bánh mì patê', 'Bánh mì nướng'];
            chains = [
                { name: 'Bánh Mì Huỳnh Hoa', note: 'Bánh mì ô môi ngập thịt số 1' },
                { name: 'Bánh Mì Dân Tổ', note: 'Nhân xào bơ béo ngậy độc lạ' },
                { name: 'Bánh Mì Chảo Cột Điện', note: 'Sốt cay béo, bánh mì giòn' },
                { name: 'Bánh Mì Má Hải', note: 'Chả cá nóng hổi giòn rụm' }
            ];
        } else if (low.includes('gà rán') || low.includes('gà')) {
            defaultQuery = 'Quán gà rán gần đây';
            shortTerm = 'gà rán';
            tags = ['Quán gà rán gần đây', 'KFC', 'Jollibee', 'Lotteria', 'Gà rán Hàn Quốc'];
            chains = [
                { name: 'KFC Vietnam', note: 'Gà rán truyền thống giòn cay' },
                { name: 'Jollibee', note: 'Gà giòn vui vẻ sốt cay ngọt' },
                { name: 'Bonchon / Popeyes', note: 'Gà rán sốt tỏi giòn tan kiểu Mỹ/Hàn' }
            ];
        } else if (low.includes('lẩu')) {
            defaultQuery = 'Quán lẩu gần đây';
            shortTerm = 'quán lẩu';
            tags = ['Quán lẩu gần đây', 'Lẩu bò', 'Lẩu thái', 'Lẩu riêu cua', 'Buffet lẩu'];
            chains = [
                { name: 'Haidilao Hotpot', note: 'Lẩu Trung Hoa phục vụ đỉnh cao' },
                { name: 'Manwah Taiwanese Hotpot', note: 'Lẩu Đài Loan đậm đà' },
                { name: 'Kichi-Kichi', note: 'Lẩu băng chuyền thả ga' },
                { name: 'Lẩu Bò Nhà Gỗ', note: 'Đặc sản lẩu bò Đà Lạt' }
            ];
        } else if (low.includes('sushi') || low.includes('sashimi')) {
            defaultQuery = 'Nhà hàng Sushi gần đây';
            shortTerm = 'sushi';
            tags = ['Nhà hàng Sushi gần đây', 'Sushi Nhật Bản', 'Sashimi cá hồi', 'Buffet Sushi'];
            chains = [
                { name: 'Sushi Kei / Tokyo Deli', note: 'Chuỗi ẩm thực Nhật Bản chuẩn vị' },
                { name: 'Sushi Hokkaido Sachi', note: 'Hải sản tươi sống cao cấp' },
                { name: 'Isushi', note: 'Buffet Nhật Bản ngập tràn sashimi' }
            ];
        } else if (low.includes('pizza hut')) {
            defaultQuery = 'Pizza Hut gần đây';
            shortTerm = 'Pizza Hut';
            tags = ['Pizza Hut gần đây', 'Pizza Hut Delivery', 'Pizza Hut viền phô mai', 'Pizza Hut khuyến mãi', 'Đặt Pizza Hut'];
            chains = [
                { name: 'Pizza Hut', note: 'Chuỗi Pizza thương hiệu toàn cầu, viền phô mai kéo sợi trứ danh' },
                { name: 'The Pizza Company', note: 'Viền phô mai xúc xích béo ngậy' },
                { name: 'Domino’s Pizza', note: 'Giao siêu tốc 30 phút' }
            ];
        } else if (low.includes('pizza')) {
            defaultQuery = `Tiệm ${name} gần đây`;
            shortTerm = 'pizza';
            tags = ['Tiệm Pizza gần đây', 'Pizza 4P’s', 'The Pizza Company', 'Pizza Hut', 'Domino’s Pizza', 'Cowboy Jack’s', 'Capricciosa'];
            chains = [
                { name: 'Pizza 4P’s', note: 'Phô mai tươi tự làm, nướng lò củi đỉnh cao' },
                { name: 'The Pizza Company', note: 'Viền phô mai xúc xích béo ngậy, hải sản Pesto số 1' },
                { name: 'Domino’s Pizza', note: 'Pepperoni đậm vị Mỹ, giao siêu tốc 30 phút' },
                { name: 'Pizza Hut', note: 'Pizza Supreme, viền phô mai giòn rụm quốc dân' },
                { name: 'Cowboy Jack’s', note: 'Pizza phô mai nhồi sâu Chicago béo ngậy' }
            ];
        } else if (low.includes('trà sữa')) {
            defaultQuery = 'Quán trà sữa gần đây';
            shortTerm = 'trà sữa';
            tags = ['Quán trà sữa gần đây', 'Phê La', 'Phúc Long', 'Gong Cha', 'KOI Thé', 'Mixue'];
            chains = [
                { name: 'Phê La', note: 'Ô Long đặc sản đượm vị' },
                { name: 'Phúc Long Coffee & Tea', note: 'Trà sữa đậm trà truyền thống' },
                { name: 'KOI Thé / Gong Cha', note: 'Trà sữa trân châu hoàng kim' }
            ];
        } else if (low.includes('wagyu') || low.includes('michelin') || low.includes('bò') || low.includes('steak')) {
            defaultQuery = 'Nhà hàng Steak Bò gần đây';
            shortTerm = 'steak bò';
            tags = ['Nhà hàng Steak Bò gần đây', 'Bò Wagyu', 'El Gaucho', 'Bít tết', 'Fine Dining'];
            chains = [
                { name: 'El Gaucho Steakhouse', note: 'Bò nướng than Nam Mỹ thượng hạng' },
                { name: 'Moo Beef Steak', note: 'Steakhouse phong cách Mỹ ấm cúng' },
                { name: 'Nhà hàng Michelin', note: 'Trải nghiệm ẩm thực tinh hoa' }
            ];
        } else if (low.includes('nướng') || low.includes('buffet')) {
            defaultQuery = 'Quán nướng buffet gần đây';
            shortTerm = 'buffet nướng';
            tags = ['Quán nướng buffet gần đây', 'Buffet nướng', 'Gogi House', 'King BBQ', 'K-Pub'];
            chains = [
                { name: 'Gogi House', note: 'Thịt nướng sốt Hàn Quốc' },
                { name: 'King BBQ', note: 'Vua nướng với sốt King độc quyền' },
                { name: 'K-Pub / Yakimono', note: 'Quán nướng đường phố năng động' }
            ];
        } else if (low.includes('hải sản') || low.includes('cua') || low.includes('tôm')) {
            defaultQuery = 'Nhà hàng hải sản gần đây';
            shortTerm = 'hải sản';
            tags = ['Nhà hàng hải sản gần đây', 'Hải sản tươi sống', 'Tôm hùm nướng', 'Cua hoàng đế'];
            chains = [
                { name: 'Hải Sản Phố', note: 'Hải sản bơi tại bể quy mô lớn' },
                { name: 'Thế Giới Hải Sản', note: 'Con gì đang bơi chúng tôi đều có' },
                { name: 'Rạn Biển Seafood', note: 'Đa dạng đặc sản biển tươi ngon' }
            ];
        }

        return { defaultQuery, shortTerm, tags, chains };
    }

    openMapsModal(item, customQuery = null) {
        this.currentMapItem = item;
        const searchData = this.getDishSearchData(item);
        const query = customQuery || searchData.defaultQuery;

        const badgeEl = document.getElementById('maps-dish-badge');
        const titleEl = document.getElementById('maps-title');
        const subEl = document.getElementById('maps-subtitle');
        const inputEl = document.getElementById('maps-search-input');
        const tagsContainer = document.getElementById('maps-tags-list');
        const chainsContainer = document.getElementById('sidebar-chains-list');

        if (badgeEl) badgeEl.textContent = `📍 TÌM QUÁN: ${item.name}`;
        if (titleEl) titleEl.textContent = `Quán Gần Bạn: ${item.name}`;
        if (subEl) subEl.textContent = `Khám phá các quán ăn ${searchData.shortTerm} xung quanh tọa độ của bạn`;
        if (inputEl) inputEl.value = query;

        // Render Quick Tags
        if (tagsContainer) {
            tagsContainer.innerHTML = '';
            searchData.tags.forEach(tag => {
                const tagBtn = document.createElement('button');
                tagBtn.className = 'maps-tag-btn';
                tagBtn.textContent = tag;
                if (tag === query) tagBtn.classList.add('active');
                tagBtn.addEventListener('click', () => {
                    if (inputEl) inputEl.value = tag;
                    this.updateMapIframe(tag);
                    tagsContainer.querySelectorAll('.maps-tag-btn').forEach(b => b.classList.remove('active'));
                    tagBtn.classList.add('active');
                });
                tagsContainer.appendChild(tagBtn);
            });
        }

        // Render Curated Brands / Chains
        if (chainsContainer) {
            chainsContainer.innerHTML = '';
            searchData.chains.forEach(chain => {
                const chainCard = document.createElement('div');
                chainCard.className = 'sidebar-chain-card';
                chainCard.innerHTML = `
                    <div class="chain-info">
                        <div class="chain-name">${chain.name}</div>
                        <div class="chain-note">${chain.note}</div>
                    </div>
                    <button class="btn btn-chain-find" title="Tìm quán này">Tìm ➔</button>
                `;
                chainCard.querySelector('.btn-chain-find').addEventListener('click', () => {
                    const chainQuery = `${chain.name} gần đây`;
                    if (inputEl) inputEl.value = chainQuery;
                    this.updateMapIframe(chainQuery);
                });
                chainsContainer.appendChild(chainCard);
            });
        }

        // Update iframe & links
        this.updateMapIframe(query);

        // Show modal
        if (this.dom.mapsModal) this.dom.mapsModal.classList.add('active');
    }

    updateMapIframe(query) {
        const iframe = document.getElementById('maps-iframe');
        const loading = document.getElementById('maps-loading');
        const gmapsBtn = document.getElementById('btn-open-gmaps-external');
        const shopeeBtn = document.getElementById('btn-open-shopeefood');
        const grabBtn = document.getElementById('btn-open-grabfood');

        if (loading) loading.style.display = 'flex';

        const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
        if (iframe) {
            iframe.src = embedUrl;
            iframe.onload = () => {
                if (loading) loading.style.display = 'none';
            };
        }

        // Update direct external app links
        if (gmapsBtn) {
            gmapsBtn.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
        }
        if (shopeeBtn) {
            const shortQ = query.replace(/gần đây/gi, '').replace(/quán/gi, '').replace(/tiệm/gi, '').replace(/nhà hàng/gi, '').trim();
            shopeeBtn.href = `https://shopeefood.vn/search?keyword=${encodeURIComponent(shortQ)}`;
        }
        if (grabBtn) {
            const shortQ = query.replace(/gần đây/gi, '').replace(/quán/gi, '').replace(/tiệm/gi, '').replace(/nhà hàng/gi, '').trim();
            grabBtn.href = `https://food.grab.com/vn/vi/restaurants?search=${encodeURIComponent(shortQ)}`;
        }
    }

    handleLocateNearby() {
        const inputEl = document.getElementById('maps-search-input');
        const searchData = this.currentMapItem ? this.getDishSearchData(this.currentMapItem) : { shortTerm: 'quán cơm' };
        const shortQ = searchData.shortTerm || 'quán ăn';

        if (!navigator.geolocation) {
            alert('Trình duyệt của bạn không hỗ trợ định vị GPS. Vui lòng nhập tên khu vực / quận vào ô tìm kiếm.');
            return;
        }

        const geoBtn = document.getElementById('maps-geo-btn');
        if (geoBtn) {
            geoBtn.disabled = true;
            geoBtn.textContent = '⏳ Đang định vị...';
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                if (geoBtn) {
                    geoBtn.disabled = false;
                    geoBtn.textContent = '🎯 Gần Tôi Nhất';
                }
                const lat = pos.coords.latitude.toFixed(6);
                const lng = pos.coords.longitude.toFixed(6);
                const query = `Quán ${shortQ} gần đây`;
                if (inputEl) inputEl.value = query;

                const iframe = document.getElementById('maps-iframe');
                const loading = document.getElementById('maps-loading');
                if (loading) loading.style.display = 'flex';

                const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&ll=${lat},${lng}&z=15&output=embed`;
                if (iframe) {
                    iframe.src = embedUrl;
                    iframe.onload = () => {
                        if (loading) loading.style.display = 'none';
                    };
                }

                const gmapsBtn = document.getElementById('btn-open-gmaps-external');
                if (gmapsBtn) {
                    gmapsBtn.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}&sll=${lat},${lng}`;
                }
            },
            (err) => {
                if (geoBtn) {
                    geoBtn.disabled = false;
                    geoBtn.textContent = '🎯 Gần Tôi Nhất';
                }
                alert('Không thể lấy vị trí GPS hiện tại (do chưa cấp quyền trình duyệt). Đang tải quán theo khu vực của bạn!');
                const query = `Quán ${shortQ} gần đây`;
                if (inputEl) inputEl.value = query;
                this.updateMapIframe(query);
            },
            { timeout: 8000, enableHighAccuracy: true }
        );
    }

    closeMapsModal() {
        if (this.dom.mapsModal) {
            this.dom.mapsModal.classList.remove('active');
        }
    }

    // =========================================================================
    // CUSTOM DISHES MANAGEMENT & LOCALSTORAGE PERSISTENCE
    // =========================================================================
    loadCustomItems() {
        try {
            return JSON.parse(localStorage.getItem('csgo_food_custom_items')) || [];
        } catch {
            return [];
        }
    }

    loadAndApplyCustomItems() {
        try {
            const savedItems = this.loadCustomItems();
            savedItems.forEach(customItem => {
                const targetCase = window.CASES_DATA.find(c => c.id === customItem.caseId) || window.CASES_DATA[0];
                if (!targetCase.items.some(i => i.id === customItem.id)) {
                    targetCase.items.push(customItem);
                }
            });
        } catch (e) {
            console.error('Lỗi khi tải món ăn tùy chỉnh:', e);
        }
    }

    // Add Custom Dish to current case with persistent localStorage
    handleAddCustomItem() {
        const nameInput = document.getElementById('custom-name');
        const name = nameInput ? nameInput.value.trim() : '';
        const category = document.getElementById('custom-weapon')?.value.trim() || 'Món Ăn Tự Thêm';
        const rarity = document.getElementById('custom-rarity')?.value || 'restricted';
        const icon = document.getElementById('custom-icon')?.value || 'rice';
        const customImage = document.getElementById('custom-image') ? document.getElementById('custom-image').value.trim() : '';
        let rawPrice = document.getElementById('custom-price')?.value.trim() || '35.000 đ';
        const lore = document.getElementById('custom-lore')?.value.trim() || 'Món ngon đậm vị do bạn tự thêm vào thực đơn!';

        if (!name) {
            alert('Vui lòng nhập tên món ăn!');
            return;
        }

        // Format price gracefully if user enters "35k" or "35000"
        let formattedPrice = rawPrice;
        if (/^\d+k$/i.test(rawPrice)) {
            const num = parseInt(rawPrice, 10);
            formattedPrice = `${num}.000 đ`;
        } else if (/^\d+$/.test(rawPrice)) {
            const num = parseInt(rawPrice, 10);
            formattedPrice = num.toLocaleString('vi-VN') + ' đ';
        }

        const newItem = {
            id: 'custom-' + Date.now(),
            caseId: this.currentCase.id,
            name,
            weapon: category,
            category: category,
            rarity,
            price: formattedPrice,
            calories: '500 kcal',
            lore,
            icon,
            image: customImage || null,
            isCustom: true
        };

        // Add to active case in memory
        this.currentCase.items.push(newItem);

        // Save to localStorage so it persists upon F5
        const customList = this.loadCustomItems();
        customList.push(newItem);
        try {
            localStorage.setItem('csgo_food_custom_items', JSON.stringify(customList));
        } catch (e) {
            console.error('Không thể lưu món ăn:', e);
        }

        this.playSoundClick();
        this.renderCaseContents();
        this.renderInitialReel();
        this.closeCustomModal();
        if (this.dom.customItemForm) this.dom.customItemForm.reset();
        alert(`🎉 Đã thêm món "${name}" (${formattedPrice}) vào ${this.currentCase.name}!\nMón ăn đã được lưu vào bộ nhớ trình duyệt và sẵn sàng để quay.`);
    }

    // =========================================================================
    // INVENTORY, BILL CALCULATION & GROUP SHARING
    // =========================================================================
    loadInventory() {
        try {
            return JSON.parse(localStorage.getItem('csgo_food_inventory')) || [];
        } catch {
            return [];
        }
    }

    saveInventory() {
        try {
            localStorage.setItem('csgo_food_inventory', JSON.stringify(this.inventory));
        } catch (e) {
            console.error(e);
        }
    }

    loadStatTrakCounts() {
        try {
            return JSON.parse(localStorage.getItem('csgo_food_stattrak')) || {};
        } catch {
            return {};
        }
    }

    saveStatTrakCounts() {
        try {
            localStorage.setItem('csgo_food_stattrak', JSON.stringify(this.statTrakCounts));
        } catch (e) {
            console.error(e);
        }
    }

    addToInventory(item, details) {
        const entry = {
            id: item.id,
            name: item.name,
            weapon: item.category || item.weapon || 'Món Ăn',
            category: item.category || item.weapon || 'Món Ăn',
            rarity: item.rarity,
            price: item.price,
            icon: item.icon,
            image: item.image,
            isStatTrak: details.isStatTrak,
            wearName: details.wear.name,
            float: details.float,
            time: details.time,
            timestamp: Date.now()
        };
        this.inventory.unshift(entry);
        if (this.inventory.length > 50) this.inventory.pop(); // Keep last 50
        this.saveInventory();
        this.renderInventory();
    }

    renderInventory() {
        if (!this.dom.inventoryList) return;
        this.dom.inventoryList.innerHTML = '';
        this.dom.inventoryCount.textContent = this.inventory.length;

        // Calculate and format total bill
        let totalAmount = 0;
        this.inventory.forEach(item => {
            totalAmount += this.parsePrice(item.price);
        });

        if (this.dom.inventoryTotalPrice) {
            this.dom.inventoryTotalPrice.textContent = totalAmount.toLocaleString('vi-VN') + ' đ';
        }

        if (this.inventory.length === 0) {
            this.dom.inventoryList.innerHTML = `
                <div class="empty-inventory">
                    <span>🧊</span>
                    <p>Tủ lạnh còn trống! Hãy bấm Mở Hòm phía trên để quay món ăn nhé.</p>
                </div>
            `;
            return;
        }

        this.inventory.forEach((item) => {
            const rarity = window.RARITY_TYPES[item.rarity];
            const card = document.createElement('div');
            card.className = `inventory-card rarity-${item.rarity}`;
            card.style.setProperty('--rarity-color', rarity.color);

            card.innerHTML = `
                <div class="card-glow-bar"></div>
                <div class="inv-thumb">
                    ${item.image 
                        ? `<img src="${item.image}" alt="${item.name}" />` 
                        : window.getFoodSvg(item.icon || 'noodle', rarity.color)}
                </div>
                <div class="inv-info">
                    ${item.isStatTrak ? `<span class="inv-stattrak">⭐ Món Tủ</span>` : ''}
                    <div class="inv-weapon">${item.category || item.weapon || 'Món Ăn'}</div>
                    <div class="inv-name">${item.name}</div>
                    <div class="inv-meta">
                        <span>${item.price}</span>
                        <span>${item.time}</span>
                    </div>
                </div>
                <button class="btn-inv-map-direct" title="Xem quán gần bạn trên Google Maps">📍</button>
            `;

            const mapBtn = card.querySelector('.btn-inv-map-direct');
            if (mapBtn) {
                mapBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.playSoundClick();
                    const fullItem = this.currentCase.items.find(i => i.id === item.id) || item;
                    this.openMapsModal(fullItem);
                });
            }

            card.addEventListener('click', () => {
                this.playSoundClick();
                const fullItem = this.currentCase.items.find(i => i.id === item.id) || item;
                this.showInspectModal(fullItem, {
                    isStatTrak: item.isStatTrak,
                    wear: { name: item.wearName },
                    float: item.float,
                    time: item.time
                });
            });

            this.dom.inventoryList.appendChild(card);
        });
    }

    // Share inventory bill with friends
    handleShareBill() {
        this.playSoundClick();
        if (this.inventory.length === 0) {
            alert('Tủ lạnh chưa có món nào! Hãy quay vài món trước khi rủ bạn bè nhé.');
            return;
        }

        let totalAmount = 0;
        const itemListText = this.inventory.map((item, idx) => {
            totalAmount += this.parsePrice(item.price);
            return `${idx + 1}. ${item.name} (${item.category || item.weapon || 'Món ngon'}) - ${item.price}`;
        }).join('\n');

        const formattedTotal = totalAmount.toLocaleString('vi-VN') + ' đ';
        const approxPerPerson = Math.round(totalAmount / Math.max(1, this.inventory.length)).toLocaleString('vi-VN') + ' đ';

        const shareContent = 
`🍱 KÈO ĂN HÔM NAY ĐÃ CHỐT! (Hôm Nay Ăn Gì?)
══════════════════════════════
${itemListText}
══════════════════════════════
💰 TỔNG DỰ TÍNH: ${formattedTotal} (~${this.inventory.length} món)
💡 Bình quân: ~${approxPerPerson}/món
👉 Anh em duyệt kèo này thì chốt đơn đi ăn liền nha! 🚀`;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareContent).then(() => {
                alert('✅ Đã sao chép thực đơn & tổng bill vào bộ nhớ tạm!\nBạn có thể dán (Ctrl+V) vào Zalo / Messenger / Telegram để rủ nhóm bạn.');
            }).catch(() => {
                prompt('Sao chép nội dung thực đơn bên dưới:', shareContent);
            });
        } else {
            prompt('Sao chép nội dung thực đơn bên dưới:', shareContent);
        }
    }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CaseOpeningApp();
});
