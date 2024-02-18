import { ethers } from "./ethers-5.1.esm.min.js"


export const TOTAL_NFT = 8;
export let contract, playGameTxHash, entryFee, signerAddress;


const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
let signer;


/*** CONNECT TO METAMASK ***/

export async function checkConnection() {
    return new Promise(async (resolve)=> {
        if (typeof window.ethereum !== "undefined") {
            console.log("LOG: Metamask detected.");
            setTimeout(async () => { // Make the callback function async
                if (window.ethereum.selectedAddress !== null) {
                    console.log("LOG: Connected to MetaMask, account:", window.ethereum.selectedAddress);
                    await getSmartContract();
                    resolve("connected");
                } else {
                    console.log("LOG: Connected account not detected.");
                    resolve("account");
                }
            }, 100); // 100 milliseconds = 0.1 seconds
        } else {
            console.log("LOG: Metamask not detected.");
            resolve("metamask");
        }
    });
}

export async function connectMetamask() {
    return new Promise(async (resolve) => {
        try {
            const currentAccount = await window.ethereum.request({ method: "eth_requestAccounts" });
            console.log("LOG: Connected to MetaMask, account:", currentAccount);
            document.getElementById("p1").style.display = "none";
            await getSmartContract();
            resolve("connected");
        }
        catch (error) {
            console.error("ERROR:", error.message);
            var paragraph = document.getElementById("p1");
            paragraph.style.display = "block";
            paragraph.textContent = error.message;
        }
    });
}


/*** SMART CONTRACT ***/

export async function getAllNFTs() {
    try {
        if (contract !== "undefined") {
            let r = await contract.connect(signer).getNFTList();
            return r;
        } else {
            console.log("ERROR: Contract undefined");
        }
    } catch (error) {
        printError(error);
    }
}

export async function getMyNFTs() {
    try {
        if (contract !== "undefined") {
            let r = await contract.connect(signer).getNFTs();
            return r;
        } else {
            console.log("ERROR: Contract undefined");
        }
    } catch (error) {
        printError(error);
    }
}

async function getContractWethBalance() {

}

async function getMyWethBalance() {

}

export async function getEntryFee() {
    return new Promise(async (resolve) => {
        try {
            if (contract !== "undefined") {
                let e = await contract.connect(signer).getEntryFee();
                resolve(e);
            } else {
                console.log("ERROR: Contract undefined");
            }
        }
        catch (error) {
            printError(error);
        }
    });
}

export async function getRemaining() {
    return new Promise(async (resolve) => {
        try {
            if (contract !== "undefined") {
                let r = await contract.connect(signer).getRemainNFT();
                resolve(r);
            } else {
                console.log("ERROR: Contract undefined");
            }
        }
        catch (error) {
            printError(error);
        }
    });
}

async function getMyInboundDemands() {

}

async function getMyOutboundDemands() {

}

export async function setPlayGame(first, second) {
    try {
        if (contract !== "undefined") {
            let tx = await contract.connect(signer).playGame(first, second, { value: entryFee });
            playGameTxHash = tx.hash;
        } else {
            console.log("ERROR: Contract undefined");
            return "error";
        }
    } catch (error) {
        printError(error);
        return "error";
    }     
}

async function setCreateDemand() {

}

async function setDeleteDemand() {

}

async function setRejectDemand() {

}

async function setAcceptDemand() {

}

async function setClaimPrice() {

}


/*** HELPER FUNCTIONS ***/

async function getSmartContract() {
    return new Promise(async (resolve) => {
        try {
            // Connect to MetaMask
            await window.ethereum.enable();
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();

            signer.getAddress().then(address => {
                signerAddress = address;
            }).catch(error => {
                console.error("ERROR:", error);
            });

            readTextFile("Game.abi", "text/plain", function(contractABI) {
                contract = new ethers.Contract(contractAddress, contractABI, signer);
                resolve("ok");
            });
        }
        catch (error) {
            console.error("ERROR:", error);
        }
    });
}

function readTextFile(file, mime, callback) { //get content of abi 
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType(mime);
    rawFile.open("GET", file, true)
    rawFile.onreadystatechange = function() {
      if (rawFile.readyState === 4 && rawFile.status == "200") {
        callback(rawFile.responseText);
      }
    }
    rawFile.send(null)
}

function printError(error) {
    try {
        // If the error is due to a contract revert, extract the revert reason from the error message
        const errorMessage = error.data.message; 
        const revertReasonMatch = errorMessage.match(/VM Exception while processing transaction: reverted with reason string (.*)/);

        var paragraph = document.getElementById("p1");
        paragraph.style.display = "block";

        if (revertReasonMatch) {
            const revertReason = revertReasonMatch[1].replace(/['.]/g, "");
            paragraph.textContent = `${revertReason}`;
        } else {
            paragraph.textContent = `ERROR: ${error}`;
        }
    } catch(e) {
        console.log("ERROR: ", error);
    }      
}

export function updateEntryFee(_entryFee) {
    entryFee = _entryFee;
}