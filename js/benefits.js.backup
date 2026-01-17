/**
 * Austrian Social Benefits Calculator (2025)
 * Familienbeihilfe, Wohnbeihilfe (Vienna), tax credits, etc.
 */

const BenefitsCalculator = {
    // Familienbeihilfe 2025 (monthly amounts per child by age)
    FAMILIENBEIHILFE: {
        age0to2: 138.40,
        age3to9: 148.00,
        age10to18: 171.80,
        age19plus: 200.40
    },

    // Kinderabsetzbetrag 2025 (monthly per child)
    KINDERABSETZBETRAG: 70.90,

    // Geschwisterstaffelung (sibling bonus per child)
    SIBLING_BONUS: {
        2: 8.60,
        3: 21.10,
        4: 32.10,
        5: 38.90,
        6: 43.40,
        7: 63.10  // 7 or more
    },

    // Familienbonus Plus 2025 (annual tax credit)
    FAMILIENBONUS_PLUS: {
        under18: 2000,  // per year
        over18: 700     // per year (if still in education)
    },

    // Kindermehrbetrag 2025 (for low income)
    KINDERMEHRBETRAG: 700,  // per year per child

    // Alleinverdiener/Alleinerzieherabsetzbetrag 2025
    ALLEINVERDIENER: {
        oneChild: 601,
        twoChildren: 813,
        additionalChild: 268,
        partnerIncomeLimit: 7284  // annual
    },

    // Wohnbeihilfe Vienna 2025
    WOHNBEIHILFE_VIENNA: {
        // Income limits (net monthly)
        incomeLimits: {
            1: 1693.60,
            2: 2030.00,
            3: 2157.60,
            4: 2450.00,
            5: 2750.00
        },
        // Appropriate apartment size (m²)
        appropriateSize: {
            1: 60,
            2: 75,
            base: 75,
            perAdditional: 10
        },
        // Maximum housing cost rate per m²
        maxRatePerSqm: 4.50,
        // Minimum housing cost covered by household (% of income)
        minHousingCostPercent: 0.25
    },

    // Wohnunterstützung Steiermark 2025
    WOHNBEIHILFE_STEIERMARK: {
        // Income limits for 100% max benefit (net monthly)
        incomeLimits: {
            1: 1270.00,
            2: 1969.10,
            3: 2461.30,
            4: 2658.20,
            5: 2855.20,
            6: 2953.60,
            7: 3052.00
        },
        // Weighting factors for income calculation
        weightingFactors: {
            household: 0.5,
            adult: 0.5,
            minor: 0.3,
            disabled: 0.8
        },
        // Maximum rent subsidy rates
        maxRentSubsidy: {
            1: 250,
            2: 350,
            3: 450,
            4: 500,
            5: 550
        },
        // Reasonable housing cost percent of income
        minHousingCostPercent: 0.20
    },

    // Wohnbeihilfe Oberösterreich 2025
    WOHNBEIHILFE_UPPER_AUSTRIA: {
        // Income limits (with Teuerungsfreibetrag) net monthly
        incomeLimits: {
            1: 1451.40,
            2: 2228.60,
            3: 2600.00,
            4: 2900.00,
            5: 3200.00
        },
        maxRatePerSqm: 3.70,
        maxBenefit: 300,
        sockelbetrag: 580,
        minHousingCostPercent: 0.20
    },

    // Wohnbeihilfe Niederösterreich 2025
    WOHNBEIHILFE_LOWER_AUSTRIA: {
        // Income limits net monthly (estimated from formulas)
        incomeLimits: {
            1: 1500.00,
            2: 2100.00,
            3: 2500.00,
            4: 2800.00,
            5: 3100.00
        },
        maxRatePerSqm: 4.00,
        maxBenefit: 280,
        minHousingCostPercent: 0.25
    },

    // Wohnbeihilfe Salzburg 2025
    WOHNBEIHILFE_SALZBURG: {
        // Income limits net monthly
        incomeLimits: {
            1: 1400.00,
            2: 2000.00,
            3: 2400.00,
            4: 2700.00,
            5: 3000.00
        },
        maxRatePerSqm: 12.45,  // City of Salzburg
        maxRatePerSqmRural: 11.06,  // Rural areas
        maxBenefit: 350,
        minHousingCostPercent: 0.25
    },

    // Wohnbeihilfe Tirol 2025
    WOHNBEIHILFE_TYROL: {
        // Income limits net monthly
        incomeLimits: {
            1: 1400.00,
            2: 2100.00,
            3: 2500.00,
            4: 2800.00,
            5: 3100.00
        },
        maxRatePerSqm: 4.50,
        maxBenefit: 300,
        minHousingCostPercent: 0.20
    },

    // Wohnbeihilfe Vorarlberg 2025
    WOHNBEIHILFE_VORARLBERG: {
        // Income limits net monthly
        incomeLimits: {
            1: 1500.00,
            2: 2200.00,
            3: 2600.00,
            4: 3000.00,
            5: 3300.00
        },
        maxRatePerSqm: 5.00,
        maxBenefit: 350,
        vermoegensfreibetrag: 15000,  // Asset allowance
        minHousingCostPercent: 0.25
    },

    // Wohnbeihilfe Kärnten 2025 (Wohnbeihilfe Neu)
    WOHNBEIHILFE_CARINTHIA: {
        // Income limits net monthly (base, +200€ per child)
        incomeLimits: {
            1: 1800.00,
            2: 2200.00,
            3: 2400.00,
            4: 2600.00,
            5: 2800.00
        },
        childBonus: 200,  // Additional income allowance per child
        maxRatePerSqm: 4.00,
        maxBenefit: 500,  // Highest in Austria!
        betriebskostenPerSqm: 2.50,
        appropriateSize: {
            1: 50,
            perAdditional: 10
        },
        minHousingCostPercent: 0.30,  // 30% up to €1000-1200 income
        noContributionBelow: 1000  // No contribution if income below €1000
    },

    // Wohnbeihilfe Burgenland 2025
    WOHNBEIHILFE_BURGENLAND: {
        // Income limits net monthly (estimated)
        incomeLimits: {
            1: 1400.00,
            2: 2000.00,
            3: 2400.00,
            4: 2700.00,
            5: 3000.00
        },
        maxRatePerSqm: 5.00,
        maxBenefit: 250,
        minBenefit: 10,  // Minimum €10/month to be paid
        minHousingCostPercent: 0.25
    },

    // Sozialhilfe/Mindestsicherung 2025 (Vienna)
    SOZIALHILFE: {
        single: 1209,
        couple: 1693,
        childSupplement: 326.43,  // Vienna specific
        housingSupplementRate: 0.30  // up to 30% additional for housing
    },

    // Kinderbetreuungskosten 2024/2025 (monthly, full-day care)
    CHILDCARE_COSTS: {
        vienna: {
            halfDay: 0,
            fullDay: 0,
            meals: 72,  // ~€3.60 per day * 20 days
            name: 'Wien'
        },
        burgenland: {
            halfDay: 0,
            fullDay: 0,
            meals: 70,
            name: 'Burgenland'
        },
        carinthia: {
            halfDay: 0,
            fullDay: 0,
            meals: 75,  // Average €60-85/month
            name: 'Kärnten'
        },
        steiermark: {
            halfDay: 0,
            fullDay: 286,  // Average 7-8h care
            meals: 110,  // €5.50 * 20 days
            name: 'Steiermark'
        },
        upperAustria: {
            halfDay: 0,
            fullDay: 73,
            meals: 70,  // Average social scale
            name: 'Oberösterreich'
        },
        lowerAustria: {
            halfDay: 0,
            fullDay: 75,  // Average afternoon care
            meals: 64,  // €3.20 * 20 days
            name: 'Niederösterreich'
        },
        tyrol: {
            halfDay: 0,
            fullDay: 36,  // Average additional hours
            meals: 88,  // €4.40 * 20 days
            name: 'Tirol'
        },
        salzburg: {
            halfDay: 0,
            fullDay: 64,  // Public kindergarten average
            meals: 80,  // Average
            name: 'Salzburg'
        },
        vorarlberg: {
            halfDay: 0,
            fullDay: 46,  // Flat rate for Kleinkinder
            meals: 140,  // €6.99 * 20 days
            name: 'Vorarlberg'
        }
    },

    /**
     * Get Familienbeihilfe amount based on child age
     * @param {number} age - Child's age
     * @returns {number} Monthly amount
     */
    getFamilienbeihilfeByAge(age) {
        if (age < 3) return this.FAMILIENBEIHILFE.age0to2;
        if (age < 10) return this.FAMILIENBEIHILFE.age3to9;
        if (age < 19) return this.FAMILIENBEIHILFE.age10to18;
        return this.FAMILIENBEIHILFE.age19plus;
    },

    /**
     * Calculate total Familienbeihilfe for all children
     * @param {Array<number>} childrenAges - Array of children's ages
     * @returns {object} Monthly breakdown
     */
    calculateFamilienbeihilfe(childrenAges) {
        if (!childrenAges || childrenAges.length === 0) {
            return {
                baseAmount: 0,
                kinderabsetzbetrag: 0,
                siblingBonus: 0,
                total: 0,
                perChild: []
            };
        }

        const numChildren = childrenAges.length;
        let baseAmount = 0;
        const perChild = [];

        // Calculate base amount for each child
        for (const age of childrenAges) {
            const amount = this.getFamilienbeihilfeByAge(age);
            baseAmount += amount;
            perChild.push({
                age: age,
                baseAmount: amount,
                kinderabsetzbetrag: this.KINDERABSETZBETRAG
            });
        }

        // Kinderabsetzbetrag for all children
        const kinderabsetzbetrag = this.KINDERABSETZBETRAG * numChildren;

        // Sibling bonus
        let siblingBonus = 0;
        if (numChildren >= 2) {
            const bonusRate = numChildren >= 7 ?
                this.SIBLING_BONUS[7] :
                this.SIBLING_BONUS[numChildren];
            siblingBonus = bonusRate * numChildren;
        }

        return {
            baseAmount: baseAmount,
            kinderabsetzbetrag: kinderabsetzbetrag,
            siblingBonus: siblingBonus,
            total: baseAmount + kinderabsetzbetrag + siblingBonus,
            perChild: perChild,
            numChildren: numChildren
        };
    },

    /**
     * Calculate Familienbonus Plus (tax credit)
     * @param {Array<number>} childrenAges - Array of children's ages
     * @param {number} taxLiability - Annual tax before credits
     * @returns {object} Tax credit info
     */
    calculateFamilienbonusPlus(childrenAges, taxLiability) {
        if (!childrenAges || childrenAges.length === 0) {
            return {
                maxBonus: 0,
                usedBonus: 0,
                remainingTax: taxLiability,
                kindermehrbetrag: 0
            };
        }

        let maxBonus = 0;
        for (const age of childrenAges) {
            if (age < 18) {
                maxBonus += this.FAMILIENBONUS_PLUS.under18;
            } else {
                maxBonus += this.FAMILIENBONUS_PLUS.over18;
            }
        }

        // Bonus is capped by tax liability
        const usedBonus = Math.min(maxBonus, taxLiability);
        const remainingTax = Math.max(0, taxLiability - usedBonus);

        // Kindermehrbetrag for low income (can't use full bonus)
        const unusedBonus = maxBonus - usedBonus;
        const kindermehrbetrag = Math.min(unusedBonus, this.KINDERMEHRBETRAG * childrenAges.length);

        return {
            maxBonus: maxBonus,
            usedBonus: usedBonus,
            remainingTax: remainingTax,
            kindermehrbetrag: kindermehrbetrag,
            monthlyKindermehrbetrag: kindermehrbetrag / 12
        };
    },

    /**
     * Calculate Alleinverdiener or Alleinerzieherabsetzbetrag
     * @param {string} status - 'single', 'married', 'singleParent'
     * @param {number} numChildren - Number of children
     * @param {number} partnerIncome - Partner's annual income (if applicable)
     * @returns {object} Tax credit info
     */
    calculateAlleinverdienerAbsetzbetrag(status, numChildren, partnerIncome = 0) {
        if (numChildren === 0) {
            return { annualCredit: 0, monthlyCredit: 0, eligible: false };
        }

        // Single parent is always eligible
        if (status === 'singleParent') {
            let credit = 0;
            if (numChildren >= 1) credit = this.ALLEINVERDIENER.oneChild;
            if (numChildren >= 2) credit = this.ALLEINVERDIENER.twoChildren;
            if (numChildren > 2) {
                credit += (numChildren - 2) * this.ALLEINVERDIENER.additionalChild;
            }
            return {
                annualCredit: credit,
                monthlyCredit: credit / 12,
                eligible: true,
                type: 'Alleinerzieherabsetzbetrag'
            };
        }

        // Married/partner - check partner income
        if (status === 'married' && partnerIncome <= this.ALLEINVERDIENER.partnerIncomeLimit) {
            let credit = 0;
            if (numChildren >= 1) credit = this.ALLEINVERDIENER.oneChild;
            if (numChildren >= 2) credit = this.ALLEINVERDIENER.twoChildren;
            if (numChildren > 2) {
                credit += (numChildren - 2) * this.ALLEINVERDIENER.additionalChild;
            }
            return {
                annualCredit: credit,
                monthlyCredit: credit / 12,
                eligible: true,
                type: 'Alleinverdienerabsetzbetrag'
            };
        }

        return { annualCredit: 0, monthlyCredit: 0, eligible: false };
    },

    /**
     * Calculate Wohnbeihilfe (Vienna)
     * @param {object} params - Calculation parameters
     * @returns {object} Wohnbeihilfe details
     */
    calculateWohnbeihilfeVienna(params) {
        const {
            householdSize,
            monthlyNetIncome,
            monthlyRent,
            apartmentSize
        } = params;

        const config = this.WOHNBEIHILFE_VIENNA;

        // Get income limit for household size
        const incomeLimit = config.incomeLimits[Math.min(householdSize, 5)] ||
            config.incomeLimits[5];

        // Check if income exceeds limit
        if (monthlyNetIncome > incomeLimit) {
            return {
                eligible: false,
                reason: 'Einkommen über der Grenze',
                amount: 0,
                incomeLimit: incomeLimit
            };
        }

        // Calculate appropriate apartment size
        let appropriateSize;
        if (householdSize === 1) {
            appropriateSize = config.appropriateSize[1];
        } else if (householdSize === 2) {
            appropriateSize = config.appropriateSize[2];
        } else {
            appropriateSize = config.appropriateSize.base +
                (householdSize - 2) * config.appropriateSize.perAdditional;
        }

        // Assessable housing cost (capped by appropriate size and rate)
        const effectiveSize = Math.min(apartmentSize, appropriateSize);
        const maxHousingCost = effectiveSize * config.maxRatePerSqm;
        const assessableHousingCost = Math.min(monthlyRent, maxHousingCost);

        // Reasonable housing cost (what household should pay from income)
        const reasonableHousingCost = monthlyNetIncome * config.minHousingCostPercent;

        // Wohnbeihilfe = difference between assessable and reasonable
        const benefit = Math.max(0, assessableHousingCost - reasonableHousingCost);

        return {
            eligible: benefit > 0,
            amount: Math.round(benefit * 100) / 100,
            assessableHousingCost: assessableHousingCost,
            reasonableHousingCost: reasonableHousingCost,
            appropriateSize: appropriateSize,
            incomeLimit: incomeLimit
        };
    },

    /**
     * Calculate Wohnunterstützung (Steiermark)
     * @param {object} params - Calculation parameters
     * @returns {object} Wohnbeihilfe details
     */
    calculateWohnbeihilfeSteiermark(params) {
        const {
            householdSize,
            numAdults,
            numChildren,
            monthlyNetIncome,
            monthlyRent
        } = params;

        const config = this.WOHNBEIHILFE_STEIERMARK;

        // Calculate weighted household size for income comparison
        // Haushalt: 0.5 + Erwachsene * 0.5 + Minderjährige * 0.3
        const weightedSize = config.weightingFactors.household +
            (numAdults * config.weightingFactors.adult) +
            (numChildren * config.weightingFactors.minor);

        // Weighted income
        const weightedIncome = monthlyNetIncome / weightedSize;

        // Get income limit for household size
        const effectiveHouseholdSize = Math.min(householdSize, 7);
        const incomeLimit = config.incomeLimits[effectiveHouseholdSize] || config.incomeLimits[7];

        // Check if income exceeds limit
        if (monthlyNetIncome > incomeLimit) {
            return {
                eligible: false,
                reason: 'Einkommen über der Grenze',
                amount: 0,
                incomeLimit: incomeLimit,
                federalState: 'steiermark'
            };
        }

        // Maximum rent subsidy based on household size
        const maxSubsidy = config.maxRentSubsidy[Math.min(householdSize, 5)] || config.maxRentSubsidy[5];

        // Reasonable housing cost from own income
        const reasonableHousingCost = monthlyNetIncome * config.minHousingCostPercent;

        // Assessable rent (capped at max subsidy)
        const assessableRent = Math.min(monthlyRent, maxSubsidy);

        // Benefit = assessable rent - reasonable cost
        // Also scale benefit based on how far below income limit
        const incomeRatio = monthlyNetIncome / incomeLimit;
        const scaleFactor = Math.max(0, 1 - incomeRatio);

        let benefit = Math.max(0, assessableRent - reasonableHousingCost);
        // Apply progressive reduction based on income
        benefit = benefit * (1 - (incomeRatio * 0.5));

        return {
            eligible: benefit > 10, // Minimum €10 to be worth claiming
            amount: Math.round(benefit * 100) / 100,
            maxSubsidy: maxSubsidy,
            reasonableHousingCost: reasonableHousingCost,
            incomeLimit: incomeLimit,
            weightedIncome: weightedIncome,
            federalState: 'steiermark'
        };
    },

    /**
     * Calculate Wohnbeihilfe for other federal states (generic calculation)
     * @param {object} params - Calculation parameters
     * @param {string} state - Federal state identifier
     * @returns {object} Wohnbeihilfe details
     */
    calculateWohnbeihilfeGeneric(params, state) {
        const {
            householdSize,
            numChildren,
            monthlyNetIncome,
            monthlyRent,
            apartmentSize
        } = params;

        // Get config for the specific state
        const configMap = {
            'upperAustria': this.WOHNBEIHILFE_UPPER_AUSTRIA,
            'lowerAustria': this.WOHNBEIHILFE_LOWER_AUSTRIA,
            'salzburg': this.WOHNBEIHILFE_SALZBURG,
            'tyrol': this.WOHNBEIHILFE_TYROL,
            'vorarlberg': this.WOHNBEIHILFE_VORARLBERG,
            'carinthia': this.WOHNBEIHILFE_CARINTHIA,
            'burgenland': this.WOHNBEIHILFE_BURGENLAND
        };

        const stateNames = {
            'upperAustria': 'Oberösterreich',
            'lowerAustria': 'Niederösterreich',
            'salzburg': 'Salzburg',
            'tyrol': 'Tirol',
            'vorarlberg': 'Vorarlberg',
            'carinthia': 'Kärnten',
            'burgenland': 'Burgenland'
        };

        const config = configMap[state];
        if (!config) {
            return {
                eligible: false,
                reason: 'Bundesland nicht unterstützt',
                amount: 0,
                federalState: state
            };
        }

        // Get income limit for household size (with child bonus for Kärnten)
        const effectiveHouseholdSize = Math.min(householdSize, 5);
        let incomeLimit = config.incomeLimits[effectiveHouseholdSize] || config.incomeLimits[5];

        // Kärnten has a child bonus added to income limit
        if (config.childBonus && numChildren > 0) {
            incomeLimit += numChildren * config.childBonus;
        }

        // Check if income exceeds limit
        if (monthlyNetIncome > incomeLimit) {
            return {
                eligible: false,
                reason: 'Einkommen über der Grenze',
                amount: 0,
                incomeLimit: incomeLimit,
                federalState: state,
                federalStateName: stateNames[state]
            };
        }

        // Calculate appropriate apartment size (default to 50 + 10 per additional person)
        let appropriateSize;
        if (config.appropriateSize) {
            appropriateSize = config.appropriateSize[1] +
                (householdSize - 1) * (config.appropriateSize.perAdditional || 10);
        } else {
            appropriateSize = 50 + (householdSize - 1) * 10;
        }

        // Assessable housing cost (capped by appropriate size and rate)
        const effectiveSize = Math.min(apartmentSize, appropriateSize);
        const maxHousingCost = effectiveSize * config.maxRatePerSqm;
        const assessableHousingCost = Math.min(monthlyRent, maxHousingCost);

        // Reasonable housing cost (what household should pay from income)
        // Kärnten: no contribution below €1000 income
        let reasonableHousingCost;
        if (config.noContributionBelow && monthlyNetIncome <= config.noContributionBelow) {
            reasonableHousingCost = 0;
        } else {
            reasonableHousingCost = monthlyNetIncome * config.minHousingCostPercent;
        }

        // Calculate benefit
        let benefit = Math.max(0, assessableHousingCost - reasonableHousingCost);

        // Cap at maximum benefit if specified
        if (config.maxBenefit) {
            benefit = Math.min(benefit, config.maxBenefit);
        }

        // Apply income-based reduction (the higher the income, the less benefit)
        const incomeRatio = monthlyNetIncome / incomeLimit;
        if (incomeRatio > 0.5) {
            benefit = benefit * (1 - (incomeRatio - 0.5) * 0.8);
        }

        // Minimum benefit threshold
        const minBenefit = config.minBenefit || 10;
        if (benefit < minBenefit) {
            return {
                eligible: false,
                reason: 'Berechneter Betrag unter Mindestgrenze',
                amount: 0,
                incomeLimit: incomeLimit,
                federalState: state,
                federalStateName: stateNames[state]
            };
        }

        return {
            eligible: true,
            amount: Math.round(benefit * 100) / 100,
            assessableHousingCost: assessableHousingCost,
            reasonableHousingCost: reasonableHousingCost,
            appropriateSize: appropriateSize,
            incomeLimit: incomeLimit,
            maxBenefit: config.maxBenefit,
            federalState: state,
            federalStateName: stateNames[state]
        };
    },


    /**
     * Calculate Sozialhilfe/Mindestsicherung (Vienna)
     * This is a top-up benefit for very low incomes
     * @param {object} params - Calculation parameters
     * @returns {object} Sozialhilfe details
     */
    calculateSozialhilfe(params) {
        const {
            householdSize,
            numChildren,
            monthlyNetIncome,
            familyBenefits,
            wiedereinsteiger
        } = params;

        // Determine maximum entitlement
        let maxEntitlement = 0;
        const numAdults = householdSize - numChildren;

        if (numAdults === 1) {
            maxEntitlement = this.SOZIALHILFE.single;
        } else if (numAdults >= 2) {
            maxEntitlement = this.SOZIALHILFE.couple;
        }

        // Add child supplements
        maxEntitlement += numChildren * this.SOZIALHILFE.childSupplement;

        // Calculate housing supplement (up to 30% more)
        const withHousing = maxEntitlement * (1 + this.SOZIALHILFE.housingSupplementRate);

        // Apply Wiedereinsteigerfreibetrag if applicable (35% of net income is exempt)
        // This reduces the "poverty trap" for people returning to work
        const freibetragRate = wiedereinsteiger ? 0.35 : 0;
        const exemptIncome = monthlyNetIncome * freibetragRate;
        const countableIncome = monthlyNetIncome - exemptIncome;

        // Total existing income including family benefits (exempt income not counted)
        const totalIncome = countableIncome + (familyBenefits || 0);

        // Sozialhilfe is the difference (only if income is below minimum)
        const benefit = Math.max(0, maxEntitlement - totalIncome);

        return {
            eligible: benefit > 0,
            amount: Math.round(benefit * 100) / 100,
            maxEntitlement: maxEntitlement,
            withHousing: withHousing,
            existingIncome: totalIncome,
            wiedereinsteiger: wiedereinsteiger,
            freibetrag: exemptIncome
        };
    },

    /**
     * Calculate childcare costs
     * @param {object} params - Calculation parameters
     * @returns {object} Childcare cost details
     */
    calculateChildcareCosts(params) {
        const {
            children,
            federalState
        } = params;

        if (!children || children.length === 0) {
            return { total: 0, breakdown: [] };
        }

        const costs = this.CHILDCARE_COSTS[federalState];
        if (!costs) {
            return { total: 0, breakdown: [] };
        }

        let total = 0;
        const breakdown = [];

        children.forEach((child, index) => {
            if (child.inChildcare && child.age < 6) {
                const careCost = child.fullDay ? costs.fullDay : costs.halfDay;
                const mealCost = costs.meals;
                const childTotal = careCost + mealCost;

                total += childTotal;
                breakdown.push({
                    index: index,
                    age: child.age,
                    fullDay: child.fullDay,
                    careCost: careCost,
                    mealCost: mealCost,
                    total: childTotal
                });
            }
        });

        return {
            total: Math.round(total * 100) / 100,
            breakdown: breakdown,
            federalState: costs.name
        };
    },

    /**
     * Calculate all benefits for a given situation
     * @param {object} situation - Complete household situation
     * @returns {object} All benefits breakdown
     */
    calculateAllBenefits(situation) {
        const {
            monthlyGross,
            monthlyNet,
            partnerNetIncome = 0,
            combinedMonthlyNet,
            annualTax,
            familyStatus,
            childrenAges,
            children,
            partnerIncome,
            monthlyRent,
            apartmentSize,
            federalState
        } = situation;

        // Calculate combined household net income
        const householdNetIncome = combinedMonthlyNet || (monthlyNet + partnerNetIncome);

        const numChildren = childrenAges ? childrenAges.length : 0;
        const householdSize = (familyStatus === 'married' ? 2 : 1) + numChildren;

        // 1. Familienbeihilfe
        const familienbeihilfe = this.calculateFamilienbeihilfe(childrenAges);

        // 2. Alleinverdiener/Alleinerzieherabsetzbetrag
        // Note: partnerIncome * 12 is annual gross for AVAB eligibility check (limit: €7,284)
        const avab = this.calculateAlleinverdienerAbsetzbetrag(
            familyStatus,
            numChildren,
            partnerIncome * 12
        );

        // 3. Familienbonus Plus (reduces tax)
        const taxAfterAVAB = Math.max(0, annualTax - avab.annualCredit);
        const familienbonus = this.calculateFamilienbonusPlus(childrenAges, taxAfterAVAB);

        // 4. Total tax credits
        const totalTaxCredits = avab.annualCredit + familienbonus.usedBonus;

        // 5. Wohnbeihilfe (all federal states)
        // Uses combined household net income
        let wohnbeihilfe = { eligible: false, amount: 0 };
        if (monthlyRent > 0) {
            const numAdults = familyStatus === 'married' ? 2 : 1;
            const wohnParams = {
                householdSize: householdSize,
                numAdults: numAdults,
                numChildren: numChildren,
                monthlyNetIncome: householdNetIncome,  // Combined income
                monthlyRent: monthlyRent,
                apartmentSize: apartmentSize
            };

            switch (federalState) {
                case 'vienna':
                    wohnbeihilfe = this.calculateWohnbeihilfeVienna(wohnParams);
                    break;
                case 'steiermark':
                    wohnbeihilfe = this.calculateWohnbeihilfeSteiermark(wohnParams);
                    break;
                case 'upperAustria':
                case 'lowerAustria':
                case 'salzburg':
                case 'tyrol':
                case 'vorarlberg':
                case 'carinthia':
                case 'burgenland':
                    wohnbeihilfe = this.calculateWohnbeihilfeGeneric(wohnParams, federalState);
                    break;
                default:
                    // Fallback for unknown states
                    wohnbeihilfe = { eligible: false, amount: 0, reason: 'Bundesland nicht konfiguriert' };
            }
        }

        // 6. Sozialhilfe (only for very low income)
        // Uses combined household net income
        const sozialhilfe = this.calculateSozialhilfe({
            householdSize: householdSize,
            numChildren: numChildren,
            monthlyNetIncome: householdNetIncome,  // Combined income
            familyBenefits: familienbeihilfe.total,
            wiedereinsteiger: situation.wiedereinsteiger || false
        });

        // Total monthly benefits
        const totalMonthlyBenefits =
            familienbeihilfe.total +
            wohnbeihilfe.amount +
            (familienbonus.monthlyKindermehrbetrag || 0) +
            sozialhilfe.amount;

        // 7. Childcare costs (reduces available income)
        const childcareCosts = this.calculateChildcareCosts({
            children: children,
            federalState: federalState
        });

        // Total household income (combined net + benefits - childcare costs)
        const totalHouseholdIncome = householdNetIncome + totalMonthlyBenefits - childcareCosts.total;

        return {
            familienbeihilfe: familienbeihilfe,
            avab: avab,
            familienbonus: familienbonus,
            wohnbeihilfe: wohnbeihilfe,
            sozialhilfe: sozialhilfe,
            childcareCosts: childcareCosts,
            totalTaxCredits: totalTaxCredits,
            totalMonthlyBenefits: totalMonthlyBenefits,
            totalHouseholdIncome: totalHouseholdIncome,
            householdSize: householdSize
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BenefitsCalculator;
}
