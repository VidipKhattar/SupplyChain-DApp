// Test script for SoybeanSupplyChain smart contract
const SoybeanSupplyChain = artifacts.require("SoybeanSupplyChain");

contract("SoybeanSupplyChain", (accounts) => {
  const farmer = accounts[1];
  const processor = accounts[2];
  const distributor = accounts[3];
  const retailer = accounts[4];
  const consumer = accounts[5];

  const initialRole = "Initial";
  const farmerRole = "Farmer";
  const processorRole = "Processor";
  const distributorRole = "Distributor";
  const retailerRole = "Retailer";
  const consumerRole = "Consumer";

  const initialName = "Initial";
  const farmerName = "John";
  const processorName = "Jane";
  const distributorName = "David";
  const retailerName = "Robert";
  const consumerName = "Alice";

  let soybeanSupplyChainInstance;

  beforeEach(async () => {
    soybeanSupplyChainInstance = await SoybeanSupplyChain.new({
      from: accounts[0],
    });
  });

  describe("Assign roles", () => {
    it("should assign the farmer role to the farmer address", async () => {
      await soybeanSupplyChainInstance.assignRole(
        farmer,
        farmerRole,
        farmerName,
        { from: accounts[0] }
      );
      const role = await soybeanSupplyChainInstance.getRole(farmer);
      assert.equal(role, farmerRole);
    });

    it("should assign the processor role to the processor address", async () => {
      await soybeanSupplyChainInstance.assignRole(
        processor,
        processorRole,
        processorName,
        { from: accounts[0] }
      );
      const role = await soybeanSupplyChainInstance.getRole(processor);
      assert.equal(role, processorRole);
    });

    it("should assign the distributor role to the distributor address", async () => {
      await soybeanSupplyChainInstance.assignRole(
        distributor,
        distributorRole,
        distributorName,
        { from: accounts[0] }
      );
      const role = await soybeanSupplyChainInstance.getRole(distributor);
      assert.equal(role, distributorRole);
    });

    it("should assign the retailer role to the retailer address", async () => {
      await soybeanSupplyChainInstance.assignRole(
        retailer,
        retailerRole,
        retailerName,
        { from: accounts[0] }
      );
      const role = await soybeanSupplyChainInstance.getRole(retailer);
      assert.equal(role, retailerRole);
    });

    it("should assign the consumer role to the consumer address", async () => {
      await soybeanSupplyChainInstance.assignRole(
        consumer,
        consumerRole,
        consumerName,
        { from: accounts[0] }
      );
      const role = await soybeanSupplyChainInstance.getRole(consumer);
      assert.equal(role, consumerRole);
    });
  });

  describe("Add addresses", () => {
    it("should add the farmer address to the array of addresses", async () => {
      await soybeanSupplyChainInstance.addAddress(farmer, {
        from: accounts[0],
      });
      const address = await soybeanSupplyChainInstance.getAddress(0);
      assert.equal(address, farmer);
    });

    it("should add the processor address to the array of addresses", async () => {
      await soybeanSupplyChainInstance.addAddress(processor, {
        from: accounts[0],
      });
      const address = await soybeanSupplyChainInstance.getAddress(0);
      assert.equal(address, processor);
    });

    it("should add the distributor address to the array of addresses", async () => {
      await soybeanSupplyChainInstance.addAddress(distributor, {
        from: accounts[0],
      });
      const address = await soybeanSupplyChainInstance.getAddress(0);
      assert.equal(address, distributor);
    });
    it("should add the retailer address to the array of addresses", async () => {
      await soybeanSupplyChainInstance.addAddress(retailer, {
        from: accounts[0],
      });
      const address = await soybeanSupplyChainInstance.getAddress(0);
      assert.equal(address, retailer);
    });
    it("should get all the addresses ", async () => {
      await soybeanSupplyChainInstance.addAddress(farmer, {
        from: accounts[0],
      });
      await soybeanSupplyChainInstance.addAddress(processor, {
        from: accounts[0],
      });
      await soybeanSupplyChainInstance.addAddress(distributor, {
        from: accounts[0],
      });
      await soybeanSupplyChainInstance.addAddress(retailer, {
        from: accounts[0],
      });

      const addressList = await soybeanSupplyChainInstance.getAllAddresses();

      assert.equal(addressList.length, 4);
    });
  });
});
