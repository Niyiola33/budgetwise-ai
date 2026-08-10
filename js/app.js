import {
    saveTransactions,
    loadTransactions,
    saveBudgetToStorage,
    loadBudget,
    saveTheme,
    loadTheme
} from "./storage.js";

const searchInput = document.getElementById("search-input");

const filterCategory = document.getElementById("filter-category");

const filterDate = document.getElementById("filter-date");

const incomeExpenseCanvas =document.getElementById("incomeExpenseChart");

const categoryCanvas = document.getElementById("categoryChart");

const insightsContainer =
document.getElementById("insights-container");

const themeBtn = document.getElementById("theme-btn");

let incomeExpenseChart;
let categoryChart;

const healthScore =
document.getElementById("health-score");

const healthMessage =
document.getElementById("health-message");

const totalTransactions = document.getElementById("total-transactions");
const largestExpense = document.getElementById("largest-expense");
const averageExpense = document.getElementById("average-expense");
const topCategory = document.getElementById("top-category");

const budgetInput = document.getElementById("budget-input");
const saveBudgetBtn = document.getElementById("save-budget-btn");

const budgetTotal = document.getElementById("budget-total");
const budgetRemaining = document.getElementById("budget-remaining");
const budgetStatus = document.getElementById("budget-status");

const progressFill = document.getElementById("progress-fill");

const csvFile =
    document.getElementById("csv-file");

const importBtn =
    document.getElementById("import-btn");


const exportBtn = document.getElementById("export-btn"); 

const clearBtn =
document.getElementById("clear-btn");


// Get the form
const form = document.getElementById("transaction-form");

// Transaction list
const transactionList = document.getElementById("transaction-list");

// Dashboard cards
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

const submitBtn = document.getElementById("submit-btn");


searchInput.addEventListener(
    "input",
    refreshUI
);

filterCategory.addEventListener(
    "change",
    refreshUI
);

filterDate.addEventListener(
    "change",
    refreshUI
);

themeBtn.addEventListener("click", toggleTheme);

// Store transactions
let transactions = loadTransactions();

let editingId = null;

let monthlyBudget = loadBudget();

saveBudgetBtn.addEventListener("click", saveBudget);

importBtn.addEventListener("click", importCSV);
exportBtn.addEventListener("click", exportCSV);
clearBtn.addEventListener("click", clearTransactions);

function saveBudget(){

    monthlyBudget = Number(budgetInput.value);

    saveBudgetToStorage(monthlyBudget);

    updateBudget();

    budgetInput.value = "";

}

function updateBudget(){

    let totalExpense = 0;

    transactions.forEach(transaction => {

        if(transaction.type === "expense"){

            totalExpense += transaction.amount;

        }

    });

    const remaining = monthlyBudget - totalExpense;

    budgetTotal.textContent =
        "₦" + monthlyBudget.toLocaleString();

    budgetRemaining.textContent =
        "₦" + remaining.toLocaleString();

    if(monthlyBudget > 0){

        const percentage =
            (totalExpense / monthlyBudget) * 100;

        progressFill.style.width =
            Math.min(percentage,100) + "%";

        if(totalExpense > monthlyBudget){

            budgetStatus.textContent =
                "⚠ Budget Exceeded";

        }else{

            budgetStatus.textContent =
                "✅ On Track";

        }

    }

}

// Listen for form submission
form.addEventListener("submit", addTransaction);

// Add Transaction
function addTransaction(event) {

    event.preventDefault();

    console.log("editingId =", editingId);

    const title = document.getElementById("title").value;

    const amount = Number(document.getElementById("amount").value);

    const type = document.getElementById("type").value;

    const category = document.getElementById("category").value;

    const date = document.getElementById("date").value;

    if (!title || !amount || !category || !date) {
    showToast("Please fill in all fields.");
    return;
}

if (editingId === null) {

    // Create a new transaction
    const transaction = {

        id: Date.now(),

        title,

        amount,

        type,

        category,

        date

    };

    transactions.push(transaction);

} else {

    // Update an existing transaction
    transactions = transactions.map(transaction => {

        if (transaction.id === editingId) {

            return {
                ...transaction,
                title,
                amount,
                type,
                category,
                date
            };

        }

        return transaction;

    });


}
saveTransactions(transactions);

refreshUI();

form.reset();

editingId = null;
submitBtn.textContent = "Add Transaction";

}

