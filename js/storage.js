// Save transactions
export function saveTransactions(transactions) {
    localStorage.setItem(
        "budgetwise_transactions",
        JSON.stringify(transactions)
    );
}

// Load transactions
export function loadTransactions() {
    return JSON.parse(
        localStorage.getItem("budgetwise_transactions")
    ) || [];
}

// Save budget
export function saveBudgetToStorage(budget) {
    localStorage.setItem(
        "monthly_budget",
        budget
    );
}

// Load budget
export function loadBudget() {
    return Number(
        localStorage.getItem("monthly_budget")
    ) || 0;
}

// Save theme
export function saveTheme(theme) {
    localStorage.setItem(
        "theme",
        theme
    );
}

// Load theme
export function loadTheme() {
    return localStorage.getItem("theme");
}