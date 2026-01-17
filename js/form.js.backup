/**
 * Form handling for Austrian Tax Calculator
 * Manages user inputs and children list
 */

const FormManager = {
    children: [],

    /**
     * Initialize form event listeners
     */
    init() {
        // Child counter buttons (+/-)
        document.getElementById('addChildBtnTop')?.addEventListener('click', () => {
            this.addChild();
            this.updateChildCount();
            this.calculate();
        });
        document.getElementById('removeChildBtn')?.addEventListener('click', () => {
            this.removeLastChild();
            this.updateChildCount();
            this.calculate();
        });

        // Status toggle cards
        document.querySelectorAll('.status-card').forEach(card => {
            card.addEventListener('click', () => {
                this.handleStatusToggle(card.dataset.status);
            });
        });

        // Period toggle (monthly/yearly)
        document.querySelectorAll('input[name="incomePeriod"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handlePeriodToggle(e.target.value);
            });
        });

        // Housing type change (update label)
        document.getElementById('housingType')?.addEventListener('change', (e) => {
            this.updateHousingLabel(e.target.value);
        });

        // Calculate button
        document.getElementById('calculateBtn')?.addEventListener('click', () => {
            this.calculate();
        });

        // Input changes trigger auto-update (with debounce)
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.calculate();
            });
        });

        // Sticky bar scroll listener
        this.initStickyBar();

        // Share button
        document.getElementById('shareBtn')?.addEventListener('click', () => {
            this.shareResults();
        });

        // Load URL parameters if present
        this.loadFromURL();

        // Initial calculation
        this.calculate();
    },

    /**
     * Handle status card toggle (Alleinstehend / Verheiratet)
     */
    // Default values for single vs married households (based on Austrian statistics 2024)
    defaults: {
        single: {
            rent: 700,
            apartmentSize: 60
        },
        married: {
            partnerIncome: 1800,  // Typical part-time or lower-earning partner
            rent: 900,
            apartmentSize: 75
        }
    },

    handleStatusToggle(status) {
        // Update visual state
        document.querySelectorAll('.status-card').forEach(card => {
            card.classList.remove('active');
        });
        document.querySelector(`[data-status="${status}"]`)?.classList.add('active');

        // Update hidden field for compatibility
        document.getElementById('familyStatus').value = status;

        // Show/hide partner income field and update defaults
        const income2Group = document.getElementById('income2Group');
        const partnerIncomeInput = document.getElementById('partnerIncome');
        const housingCostInput = document.getElementById('housingCost');
        const apartmentSizeInput = document.getElementById('apartmentSize');

        if (status === 'married') {
            income2Group.style.display = 'block';

            // Set realistic defaults for married/partnered households
            // Only set if current value is the single default (to not overwrite user input)
            if (parseFloat(partnerIncomeInput.value) === 0) {
                partnerIncomeInput.value = this.defaults.married.partnerIncome;
            }
            if (parseFloat(housingCostInput.value) === this.defaults.single.rent) {
                housingCostInput.value = this.defaults.married.rent;
            }
            if (parseFloat(apartmentSizeInput.value) === this.defaults.single.apartmentSize) {
                apartmentSizeInput.value = this.defaults.married.apartmentSize;
            }
        } else {
            income2Group.style.display = 'none';
            partnerIncomeInput.value = 0;

            // Reset to single defaults if values are at married defaults
            if (parseFloat(housingCostInput.value) === this.defaults.married.rent) {
                housingCostInput.value = this.defaults.single.rent;
            }
            if (parseFloat(apartmentSizeInput.value) === this.defaults.married.apartmentSize) {
                apartmentSizeInput.value = this.defaults.single.apartmentSize;
            }
        }

        this.calculate();
    },

    /**
     * Handle period toggle (monthly/yearly)
     */
    handlePeriodToggle(period) {
        const isYearly = period === 'yearly';
        const multiplier = isYearly ? 14 : 1; // Austria has 14 salaries
        const divisor = isYearly ? 1 : 14;

        // Update labels
        const periodText = isYearly ? 'jährlich' : 'monatlich';
        const suffix = isYearly ? '€/Jahr' : '€/Monat';

        document.getElementById('periodLabel1').textContent = periodText;
        document.getElementById('periodLabel2').textContent = periodText;
        document.getElementById('incomeSuffix1').textContent = suffix;
        document.getElementById('incomeSuffix2').textContent = suffix;

        // Convert current values
        const income1 = document.getElementById('grossIncome');
        const income2 = document.getElementById('partnerIncome');

        // Store current period for conversion calculation
        const wasYearly = income1.dataset.period === 'yearly';

        if (wasYearly !== isYearly) {
            if (isYearly) {
                // Convert monthly to yearly
                income1.value = Math.round(parseFloat(income1.value || 0) * 14);
                income2.value = Math.round(parseFloat(income2.value || 0) * 14);
            } else {
                // Convert yearly to monthly
                income1.value = Math.round(parseFloat(income1.value || 0) / 14);
                income2.value = Math.round(parseFloat(income2.value || 0) / 14);
            }
        }

        income1.dataset.period = period;
        income2.dataset.period = period;

        this.calculate();
    },

    /**
     * Initialize sticky result bar
     */
    initStickyBar() {
        const stickyBar = document.getElementById('stickyResultBar');
        const inputSection = document.querySelector('.input-section');
        const header = document.querySelector('.header');

        if (!stickyBar || !inputSection) return;

        // Show sticky bar on any interaction with the form
        let hasInteracted = false;

        const showStickyBar = () => {
            if (!hasInteracted) {
                hasInteracted = true;
            }
            // Only show if header is not visible
            if (header) {
                const headerBottom = header.getBoundingClientRect().bottom;
                if (headerBottom < 0) {
                    stickyBar.classList.add('visible');
                }
            } else {
                stickyBar.classList.add('visible');
            }
        };

        // Listen for any click or focus on input section
        inputSection.addEventListener('click', showStickyBar);
        inputSection.addEventListener('focusin', showStickyBar);

        // Show/hide based on scroll position - hide when header is visible
        window.addEventListener('scroll', () => {
            if (!hasInteracted) return;

            const headerBottom = header ? header.getBoundingClientRect().bottom : -1;

            if (headerBottom > 0) {
                // Header is visible, hide sticky bar
                stickyBar.classList.remove('visible');
            } else {
                // Header is not visible, show sticky bar
                stickyBar.classList.add('visible');
            }
        });
    },

    /**
     * Load form values from URL parameters
     */
    loadFromURL() {
        const params = new URLSearchParams(window.location.search);

        // Basic inputs
        if (params.has('brutto')) {
            document.getElementById('grossIncome').value = params.get('brutto');
        }
        if (params.has('status')) {
            const status = document.getElementById('familyStatus');
            status.value = params.get('status');
            this.updatePartnerIncomeVisibility(status.value);
        }
        if (params.has('partner')) {
            document.getElementById('partnerIncome').value = params.get('partner');
        }
        if (params.has('miete')) {
            document.getElementById('monthlyRent').value = params.get('miete');
        }
        if (params.has('bundesland')) {
            document.getElementById('federalState').value = params.get('bundesland');
        }

        // Children (format: kinder=5,7,12)
        if (params.has('kinder')) {
            const ages = params.get('kinder').split(',').map(a => parseInt(a)).filter(a => !isNaN(a));
            ages.forEach(age => this.addChild(age));
        }
    },

    /**
     * Generate URL with current parameters
     */
    generateShareURL() {
        const formData = this.getFormData();
        const params = new URLSearchParams();

        params.set('brutto', formData.monthlyGross);

        if (formData.familyStatus !== 'single') {
            params.set('status', formData.familyStatus);
        }
        if (formData.partnerIncome > 0) {
            params.set('partner', formData.partnerIncome);
        }
        if (formData.monthlyRent > 0) {
            params.set('miete', formData.monthlyRent);
        }
        if (formData.federalState !== 'wien') {
            params.set('bundesland', formData.federalState);
        }
        if (formData.childrenAges && formData.childrenAges.length > 0) {
            params.set('kinder', formData.childrenAges.join(','));
        }

        return window.location.origin + window.location.pathname + '?' + params.toString();
    },

    /**
     * Share results (copy URL or native share)
     */
    async shareResults() {
        const url = this.generateShareURL();

        // Update URL without reload
        window.history.replaceState({}, '', url);

        // Try native share, fallback to clipboard
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'was-bleibt.at - Meine Berechnung',
                    text: `Haushaltskasse: ${document.getElementById('stickyTotal').textContent}`,
                    url: url
                });
            } catch (e) {
                // User cancelled or error - copy to clipboard instead
                this.copyToClipboard(url);
            }
        } else {
            this.copyToClipboard(url);
        }
    },

    /**
     * Copy text to clipboard with feedback
     */
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById('shareBtn');
            const originalTitle = btn.title;
            btn.title = 'Link kopiert!';
            btn.style.background = 'rgba(46, 125, 50, 0.8)';
            setTimeout(() => {
                btn.title = originalTitle;
                btn.style.background = '';
            }, 2000);
        });
    },

    /**
     * Update sticky bar values
     */
    updateStickyBar(totalHousehold, netIncome, benefits) {
        document.getElementById('stickyTotal').textContent = this.formatCurrency(totalHousehold);
        document.getElementById('stickyNet').textContent = this.formatCurrency(netIncome);
        document.getElementById('stickyBenefits').textContent = '+' + this.formatCurrency(benefits);
    },

    /**
     * Add a child to the list
     * @param {number} age - Initial age
     */
    addChild(age = 5) {
        const id = Date.now();
        this.children.push({
            id,
            age,
            inChildcare: false,
            fullDay: false
        });
        this.renderChildren();
    },

    /**
     * Remove a child from the list
     * @param {number} id - Child ID
     */
    removeChild(id) {
        this.children = this.children.filter(c => c.id !== id);
        this.renderChildren();
        this.updateChildCount();
        this.calculate();
    },

    /**
     * Remove the last child from the list (for - button)
     */
    removeLastChild() {
        if (this.children.length > 0) {
            this.children.pop();
            this.renderChildren();
            this.calculate();
        }
    },

    /**
     * Update child count display and show/hide children section
     */
    updateChildCount() {
        const countEl = document.getElementById('childCount');
        const sectionEl = document.getElementById('childrenSection');

        if (countEl) {
            countEl.textContent = this.children.length;
        }

        if (sectionEl) {
            sectionEl.style.display = this.children.length > 0 ? 'block' : 'none';
        }
    },

    /**
     * Update child age
     * @param {number} id - Child ID
     * @param {number} age - New age
     */
    updateChildAge(id, age) {
        const child = this.children.find(c => c.id === id);
        if (child) {
            child.age = parseInt(age) || 0;
        }
    },

    /**
     * Update childcare status
     * @param {number} id - Child ID
     * @param {boolean} inChildcare - Whether child is in childcare
     */
    updateChildcare(id, inChildcare) {
        const child = this.children.find(c => c.id === id);
        if (child) {
            child.inChildcare = inChildcare;
            if (!inChildcare) {
                child.fullDay = false;
            }
        }
        this.renderChildren();
    },

    /**
     * Update childcare type
     * @param {number} id - Child ID
     * @param {boolean} fullDay - Whether full-day care
     */
    updateChildcareType(id, fullDay) {
        const child = this.children.find(c => c.id === id);
        if (child) {
            child.fullDay = fullDay;
        }
    },

    /**
     * Render children list in the DOM
     */
    renderChildren() {
        const container = document.getElementById('childrenContainer');
        if (!container) return;

        container.innerHTML = this.children.map((child, index) => `
            <div class="child-card" data-id="${child.id}">
                <div class="child-card-header">
                    <span class="child-label">Kind ${index + 1}</span>
                    <input 
                        type="number" 
                        min="0" 
                        max="25" 
                        value="${child.age}" 
                        placeholder="Alter"
                        onchange="FormManager.updateChildAge(${child.id}, this.value); FormManager.calculate();"
                        class="child-age-input"
                    >
                    <span>Jahre</span>
                    <button type="button" class="child-remove" onclick="FormManager.removeChild(${child.id})" title="Kind entfernen">
                        ×
                    </button>
                </div>
                <div class="child-card-options">
                    <label class="childcare-checkbox">
                        <input 
                            type="checkbox" 
                            ${child.inChildcare ? 'checked' : ''}
                            onchange="FormManager.updateChildcare(${child.id}, this.checked); FormManager.calculate();"
                        >
                        In Kinderbetreuung
                    </label>
                    ${child.inChildcare ? `
                        <div class="childcare-type">
                            <label class="radio-label">
                                <input 
                                    type="radio" 
                                    name="childcare-${child.id}" 
                                    value="half"
                                    ${!child.fullDay ? 'checked' : ''}
                                    onchange="FormManager.updateChildcareType(${child.id}, false); FormManager.calculate();"
                                >
                                Halbtag
                            </label>
                            <label class="radio-label">
                                <input 
                                    type="radio" 
                                    name="childcare-${child.id}" 
                                    value="full"
                                    ${child.fullDay ? 'checked' : ''}
                                    onchange="FormManager.updateChildcareType(${child.id}, true); FormManager.calculate();"
                                >
                                Ganztag
                            </label>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    },

    /**
     * Show/hide partner income field based on family status
     * @param {string} status - Family status
     */
    updatePartnerIncomeVisibility(status) {
        const partnerGroup = document.getElementById('partnerIncomeGroup');
        if (partnerGroup) {
            partnerGroup.style.display = status === 'married' ? 'flex' : 'none';
        }
    },

    /**
     * Update housing cost label based on housing type
     * @param {string} type - Housing type
     */
    updateHousingLabel(type) {
        const label = document.getElementById('housingCostLabel');
        const group = document.getElementById('housingCostGroup');

        if (label) {
            switch (type) {
                case 'rent':
                    label.textContent = 'Monatliche Miete (Hauptmietzins)';
                    break;
                case 'loan':
                    label.textContent = 'Monatliche Kreditrate';
                    break;
                case 'owned':
                    label.textContent = 'Wohnkosten';
                    break;
            }
        }

        // Hide housing cost for owned properties without loan
        if (group) {
            group.style.display = type === 'owned' ? 'none' : 'flex';
        }
    },

    /**
     * Get current form values
     * @returns {object} Form data
     */
    getFormData() {
        const grossInput = document.getElementById('grossIncome');
        const partnerInput = document.getElementById('partnerIncome');
        const isYearly = grossInput?.dataset.period === 'yearly';

        // Get raw values
        let monthlyGross = parseFloat(grossInput?.value) || 0;
        let partnerIncome = parseFloat(partnerInput?.value) || 0;

        // Convert yearly to monthly if needed
        if (isYearly) {
            monthlyGross = monthlyGross / 14;
            partnerIncome = partnerIncome / 14;
        }

        return {
            monthlyGross: monthlyGross,
            familyStatus: document.getElementById('familyStatus')?.value || 'single',
            partnerIncome: partnerIncome,
            childrenAges: this.children.map(c => c.age),
            children: this.children,  // Full children data for childcare costs
            housingType: document.getElementById('housingType')?.value || 'rent',
            monthlyRent: parseFloat(document.getElementById('housingCost')?.value) || 0,
            apartmentSize: parseFloat(document.getElementById('apartmentSize')?.value) || 60,
            federalState: document.getElementById('federalState')?.value || 'vienna',
            wiedereinsteiger: document.getElementById('wiedereinsteiger')?.checked || false
        };
    },

    /**
     * Perform calculation and update results
     */
    calculate() {
        const formData = this.getFormData();

        // Calculate net income for primary earner
        const taxResult = TaxCalculator.calculateMonthlyNet(formData.monthlyGross);

        // Calculate net income for partner (if applicable)
        let partnerTaxResult = null;
        let combinedMonthlyNet = taxResult.net;

        if (formData.familyStatus === 'married' && formData.partnerIncome > 0) {
            partnerTaxResult = TaxCalculator.calculateMonthlyNet(formData.partnerIncome);
            combinedMonthlyNet = taxResult.net + partnerTaxResult.net;
        }

        // Calculate all benefits (using combined household net income)
        const benefits = BenefitsCalculator.calculateAllBenefits({
            ...formData,
            monthlyNet: taxResult.net,
            partnerNetIncome: partnerTaxResult ? partnerTaxResult.net : 0,
            combinedMonthlyNet: combinedMonthlyNet,
            annualTax: taxResult.annualTax
        });

        // Update summary cards
        document.getElementById('totalHousehold').textContent =
            this.formatCurrency(benefits.totalHouseholdIncome);
        document.getElementById('netIncome').textContent =
            this.formatCurrency(combinedMonthlyNet);
        document.getElementById('totalBenefits').textContent =
            this.formatCurrency(benefits.totalMonthlyBenefits);

        // Update breakdown table
        this.renderBreakdown(formData, taxResult, benefits, partnerTaxResult);

        // Update chart
        ChartManager.createChart('incomeChart', formData, formData.monthlyGross);

        // Update recommendations
        RecommendationsManager.generateRecommendations(formData, taxResult, benefits);

        // Update sticky bar
        this.updateStickyBar(benefits.totalHouseholdIncome, combinedMonthlyNet, benefits.totalMonthlyBenefits);
    },

    /**
     * Render detailed breakdown table
     * @param {object} formData - Form data
     * @param {object} taxResult - Tax calculation result
     * @param {object} benefits - Benefits calculation result
     * @param {object} partnerTaxResult - Partner tax calculation result (optional)
     */
    renderBreakdown(formData, taxResult, benefits, partnerTaxResult = null) {
        const container = document.getElementById('breakdownTable');
        if (!container) return;

        const hasPartner = partnerTaxResult && formData.partnerIncome > 0;
        const rows = [];

        // Primary earner income
        rows.push({
            icon: '',
            label: hasPartner ? 'Bruttoeinkommen (Person 1)' : 'Bruttoeinkommen',
            value: formData.monthlyGross,
            color: '#1d9bf0'
        });
        rows.push({
            icon: '',
            label: hasPartner ? 'Sozialversicherung (Person 1)' : 'Sozialversicherung',
            value: -taxResult.socialSecurity.total,
            color: '#dc2626',
            negative: true
        });
        rows.push({
            icon: '',
            label: hasPartner ? 'Lohnsteuer (Person 1)' : 'Lohnsteuer',
            value: -taxResult.monthlyTax,
            color: '#dc2626',
            negative: true
        });

        // Partner income (if applicable)
        if (hasPartner) {
            rows.push({
                icon: '',
                label: 'Bruttoeinkommen (Partner:in)',
                value: formData.partnerIncome,
                color: '#1d9bf0'
            });
            rows.push({
                icon: '',
                label: 'Sozialversicherung (Partner:in)',
                value: -partnerTaxResult.socialSecurity.total,
                color: '#dc2626',
                negative: true
            });
            rows.push({
                icon: '',
                label: 'Lohnsteuer (Partner:in)',
                value: -partnerTaxResult.monthlyTax,
                color: '#dc2626',
                negative: true
            });
        }

        // Add tax credits if applicable
        if (benefits.familienbonus.usedBonus > 0) {
            rows.push({
                icon: '',
                label: 'Familienbonus Plus (Steuerersparnis)',
                value: benefits.familienbonus.usedBonus / 12,
                color: '#00a67e',
                isCredit: true
            });
        }

        // Net income subtotal
        const combinedNet = hasPartner ? taxResult.net + partnerTaxResult.net : taxResult.net;
        rows.push({
            icon: '',
            label: hasPartner ? 'Haushaltsnetto (beide)' : 'Nettoeinkommen',
            value: combinedNet,
            color: '#2e7d32',
            isSubtotal: true
        });

        // Add benefits
        if (benefits.familienbeihilfe.total > 0) {
            rows.push({
                icon: '',
                label: `Familienbeihilfe (${benefits.familienbeihilfe.numChildren} Kind${benefits.familienbeihilfe.numChildren > 1 ? 'er' : ''})`,
                value: benefits.familienbeihilfe.total,
                color: '#1565c0'
            });
        }

        if (benefits.wohnbeihilfe.amount > 0) {
            const stateNames = {
                'vienna': 'Wien',
                'steiermark': 'Steiermark',
                'upperAustria': 'Oberösterreich',
                'lowerAustria': 'Niederösterreich',
                'salzburg': 'Salzburg',
                'tyrol': 'Tirol',
                'vorarlberg': 'Vorarlberg',
                'carinthia': 'Kärnten',
                'burgenland': 'Burgenland'
            };
            const stateName = stateNames[formData.federalState] || formData.federalState;
            const wbLabel = formData.federalState === 'steiermark' ?
                'Wohnunterstützung' : 'Wohnbeihilfe';
            rows.push({
                icon: '',
                label: `${wbLabel} (${stateName})`,
                value: benefits.wohnbeihilfe.amount,
                color: '#f9a825'
            });
        }

        if (benefits.familienbonus.monthlyKindermehrbetrag > 0) {
            rows.push({
                icon: '',
                label: 'Kindermehrbetrag',
                value: benefits.familienbonus.monthlyKindermehrbetrag,
                color: '#6a1b9a'
            });
        }

        if (benefits.sozialhilfe.amount > 0) {
            rows.push({
                icon: '',
                label: 'Sozialhilfe/Mindestsicherung',
                value: benefits.sozialhilfe.amount,
                color: '#c62828'
            });
        }

        // Childcare costs (negative)
        if (benefits.childcareCosts && benefits.childcareCosts.total > 0) {
            rows.push({
                icon: '',
                label: `Kinderbetreuung (${benefits.childcareCosts.breakdown.length} Kind${benefits.childcareCosts.breakdown.length > 1 ? 'er' : ''})`,
                value: -benefits.childcareCosts.total,
                color: '#ff6f00',
                negative: true
            });
        }

        // Total
        rows.push({
            icon: '',
            label: 'Haushaltskasse gesamt',
            value: benefits.totalHouseholdIncome,
            color: '#1d9bf0',
            isTotal: true
        });

        container.innerHTML = rows.map(row => `
            <div class="breakdown-row ${row.negative ? 'negative' : ''} ${row.isTotal ? 'total' : ''}" 
                 style="--row-color: ${row.color}">
                <span class="row-label">
                    <span class="row-icon" style="background: ${row.color}"></span>
                    ${row.icon} ${row.label}
                </span>
                <span class="row-value">
                    ${row.negative ? '' : (row.value < 0 ? '' : '')}${this.formatCurrency(row.value)}
                </span>
            </div>
        `).join('');
    },

    /**
     * Format number as currency
     * @param {number} value - Value to format
     * @returns {string} Formatted currency
     */
    formatCurrency(value) {
        return new Intl.NumberFormat('de-AT', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.round(value));
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormManager;
}
