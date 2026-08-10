export class Transaction {

    constructor(title, amount, type, category, date) {

        this.id = Date.now();

        this.title = title;

        this.amount = Number(amount);

        this.type = type;

        this.category = category;

        this.date = date;

    }

}