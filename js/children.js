/**
 * Children Management Module
 * Handles adding, removing, and rendering children
 */

const ChildrenManager = {
    children: [],

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
        if (typeof FormManager !== 'undefined') FormManager.calculate();
    },

    /**
     * Remove the last child from the list (for - button)
     */
    removeLastChild() {
        if (this.children.length > 0) {
            this.children.pop();
            this.renderChildren();
            if (typeof FormManager !== 'undefined') FormManager.calculate();
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
     */
    updateChildAge(id, age) {
        const child = this.children.find(c => c.id === id);
        if (child) {
            child.age = parseInt(age) || 0;
        }
    },

    /**
     * Update childcare status
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
     */
    updateChildcareType(id, fullDay) {
        const child = this.children.find(c => c.id === id);
        if (child) {
            child.fullDay = fullDay;
        }
    },

    /**
     * Get all children ages
     */
    getChildrenAges() {
        return this.children.map(c => c.age);
    },

    /**
     * Get all children data
     */
    getChildren() {
        return this.children;
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
                        onchange="ChildrenManager.updateChildAge(${child.id}, this.value); FormManager.calculate();"
                        class="child-age-input"
                    >
                    <span>Jahre</span>
                    <button type="button" class="child-remove" onclick="ChildrenManager.removeChild(${child.id})" title="Kind entfernen">
                        ×
                    </button>
                </div>
                <div class="child-card-options">
                    <label class="childcare-checkbox">
                        <input 
                            type="checkbox" 
                            ${child.inChildcare ? 'checked' : ''}
                            onchange="ChildrenManager.updateChildcare(${child.id}, this.checked); FormManager.calculate();"
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
                                    onchange="ChildrenManager.updateChildcareType(${child.id}, false); FormManager.calculate();"
                                >
                                Halbtag
                            </label>
                            <label class="radio-label">
                                <input 
                                    type="radio" 
                                    name="childcare-${child.id}" 
                                    value="full"
                                    ${child.fullDay ? 'checked' : ''}
                                    onchange="ChildrenManager.updateChildcareType(${child.id}, true); FormManager.calculate();"
                                >
                                Ganztag
                            </label>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChildrenManager;
}
