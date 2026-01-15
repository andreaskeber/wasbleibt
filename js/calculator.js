/**
 * Austrian Tax Calculator (2025)
 * Core calculation logic for income tax and social security
 */

const TaxCalculator = {
    // 2025 Austrian income tax brackets (annual income)
    TAX_BRACKETS_2025: [
        { min: 0, max: 13308, rate: 0 },
        { min: 13308, max: 21617, rate: 0.20 },
        { min: 21617, max: 35836, rate: 0.30 },
        { min: 35836, max: 69166, rate: 0.40 },
        { min: 69166, max: 103072, rate: 0.48 },
        { min: 103072, max: 1000000, rate: 0.50 },
        { min: 1000000, max: Infinity, rate: 0.55 }
    ],

    // Social security contribution rates (employee share)
    SOCIAL_SECURITY: {
        health: 0.0387,          // Krankenversicherung
        pension: 0.1025,         // Pensionsversicherung
        unemployment: 0.0295,    // Arbeitslosenversicherung
        other: 0.01,             // Wohnbauförderung, AK, etc.
        total: 0.1807,           // Total employee contribution
        maxMonthlyBase: 6450,    // Höchstbeitragsgrundlage 2025
        minMonthlyBase: 1500     // Mindestbeitragsgrundlage 2025
    },

    // Geringfügigkeitsgrenze 2025
    MARGINAL_INCOME_THRESHOLD: 551.10,

    /**
     * Calculate annual income tax using progressive brackets
     * @param {number} annualGross - Annual gross income
     * @returns {number} Annual income tax
     */
    calculateIncomeTax(annualGross) {
        let tax = 0;
        let remainingIncome = annualGross;

        for (const bracket of this.TAX_BRACKETS_2025) {
            if (remainingIncome <= 0) break;

            const taxableInBracket = Math.min(
                Math.max(0, annualGross - bracket.min),
                bracket.max - bracket.min
            );

            if (annualGross > bracket.min) {
                const incomeInBracket = Math.min(
                    annualGross - bracket.min,
                    bracket.max - bracket.min
                );
                tax += incomeInBracket * bracket.rate;
            }
        }

        // Recalculate using correct progressive formula
        tax = 0;
        for (let i = 0; i < this.TAX_BRACKETS_2025.length; i++) {
            const bracket = this.TAX_BRACKETS_2025[i];
            if (annualGross <= bracket.min) break;
            
            const taxableAmount = Math.min(annualGross, bracket.max) - bracket.min;
            if (taxableAmount > 0) {
                tax += taxableAmount * bracket.rate;
            }
        }

        return Math.max(0, tax);
    },

    /**
     * Calculate monthly social security contributions
     * @param {number} monthlyGross - Monthly gross salary
     * @returns {object} Breakdown of social security contributions
     */
    calculateSocialSecurity(monthlyGross) {
        // Cap at maximum contribution base
        const effectiveBase = Math.min(monthlyGross, this.SOCIAL_SECURITY.maxMonthlyBase);
        
        // Below marginal threshold = no social security
        if (monthlyGross < this.MARGINAL_INCOME_THRESHOLD) {
            return {
                health: 0,
                pension: 0,
                unemployment: 0,
                other: 0,
                total: 0
            };
        }

        return {
            health: effectiveBase * this.SOCIAL_SECURITY.health,
            pension: effectiveBase * this.SOCIAL_SECURITY.pension,
            unemployment: effectiveBase * this.SOCIAL_SECURITY.unemployment,
            other: effectiveBase * this.SOCIAL_SECURITY.other,
            total: effectiveBase * this.SOCIAL_SECURITY.total
        };
    },

    /**
     * Calculate monthly net income from gross
     * @param {number} monthlyGross - Monthly gross salary (14x yearly)
     * @param {object} options - Additional options (tax credits, etc.)
     * @returns {object} Detailed breakdown
     */
    calculateMonthlyNet(monthlyGross, options = {}) {
        // Austria has 14 monthly payments (incl. Urlaubs- and Weihnachtsgeld)
        // For monthly calculation, we use the standard monthly view
        
        // Annual gross (14 payments)
        const annualGross = monthlyGross * 14;
        
        // Social security (monthly)
        const socialSecurity = this.calculateSocialSecurity(monthlyGross);
        
        // Calculate taxable income (annual)
        // Social security is deducted before tax
        const annualSocialSecurity = socialSecurity.total * 12 + 
            (monthlyGross <= this.SOCIAL_SECURITY.maxMonthlyBase ? 
                socialSecurity.total * 2 : // 13th and 14th month
                this.SOCIAL_SECURITY.maxMonthlyBase * this.SOCIAL_SECURITY.total * 2);
        
        const taxableIncome = annualGross - annualSocialSecurity;
        
        // Calculate income tax
        let annualTax = this.calculateIncomeTax(taxableIncome);
        
        // Apply tax credits
        const taxCredits = options.taxCredits || 0;
        annualTax = Math.max(0, annualTax - taxCredits);
        
        // Monthly tax
        const monthlyTax = annualTax / 12;
        
        // Net income
        const monthlyNet = monthlyGross - socialSecurity.total - monthlyTax;
        
        return {
            gross: monthlyGross,
            annualGross: annualGross,
            socialSecurity: socialSecurity,
            monthlyTax: monthlyTax,
            annualTax: annualTax,
            taxCredits: taxCredits,
            net: Math.max(0, monthlyNet),
            effectiveTaxRate: annualGross > 0 ? (annualTax / annualGross) * 100 : 0,
            effectiveTotalRate: annualGross > 0 ? 
                ((annualTax + annualSocialSecurity) / annualGross) * 100 : 0
        };
    },

    /**
     * Calculate net for a range of gross incomes
     * Used for generating the chart data
     * @param {number} maxGross - Maximum gross to calculate
     * @param {number} step - Step size
     * @param {object} options - Calculation options
     * @returns {Array} Array of calculation results
     */
    calculateRange(maxGross = 6000, step = 100, options = {}) {
        const results = [];
        for (let gross = 0; gross <= maxGross; gross += step) {
            results.push({
                gross: gross,
                ...this.calculateMonthlyNet(gross, options)
            });
        }
        return results;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaxCalculator;
}
