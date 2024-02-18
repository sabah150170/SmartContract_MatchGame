const fs = require('fs');

// Load the JSON file containing the compiled bytecode
const compiledData = JSON.parse(fs.readFileSync('./artifacts/contracts/Game/Game.sol/Game.json'));

// Get the bytecode
const bytecode = compiledData.bytecode;

// Calculate the byte size
const byteSize = bytecode.length / 2; // Divide by 2 since each byte is represented by 2 characters in hexadecimal

console.log("Byte size of the contract:", byteSize);