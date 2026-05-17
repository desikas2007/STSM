// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TouristDigitalID is Ownable {
    constructor() Ownable(msg.sender) {}
    struct DigitalID {
        string userId;
        string name;
        string location;
        string role;
        uint256 issuedAt;
        bool isVerified;
        uint256 incidentsReported;
        uint256 accidentsReported;
    }

    mapping(address => DigitalID) public digitalIDs;

    event IDIssued(address indexed wallet, string userId, uint256 timestamp);
    event IDVerified(address indexed wallet);
    event IncidentLogged(address indexed wallet, uint256 count);

    function issueID(
        string memory userId,
        string memory name,
        string memory location,
        string memory role
    ) external {
        require(bytes(digitalIDs[msg.sender].userId).length == 0, "ID already exists");
        digitalIDs[msg.sender] = DigitalID({
            userId: userId,
            name: name,
            location: location,
            role: role,
            issuedAt: block.timestamp,
            isVerified: false,
            incidentsReported: 0,
            accidentsReported: 0
        });
        emit IDIssued(msg.sender, userId, block.timestamp);
    }

    function getID(address wallet) external view returns (DigitalID memory) {
        return digitalIDs[wallet];
    }

    function verifyID(address wallet) external onlyOwner {
        require(bytes(digitalIDs[wallet].userId).length > 0, "ID does not exist");
        digitalIDs[wallet].isVerified = true;
        emit IDVerified(wallet);
    }

    modifier onlyOwnerOrWallet(address wallet) {
        require(
            msg.sender == wallet || msg.sender == owner(),
            "Not authorized"
        );
        _;
    }

    function incrementIncident(address wallet) external onlyOwnerOrWallet(wallet) {
        require(bytes(digitalIDs[wallet].userId).length > 0, "ID does not exist");
        digitalIDs[wallet].incidentsReported += 1;
        emit IncidentLogged(wallet, digitalIDs[wallet].incidentsReported);
    }

    function incrementAccident(address wallet) external onlyOwnerOrWallet(wallet) {
        require(bytes(digitalIDs[wallet].userId).length > 0, "ID does not exist");
        digitalIDs[wallet].accidentsReported += 1;
    }

    function revokeID(address wallet) external onlyOwner {
        delete digitalIDs[wallet];
    }
}