// Display Transactions

function displayTransactions() {

    transactionList.innerHTML = "";

    
    // Make a copy of the transactions array
    let filteredTransactions = [...transactions];

    if(filteredTransactions.length===0){

    transactionList.innerHTML=`

        <div class="empty-state">

            <h2>💰</h2>

            <h3>No Transactions Yet</h3>

            <p>

                Add a transaction or import a bank statement.

            </p>

        </div>

    `;

    return;

}

    // Search filter
    const searchText = searchInput.value.toLowerCase();

    if (searchText) {

        filteredTransactions = filteredTransactions.filter(transaction =>

            transaction.title.toLowerCase().includes(searchText) ||

            transaction.category.toLowerCase().includes(searchText) ||

            transaction.type.toLowerCase().includes(searchText)

        );

    }

    // Category filter
    if (filterCategory.value !== "all") {

        filteredTransactions = filteredTransactions.filter(transaction =>

            transaction.category === filterCategory.value

        );

    }

    // Date filter
    if (filterDate.value) {

    filteredTransactions = filteredTransactions.filter(transaction =>

        transaction.date === filterDate.value

    );

    }

    if(filteredTransactions.length === 0){

    transactionList.innerHTML = `
        <div class="empty-state">
            <h3>📂 No Transactions Yet</h3>
            <p>Add a transaction or import a bank statement.</p>
        </div>
    `;

    return;

}

    // Display the filtered transactions
    filteredTransactions.forEach(transaction => {

        const div = document.createElement("div");
        div.className = "transaction";

        const sign = transaction.type === "income" ? "+" : "-";
        const color = transaction.type === "income"
            ? "income-text"
            : "expense-text";

        div.innerHTML = `
            <div class="transaction-left">
                <h4>${transaction.title}</h4>
                <span>${transaction.category} • ${transaction.date}</span>
            </div>

            <div class="transaction-actions">
                <span class="amount ${color}">
                    ${sign}₦${transaction.amount.toLocaleString()}
                </span>

                <button class="edit-btn">✏️</button>

                <button class="delete-btn">🗑️</button>
            </div>
        `;

        const editBtn = div.querySelector(".edit-btn");

        editBtn.addEventListener("click", () => {
            editTransaction(transaction.id);
        });

        const deleteBtn = div.querySelector(".delete-btn");

        deleteBtn.addEventListener("click", () => {
            deleteTransaction(transaction.id);
        });

        transactionList.appendChild(div);

    });

}

function animateValue(element, start, end, duration) {

    let startTimestamp = null;

    function step(timestamp) {

        if (!startTimestamp) startTimestamp = timestamp;

        const progress = Math.min(
            (timestamp - startTimestamp) / duration,
            1
        );

        const value =
            Math.floor(progress * (end - start) + start);

        element.textContent =
            "₦" + value.toLocaleString();

        if (progress < 1) {

            window.requestAnimationFrame(step);

        }

    }

    window.requestAnimationFrame(step);

}

// Update Dashboard
function updateDashboard() {

    let totalIncome = 0;

    let totalExpense = 0;

    transactions.forEach(transaction => {

        if (transaction.type === "income") {

            totalIncome += transaction.amount;

        } else {

            totalExpense += transaction.amount;

        }

    });

    const totalBalance = totalIncome - totalExpense;

    animateValue(balance, 0, totalBalance, 800);

    animateValue(income, 0, totalIncome, 800);

    animateValue(expense, 0, totalExpense, 800);

}


function refreshUI() {
    
    displayTransactions();
    
    updateDashboard();
    
    updateBudget();
    
    updateCharts();
    
    updateAnalytics();
    
    updateInsights();

    updateHealthScore();

}

function deleteTransaction(id){

    transactions = transactions.filter(transaction => {

        return transaction.id !== id;

    });

saveTransactions(transactions);

refreshUI();
}

