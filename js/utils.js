const API_URL = "http://127.0.0.1:8000/api/transactions/";


// GET all transactions
export async function getTransactions() {

    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error("Failed to load transactions.");
    }

    return await response.json();
}


// CREATE transaction
export async function createTransaction(transaction) {

    const response = await fetch(API_URL, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(transaction)

    });

    if (!response.ok) {

        const error = await response.text();

        console.error("Create transaction error:", error);

        throw new Error("Failed to create transaction.");

    }

    return await response.json();
}


// UPDATE transaction
export async function updateTransaction(id, transaction) {

    const response = await fetch(`${API_URL}${id}/`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(transaction)

    });

    if (!response.ok) {

        const error = await response.text();

        console.error("Update transaction error:", error);

        throw new Error("Failed to update transaction.");

    }

    return await response.json();
}


// DELETE transaction
export async function deleteTransactionAPI(id) {

    const response = await fetch(`${API_URL}${id}/`, {

        method: "DELETE"

    });

    if (!response.ok) {

        throw new Error("Failed to delete transaction.");

    }

    return true;
}