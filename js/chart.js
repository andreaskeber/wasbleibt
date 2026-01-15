/**
 * Chart visualization for Austrian Tax Calculator
 * Stacked bar chart showing household income breakdown
 */

const ChartManager = {
    chart: null,

    // Chart colors - Professional palette
    COLORS: {
        nettoFix: 'rgba(46, 125, 50, 0.9)',        // Forest Green - base net
        nettoRising: 'rgba(249, 168, 37, 0.85)',   // Amber - rising net
        familienbeihilfe: 'rgba(21, 101, 192, 0.9)', // Deep Blue
        sozialhilfe: 'rgba(198, 40, 40, 0.9)',     // Dark Red
        wohnbeihilfe: 'rgba(249, 168, 37, 0.9)',   // Amber
        kinderzuschlag: 'rgba(106, 27, 154, 0.9)', // Deep Purple
        currentMarker: 'rgba(29, 155, 240, 1)'     // Accent Blue
    },

    /**
     * Generate chart data for income range
     * @param {object} situation - User's situation
     * @param {number} currentGross - User's current gross income
     * @returns {object} Chart.js compatible data
     */
    generateChartData(situation, currentGross) {
        const step = 100;
        const maxGross = 6000;
        const labels = [];
        const nettoData = [];
        const familienbeihilfeData = [];
        const wohnbeihilfeData = [];
        const kinderzuschlagData = [];
        const sozialhilfeData = [];

        for (let gross = 0; gross <= maxGross; gross += step) {
            labels.push(gross);

            // Calculate net income for primary earner
            const taxResult = TaxCalculator.calculateMonthlyNet(gross);

            // Calculate partner's net income (if married and partner has income)
            let partnerNetIncome = 0;
            let combinedMonthlyNet = taxResult.net;
            if (situation.familyStatus === 'married' && situation.partnerIncome > 0) {
                const partnerTaxResult = TaxCalculator.calculateMonthlyNet(situation.partnerIncome);
                partnerNetIncome = partnerTaxResult.net;
                combinedMonthlyNet = taxResult.net + partnerNetIncome;
            }

            // Calculate benefits for this income level (using combined income)
            const benefits = BenefitsCalculator.calculateAllBenefits({
                ...situation,
                monthlyGross: gross,
                monthlyNet: taxResult.net,
                partnerNetIncome: partnerNetIncome,
                combinedMonthlyNet: combinedMonthlyNet,
                annualTax: taxResult.annualTax
            });

            nettoData.push(Math.round(combinedMonthlyNet));
            familienbeihilfeData.push(Math.round(benefits.familienbeihilfe.total));
            wohnbeihilfeData.push(Math.round(benefits.wohnbeihilfe.amount));
            kinderzuschlagData.push(Math.round(benefits.familienbonus.monthlyKindermehrbetrag || 0));
            sozialhilfeData.push(Math.round(benefits.sozialhilfe.amount));
        }

        const hasPartnerIncome = situation.familyStatus === 'married' && situation.partnerIncome > 0;

        return {
            labels: labels,
            datasets: [
                {
                    label: hasPartnerIncome ? 'Haushaltsnetto' : 'Nettoeinkommen',
                    data: nettoData,
                    backgroundColor: this.COLORS.nettoFix,
                    borderColor: this.COLORS.nettoFix,
                    borderWidth: 0
                },
                {
                    label: 'Familienbeihilfe',
                    data: familienbeihilfeData,
                    backgroundColor: this.COLORS.familienbeihilfe,
                    borderColor: this.COLORS.familienbeihilfe,
                    borderWidth: 0
                },
                {
                    label: 'Wohnbeihilfe',
                    data: wohnbeihilfeData,
                    backgroundColor: this.COLORS.wohnbeihilfe,
                    borderColor: this.COLORS.wohnbeihilfe,
                    borderWidth: 0
                },
                {
                    label: 'Kindermehrbetrag',
                    data: kinderzuschlagData,
                    backgroundColor: this.COLORS.kinderzuschlag,
                    borderColor: this.COLORS.kinderzuschlag,
                    borderWidth: 0
                },
                {
                    label: 'Sozialhilfe',
                    data: sozialhilfeData,
                    backgroundColor: this.COLORS.sozialhilfe,
                    borderColor: this.COLORS.sozialhilfe,
                    borderWidth: 0
                }
            ],
            currentIndex: Math.round(currentGross / step)
        };
    },

    /**
     * Create or update the chart
     * @param {string} canvasId - Canvas element ID
     * @param {object} situation - User's situation
     * @param {number} currentGross - Current gross income
     */
    createChart(canvasId, situation, currentGross) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const chartData = this.generateChartData(situation, currentGross);
        const currentIndex = chartData.currentIndex;

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        // Create annotation for current income
        const verticalLinePlugin = {
            id: 'verticalLine',
            afterDraw: (chart) => {
                if (currentIndex >= 0 && currentIndex < chart.data.labels.length) {
                    const ctx = chart.ctx;
                    const xAxis = chart.scales.x;
                    const yAxis = chart.scales.y;

                    // Get the x position for current income
                    const x = xAxis.getPixelForValue(currentIndex);

                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(x, yAxis.top);
                    ctx.lineTo(x, yAxis.bottom);
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = this.COLORS.currentMarker;
                    ctx.setLineDash([5, 5]);
                    ctx.stroke();

                    // Label
                    ctx.fillStyle = this.COLORS.currentMarker;
                    ctx.font = 'bold 12px Inter, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                    ctx.shadowBlur = 4;
                    ctx.fillText('Ihr Einkommen', x, yAxis.top - 10);
                    ctx.restore();
                }
            }
        };

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: {
                                family: 'Inter, sans-serif',
                                size: 12
                            },
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'rectRounded'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(26, 26, 36, 0.95)',
                        titleColor: 'white',
                        bodyColor: 'rgba(255, 255, 255, 0.8)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: {
                            family: 'Inter, sans-serif',
                            weight: 'bold'
                        },
                        bodyFont: {
                            family: 'Inter, sans-serif'
                        },
                        callbacks: {
                            title: (items) => {
                                return `Brutto: € ${items[0].label}/Monat`;
                            },
                            label: (item) => {
                                return `${item.dataset.label}: € ${item.raw}`;
                            },
                            afterBody: (items) => {
                                const index = items[0].dataIndex;
                                let total = 0;
                                chartData.datasets.forEach(ds => {
                                    total += ds.data[index];
                                });
                                return [`\nHaushaltskasse gesamt: € ${total}`];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        title: {
                            display: true,
                            text: 'Bruttolohn (€/Monat)',
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: {
                                family: 'Inter, sans-serif',
                                size: 14,
                                weight: '500'
                            }
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.5)',
                            callback: (value, index) => {
                                // Show every 5th label
                                if (index % 5 === 0) {
                                    return '€' + chartData.labels[index];
                                }
                                return '';
                            },
                            maxRotation: 0
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    y: {
                        stacked: true,
                        title: {
                            display: true,
                            text: 'Haushaltskasse (€/Monat)',
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: {
                                family: 'Inter, sans-serif',
                                size: 14,
                                weight: '500'
                            }
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.5)',
                            callback: (value) => '€' + value.toLocaleString('de-AT')
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                }
            },
            plugins: [verticalLinePlugin]
        });
    },

    /**
     * Find "trap zones" where earning more doesn't increase total income
     * @param {object} situation - User's situation
     * @returns {Array} Array of trap zones
     */
    findTrapZones(situation) {
        const step = 100;
        const maxGross = 6000;
        const results = [];
        const trapZones = [];

        for (let gross = 0; gross <= maxGross; gross += step) {
            const taxResult = TaxCalculator.calculateMonthlyNet(gross);

            // Calculate partner's net income (if married and partner has income)
            let partnerNetIncome = 0;
            let combinedMonthlyNet = taxResult.net;
            if (situation.familyStatus === 'married' && situation.partnerIncome > 0) {
                const partnerTaxResult = TaxCalculator.calculateMonthlyNet(situation.partnerIncome);
                partnerNetIncome = partnerTaxResult.net;
                combinedMonthlyNet = taxResult.net + partnerNetIncome;
            }

            const benefits = BenefitsCalculator.calculateAllBenefits({
                ...situation,
                monthlyGross: gross,
                monthlyNet: taxResult.net,
                partnerNetIncome: partnerNetIncome,
                combinedMonthlyNet: combinedMonthlyNet,
                annualTax: taxResult.annualTax
            });

            results.push({
                gross: gross,
                total: benefits.totalHouseholdIncome
            });
        }

        // Find zones where increasing gross doesn't increase total
        for (let i = 1; i < results.length; i++) {
            const prev = results[i - 1];
            const curr = results[i];

            if (curr.total <= prev.total && curr.gross > prev.gross) {
                trapZones.push({
                    fromGross: prev.gross,
                    toGross: curr.gross,
                    fromTotal: prev.total,
                    toTotal: curr.total,
                    difference: prev.total - curr.total
                });
            }
        }

        return trapZones;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChartManager;
}