function editTransaction(id) {

    console.log("Editing:", id);

    const transaction = transactions.find(
        transaction => transaction.id === id
    );

    document.getElementById("title").value = transaction.title;
    document.getElementById("amount").value = transaction.amount;
    document.getElementById("type").value = transaction.type;
    document.getElementById("category").value = transaction.category;
    document.getElementById("date").value = transaction.date;

    editingId = id;

    submitBtn.textContent = "Update Transaction";

}


function updateCharts() {

    let totalIncome = 0;
    let totalExpense = 0;

    const categories = {};

    transactions.forEach(transaction => {

        if(transaction.type === "income"){

            totalIncome += transaction.amount;

        }else{

            totalExpense += transaction.amount;

            categories[transaction.category] =
                (categories[transaction.category] || 0)
                + transaction.amount;

        }

    });

    // Destroy old charts
    if(incomeExpenseChart){
        incomeExpenseChart.destroy();
    }

    if(categoryChart){
        categoryChart.destroy();
    }

    const dark = document.body.classList.contains("dark-mode");
    const textColor = dark ? "#ffffff" : "#222";

    // Bar Chart
    incomeExpenseChart = new Chart(
        incomeExpenseCanvas,
        {
            type: "bar",
            data: {
                labels: ["Income", "Expense"],
                datasets: [{
                    label: "Amount",
                    data: [totalIncome, totalExpense]
                }]
            },
            options: {
                plugins: {
                    legend: {
                        labels: { color: textColor }
                    }
                },
                scales: {
                    x: { ticks: { color: textColor } },
                    y: { ticks: { color: textColor } }
                }
            }
        }
    );

    // Pie Chart
    categoryChart = new Chart(
        categoryCanvas,
        {
            type: "pie",
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    data: Object.values(categories)
                }]
            },
            options: {
                plugins: {
                    legend: {
                        labels: { color: textColor }
                    }
                }
            }
        }
    );

}

function updateAnalytics() {

    totalTransactions.textContent = transactions.length;

    const expenses = transactions.filter(
        transaction => transaction.type === "expense"
    );

    if (expenses.length === 0) {

        largestExpense.textContent = "₦0";
        averageExpense.textContent = "₦0";
        topCategory.textContent = "None";
        return;
    }

    const amounts = expenses.map(transaction => transaction.amount);

    const maxExpense = Math.max(...amounts);

    largestExpense.textContent =
        "₦" + maxExpense.toLocaleString();

    const average =
        amounts.reduce((sum, amount) => sum + amount, 0) /
        amounts.length;

    averageExpense.textContent =
        "₦" + average.toFixed(2);

    const categoryCounts = {};

    expenses.forEach(transaction => {

        categoryCounts[transaction.category] =
            (categoryCounts[transaction.category] || 0) + 1;

    });

    let mostUsed = "";

    let highestCount = 0;

    for (const category in categoryCounts) {

        if (categoryCounts[category] > highestCount) {

            highestCount = categoryCounts[category];
            mostUsed = category;

        }

    }

    topCategory.textContent = mostUsed;

}

function importCSV() {
    const file = csvFile.files[0];

    if (!file) {
        showToast("Please choose a CSV file.");
        return;
    }

    importBtn.disabled = true;
    importBtn.textContent = "Importing...";
    
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            processImportedRows(results.data, results.meta.fields);
        },
error: function(error) {

    importBtn.disabled = false;
    importBtn.textContent = "Import CSV";

    showToast(
        "❌ Failed to read CSV file: " + error.message
    );

}
    });
}

function detectCategory(description) {
    const text = description.toLowerCase();

    const rules = [
        { category: "Transport", keywords: ["uber", "bolt", "taxify", "fuel", "petrol"] },
        { category: "Food", keywords: ["shoprite", "spar", "restaurant", "eatery", "supermarket"] },
        { category: "Salary", keywords: ["salary", "payroll"] },
        { category: "Entertainment", keywords: ["netflix", "spotify", "showmax", "dstv", "gotv"] },
        { category: "Bills", keywords: ["mtn", "airtel", "glo", "electricity", "nepa", "phcn", "water bill"] },
        { category: "Transfer", keywords: ["transfer", "pos", "atm", "withdrawal"] },
        { category: "Rent", keywords: ["rent", "landlord"] },
    ];

    for (const rule of rules) {
        if (rule.keywords.some(keyword => text.includes(keyword))) {
            return rule.category;
        }
    }

    return "Other";
}

