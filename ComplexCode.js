/*
 Filename: ComplexCode.js
 
 Description: This code simulates a complex banking system with functionalities like creating accounts, managing transactions, and generating reports. It includes various classes, methods, and data structures to demonstrate a professional and elaborate implementation.
*/

// Bank Class
class Bank {
  constructor(name) {
    this.name = name;
    this.accounts = [];
  }

  // Method to create an account
  createAccount(accountNumber, initialBalance, accountType) {
    const account = new Account(accountNumber, initialBalance, accountType);
    this.accounts.push(account);
  }

  // Method to perform a transaction on an account
  performTransaction(accountNumber, amount, transactionType) {
    const account = this.accounts.find(account => account.number === accountNumber);
    
    if (!account) {
      console.log(`Account ${accountNumber} not found.`);
      return;
    }

    const transaction = new Transaction(amount, transactionType);
    account.addTransaction(transaction);
  }

  // Method to generate a report of all accounts
  generateReport() {
    console.log(`Report for Bank: ${this.name}`);
    this.accounts.forEach(account => {
      console.log(`Account: ${account.number} Balance: $${account.balance}`);
      console.log(`Transactions:`);
      account.transactions.forEach(transaction => {
        console.log(`Amount: $${transaction.amount} Type: ${transaction.type}`);
      });
    });
  }
}

// Account Class
class Account {
  constructor(number, initialBalance, type) {
    this.number = number;
    this.balance = initialBalance;
    this.type = type;
    this.transactions = [];
  }

  // Method to add a transaction to the account
  addTransaction(transaction) {
    this.transactions.push(transaction);
    if (transaction.type === 'deposit') {
      this.balance += transaction.amount;
    } else if (transaction.type === 'withdrawal') {
      this.balance -= transaction.amount;
    }
  }
}

// Transaction Class
class Transaction {
  constructor(amount, type) {
    this.amount = amount;
    this.type = type;
    this.timestamp = new Date().toLocaleString();
  }
}

// Usage Example
const myBank = new Bank("MyBank");

myBank.createAccount(12345, 5000, "savings");
myBank.createAccount(67890, 10000, "checking");

myBank.performTransaction(12345, 1000, "withdrawal");
myBank.performTransaction(67890, 2000, "deposit");

myBank.generateReport();

// Output:
// Report for Bank: MyBank
// Account: 12345 Balance: $4000
// Transactions:
// Amount: $1000 Type: withdrawal
// 
// Account: 67890 Balance: $12000
// Transactions:
// Amount: $2000 Type: deposit