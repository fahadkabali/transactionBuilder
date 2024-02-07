import crypto from 'crypto'
import bitcoin from 'bitcoinjs-lib'
import { ECPairFactory } from 'ecpair'
import * as ecc from 'tiny-secp256k1'

const ECPair = ECPairFactory(ecc)

// Function for generating the redeem script in hex format for the given pre-image.
function generateRedeemScript(preImage) {
  const sha256Hash = crypto.createHash('sha256').update(preImage).digest('hex')
  const redeemScript = `OP_SHA256 ${sha256Hash} OP_EQUAL`
  return redeemScript
}

const preImage = 'Btrust Builders'
const redeemScript = generateRedeemScript(preImage)
//console.log(redeemScript)

// Function for deriving an address with from the above redeem script.
function deriveAddress(redeemScript) {
  const script = bitcoin.script.fromASM(redeemScript)
  const { address } = bitcoin.payments.p2sh({ redeem: { output: script } })
  return address
}
const address = deriveAddress(redeemScript);
//console.log(address);

// Function to construct a transaction.
function constructTransaction(address, amount) {
  const network = bitcoin.networks.testnet
  const keyPair = ECPair.makeRandom({ network });
  //const privateKey = Buffer.from('16e05614526c1ebd3a170a430a1906a6484fdd203ab7ce6690a54938f5c44d7d', 'hex');
  //const keyPair = ECPair.fromPrivateKey(privateKey, { network })

  const psbt = new bitcoin.Psbt(bitcoin.networks.testnet)

  psbt.addInput({
    hash: 'ff272fdb1e9f2ca6f7d286b4b0a7969237d65cc5b9cbe196f1c95f8b6e860507',
    index: 1,
    nonWitnessUtxo: Buffer.from(
      '02000000000101a31ed7920359264286a246deff28260f73a35062de0b8b65a3a3d9ddfd59acf90000000000fdffffff02c287caf4000000001976a91499cad6021512d7bd2078c3f47922888832ca5c3d88ac20030300000000001976a914a6dc9efbbd50e1ef0c3ac6763228bc96d9adce8388ac024730440220499ba5fde8e69118ccc93f428a994e4b56ae551663ae02b51466857e82e32f1502206d4fc453e95a0ab4e0fdfdf38abd389ba042449ce98e78336f63391905ea5f8b0121035468dabd4848979d155100226a47e378a0270b449a16078c3b2c2f6baa2b10b431522700',
      'hex'
    ),
  });

  psbt.addOutput({
    address: address,
    value: Math.floor(amount * 1e8),
  })
  psbt.signInput(0, keyPair)
  psbt.finalizeAllInputs()

  const txHex = psbt.extractTransaction().toHex()
  return txHex;
}

const amount = 0.001
const transactionHex = constructTransaction(address, amount)
console.log(transactionHex)


// function Construct Transaction to Spend Bitcoins.
// function constructSpendingTransaction(previousTxHex, unlockingScript, outputAddress, outputAmount) {
//   const network = bitcoin.networks.testnet
//   const keyPair = ECPair.makeRandom({ network })
//   const txb = new bitcoin.Psbt({network})
//   txb.addInput('ff272fdb1e9f2ca6f7d286b4b0a7969237d65cc5b9cbe196f1c95f8b6e860507', 1, unlockingScript)
//   txb.addOutput(outputAddress, outputAmount)
//   txb.sign(0, keyPair)
//   const tx = txb.build()
//   const txHex = tx.toHex()
//   return txHex-
// }

// const previousTxHex = '02000000000101a31ed7920359264286a246deff28260f73a35062de0b8b65a3a3d9ddfd59acf90000000000fdffffff02c287caf4000000001976a91499cad6021512d7bd2078c3f47922888832ca5c3d88ac20030300000000001976a914a6dc9efbbd50e1ef0c3ac6763228bc96d9adce8388ac024730440220499ba5fde8e69118ccc93f428a994e4b56ae551663ae02b51466857e82e32f1502206d4fc453e95a0ab4e0fdfdf38abd389ba042449ce98e78336f63391905ea5f8b0121035468dabd4848979d155100226a47e378a0270b449a16078c3b2c2f6baa2b10b431522700' 
// const unlockingScript = '76a914a6dc9efbbd50e1ef0c3ac6763228bc96d9adce8388ac' 
// const outputAddress = 'mvjEkv4cTYoAtbVAN9N8JqrBH4nazjPH93'
// const outputAmount = 0.001
// const spendingTransactionHex = constructSpendingTransaction(previousTxHex, unlockingScript, outputAddress, outputAmount)
// //console.log(spendingTransactionHex)
