// SPDX-License-Identifier: MIT OR UNLICENSED
pragma solidity ^0.8.20;


contract Common  {

  /*** CONSTANTS  ***/
  uint constant NUMBER_OF_NFTs = 8;


  /*** ENUMS ***/
  enum NFTState { Minted, NotMinted }


  /*** STRUCTS ***/
  struct NFT {
    uint basePrice;
    uint tokenUri; // #number in NFT's json file
    address minter;
  }
}