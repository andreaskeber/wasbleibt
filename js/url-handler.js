/**
 * URL Handler Module
 * Manages URL parameters and sharing functionality
 */

const URLHandler = {
    /**
     * Load form values from URL parameters
     */
    loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        if (params.toString() === '') return; // No params to load

        console.log('Loading from URL params:', params.toString());

        // Gross income
        if (params.has('brutto')) {
            const grossInput = document.getElementById('grossIncome');
            if (grossInput) grossInput.value = params.get('brutto');
        }

        // Family status
        if (params.has('status')) {
            const status = params.get('status');
            document.getElementById('familyStatus').value = status;

            // Update status cards visually
            document.querySelectorAll('.status-card').forEach(card => {
                card.classList.remove('active');
            });
            document.querySelector(`[data-status="${status}"]`)?.classList.add('active');

            // Show partner income if married
            const income2Group = document.getElementById('income2Group');
            if (income2Group) {
                income2Group.style.display = status === 'married' ? 'block' : 'none';
            }
        }

        // Partner income
        if (params.has('partner')) {
            const partnerInput = document.getElementById('partnerIncome');
            if (partnerInput) partnerInput.value = params.get('partner');
        }

        // Rent/Housing cost
        if (params.has('miete')) {
            const housingInput = document.getElementById('housingCost');
            if (housingInput) housingInput.value = params.get('miete');
        }

        // Apartment size
        if (params.has('groesse')) {
            const sizeInput = document.getElementById('apartmentSize');
            if (sizeInput) sizeInput.value = params.get('groesse');
        }

        // Federal state
        if (params.has('bundesland')) {
            const stateInput = document.getElementById('federalState');
            if (stateInput) stateInput.value = params.get('bundesland');
        }

        // Children (format: kinder=5,7,12)
        if (params.has('kinder')) {
            const ages = params.get('kinder').split(',').map(a => parseInt(a)).filter(a => !isNaN(a));
            ages.forEach(age => {
                if (typeof ChildrenManager !== 'undefined') {
                    ChildrenManager.addChild(age);
                }
            });
            if (typeof ChildrenManager !== 'undefined') {
                ChildrenManager.updateChildCount();
            }
        }

        // Trigger calculation after loading
        setTimeout(() => {
            if (typeof FormManager !== 'undefined') {
                FormManager.calculate();
            }
        }, 100);
    },

    /**
     * Generate URL with current parameters
     */
    generateShareURL() {
        const params = new URLSearchParams();

        // Get current form values
        const grossIncome = document.getElementById('grossIncome')?.value || 0;
        const familyStatus = document.getElementById('familyStatus')?.value || 'single';
        const partnerIncome = document.getElementById('partnerIncome')?.value || 0;
        const housingCost = document.getElementById('housingCost')?.value || 0;
        const apartmentSize = document.getElementById('apartmentSize')?.value || 0;
        const federalState = document.getElementById('federalState')?.value || 'vienna';

        params.set('brutto', grossIncome);

        if (familyStatus !== 'single') {
            params.set('status', familyStatus);
        }
        if (parseFloat(partnerIncome) > 0) {
            params.set('partner', partnerIncome);
        }
        if (parseFloat(housingCost) > 0) {
            params.set('miete', housingCost);
        }
        if (parseFloat(apartmentSize) > 0) {
            params.set('groesse', apartmentSize);
        }
        if (federalState !== 'vienna') {
            params.set('bundesland', federalState);
        }

        // Children
        if (typeof ChildrenManager !== 'undefined') {
            const ages = ChildrenManager.getChildrenAges();
            if (ages.length > 0) {
                params.set('kinder', ages.join(','));
            }
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
                    text: `Haushaltskasse: ${document.getElementById('stickyTotal')?.textContent || ''}`,
                    url: url
                });
            } catch (e) {
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
            if (!btn) return;

            const originalTitle = btn.title;
            btn.title = 'Link kopiert!';
            btn.style.background = 'rgba(46, 125, 50, 0.8)';
            setTimeout(() => {
                btn.title = originalTitle;
                btn.style.background = '';
            }, 2000);
        });
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = URLHandler;
}
