require("dotenv").config();
const { ethers } = require('hardhat');


let WethContractAddress, WethDeployed;
let GameContractAddress, GameDeployed;


describe("Frontend Helper", function () {
  
  before(async function () {
    await preTest();

    let users = await ethers.getSigners();

    
    await WethDeployed.connect(users[19]).deposit({ value: 1000000000000000000000n }); 
    await WethDeployed.connect(users[19]).approve(GameContractAddress, 50000);

    await WethDeployed.connect(users[0]).deposit({ value: 1000000000000000000000n }); 
    await WethDeployed.connect(users[0]).approve(GameContractAddress, 50000);
    

    ///wait GameDeployed.connect(users[19]).testMint(0, { value: 512 });
    //await GameDeployed.connect(users[19]).testMint(1, { value: 256 }); 
    //await GameDeployed.connect(users[0]).testMint(4, { value: 32 }); 
    //await GameDeployed.connect(users[0]).testMint(3, { value: 64 });
    //await GameDeployed.connect(users[19]).testMint(2, { value: 128 });
    //await GameDeployed.connect(users[0]).testMint(5, { value: 16 });

    //await GameDeployed.connect(users[0]).createDemand(9000, [0]); // 0
    //await GameDeployed.connect(users[19]).acceptDemand(0);

    /*
    await GameDeployed.connect(users[19]).playGame(0, 2, { value: 64 });
    await GameDeployed.connect(users[19]).playGame(0, 2, { value: 64 });
    await GameDeployed.connect(users[19]).playGame(0, 2, { value: 64 });
    await GameDeployed.connect(users[19]).playGame(0, 2, { value: 64 });
    */

  })
  
  it("Run", async function() {
    console.log()
  })
})



async function preTest() {
    // WETH Contract
    WethContractAddress = process.env.WETH_CONTRACT_ADDRESS;
    const w = await ethers.getContractFactory('WETH9');
    WethDeployed = w.attach(WethContractAddress);
    console.log("Weth address:", WethContractAddress);
    
    // Game Contract
    GameContractAddress = process.env.GAME_CONTRACT_ADDRESS;
    const g = await ethers.getContractFactory('Game');
    GameDeployed = g.attach(GameContractAddress); 
    console.log("Game address:", GameContractAddress);  
}