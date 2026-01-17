/**
 * UI State Module
 * Handles status toggles, period toggles, sticky bar, and UI defaults
 */

const UIState = {
    // Default values for single vs married households
    defaults: {
        single: {
            rent: 700,
            apartmentSize: 60
        },
        married: {
            partnerIncome: 1800,
            rent: 900,
            apartmentSize: 75
        }
    },

    /**
     * Handle status card toggle (Alleinstehend / Verheiratet)
     */
    handleStatusToggle(status) {
        // Update visual state
        document.querySelectorAll('.status-card').forEach(card => {
            card.classList.remove('active');
        });
        document.querySelector(`[data-status="${status}"]`)?.classList.add('active');

        // Update hidden field
        document.getElementById('familyStatus').value = status;

        // Get input elements
        const income2Group = document.getElementById('income2Group');
        const partnerIncomeInput = document.getElementById('partnerIncome');
        const housingCostInput = document.getElementById('housingCost');
        const apartmentSizeInput = document.getElementById('apartmentSize');

        if (status === 'married') {
            income2Group.style.display = 'block';

            // Set defaults for married (only if at single defaults)
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

            // Reset to single defaults if at married defaults
            if (parseFloat(housingCostInput.value) === this.defaults.married.rent) {
                housingCostInput.value = this.defaults.single.rent;
            }
            if (parseFloat(apartmentSizeInput.value) === this.defaults.married.apartmentSize) {
                apartmentSizeInput.value = this.defaults.single.apartmentSize;
            }
        }

        if (typeof FormManager !== 'undefined') FormManager.calculate();
    },

    /**
     * Handle period toggle (monthly/yearly)
     */
    handlePeriodToggle(period) {
        const isYearly = period === 'yearly';

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
        const wasYearly = income1.dataset.period === 'yearly';

        if (wasYearly !== isYearly) {
            if (isYearly) {
                income1.value = Math.round(parseFloat(income1.value || 0) * 14);
                income2.value = Math.round(parseFloat(income2.value || 0) * 14);
            } else {
                income1.value = Math.round(parseFloat(income1.value || 0) / 14);
                income2.value = Math.round(parseFloat(income2.value || 0) / 14);
            }
        }

        income1.dataset.period = period;
        income2.dataset.period = period;

        if (typeof FormManager !== 'undefined') FormManager.calculate();
    },

    /**
     * Initialize sticky result bar
     */
    initStickyBar() {
        const stickyBar = document.getElementById('stickyResultBar');
        const inputSection = document.querySelector('.input-section');
        const header = document.querySelector('.header');

        if (!stickyBar || !inputSection) return;

        let hasInteracted = false;

        const showStickyBar = () => {
            if (!hasInteracted) hasInteracted = true;

            if (header) {
                const headerBottom = header.getBoundingClientRect().bottom;
                if (headerBottom < 0) {
                    stickyBar.classList.add('visible');
                }
            } else {
                stickyBar.classList.add('visible');
            }
        };

        inputSection.addEventListener('click', showStickyBar);
        inputSection.addEventListener('focusin', showStickyBar);

        window.addEventListener('scroll', () => {
            if (!hasInteracted) return;

            const headerBottom = header ? header.getBoundingClientRect().bottom : -1;

            if (headerBottom > 0) {
                stickyBar.classList.remove('visible');
            } else {
                stickyBar.classList.add('visible');
            }
        });
    },

    /**
     * Update sticky bar values
     */
    updateStickyBar(totalHousehold, netIncome, benefits) {
        const formatCurrency = (value) => {
            return new Intl.NumberFormat('de-AT', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(value);
        };

        document.getElementById('stickyTotal').textContent = formatCurrency(totalHousehold);
        document.getElementById('stickyNet').textContent = formatCurrency(netIncome);
        document.getElementById('stickyBenefits').textContent = '+' + formatCurrency(benefits);
    },

    /**
     * Update housing cost label based on housing type
     */
    updateHousingLabel(type) {
        const label = document.querySelector('label[for="housingCost"]');
        if (!label) return;

        const labels = {
            'rent': 'Monatliche Miete (Hauptmietzins)',
            'coop': 'Monatliche Miete (Genossenschaft)',
            'own': 'Monatliche Kreditrate'
        };

        label.textContent = labels[type] || labels['rent'];
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIState;
}
