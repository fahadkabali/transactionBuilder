const bitcoin = require('bitcoinjs-lib')
const { Psbt } = require('bitcoinjs-lib')
const ECPairFactory = require('ecpair').default
const ecc = require('tiny-secp256k1')
const ECPair = ECPairFactory(ecc)


// Generate Redeem Script
const preimageString = 'Btrust Builders';
const redeemScriptHex = bitcoin.crypto.sha256(Buffer.from(preimageString, 'utf-8')).toString('hex');

// 2. Derive P2SH Address
const redeemScript = bitcoin.script.compile([
  bitcoin.opcodes.OP_SHA256,
  Buffer.from(redeemScriptHex, 'hex'),
  bitcoin.opcodes.OP_EQUAL,
]);
console.log('redeemScript Hex: ', redeemScript.toString('hex'));
console.log('redeemScript ASM:', bitcoin.script.toASM(redeemScript));

const redeemScriptBuffer = Buffer.from(redeemScript, 'hex')
const p2shAddress = bitcoin.payments.p2sh({ redeem: { output: redeemScript } }).address
console.log('P2SH Address:', p2shAddress);

async function constructTransaction(outputAddress, amountToSend, privateKeyHex, utxoTxid, utxoOutputIndex, utxoAmount) {
    try {
        const network = bitcoin.networks.testnet;

        // Create a new PSBT instance
        const psbt = new Psbt({ network });

        // Add the input to the PSBT
        psbt.addInput({
            hash: utxoTxid,
            index: utxoOutputIndex,
            witnessUtxo: {
                script: Buffer.from('0014c819d8b265f8b4ebf1af797b0f92640b4a11c37e', 'hex'),
                value: utxoAmount * 1e8, 
            },
            redeemScript: Buffer.from(redeemScriptHex, 'hex')
        });

        // Add the output to the PSBT
        psbt.addOutput({
            address: outputAddress,
            value: Math.floor(amountToSend * 1e8), 
        });

        // Sign the input
        const privateKey = bitcoin.ECPair.fromPrivateKey(Buffer.from(privateKeyHex, 'hex'));
        psbt.signInput(1, privateKey); 

        // Finalize the PSBT
        psbt.finalizeAllInputs();

        // Extract the finalized transaction hex from the PSBT
        const transactionHex = psbt.extractTransaction().toHex();

        return transactionHex;
    } catch (error) {
        console.error('Error constructing transaction:', error);
        throw error;
    }
}

const amountToSend = 0.0001
const privateKeyHex = 'aTGB3KFubTka7SddepSF5igai8sc5NsktnM8NJxi8fwztxAE034g';
const utxoTxid = 'bd9feb24cae28466bfb88016d45a96fd92432ee00a44bd8a6668a8758d5d1389';
const utxoOutputIndex = 2
const utxoAmount = 0.00183220

constructTransaction(p2shAddress, amountToSend, privateKeyHex, utxoTxid, utxoOutputIndex, utxoAmount)
    .then((transactionHex) => {
        console.log('Constructed Transaction:', transactionHex);
    })
    .catch((error) => {
        console.error('Error constructing transaction:', error);
    });

    
    
// async function constructSpendingTransaction(outputAddress, amountToSend, privateKeyHex, utxoTxid, utxoOutputIndex, utxoAmount) {
//     try {
//         const network = bitcoin.networks.testnet;

//         // Create a new PSBT instance
//         const psbt = new Psbt({ network });

//         // Add the input from the previous transaction
//         psbt.addInput({
//             hash: utxoTxid,
//             index: utxoOutputIndex,
//             witnessUtxo: {
//                 script: Buffer.from(previousRedeemScriptHex, 'hex'),
//                 value: utxoAmount,
//             },
//             redeemScript: Buffer.from(previousRedeemScriptHex, 'hex')
//         });

//         // Add the new output
//         psbt.addOutput({
//             address: outputAddress,
//             value: amountToSend,
//         });

//         // Sign the input with the private key
//         const privateKey = bitcoin.ECPair.fromPrivateKey(Buffer.from(privateKeyHex, 'hex'));
//         psbt.signInput(0, privateKey);

//         // Finalize the PSBT
//         psbt.finalizeAllInputs();

//         // Extract the finalized transaction hex
//         const transactionHex = psbt.extractTransaction().toHex();

//         return transactionHex;
//     } catch (error) {
//         console.error('Error constructing new transaction:', error)
//         throw error
//     }
// }

// constructSpendingTransaction(newOutputAddress, newOutputAmount, privateKeyHex, utxoTxid, utxoOutputIndex, utxoAmount)
//     .then((transactionHex) => {
//         console.log('Constructed New Transaction Hex:', transactionHex)
//         const exec = require('child_process').exec;
//         const command = `bitcoin-cli -testnet sendrawtransaction ${transactionHex}`
//         exec(command, (error, stdout, stderr) => {
//             if (error) {
//                 console.error('Error broadcasting transaction:', error)
//                 return;
//             }
//             console.log('Transaction ID:', stdout.trim())
//         });
//     })
//     .catch((error) => {
//         console.error('Error constructing new transaction:', error)
//     })
