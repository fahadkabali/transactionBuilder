const bitcoin = require('bitcoinjs-lib')
const { Psbt } = require('bitcoinjs-lib')
const ECPairFactory = require('ecpair').default
const ecc = require('tiny-secp256k1')
const ECPair = ECPairFactory(ecc)
const network = bitcoin.networks.testnet


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
const outputAddress = bitcoin.payments.p2sh({ redeem: { output: redeemScriptBuffer} }).address
console.log('P2SH Address:', outputAddress);

async function constructTransaction(outputAddress, privateKeyHex, utxoTxid, utxoHex) {
    try {
        
        const keyPair= ECPair.fromWIF(privateKeyHex, network)

        // Create a new PSBT instance
        const psbt = new bitcoin.Psbt({ network })
        psbt.setVersion(2);
        psbt.setLocktime(0);

        // Add the input to the PSBT
        psbt.addInput({
            hash: utxoTxid,
            index: 0,
            nonWitnessUtxo: Buffer.from(utxoHex, 'hex'),
        });

        // Add the output to the PSBT
        psbt.addOutput({
            script: Buffer.from(outputAddress,'hex'),
            value: 20000, 
        });

        // Sign the input
        psbt.signInput(0, keyPair); 

        // Finalize the PSBT
        psbt.finalizeAllInputs();

        // Extract the finalized transaction hex from the PSBT
        const transactionHex = psbt.extractTransaction().toHex()

        return transactionHex;
    } catch (error) {
        console.error('Error constructing transaction:', error);
        throw error;
    }
}

const privateKeyHex = 'cQGMx2kk5jAppb1igyUv4SDUvDaWP9xZU47K4mmwTg1R9oMjNtTz';
const utxoTxid = '81018435efa1942bd6b03be999b709d817c42add8fc14ca504811872ee4db9db';
const utxoHex = '02000000000101caee8b5ac5a58094b70745fb497cf52a5b686cfc21940394836665479626e6910100000000fdffffff02f47a0100000000001976a914d798d42b6ec6818157a8ee46f935affb58a6c08a88ac697a7be2000000001976a91413772d67780951b0952d3490b52e0714564cae8f88ac02473044022063546d345e2a33cf0566085a99a023df9a897d9a9269975b4d55412d65563b8b02205d744feb0bf719e183b688353ad41cf7167f6865f76a0d05a34e5f4a293b7062012102d193603650a187c820d312110c90215af39c64385e71bf62d3d13b72ee3f4f8112582700';

constructTransaction(outputAddress, privateKeyHex, utxoTxid, utxoHex)
    .then((transactionHex) => {
        console.log('Constructed Transaction:', transactionHex);
    })
    .catch((error) => {
        console.error('Error constructing transaction:', error);
    });

    
    
async function constructSpendingTransaction(outputAddress, amountToSend, privateKeyHex, utxoTxid, utxoOutputIndex, utxoAmount) {
    try {
        const network = bitcoin.networks.testnet;

        // Create a new PSBT instance
        const psbt = new Psbt({ network });

        // Add the input from the previous transaction
        psbt.addInput({
            hash: utxoTxid,
            index: utxoOutputIndex,
            witnessUtxo: {
                script: Buffer.from(previousRedeemScriptHex, 'hex'),
                value: utxoAmount,
            },
            redeemScript: Buffer.from(previousRedeemScriptHex, 'hex')
        });

        // Add the new output
        psbt.addOutput({
            address: outputAddress,
            value: amountToSend,
        });

        // Sign the input with the private key
        const privateKey = bitcoin.ECPair.fromPrivateKey(Buffer.from(privateKeyHex, 'hex'));
        psbt.signInput(0, privateKey);

        // Finalize the PSBT
        psbt.finalizeAllInputs();

        // Extract the finalized transaction hex
        const transactionHex = psbt.extractTransaction().toHex();

        return transactionHex;
    } catch (error) {
        console.error('Error constructing new transaction:', error)
        throw error
    }
}

constructSpendingTransaction(newOutputAddress, newOutputAmount, privateKeyHex, utxoTxid, utxoOutputIndex, utxoAmount)
    .then((transactionHex) => {
        console.log('Constructed New Transaction Hex:', transactionHex)
        const exec = require('child_process').exec;
        const command = `bitcoin-cli -testnet sendrawtransaction ${transactionHex}`
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Error broadcasting transaction:', error)
                return;
            }
            console.log('Transaction ID:', stdout.trim())
        });
    })
    .catch((error) => {
        console.error('Error constructing new transaction:', error)
    })
