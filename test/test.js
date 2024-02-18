require("dotenv").config();

const { expect } = require('chai');
const { ethers } = require('hardhat');


let WethContractAddress, WethDeployed;
let GameContractAddress, GameDeployed;

describe("Test1", function () {
  let ownerAddress, ownerBalance, contractBalance, entryFee, remaining, counter, user, dummy, totalNFTSupply;
  
  before(async function () {
    await preTest();

    [dummy, user] = await ethers.getSigners();

    contractBalance = 0;
    entryFee = 512;
    remaining = 8;
    counter = 0;
    totalNFTSupply = 0;
    ownerAddress = GameDeployed.runner.address;

    await WethDeployed.connect(user).deposit({ value: 1000000000000000000000n });
  })

  it("Run 'playGame'.", async function() {
    const ownerBalanceBeforeStart = await WethDeployed.connect(user).balanceOf(ownerAddress);
    
    await WethDeployed.connect(user).approve(GameContractAddress, 200000000000000000000n);

    for (; remaining;) {
      await GameDeployed.connect(user).playGame(0, 2, { value: entryFee });
      contractBalance += entryFee;
      counter++;

      r = await GameDeployed.connect(user).getRemainNFT();
      if (r != remaining) {
        remaining--;
        totalNFTSupply++;
        entryFee = entryFee / 2;
        console.log("Hit!.. counter:", counter);
        console.log("Balance:", contractBalance);
        console.log(await GameDeployed.connect(user).getNFTList());
      }
    }
    
    ownerBalance = Number(ownerBalanceBeforeStart) + Math.floor(contractBalance / 2);
    contractBalance = contractBalance - Math.floor(contractBalance / 2);
  })

  it("Check contract balance.", async function() {
    expect(contractBalance).to.equal(await WethDeployed.connect(user).balanceOf(GameContractAddress));
  })
  it("Check owner balance.", async function() {
    expect(ownerBalance).to.equal(await WethDeployed.connect(user).balanceOf(ownerAddress));
  }) 
  it("Check total supply..", async function() {
    expect(totalNFTSupply).to.equal(await GameDeployed.connect(user).testGetTotalNFTSupply());
  }) 
  it("Check winner balance and burning NFTs.", async function() {
    const balanceContractBeforeClaim = await WethDeployed.connect(user).balanceOf(user);
    const balanceWinnerBeforeClaim = await WethDeployed.connect(user).balanceOf(GameContractAddress);

    await GameDeployed.connect(user).claimPrice();
    contractBalance = 0;
    totalNFTSupply = 0;

    expect(contractBalance).to.equal(await WethDeployed.connect(user).balanceOf(GameContractAddress));
    expect(balanceContractBeforeClaim + balanceWinnerBeforeClaim).to.equal(await WethDeployed.connect(user).balanceOf(user));
    expect(totalNFTSupply).to.equal(await GameDeployed.connect(user).testGetTotalNFTSupply());
  })
  it("Check Game Status.", async function () {
    await expect(GameDeployed.connect(user).playGame(20, 1, { value: 4 })).to.be.revertedWith("Game is over.");
    await expect(GameDeployed.connect(user).createDemand(500, [0])).to.be.revertedWith("Game is over.");
    await expect(GameDeployed.connect(user).rejectDemand(0)).to.be.revertedWith("Game is over.");
    await expect(GameDeployed.connect(user).updateDemand(0, 100)).to.be.revertedWith("Game is over.");
    await expect(GameDeployed.connect(user).deleteDemand(0)).to.be.revertedWith("Game is over.");
    await expect(GameDeployed.connect(user).acceptDemand(0)).to.be.revertedWith("Game is over.");
    await expect(GameDeployed.connect(user).claimPrice()).to.be.revertedWith("Game is over.");
  });
});


