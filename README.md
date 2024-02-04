# Bitcoin Script Builder
A simple Node.js script for Bitcoin script construction, address derivation, and transaction building.
## Table of Contents
## Overview

This project provides a set of Node.js functions to perform various Bitcoin-related tasks, including:

1. Generating a redeem script in hex format.
2. Deriving a Bitcoin address from a redeem script.
3. Constructing a transaction that sends Bitcoins to a specified address.
4. Constructing another transaction that spends from the previous transaction, considering both locking and unlocking scripts.

## Prerequisites

- Node.js installed

## Installation

Clone the repository:
    git clone https://github.com/fahadkabali/transactionBuilder.git

Change into the project directory:
    cd bitcoin-script-builder
Install dependencies:
    npm install

## Usage

Example script usage:
    node transactionBuilder.js
    Replace placeholder values in the script with your actual transaction details.

## Functions

function generateRedeemScript(preImage):
    Generates a redeem script in hex format using a provided pre-image.
function deriveAddress(redeemScript):
    Derives a Bitcoin address from a redeem script.
function constructTransaction(address, amount):
    Constructs a transaction that sends Bitcoins to the specified address.
function constructSpendingTransaction(previousTxHex, unlockingScript, outputAddress, outputAmount):
    Constructs a transaction that spends from the previous transaction, considering locking and unlocking scripts.

## Tests

To run tests, use the following command:
    npm test
Ensure that you have updated the test cases according to your specific functions.
