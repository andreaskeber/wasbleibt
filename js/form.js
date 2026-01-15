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
        // Add child button
        document.getElementById('addChildBtn')?.addEventListener('click', () => {
            this.addChild();
        });

        // Family status change (show/hide partner income)
        document.getElementById('familyStatus')?.addEventListener('change', (e) => {
            this.updatePartnerIncomeVisibility(e.target.value);
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

        // No initial children - start with empty form

        // Initial calculation
        this.calculate();
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
        this.calculate();
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
        return {
            monthlyGross: parseFloat(document.getElementById('grossIncome')?.value) || 0,
            familyStatus: document.getElementById('familyStatus')?.value || 'single',
            partnerIncome: parseFloat(document.getElementById('partnerIncome')?.value) || 0,
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