describe("Test2", function () {
  let dummy, user1, user2, user3, user4;
  let user1Arr = [], user2Arr = [], user3Arr = [], user4Arr = [];
  let user1In = [], user2In = [], user3In = [], user4In = [];
  let user1Out = [], user2Out = [], user3Out = [], user4Out = [];
  let contractBalance;

  
  before(async function () {
    await preTest();

    [dummy, user1, user2, user3, user4] = await ethers.getSigners();

    expect(GameContractAddress).to.not.be.undefined;

    await WethDeployed.connect(user1).deposit({ value: 1000000000000000000000n });
    await WethDeployed.connect(user2).deposit({ value: 1000000000000000000000n });
    await WethDeployed.connect(user3).deposit({ value: 1000000000000000000000n });
    await WethDeployed.connect(user4).deposit({ value: 1000000000000000000000n });   

    await WethDeployed.connect(user1).approve(GameContractAddress, 5000);
    await WethDeployed.connect(user2).approve(GameContractAddress, 5000);
    await WethDeployed.connect(user3).approve(GameContractAddress, 5000);
    await WethDeployed.connect(user4).approve(GameContractAddress, 5000);

    await GameDeployed.connect(user1).testMint(0, { value: 512 }); user1Arr.push([10, 0, user1.address]);
    await GameDeployed.connect(user1).testMint(1, { value: 256 }); user1Arr.push([20, 1, user1.address]);
    await GameDeployed.connect(user1).testMint(2, { value: 128 }); user1Arr.push([40, 2, user1.address]);
    await GameDeployed.connect(user2).testMint(3, { value: 64 }); user2Arr.push([80, 3, user2.address]);
    await GameDeployed.connect(user2).testMint(4, { value: 32 }); user2Arr.push([160, 4, user2.address]);
    await GameDeployed.connect(user2).testMint(5, { value: 16 }); user2Arr.push([320, 5, user2.address]);
    await GameDeployed.connect(user2).testMint(6, { value: 8 }); user2Arr.push([640, 6, user2.address]);

    contractBalance = 512 + 256 + 128 + 64 + 32 + 16 + 8;
  })


  // SHOW 
  {
    it("Join the game with insufficient allowance.", async function() {
      await WethDeployed.connect(user3).approve(GameContractAddress, 2);
      await expect(GameDeployed.connect(user3).playGame(5, 5, { value: 4 })).to.be.revertedWith("Insufficient allowance.");  
      await WethDeployed.connect(user3).approve(GameContractAddress, 5000); 
    })    
    it("Join the game with the same indexes.", async function() {
      await expect(GameDeployed.connect(user3).playGame(5, 5, { value: 4 })).to.be.revertedWith("Indexes should be different.");     
    }) 
    it("Join the game with out of boundry.", async function() {
      await expect(GameDeployed.connect(user3).playGame(20, 1, { value: 4 })).to.be.revertedWith("Out of boundries.");
    }) 
    it("Join the game with out of boundry.", async function() {
      await expect(GameDeployed.connect(user3).playGame(0, 16, { value: 4 })).to.be.revertedWith("Out of boundries.");
    }) 
    it("Join the game with wrong entry fee.", async function() {
      await expect(GameDeployed.connect(user3).playGame(0, 1, { value: 1 })).to.be.revertedWith("The value must be equal to the entry fee.");
    }) 
    it("Join the game with insufficient balance.", async function() {
      l = await WethDeployed.connect(user3).balanceOf(user3);
      await GameDeployed.connect(user3).testSetEntryFee(l + 10n);
      await WethDeployed.connect(user3).approve(GameContractAddress, l + 10n);   
      await expect(GameDeployed.connect(user3).playGame(0, 1, { value: 4 })).to.be.revertedWith("Insufficient balance.");
      await WethDeployed.connect(user3).approve(GameContractAddress, 5000);
      await GameDeployed.connect(user3).testSetEntryFee(4);

    }) 
    it("Run 'getNFTs' properly.", async function() {
      await GameDeployed.connect(user3).testMint(7, { value: 4 }); user3Arr.push([1280, 7, user3.address]);
      contractBalance += 4;
      contractBalance = contractBalance - Math.floor(contractBalance / 2);

      expect(user1Arr).to.deep.equal(await GameDeployed.connect(user1).getNFTs());
      expect(user2Arr).to.deep.equal(await GameDeployed.connect(user2).getNFTs());
      expect(user3Arr).to.deep.equal(await GameDeployed.connect(user3).getNFTs());
      expect(user4Arr).to.deep.equal(await GameDeployed.connect(user4).getNFTs());
    })
    it("Join the game when no NFT remains.", async function() {
      await expect(GameDeployed.connect(user3).playGame(0, 1, { value: 4 })).to.be.revertedWith("There are no more NFTs to be minted.");
    })
    it("Check contract balance.", async function() {
      expect(contractBalance).to.equal(await WethDeployed.connect(user1).balanceOf(GameContractAddress))
    })
  }
  
  
  // CREATE
  {
    it("Create demands with insufficient allowance.", async function() {
      await WethDeployed.connect(user3).approve(GameContractAddress, 50);
      await expect(GameDeployed.connect(user3).createDemand(500, [])).to.be.revertedWith("Insufficient allowance.");  
      await WethDeployed.connect(user3).approve(GameContractAddress, 5000);
   
    }) 
    it("Create demands with empty request", async function() {
      await expect(GameDeployed.connect(user3).createDemand(500, [])).to.be.revertedWith("The NFT list cannot be sent empty.");
    })
    it("Create demands for non-exist nft", async function() {
      await expect(GameDeployed.connect(user3).createDemand(500, [20])).to.be.revertedWith("There is no NFT with this ID.");
    }) 
    it("Create demands with different owner's NFTs", async function() {
      await expect(GameDeployed.connect(user3).createDemand(500, [1,2,3])).to.be.revertedWith("NFTs cannot have different owners.");
    }) 
    it("Create demands with lower price", async function() {
      await expect(GameDeployed.connect(user3).createDemand(10, [5,6])).to.be.revertedWith("A fee below the base price is not offered.");
    })
    it("Create demands with insufficent applicant balance", async function() {
      l = await WethDeployed.connect(user4).balanceOf(user4);
      await WethDeployed.connect(user4).approve(GameContractAddress, l + 10n);
      await expect(GameDeployed.connect(user4).createDemand(l + 10n, [5,6])).to.be.revertedWith("Insufficient balance.");
    })
    it("Create demands for own NFTs", async function() {   
      await expect(GameDeployed.connect(user1).createDemand(500, [1])).to.be.revertedWith("Demands can be created for someone else's NFT.");
    })
    it("Run 'createDemand' properly", async function() {
      await GameDeployed.connect(user3).createDemand(517, [0,1]);
      d = [0, user3.address, 517, [0,1], user1.address]; 
      user3Out.push(d); user1In.push(d);

      await GameDeployed.connect(user4).createDemand(500, [0,2]);
      d = [0, user4.address, 500, [0,2], user1.address];
      user4Out.push(d); user1In.push(d);
      
      await GameDeployed.connect(user1).createDemand(500, [5]);
      d = [0, user1.address, 500, [5], user2.address];
      user1Out.push(d); user2In.push(d);

      await GameDeployed.connect(user4).createDemand(500, [3]);
      d = [0, user4.address, 500, [3], user2.address];
      user4Out.push(d); user2In.push(d);

      await GameDeployed.connect(user4).createDemand(500, [3,4]);
      d = [0, user4.address, 500, [3,4], user2.address];
      user4Out.push(d); user2In.push(d);

      await GameDeployed.connect(user4).createDemand(5000, [6]);
      d = [0, user4.address, 5000, [6], user2.address];
      user4Out.push(d); user2In.push(d);

      await GameDeployed.connect(user3).createDemand(500, [1]);
      d = [0, user3.address, 500, [1], user1.address];
      user3Out.push(d); user1In.push(d);


      l = await GameDeployed.connect(user1).getInboundDemands();
      expect(l).to.deep.equal(user1In);

      l = await GameDeployed.connect(user1).getOutboundDemands();
      expect(l).to.deep.equal(user1Out);

      l = await GameDeployed.connect(user2).getInboundDemands();
      expect(l).to.deep.equal(user2In);

      l = await GameDeployed.connect(user2).getOutboundDemands();
      expect(l).to.deep.equal(user2Out);

      l = await GameDeployed.connect(user3).getInboundDemands();
      expect(l).to.deep.equal(user3In);

      l = await GameDeployed.connect(user3).getOutboundDemands();
      expect(l).to.deep.equal(user3Out);

      l = await GameDeployed.connect(user4).getInboundDemands();
      expect(l).to.deep.equal(user4In);

      l = await GameDeployed.connect(user4).getOutboundDemands();
      expect(l).to.deep.equal(user4Out);
    })
  }


  // REJECT 
  {
    it("Run 'rejectDemand' properly", async function() {
      await GameDeployed.connect(user2).rejectDemand(4);

      user2In[2][0] = 2;

      l = await GameDeployed.connect(user2).getInboundDemands();
      expect(l).to.deep.equal(user2In);

      l = await GameDeployed.connect(user4).getOutboundDemands();
      expect(l).to.deep.equal(user4Out);
    })
    it("Reject demands with non-exist id", async function() {
      await expect(GameDeployed.connect(user1).rejectDemand(20)).to.be.revertedWith("There is no demand with this ID.");
    })
    it("Reject demands with wrong owner", async function() {
      await expect(GameDeployed.connect(user1).rejectDemand(2)).to.be.revertedWith("Only the owner of the NFT can execute.");
      // No demand that belongs to this owner address in this demand id.
    })
    it("Reject demands with invalid demand id", async function() {
      await expect(GameDeployed.connect(user2).rejectDemand(4)).to.be.revertedWith("There is no valid demand with this ID.");
    })
  }


  // DELETE
  {
    it("Run 'deleteDemand' properly", async function() {
      await GameDeployed.connect(user4).deleteDemand(5);

      user2In[3][0] = 3;

      l = await GameDeployed.connect(user2).getInboundDemands();
      expect(l).to.deep.equal(user2In);

      l = await GameDeployed.connect(user4).getOutboundDemands();
      expect(l).to.deep.equal(user4Out);
    })
    it("Delete demands with non-exist id", async function() {
      await expect(GameDeployed.connect(user4).deleteDemand(15)).to.be.revertedWith("There is no demand with this ID.");
    })
    it("Delete demands with wrong owner", async function() {
      await expect(GameDeployed.connect(user1).deleteDemand(3)).to.be.revertedWith("Only the creator of the demand can execute.");
    })
    it("Delete demands with invalid demand id", async function() {
      await expect(GameDeployed.connect(user4).deleteDemand(4)).to.be.revertedWith("There is no valid demand with this ID.");
    })
  }


  // UPDATE
  {
    it("Run 'updateDemand' properly", async function() {
      await GameDeployed.connect(user1).updateDemand(2, 600);
      l = await GameDeployed.connect(user1).getOutboundDemands();
      user1Out[0][2] = 600;
      expect(l).to.deep.equal(user1Out);
    })
    it("Update demands with insufficient allowance.", async function() {
      await WethDeployed.connect(user4).approve(GameContractAddress, 60);
      await expect(GameDeployed.connect(user4).updateDemand(3, 600)).to.be.revertedWith("Insufficient allowance.");  
      await WethDeployed.connect(user4).approve(GameContractAddress, 5000);
    }) 
    it("Update demands with non-exist id", async function() {
      await expect(GameDeployed.connect(user1).updateDemand(12, 600)).to.be.revertedWith("There is no demand with this ID.");
    })
    it("Update demands with wrong owner", async function() {
      await expect(GameDeployed.connect(user1).updateDemand(3, 600)).to.be.revertedWith("Only the creator of the demand can execute.");
    })
    it("Update demands with invalid demand id", async function() {
      await expect(GameDeployed.connect(user4).updateDemand(4, 600)).to.be.revertedWith("There is no valid demand with this ID.");
    })
    it("Update demands with lower price", async function() { 
      await expect(GameDeployed.connect(user1).updateDemand(2, 100)).to.be.revertedWith("A fee below the base price is not offered.");
    })
    it("Update demands with insufficent applicant balance", async function() {
      l = await WethDeployed.connect(user1).balanceOf(user1);
      await WethDeployed.connect(user1).approve(GameContractAddress, l + 10n);
      await expect(GameDeployed.connect(user1).updateDemand(2, l + 10n)).to.be.revertedWith("Insufficient balance.");
    })
  }


  // ACCEPT
  {
    it("Accept demands with insufficient allowance.", async function() {
      await WethDeployed.connect(user3).approve(GameContractAddress, 5);
      await expect(GameDeployed.connect(user1).acceptDemand(0)).to.be.revertedWith("Insufficient allowance of the applicant.");  
      await WethDeployed.connect(user3).approve(GameContractAddress, 5000);
    }) 
    it("Accept demands with non-exist id", async function() {
      await expect(GameDeployed.connect(user1).acceptDemand(20)).to.be.revertedWith("There is no demand with this ID.");
    })
    it("Accept demands with wrong owner", async function() {
      await expect(GameDeployed.connect(user1).acceptDemand(3)).to.be.revertedWith("Only the owner of the NFT can execute.");
    })
    it("Accept demands with invalid demand id", async function() {
      await expect(GameDeployed.connect(user2).acceptDemand(4)).to.be.revertedWith("There is no valid demand with this ID.");
    })
    it("Accept demand but applicant's balance is insufficient.", async function() {
      await GameDeployed.connect(user2).createDemand(100, [2]);
      d = [0, user2.address, 100, [2], user1.address]; 
      user2Out.push(d); user1In.push(d);

      l = await WethDeployed.connect(user2).balanceOf(user2);
      await WethDeployed.connect(user2).withdraw(l);
      
      await expect(GameDeployed.connect(user1).acceptDemand(7)).to.be.revertedWith("Insufficient balance of the applicant.");
    })
    it("Run 'acceptDemand' properly", async function() {
      let balanceBuyerBefore = await WethDeployed.connect(user3).balanceOf(user3);
      let balanceSellerBefore = await WethDeployed.connect(user1).balanceOf(user1);
      
      t = await GameDeployed.connect(user1).acceptDemand(0);
      
      price = user1In[0][2];    
      toMinter = Math.floor(price / (2 * 10));
      contractBalance = contractBalance + 5;
      toSeller = price - 2 * toMinter - 5;

      expect(balanceBuyerBefore - BigInt(price)).to.equal(await WethDeployed.connect(user3).balanceOf(user3));
      expect(balanceSellerBefore + BigInt(toSeller) + 2n * BigInt(toMinter)).to.equal(await WethDeployed.connect(user1).balanceOf(user1));
      expect(contractBalance).to.equal(await WethDeployed.connect(user3).balanceOf(GameContractAddress));

      user1In[0][0] = 4;
      user1In[1][0] = 1;
      user1In[2][0] = 1;
  
      l = await GameDeployed.connect(user1).getInboundDemands();
      expect(l).to.deep.equal(user1In);
      
      l = await GameDeployed.connect(user3).getOutboundDemands();
      expect(l).to.deep.equal(user3Out);

      l = await GameDeployed.connect(user4).getOutboundDemands();
      expect(l).to.deep.equal(user4Out);

      user1Arr.splice(0, 2); 
      user3Arr.push([10, 0, user1.address]);
      user3Arr.push([20, 1, user1.address]);

      expect(user1Arr).to.deep.equal(await GameDeployed.connect(user1).getNFTs());
      expect(user3Arr).to.deep.equal(await GameDeployed.connect(user3).getNFTs());
    })
    it("Check minter balance", async function() {
      await GameDeployed.connect(user4).createDemand(300, [1]);
      d = [0, user4.address, 300, [1], user3.address]; 
      user4Out.push(d); user3In.push(d);

      let balanceBuyerBefore = await WethDeployed.connect(user4).balanceOf(user4);
      let balanceSellerBefore = await WethDeployed.connect(user3).balanceOf(user3);
      let balanceMinterBefore = await WethDeployed.connect(user1).balanceOf(user1);
      
      await GameDeployed.connect(user3).acceptDemand(8);

      price = user3In[0][2];
      toMinter = Math.floor(price / (1 * 10));
      contractBalance = contractBalance + 5;
      toSeller = price - toMinter - 5;

      expect(contractBalance).to.equal(await WethDeployed.connect(user3).balanceOf(GameContractAddress));
      expect(balanceMinterBefore + BigInt(toMinter)).to.equal(await WethDeployed.connect(user1).balanceOf(user1));
      expect(balanceBuyerBefore - BigInt(price)).to.equal(await WethDeployed.connect(user4).balanceOf(user4));
      expect(balanceSellerBefore + BigInt(toSeller)).to.equal(await WethDeployed.connect(user3).balanceOf(user3));
      
      user3In[0][0] = 4;
  
      l = await GameDeployed.connect(user3).getInboundDemands();
      expect(l).to.deep.equal(user3In);
      
      l = await GameDeployed.connect(user4).getOutboundDemands();
      expect(l).to.deep.equal(user4Out);

      user3Arr.pop();
      user4Arr.push([20, 1, user1.address]);

      expect(user3Arr).to.deep.equal(await GameDeployed.connect(user3).getNFTs());
      expect(user4Arr).to.deep.equal(await GameDeployed.connect(user4).getNFTs());
    })
  }


  // CLAIM
  it("Claim price before completing the collection", async function() {
    await expect(GameDeployed.connect(user1).claimPrice()).to.be.revertedWith("Not have all NFTs.");
  })
});


