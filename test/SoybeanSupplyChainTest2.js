const SoybeanSupplyChain = artifacts.require("SoybeanSupplyChain");

contract("SoybeanSupplyChain", (accounts) => {
  let contractInstance;
  const quantity = 100;
  const farmer = accounts[1];
  const processor = accounts[2];
  const distributor = accounts[3];
  const retailer = accounts[4];
  const consumer = accounts[5];

  const prices = [30000, 40000, 50000];

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

  const productName = "Soy Milk";

  before(async () => {
    contractInstance = await SoybeanSupplyChain.deployed();
    await contractInstance.assignRole(farmer, farmerRole, farmerName, {
      from: accounts[0],
    });
    await contractInstance.assignRole(processor, processorRole, processorName, {
      from: accounts[0],
    });
    await contractInstance.assignRole(
      distributor,
      distributorRole,
      distributorName,
      {
        from: accounts[0],
      }
    );
    await contractInstance.assignRole(retailer, retailerRole, retailerName, {
      from: accounts[0],
    });
  });

  describe("Move soybeans", () => {
    it("should plant soybeans", async () => {
      await contractInstance.assignRole(farmer, farmerRole, farmerName, {
        from: accounts[0],
      });
      await contractInstance.plantSoybeans(quantity, { from: farmer });
      const soybean = await contractInstance.soybeans(1);
      //console.log(soybean.prices);
      assert.equal(soybean.state, 0, "Soybeans should be in Planted state");
      assert.equal(
        soybean.quantity,
        quantity,
        "Incorrect quantity of soybeans planted"
      );
    });

    it("should harvest soybeans", async () => {
      await contractInstance.harvestSoybeans(1, prices[0], { from: farmer });
      const soybean = await contractInstance.soybeans(1);
      assert.equal(soybean.state, 1, "Soybeans should be in Harvested state");
    });

    it("should process soybeans", async () => {
      await contractInstance.processSoybeans(1, processor, productName, {
        from: processor,
        value: prices[0],
      });
      const soybean = await contractInstance.soybeans(1);
      assert.equal(soybean.state, 2, "Soybeans should be in Processed state");
      assert.equal(soybean.processor, processor, "Incorrect processor address");
    });

    it("should pack soybeans", async () => {
      await contractInstance.packSoybeans(1, prices[1], { from: processor });
      const soybean = await contractInstance.soybeans(1);
      assert.equal(soybean.state, 3, "Soybeans should be in Packed state");
    });

    it("should sell soybeans", async () => {
      await contractInstance.sellSoybeans(1, prices[2], { from: distributor });
      const soybean = await contractInstance.soybeans(1);
      //console.log(soybean);
      assert.equal(soybean.state, 4, "Soybeans should be in ForSale state");
    });

    it("should buy soybeans", async () => {
      const distributorBalanceBefore = parseInt(
        await web3.eth.getBalance(distributor)
      );
      await contractInstance.buySoybeans(1, {
        from: retailer,
        value: prices[2],
      });
      const soybean = await contractInstance.soybeans(1);
      const distributorBalanceAfter = parseInt(
        await web3.eth.getBalance(distributor)
      );
      const allSoybeans = await contractInstance.getAllSoybeans();

      assert.equal(soybean.state, 5, "Soybeans should be in Sold state");
      assert.equal(soybean.retailer, retailer, "Incorrect retailer address");
      assert.equal(
        distributorBalanceAfter,
        distributorBalanceBefore + prices[2],
        "Incorrect distributor balance after sale"
      );
    });
  });

  describe("Get soybeans", () => {
    it("should get all soybeans", async () => {
      const allSoybeans = await contractInstance.getAllSoybeans();
      assert(
        allSoybeans[0],
        contractInstance.soybeans(1),
        "Soybean batches should be the same"
      );
    });
  });
});
