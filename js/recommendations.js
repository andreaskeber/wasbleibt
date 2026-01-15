/**
 * Recommendations engine for Austrian Tax Calculator
 * Analyzes income situation and provides advice
 */

const RecommendationsManager = {
    /**
     * Generate recommendations based on calculation results
     * @param {object} formData - User's input data
     * @param {object} taxResult - Tax calculation result
     * @param {object} benefits - Benefits calculation result
     */
    generateRecommendations(formData, taxResult, benefits) {
        const container = document.getElementById('recommendationsContent');
        if (!container) return;

        const recommendations = [];

        // 1. Find trap zones (where earning more doesn't help)
        const trapZones = ChartManager.findTrapZones(formData);
        const currentGross = formData.monthlyGross;

        // Check if user is near a trap zone
        for (const trap of trapZones) {
            if (currentGross >= trap.fromGross - 200 && currentGross <= trap.toGross + 200) {
                recommendations.push({
                    type: 'warning',
                    icon: '',
                    title: 'Achtung: Grenzbereich',
                    text: `Bei einem Bruttoeinkommen zwischen €${trap.fromGross} und €${trap.toGross} kann es sein, ` +
                        `dass mehr Arbeit nicht zu mehr Haushalt führt. Der Unterschied beträgt ca. €${Math.round(trap.difference)}/Monat.`
                });
            }
        }

        // 2. Wohnbeihilfe eligibility
        const wbName = formData.federalState === 'steiermark' ? 'Wohnunterstützung' : 'Wohnbeihilfe';
        const stateOffices = {
            'vienna': 'MA 50 (Wien)',
            'steiermark': 'Land Steiermark',
            'upperAustria': 'Land Oberösterreich',
            'lowerAustria': 'Land Niederösterreich',
            'salzburg': 'Land Salzburg',
            'tyrol': 'Land Tirol',
            'vorarlberg': 'Land Vorarlberg',
            'carinthia': 'Land Kärnten',
            'burgenland': 'Land Burgenland'
        };
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
        const wbOffice = stateOffices[formData.federalState] || 'zuständige Landesregierung';
        const wbRegion = stateNames[formData.federalState] || formData.federalState;

        if (!benefits.wohnbeihilfe.eligible && formData.monthlyRent > 0) {
            const limit = benefits.wohnbeihilfe.incomeLimit;
            if (limit && taxResult.net > limit) {
                const difference = taxResult.net - limit;
                recommendations.push({
                    type: 'info',
                    icon: '',
                    title: `${wbName} nicht berechtigt`,
                    text: `Ihr Nettoeinkommen (€${Math.round(taxResult.net)}) liegt €${Math.round(difference)} über der Einkommensgrenze ` +
                        `für ${wbName} in ${wbRegion} (€${Math.round(limit)} für ${benefits.householdSize} Personen).`
                });
            }
        } else if (benefits.wohnbeihilfe.eligible) {
            recommendations.push({
                type: 'positive',
                icon: '',
                title: `${wbName} möglich`,
                text: `Sie könnten Anspruch auf ca. €${Math.round(benefits.wohnbeihilfe.amount)}/Monat ${wbName} haben. ` +
                    `Bitte stellen Sie einen Antrag bei ${wbOffice}.`
            });
        }

        // 3. Familienbonus Plus optimization
        if (benefits.familienbonus.maxBonus > 0) {
            const usedPercent = (benefits.familienbonus.usedBonus / benefits.familienbonus.maxBonus * 100).toFixed(0);

            if (benefits.familienbonus.usedBonus < benefits.familienbonus.maxBonus * 0.5) {
                recommendations.push({
                    type: 'info',
                    icon: '',
                    title: 'Familienbonus Plus nicht voll ausgeschöpft',
                    text: `Sie nutzen nur ${usedPercent}% des möglichen Familienbonus Plus (€${Math.round(benefits.familienbonus.usedBonus)}/Jahr ` +
                        `von max. €${benefits.familienbonus.maxBonus}/Jahr). Der Kindermehrbetrag gleicht einen Teil davon aus.`
                });
            } else if (usedPercent >= 100) {
                recommendations.push({
                    type: 'positive',
                    icon: '',
                    title: 'Familienbonus Plus vollständig genutzt',
                    text: `Sie nutzen den vollen Familienbonus Plus von €${benefits.familienbonus.maxBonus}/Jahr.`
                });
            }
        }

        // 4. Alleinverdiener check
        if (formData.familyStatus === 'married' && formData.childrenAges.length > 0) {
            if (benefits.avab.eligible) {
                recommendations.push({
                    type: 'positive',
                    icon: '',
                    title: 'Alleinverdienerabsetzbetrag',
                    text: `Sie haben Anspruch auf €${Math.round(benefits.avab.annualCredit)}/Jahr Alleinverdienerabsetzbetrag.`
                });
            } else {
                const limit = BenefitsCalculator.ALLEINVERDIENER.partnerIncomeLimit;
                recommendations.push({
                    type: 'info',
                    icon: '',
                    title: 'Alleinverdienerabsetzbetrag',
                    text: `Wenn das Einkommen Ihrer Partner:in unter €${limit}/Jahr liegt, hätten Sie Anspruch auf den Alleinverdienerabsetzbetrag.`
                });
            }
        }

        // 5. Effective tax rate insight
        if (taxResult.effectiveTotalRate > 0) {
            recommendations.push({
                type: 'info',
                icon: '',
                title: 'Effektive Abgabenquote',
                text: `Ihre effektive Abgabenquote (Lohnsteuer + SV) beträgt ${taxResult.effectiveTotalRate.toFixed(1)}%. ` +
                    `Die Lohnsteuer alleine macht ${taxResult.effectiveTaxRate.toFixed(1)}% aus.`
            });
        }

        // 6. Check if working less might be beneficial
        const optimalPoint = this.findOptimalWorkingPoint(formData, benefits);
        if (optimalPoint && Math.abs(optimalPoint.gross - currentGross) > 200) {
            if (optimalPoint.gross < currentGross && optimalPoint.difference < 100) {
                recommendations.push({
                    type: 'warning',
                    icon: '',
                    title: 'Weniger arbeiten = fast gleich viel verdienen?',
                    text: `Bei €${optimalPoint.gross} brutto hätten Sie nur €${Math.round(optimalPoint.difference)} weniger ` +
                        `in der Haushaltskasse - das entspricht einem "Mehrwert" von nur €${(optimalPoint.difference / (currentGross - optimalPoint.gross) * 100).toFixed(0)} Cent pro Euro zusätzlichem Brutto.`
                });
            }
        }

        // Render recommendations
        if (recommendations.length === 0) {
            container.innerHTML = `
                <div class="recommendation-card positive">
                    <span class="rec-icon"></span>
                    <div class="rec-content">
                        <h4>Alles im grünen Bereich</h4>
                        <p>Keine besonderen Hinweise für Ihre aktuelle Situation.</p>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = recommendations.map(rec => `
                <div class="recommendation-card ${rec.type}">
                    <span class="rec-icon">${rec.icon}</span>
                    <div class="rec-content">
                        <h4>${rec.title}</h4>
                        <p>${rec.text}</p>
                    </div>
                </div>
            `).join('');
        }
    },

    /**
     * Find optimal working point (where household income per euro is best)
     * @param {object} formData - User's input data
     * @param {object} currentBenefits - Current benefits
     * @returns {object|null} Optimal point info
     */
    findOptimalWorkingPoint(formData, currentBenefits) {
        const currentGross = formData.monthlyGross;
        const currentTotal = currentBenefits.totalHouseholdIncome;

        // Check points below current income
        const checkPoints = [
            currentGross - 500,
            currentGross - 1000,
            currentGross - 1500
        ].filter(p => p >= 0);

        let bestPoint = null;
        let minDifferencePerEuro = Infinity;

        for (const testGross of checkPoints) {
            const taxResult = TaxCalculator.calculateMonthlyNet(testGross);
            const benefits = BenefitsCalculator.calculateAllBenefits({
                ...formData,
                monthlyGross: testGross,
                monthlyNet: taxResult.net,
                annualTax: taxResult.annualTax
            });

            const grossDifference = currentGross - testGross;
            const totalDifference = currentTotal - benefits.totalHouseholdIncome;
            const differencePerEuro = grossDifference > 0 ? totalDifference / grossDifference : Infinity;

            if (differencePerEuro < minDifferencePerEuro && differencePerEuro < 0.5) {
                minDifferencePerEuro = differencePerEuro;
                bestPoint = {
                    gross: testGross,
                    total: benefits.totalHouseholdIncome,
                    difference: totalDifference,
                    differencePerEuro: differencePerEuro
                };
            }
        }

        return bestPoint;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecommendationsManager;
}
