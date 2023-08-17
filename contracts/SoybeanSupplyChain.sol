// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SoybeanSupplyChain {
    // Define the possible states of a soybean
    enum State {
        Planted, // Soybean has been planted
        Harvested, // Soybean has been harvested
        Processed, // Soybean has been processed
        Packed, // Soybean has been packed
        ForSale, // Soybean is ready to be sold
        Sold // Soybean has been sold
    }

    // Define the properties of a soybean
    struct Soybean {
        uint id; // Unique ID of the soybean
        address payable farmer; // Address of the farmer who planted the soybean
        address payable processor; // Address of the processor who processed the soybean
        address payable distributor; // Address of the distributor who will distribute the soybean
        address retailer; // Address of the retailer who will sell the soybean
        address consumer; // Address of the consumer who will buy the soybean
        uint256 quantity; // Quantity of soybeans
        uint256[3] prices; // Price of the soybean
        string product; // Final product of the soybean
        State state; // Current state of the soybean
        uint256[6] timestamps; // Timestamps of various events in the lifecycle of the soybean
        // 0 - planting
        // 1 - harvesting
        // 2 - processing
        // 3 - packing
        // 4 - for sale
        // 5 - sold
    }

    // Define the address of the admin
    address public admin;

    // Define the counter for the soybean IDs
    uint256 public soybeanCounter;

    // Define a mapping of soybeans by ID
    mapping(uint256 => Soybean) public soybeans;

    // Define a mapping of roles by address
    mapping(address => string) public roles;

    // Define a mapping of names by address
    mapping(address => string) public names;

    // Define an array of addresses
    address[] private addresses;

    // Define events that will be emitted during various actions in the lifecycle of a soybean
    event Planting(address indexed farmer, uint256 soybeanId);
    event Harvesting(address indexed farmer, uint256 soybeanId);
    event Processing(address indexed processor, uint256 soybeanId);
    event Packing(address indexed processor, uint256 soybeanId);
    event ForSale(address indexed distributor, uint256 soybeanId);
    event Sold(
        address indexed retailer,
        address indexed consumer,
        uint256 soybeanId
    );

    // Define the constructor
    constructor() {}

    // Define a modifier that ensures that the caller is a farmer
    modifier onlyFarmer() {
        require(
            keccak256(abi.encodePacked(roles[msg.sender])) ==
                keccak256(abi.encodePacked("Farmer")),
            "Only farmers can plant soybean."
        );
        _;
    }

    // Define a modifier that ensures that the caller is a processor
    modifier onlyProcessor() {
        require(
            keccak256(abi.encodePacked(roles[msg.sender])) ==
                keccak256(abi.encodePacked("Processor")),
            "Only processor can call this function."
        );
        _;
    }

    // Define a modifier that ensures that the caller is a distributor
    modifier onlyDistributor() {
        require(
            keccak256(abi.encodePacked(roles[msg.sender])) ==
                keccak256(abi.encodePacked("Distributor")),
            "Only distributor can call this function."
        );
        _;
    }

    // Modifier for retailer
    modifier onlyRetailer() {
        require(
            keccak256(abi.encodePacked(roles[msg.sender])) ==
                keccak256(abi.encodePacked("Retailer")),
            "Only retailer can call this function." // error message for invalid access
        );
        _;
    }

    // Modifier for consumer
    modifier onlyConsumer() {
        require(
            keccak256(abi.encodePacked(roles[msg.sender])) ==
                keccak256(abi.encodePacked("Consumer")),
            "Only consumer can call this function." // error message for invalid access
        );
        _;
    }

    /* Function to assign roles */
    function assignRole(
        address _address,
        string memory _role,
        string memory _name
    ) public {
        roles[_address] = _role;
        names[_address] = _name;
        addresses.push(_address);
    }

    // Function to get role of an address
    function getRole(address _addr) public view returns (string memory) {
        return roles[_addr];
    }

    // Function to get name of an address
    function getName(address _addr) public view returns (string memory) {
        return names[_addr];
    }

    // Function to add an address
    function addAddress(address _address) public {
        addresses.push(_address);
    }

    // Function to get an address by index
    function getAddress(uint index) public view returns (address) {
        require(index < addresses.length, "Index out of range"); // error message for index out of range
        return addresses[index];
    }

    // Function to get all addresses
    function getAllAddresses() public view returns (address[] memory) {
        return addresses;
    }

    /* Function to plant soybeans */
    function plantSoybeans(uint _quantity) public onlyFarmer {
        soybeanCounter++;
        soybeans[soybeanCounter] = Soybean({
            id: soybeanCounter,
            farmer: payable(msg.sender),
            processor: payable(address(0)),
            distributor: payable(address(0)),
            retailer: address(0),
            consumer: address(0),
            quantity: _quantity,
            prices: [block.timestamp, 0, 0],
            product: "",
            state: State.Planted,
            timestamps: [block.timestamp, 0, 0, 0, 0, 0] // set the first timestamp
        });
        emit Planting(msg.sender, soybeanCounter);
    }

    /* Function to harvest soybeans */
    function harvestSoybeans(
        uint256 _soybeanId,
        uint256 _price
    ) public payable onlyFarmer {
        require(
            soybeans[_soybeanId].state == State.Planted,
            "Soybeans must be planted first."
        );
        soybeans[_soybeanId].state = State.Harvested;
        soybeans[_soybeanId].prices[0] = _price;
        soybeans[_soybeanId].timestamps[1] = block.timestamp;

        emit Harvesting(msg.sender, _soybeanId);
    }

    /* Function to process soybeans */
    function processSoybeans(
        uint256 _soybeanId,
        address payable _processor,
        string memory _product
    ) public payable onlyProcessor {
        require(
            soybeans[_soybeanId].state == State.Harvested,
            "Soybeans must be harvested first." // error message for invalid state
        );
        soybeans[_soybeanId].processor = _processor;
        soybeans[_soybeanId].state = State.Processed;
        soybeans[_soybeanId].product = _product;
        soybeans[_soybeanId].farmer.transfer(msg.value);
        soybeans[_soybeanId].timestamps[2] = block.timestamp;

        emit Processing(_processor, _soybeanId);
    }

    /* Function to pack soybeans */
    function packSoybeans(
        uint256 _soybeanId,
        uint256 _price
    ) public payable onlyProcessor {
        require(
            soybeans[_soybeanId].state == State.Processed,
            "Soybeans must be processed first."
        );
        soybeans[_soybeanId].state = State.Packed;
        soybeans[_soybeanId].prices[1] = _price;
        soybeans[_soybeanId].timestamps[3] = block.timestamp;
        emit Packing(msg.sender, _soybeanId);
    }

    // This function is used by the distributor to sell soybeans to a retailer.
    function sellSoybeans(
        uint256 _soybeanId,
        uint256 _price
    ) public payable onlyDistributor {
        // Check if the soybeans are in the correct state before selling them.
        require(
            soybeans[_soybeanId].state == State.Packed,
            "Soybeans must be packed first."
        );
        // Set the price of the soybeans and update their state to ForSale.
        soybeans[_soybeanId].distributor = payable(msg.sender);
        soybeans[_soybeanId].prices[2] = _price;
        soybeans[_soybeanId].processor.transfer(msg.value);
        soybeans[_soybeanId].state = State.ForSale;
        // Record the timestamp and emit an event indicating that the soybeans are now for sale.
        soybeans[_soybeanId].timestamps[4] = block.timestamp;
        emit ForSale(msg.sender, _soybeanId);
    }

    // This function is used by a retailer to buy soybeans from a distributor.
    function buySoybeans(uint256 _soybeanId) public payable onlyRetailer {
        // Check if the soybeans are in the correct state before allowing the retailer to buy them.
        require(
            soybeans[_soybeanId].state == State.ForSale,
            "Soybeans must be for sale first."
        );
        // Check that the amount of Ether sent by the retailer is equal to the price of the soybeans.
        require(
            msg.value == soybeans[_soybeanId].prices[2],
            "Incorrect price."
        );
        // Record the retailer's address as the new owner of the soybeans and transfer the Ether to the distributor.
        soybeans[_soybeanId].retailer = msg.sender;
        soybeans[_soybeanId].distributor.transfer(msg.value);
        // Update the state of the soybeans to Sold and record the timestamp.
        soybeans[_soybeanId].state = State.Sold;
        soybeans[_soybeanId].timestamps[5] = block.timestamp;
        // Emit an event indicating that the soybeans have been sold.
        emit Sold(
            soybeans[_soybeanId].retailer,
            soybeans[_soybeanId].consumer,
            _soybeanId
        );
    }

    // This function returns all soybeans in the system
    function getAllSoybeans() public view returns (Soybean[] memory) {
        // Create a new array of Soybean type with length of the current number of soybeans
        Soybean[] memory allSoybeans = new Soybean[](soybeanCounter);
        // Loop through all soybeans and add them to the array
        for (uint256 i = 1; i <= soybeanCounter; i++) {
            allSoybeans[i - 1] = soybeans[i];
        }
        // Return the array of all soybeans
        return allSoybeans;
    }
}
