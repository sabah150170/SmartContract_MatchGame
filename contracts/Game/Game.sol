// SPDX-License-Identifier: MIT OR UNLICENSED
pragma solidity ^0.8.20;

import "./Common.sol";
import "./GameNFT.sol";

// Interface for the WETH contract
interface IWETH {
    function transferFrom(address from, address to, uint amount) external returns (bool);
    function balanceOf(address account) external view returns (uint);
    function allowance(address owner, address spender) external view returns (uint);
    function approve(address spender, uint amount) external returns (uint);
}

contract Game is Common {
    /*** CONSTRUCTOR  ***/
    GameNFT private immutable GCI;
    IWETH private immutable WETH;

    constructor(address _wethAddress) {
        // Create an instance of OtherContract
        GCI = new GameNFT();
        WETH = IWETH(_wethAddress);

        contractOwner = payable(msg.sender);
    }

    /*** MODIFIER ***/
    modifier checkDemandId(uint _id) {
        require(_id < next_demandId, "There is no demand with this ID.");
        require(demands[_id].validity == DemandState.Valid, "There is no valid demand with this ID.");
        _;
    }

    modifier checkFinancial(uint _amount) {
        require(_amount <= WETH.allowance(msg.sender, address(this)), "Insufficient allowance.");
        require(_amount <= WETH.balanceOf(msg.sender), "Insufficient balance.");
        _;
    }

    modifier checkGame() {
        require(gameIsOver == false, "Game is over.");
        _;
    }

    modifier IsApplicant(uint _id) {
        require(demands[_id].applicant == msg.sender, "Only the creator of the demand can execute.");
        _;
    }

    modifier IsOwner(uint _id) {
        require(demands[_id].owner == msg.sender, "Only the owner of the NFT can execute.");
        _;
    }

    modifier addApprove(uint _amount) {
        uint amount = WETH.allowance(msg.sender, address(this)) + _amount;
        WETH.approve(address(this), amount);
        _;        
    }

    /*** CONSTANTS  ***/
    uint constant NUMBER_OF_INDEX = NUMBER_OF_NFTs * 2;
    uint constant ENTRY_FEE = 512;
    uint constant OWNERSHIP_SHARE = 2;
    uint constant GAME_COMMISSION = 5;
    uint constant MINTER_COMMISSION = 10;

    /*** ENUMS ***/
    enum DemandState {
        Valid,
        Invalid,
        Rejected,
        Deleted,
        Accepted
    }

    /*** STRUCTS ***/
    struct Demand {
        DemandState validity;
        address applicant;
        uint price;
        uint[] NFTs; // keeps tokenId of NFTs
        address owner;
    }

    /*** VARIABLES ***/
    address payable private immutable contractOwner;
    uint private next_demandId;
    uint private remaining = NUMBER_OF_NFTs;
    uint private entryFee = ENTRY_FEE;
    bool private gameIsOver = false;

    // key: applicant address
    mapping(address => uint[]) outboundDemands;

    // key: owner address
    mapping(address => uint[]) inboundDemands;

    // key: DemandId
    mapping(uint => Demand) demands;


    /*** EVENTS  ***/
    event NewMinting(address indexed minter, uint tokenUri, uint entryFee, uint remaining);
    event GetImages(uint[] randomArr, bool result);
    event DemandAccepted(address indexed buyer, address indexed seller, uint[] acceptedNFTs);


    /*** FUNCTIONS ***/
    function playGame(uint f_idx, uint s_idx) public payable checkGame addApprove(entryFee) checkFinancial(entryFee) {
        require(remaining > 0, "There are no more NFTs to be minted.");
        require(f_idx < NUMBER_OF_INDEX && s_idx < NUMBER_OF_INDEX, "Out of boundries.");
        require(s_idx != f_idx, "Indexes should be different.");
        require(entryFee == msg.value, "The value must be equal to the entry fee.");

        // add WETH tokens to participate
        require(WETH.transferFrom(msg.sender, address(this), msg.value), "Transfer failed");

        bool result = false;

        // shuffle
        uint[] memory randomArr = shuffle();

        // check whether hit
        uint first = randomArr[f_idx];
        if (first == randomArr[s_idx] && GCI.getStateOfNFTs(first) == NFTState.NotMinted) {
            GCI.mintNFT(first, msg.sender);

            unchecked {entryFee = entryFee / 2;}
            unchecked {--remaining;}
            result = true;

            emit NewMinting(msg.sender, first, entryFee, remaining);
        }

        // game is over, send owner price
        if (remaining == 0) {
            uint balance = WETH.balanceOf(address(this)) / OWNERSHIP_SHARE;
            require(WETH.transferFrom(address(this), contractOwner, balance), "Transfer failed");
        }

        emit GetImages(randomArr, result);
    }

    function createDemand(uint price, uint[] calldata NFTs) public checkGame checkFinancial(price) {
        require(NFTs.length > 0, "The NFT list cannot be sent empty.");

        // demand list holds tokenId not tokenUri
        uint _nextTokenId = GCI.getNextTokenId();
        require(NFTs[0] < _nextTokenId, "There is no NFT with this ID.");

        address owner = GCI.ownerOf(NFTs[0]);
        require(owner != msg.sender, "Demands can be created for someone else's NFT.");

        NFT[] memory list = GCI.getNFTList();
        uint p = list[NFTs[0]].basePrice;

        for (uint i = 1; i < NFTs.length;) {
            // check whether all owners are the same and demands exist
            require(NFTs[i] < _nextTokenId, "There is no NFT with this ID.");
            require(owner == GCI.ownerOf(NFTs[i]), "NFTs cannot have different owners.");

            unchecked {p = p + list[NFTs[i]].basePrice;}
            unchecked {++i;}
        }
        require(p <= price, "A fee below the base price is not offered.");

        uint currentId;
        unchecked {currentId = next_demandId++;}
        demands[currentId] = Demand(DemandState.Valid, msg.sender, price, NFTs, owner);

        outboundDemands[msg.sender].push(currentId);
        inboundDemands[owner].push(currentId);

        //emit DemandCreated(demandId);
    }

    function deleteDemand(uint demandId) public checkGame checkDemandId(demandId) IsApplicant(demandId) {
        demands[demandId].validity = DemandState.Deleted;

        //emit DemandDeleted(demandId);
    }

    function updateDemand(uint demandId, uint price) public checkGame checkDemandId(demandId) IsApplicant(demandId) checkFinancial(price) {
        uint p = 0;
        NFT[] memory list = GCI.getNFTList();
        for (uint i = 0; i < demands[demandId].NFTs.length;) {
            unchecked {p = p + list[demands[demandId].NFTs[i]].basePrice;}
            unchecked {++i;}
        }
        require(p <= price, "A fee below the base price is not offered.");

        demands[demandId].price = price;

        //emit PriceUpdated(demandId);
    }

    function acceptDemand(uint demandId) public payable checkGame checkDemandId(demandId) IsOwner(demandId) {
        Demand memory demand = demands[demandId];
        require(demand.price <= WETH.allowance(demand.applicant, address(this)), "Insufficient allowance of the applicant.");
        require(demand.price <= WETH.balanceOf(demand.applicant), "Insufficient balance of the applicant.");

        // commission for the minters
        NFT[] memory NFTList = GCI.getNFTList();
        uint m;
        unchecked {m = MINTER_COMMISSION * demand.NFTs.length;}
        
        for (uint i = 0; i < demand.NFTs.length;) {
            require(WETH.transferFrom(demand.applicant, NFTList[demand.NFTs[i]].minter, demand.price / m), "Transfer failed");
            unchecked {++i;}
        }

        // commission for the game
        require(WETH.transferFrom(demand.applicant, address(this), GAME_COMMISSION), "Transfer failed");

        // get price
        uint p = demand.price - demand.NFTs.length * (demand.price / m) - GAME_COMMISSION;
        require(WETH.transferFrom(demand.applicant, msg.sender, p), "Transfer failed");

        // send NFTS
        for (uint i = 0; i < demand.NFTs.length;) {
            GCI.safeNFTTransfer(msg.sender, demand.applicant, demand.NFTs[i]);
            unchecked {++i;}
        }

        demands[demandId].validity = DemandState.Accepted;

        //make invalid other related demands
        makeInvalidDemands(demand);

        emit DemandAccepted(demand.applicant, msg.sender, demand.NFTs);
    }

    function rejectDemand(uint demandId) public checkGame checkDemandId(demandId) IsOwner(demandId) {
        demands[demandId].validity = DemandState.Rejected;

        //emit DemandRejected(demandId);
    }

    function claimPrice() public checkGame {
        require(GCI.balanceOf(msg.sender) == NUMBER_OF_NFTs, "Not have all NFTs.");

        // Transfer WETH tokens price to the winner
        require(WETH.transferFrom(address(this), msg.sender, WETH.balanceOf(address(this))), "Transfer failed");

        GCI.burnAllNFTs();

        // ALL OVER!...
        gameIsOver = true;
    }

    // helper functions
    function makeInvalidDemands(Demand memory demand) private {  
        uint[] memory inList = inboundDemands[msg.sender];
        uint _next_demandId = next_demandId;
        
        for (uint i = 0; i < inList.length; i++) {
            if (demands[inList[i]].validity == DemandState.Valid) {
                for (uint j = 0; j < demand.NFTs.length;) {
                    for (uint k = 0; k < demands[inList[i]].NFTs.length;) {
                        if(demands[inList[i]].NFTs[k] == demand.NFTs[j]) {
                            demands[inList[i]].validity = DemandState.Invalid;
                            k = _next_demandId;
                            j = _next_demandId;
                        }
                        unchecked {++k;}
                    }
                    unchecked {++j;}
                }
            }
        }
    }

    function shuffle() private view returns (uint[] memory) {
        uint[] memory randomArr = new uint[](NUMBER_OF_INDEX);
        for (uint i = 0; i < NUMBER_OF_NFTs;) {
            randomArr[i] = randomArr[NUMBER_OF_NFTs + i ] = i;
            unchecked {++i;}
        }

        // pseudo random
        for (uint i = 0; i < randomArr.length;) { 
            uint n = uint(keccak256(abi.encodePacked(i + block.timestamp, block.prevrandao))) % randomArr.length;

            uint temp = randomArr[n];
            randomArr[n] = randomArr[i];
            randomArr[i] = temp;
            unchecked {++i;}
        }
        
        return randomArr;
    }

    // get functions
    function getNFTs() public view returns (NFT[] memory) {
        NFT[] memory NFTList = GCI.getNFTList();
        uint balance = GCI.balanceOf(msg.sender);

        NFT[] memory list = new NFT[](balance);        
        for (uint i = 0; i < balance;) {
            list[i] = NFTList[GCI.tokenOfOwnerByIndex(msg.sender, i)];
            unchecked {++i;}
        }

        return list;
    }

    function getInboundDemands() public view returns (Demand[] memory) {
        Demand[] memory list = new Demand[](inboundDemands[msg.sender].length);
        for (uint i = 0; i < inboundDemands[msg.sender].length; i++) {
            list[i] = demands[inboundDemands[msg.sender][i]];
        }

        return list;
    }

    function getOutboundDemands() public view returns (Demand[] memory) {
        Demand[] memory list = new Demand[](outboundDemands[msg.sender].length);
        for (uint i = 0; i < outboundDemands[msg.sender].length; i++) {
            list[i] = demands[outboundDemands[msg.sender][i]];
        }

        return list;
    }

    function getRemainNFT() public view returns (uint) {
        return remaining;
    }

    function getEntryFee() public view returns (uint) {
        return entryFee;
    }

    function getNFTList() public view returns (NFT[] memory) {
        NFT[] memory n = GCI.getNFTList();
        return n;
    }
}