const HEADER_ALIASES = {
    date: ["date", "transaction date", "value date", "posting date"],
    description: ["description", "narration", "details", "remarks", "particulars"],
    amount: ["amount", "value"],
    debit: ["debit", "withdrawal", "money out", "dr", "debit amount"],
    credit: ["credit", "deposit", "money in", "cr", "credit amount"],
};

function mapHeaders(fields) {
    const map = {};
    fields.forEach(field => {
        const normalized = field.trim().toLowerCase();
        for (const key in HEADER_ALIASES) {
            if (HEADER_ALIASES[key].includes(normalized)) {
                map[key] = field;
            }
        }
    });
    return map;
}

function processImportedRows(rows, fields) {
    const map = mapHeaders(fields);

    if (!map.date || !map.description || (!map.amount && !map.debit && !map.credit)) {
        showToast(
            "Couldn't recognize this CSV's columns. Found headers: " +
            fields.join(", ") +
            "\nExpected something like Date, Description, and Amount (or Debit/Credit)."
        );
        return;
    }

    const existingKeys = new Set(
        transactions.map(t => `${t.date}|${t.title}|${t.amount}|${t.type}`)
    );

    let imported = 0;
    let skipped = 0;
    let duplicates = 0;

    rows.forEach(row => {
        const rawDate = row[map.date];
        const rawDescription = row[map.description];

        const { amount, type } = extractAmountAndType(row, map);

        if (!rawDate || !rawDescription || amount === null || isNaN(amount)) {
            skipped++;
            return;
        }

        const date = normalizeDate(rawDate);
        const title = rawDescription.trim();

        if (!date) {
            skipped++;
            return;
        }

        const key = `${date}|${title}|${amount}|${type}`;
        if (existingKeys.has(key)) {
            duplicates++;
            return;
        }
        existingKeys.add(key);

        transactions.push({
            id: Date.now() + Math.random(),
            title,
            amount,
            type,
            category: detectCategory(title),
            date,
        });

        imported++;
    });

saveTransactions(transactions);

refreshUI();

// Re-enable the button
importBtn.disabled = false;
importBtn.textContent = "Import CSV";

showToast(
    `✅ Import complete.
Imported: ${imported}
Skipped (invalid): ${skipped}
Duplicates: ${duplicates}`
);
}

function extractAmountAndType(row, map) {
    if (map.amount) {
        const raw = row[map.amount];
        if (raw === undefined || raw === null || raw === "") return { amount: null, type: null };
        const num = Number(String(raw).replace(/[₦,\s]/g, ""));
        if (isNaN(num)) return { amount: null, type: null };
        return { amount: Math.abs(num), type: num >= 0 ? "income" : "expense" };
    }

    const debitRaw = map.debit ? row[map.debit] : "";
    const creditRaw = map.credit ? row[map.credit] : "";

    const debit = debitRaw ? Number(String(debitRaw).replace(/[₦,\s]/g, "")) : 0;
    const credit = creditRaw ? Number(String(creditRaw).replace(/[₦,\s]/g, "")) : 0;

    if (debit > 0) return { amount: debit, type: "expense" };
    if (credit > 0) return { amount: credit, type: "income" };

    return { amount: null, type: null };
}

