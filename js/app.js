/**
 * WasBleibt.at - Austrian Tax & Benefits Calculator
 * Main application entry point
 */

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🇦🇹 WasBleibt.at - Österreich Steuer- & Sozialleistungsrechner');
    console.log('Version 1.0.0 | Stand: Jänner 2026');

    // Load benefits data from JSON
    await BenefitsCalculator.loadData();

    // Initialize form manager
    FormManager.init();

    // Log initialization
    console.log('✅ Anwendung initialisiert');
    console.log('📊 Steuerberechnung: Lohnsteuertarif 2025');
    console.log('👨‍👩‍👧 Familienbeihilfe: Werte 2025');
    console.log('🏠 Wohnbeihilfe: Alle Bundesländer 2025');
});

// Global error handler for debugging
window.onerror = function (message, source, lineno, colno, error) {
    console.error('Fehler:', message);
    console.error('Quelle:', source, 'Zeile:', lineno);
    return false;
};

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