describe("Test3", function () {
  let dummy, user1, user4;
  
  before(async function () {
    await preTest();

    [dummy, user1, user4] = await ethers.getSigners();

    expect(GameContractAddress).to.not.be.undefined;

    await WethDeployed.connect(user1).deposit({ value: 1000000000000000000000n });
    await WethDeployed.connect(user4).deposit({ value: 1000000000000000000000n });   

    await WethDeployed.connect(user1).approve(GameContractAddress, 50000);
    await WethDeployed.connect(user4).approve(GameContractAddress, 50000);

    await GameDeployed.connect(user4).testMint(0, { value: 512 });
    await GameDeployed.connect(user1).testMint(1, { value: 256 }); 
    await GameDeployed.connect(user1).testMint(2, { value: 128 }); 
    await GameDeployed.connect(user1).testMint(3, { value: 64 }); 
    await GameDeployed.connect(user1).testMint(4, { value: 32 }); 
    await GameDeployed.connect(user1).testMint(5, { value: 16 }); 
    await GameDeployed.connect(user1).testMint(6, { value: 8 }); 
    await GameDeployed.connect(user1).testMint(7, { value: 4 }); 

    for(let i = 0; i < 5; i++) {
      await GameDeployed.connect(user4).createDemand(900, [3]);
      await GameDeployed.connect(user4).createDemand(900, [4]); 
      await GameDeployed.connect(user4).createDemand(900, [3, 6]);
      await GameDeployed.connect(user4).createDemand(900, [3, 4, 5]);
      await GameDeployed.connect(user4).createDemand(900, [3, 6]);
      await GameDeployed.connect(user4).createDemand(900, [3, 4, 5]);
      await GameDeployed.connect(user4).createDemand(9000, [4, 5, 6]);
      await GameDeployed.connect(user4).createDemand(9000, [5, 6]);
    }
  })
  
  it("Test 'update' cost", async function() {    
    await GameDeployed.connect(user4).createDemand(3000, [1, 2, 3, 4, 5, 6, 7]);
    await GameDeployed.connect(user4).updateDemand(40, 6000);
    await GameDeployed.connect(user4).getNFTs();
  })
  it("Test 'accept' cost", async function() {
    await GameDeployed.connect(user1).acceptDemand(1);
  })
})



async function preTest() {
  const network = process.env.NETWORK;

  if (network === "localhost") {
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
  else if (network === "hardhat") {
    // deploy WETH
    const WethContract = await hre.ethers.getContractFactory("WETH9");
    WethDeployed = await WethContract.deploy();
    await WethDeployed.waitForDeployment();
    WethContractAddress = await WethDeployed.getAddress();
    console.log("Weth, deployed to:", WethContractAddress);

    // deploy Game
    const GameContract = await hre.ethers.getContractFactory("Game");
    GameDeployed = await GameContract.deploy(WethContractAddress)
    await GameDeployed.waitForDeployment();
    GameContractAddress = await GameDeployed.getAddress();
    console.log("Game, deployed to:", GameContractAddress);
  } 
  else {
    console.error("Unrecognized network.");
    process.exit(1);
  }
}