function normalizeDate(raw) {
    const cleaned = raw.trim().replace(/"/g, "");

    if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned;

    const match = cleaned.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (match) {
        const [, day, month, year] = match;
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    return null;
}

function exportCSV() {

    if (transactions.length === 0) {

        showToast("No transactions to export.");

        return;

    }

    const headers = [
        "Date",
        "Description",
        "Category",
        "Type",
        "Amount"
    ];

    const rows = transactions.map(transaction => [

        transaction.date,

        transaction.title,

        transaction.category,

        transaction.type,

        transaction.amount

    ]);

    const csv = [

        headers.join(","),

        ...rows.map(row => row.join(","))

    ].join("\n");

    const blob = new Blob(
        [csv],
        { type: "text/csv" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "budgetwise-transactions.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}

function clearTransactions(){

    if(transactions.length === 0){

        showToast("There are no transactions to delete.");

        return;

    }

    const confirmed = confirm(
        "Are you sure you want to delete ALL transactions?"
    );

    if(!confirmed){

        return;

    }

    transactions = [];

    saveTransactions(transactions);

    refreshUI();

    showToast("All transactions have been deleted.");

}

function updateInsights(){

    insightsContainer.innerHTML = "";

    if(transactions.length === 0){

        insightsContainer.innerHTML = `
            <p>No insights available.</p>
        `;

        return;

    }

    let income = 0;

    let expense = 0;

    const categoryTotals = {};

    transactions.forEach(transaction=>{

        if(transaction.type==="income"){

            income += transaction.amount;

        }else{

            expense += transaction.amount;

            categoryTotals[transaction.category] =
                (categoryTotals[transaction.category]||0)
                + transaction.amount;

        }

    });

    const savings = income - expense;

    const hasExpenses = Object.keys(categoryTotals).length > 0;

    const topCategory = hasExpenses
        ? Object.keys(categoryTotals).reduce(
            (a,b) => categoryTotals[a] > categoryTotals[b] ? a : b
          )
        : null;

    const topAmount = hasExpenses ? categoryTotals[topCategory] : 0;

    const percentage =
        expense > 0
        ? ((topAmount/expense)*100).toFixed(1)
        : 0;

    const insights=[
        `💰 You earned ₦${income.toLocaleString()}.`,
        `💸 You spent ₦${expense.toLocaleString()}.`,
        `🏦 Your savings are ₦${savings.toLocaleString()}.`,
    ];

    if (hasExpenses) {
        insights.push(`📊 Your biggest expense category is ${topCategory}.`);
        insights.push(`🍔 ${topCategory} accounts for ${percentage}% of your spending.`);
    }

    if(monthlyBudget>0){

        if(expense>monthlyBudget){

            insights.push(
                "⚠ You exceeded your monthly budget."
            );

        }else{

            insights.push(
                "✅ Great! You are within your budget."
            );

        }

    }

    insights.forEach(text=>{

        const div=document.createElement("div");

        div.className="insight";

        div.textContent=text;

        insightsContainer.appendChild(div);

    });

}

function updateHealthScore(){

    let income = 0;

    let expense = 0;

    transactions.forEach(transaction=>{

        if(transaction.type==="income"){

            income += transaction.amount;

        }else{

            expense += transaction.amount;

        }

    });

    let score = 100;

    // Budget check
    if(monthlyBudget > 0){

        if(expense > monthlyBudget){

            score -= 30;

        }

    }

    // Savings check
    if(income > 0){

        const savingsRate =
            (income-expense)/income;

        if(savingsRate < .20){

            score -= 20;

        }

    }

    // Heavy spending
    if(expense > income){

        score -= 40;

    }

    if(score < 0){

        score = 0;

    }

    healthScore.textContent = score;

    if(score >= 90){

        healthMessage.textContent =
        "🌟 Excellent Financial Health";

    }

    else if(score >= 75){

        healthMessage.textContent =
        "✅ Good Financial Health";

    }

    else if(score >= 50){

        healthMessage.textContent =
        "⚠ Needs Improvement";

    }

    else{

        healthMessage.textContent =
        "🚨 Critical - Review Your Spending";

    }

}

function toggleTheme() {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {

        saveTheme("dark");

        themeBtn.textContent = "☀ Light Mode";

    } else {

        saveTheme("light");

        themeBtn.textContent = "🌙 Dark Mode";

    }

    updateCharts();

}

// Load saved theme

const savedTheme = loadTheme();

if (savedTheme === "dark") {

    document.body.classList.add("dark-mode");

    themeBtn.textContent = "☀ Light Mode";

}

updateCharts();

function updateGreeting() {

    const hour = new Date().getHours();

    let greeting = "Good Evening";

    if(hour < 12){

        greeting = "Good Morning";

    }else if(hour < 17){

        greeting = "Good Afternoon";

    }

    document.getElementById("welcome-message").textContent =
        `${greeting}! Here's your financial overview.`;

}

updateGreeting();

const toast = document.getElementById("toast");

function showToast(message){

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    },3000);

}

refreshUI();    


