// SPDX-License-Identifier: MIT OR UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./Common.sol";

contract GameNFT is Common, ERC721, ERC721Enumerable {

    /*** CONSTANTS  ***/
    uint constant FIRST_NFT_VALUE = 10;

    /*** VARIABLES ***/
    uint private _nextTokenId;
    NFT[NUMBER_OF_NFTs] private NFTList;
    mapping (uint => NFTState) private stateOfNFTs;
    uint private currentNFTValue = FIRST_NFT_VALUE;


    /*** CONSTRUCTOR ***/
    constructor() ERC721("GameToken", "GTK")  {
      _nextTokenId = 0;

      // indicate if NFT is minted already
      stateOfNFTs[0] = NFTState.NotMinted;
      stateOfNFTs[1] = NFTState.NotMinted;
      stateOfNFTs[2] = NFTState.NotMinted;
      stateOfNFTs[3] = NFTState.NotMinted;
      stateOfNFTs[4] = NFTState.NotMinted;
      stateOfNFTs[5] = NFTState.NotMinted;
      stateOfNFTs[6] = NFTState.NotMinted;
      stateOfNFTs[7] = NFTState.NotMinted;
    }


    /*** FUNCTIONS ***/
    function mintNFT(uint _tokenUri, address _to) external {
      uint tokenId = _nextTokenId++;
      _safeMint(_to, tokenId);

      NFTList[tokenId] = NFT(currentNFTValue, _tokenUri, _to);

      currentNFTValue = currentNFTValue * 2;
      stateOfNFTs[_tokenUri] = NFTState.Minted;

      //emit NewMinting(_to, NFTUri);
    }

    function safeNFTTransfer(address from, address to, uint tokenId) external {
      _safeTransfer(from, to, tokenId);
    }

    function burnAllNFTs() external {
      for (uint tokenId = 0; tokenId < NFTList.length; tokenId++) {
        _burn(tokenId);
      }
    }


    // gets
    function getStateOfNFTs(uint _tokenUri) external view returns(NFTState) {
      return stateOfNFTs[_tokenUri];
    }

    function getNFTList() external view returns(NFT[] memory) {
      NFT[] memory n = new NFT[](NFTList.length);
      for (uint i = 0; i < NFTList.length; i++) {
        n[i] = NFTList[i];
      }
      
      return n;
    }

    function getNextTokenId() external view returns(uint256) {
      return _nextTokenId;
    }

    /*** OVERRIDDEN FUNCTIONS ***/
    function _update(address to, uint tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}


