const axios = require('axios');
const fs = require('fs');
const path = require('path');
require("dotenv").config();


// download the file from GitHub and save it
const githubUrl = process.env.WETH_CONTRACT_URL

const downloadDirectory = path.join(__dirname, '../contracts/Weth');

if (!fs.existsSync(downloadDirectory)) {
    fs.mkdirSync(downloadDirectory);
}

const savePath = path.join(downloadDirectory, 'WETH9.sol');
axios.get(githubUrl)
.then(response => {
    fs.writeFileSync(savePath, response.data);
    console.log(`Solidity file downloaded and saved to ${savePath}`);
})
.catch(error => {
    console.error(`Error downloading Solidity file: ${error.message}`);
});
