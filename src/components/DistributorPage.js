// This code imports necessary libraries and components for DistributorPage
import React, { useState, useEffect } from "react";
import Web3 from "web3";
import SoybeanSupplyChain from "../contracts/SoybeanSupplyChain.json";
import "../components.css";

// DistributorPage component
const DistributorPage = () => {
  // State variables initialization using useState hook
  const [web3, setWeb3] = useState(null); // Web3 instance
  const [contract, setContract] = useState(null); // Smart contract instance
  const [accounts, setAccounts] = useState(null); // User accounts
  const [role, setRole] = useState(""); // User role
  const [selectedSoybeanId, setSelectedSoybeanId] = useState("0"); // Selected soybean ID
  const [soybeans, setSoybeans] = useState([]); // All soybeans
  const [price, setPrice] = useState(""); // Price to sell soybeans

  // Use effect to initialize Web3
  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        setWeb3(new Web3(window.ethereum));
        try {
          await window.ethereum.enable();
        } catch (error) {
          console.error("User denied account access");
        }
      } else if (window.web3) {
        setWeb3(new Web3(window.web3.currentProvider));
      } else {
        console.error("No web3 provider detected");
      }
    };
    initWeb3();
  }, []);

  // Use effect to initialize other variables using Web3
  useEffect(() => {
    const init = async () => {
      try {
        const web3 = new Web3(Web3.givenProvider);
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = SoybeanSupplyChain.networks[networkId];
        const contract = new web3.eth.Contract(
          SoybeanSupplyChain.abi,
          deployedNetwork && deployedNetwork.address
        );
        const role = await contract.methods.getRole(accounts[0]).call();
        const soybeans = await contract.methods.getAllSoybeans().call();
        setSoybeans(soybeans);
        setWeb3(web3);
        setAccounts(accounts);
        setContract(contract);
        setRole(role);
      } catch (error) {
        console.error(error);
      }
    };
    init();
  }, []);

  // Use effect to update user accounts when changed
  useEffect(() => {
    const getAccounts = async () => {
      if (web3) {
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
        window.ethereum.on("accountsChanged", function (accounts) {
          window.location.reload();
        });
      }
    };
    getAccounts();
  }, [web3]);

  // Function to handle selling soybeans
  const handleSellSoybeans = async (e) => {
    e.preventDefault();
    try {
      const soybean = soybeans.find((s) => s.id === selectedSoybeanId);
      console.log(soybean.prices[1]);
      await contract.methods
        .sellSoybeans(selectedSoybeanId, price)
        .send({ from: accounts[0], value: soybean.prices[1] });

      alert("Soybeans put up for sale successfully!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("An error occurred while putting soybeans up for sale.");
    }
  };

  // If Web3 or contract instance is not initialized, return Loading...
  if (!web3 || !contract) {
    return <div>Loading...</div>;
  }

  if (role !== "Distributor") {
    return (
      <div>
        <p>Your address: {accounts.length > 0 ? accounts[0] : "unknown"}</p>
        <p> Your role: {role}</p>
        <p>Only Distributor can access this page.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Distributor Page</h2>
      <p>Your address: {accounts.length > 0 ? accounts[0] : "unknown"}</p>
      <hr></hr>
      <div>
        <h3>Buy Soybeans from processor Sell Soybeans</h3>
        <form onSubmit={handleSellSoybeans}>
          <label htmlFor="soybean-select2">Select Soybean:</label>
          <br></br>
          <select
            id="soybean-select2"
            value={selectedSoybeanId}
            onChange={(e) => setSelectedSoybeanId(e.target.value)}
          >
            <option>Choose Soybean batch</option>
            {soybeans
              .filter((soybean) => soybean.state === "3")
              .map((soybean) => (
                <option key={soybean.id} value={soybean.id}>
                  {`Soybean ${soybean.id}`}
                </option>
              ))}
          </select>
          <br></br>
          <br></br>
          <label htmlFor="price-input">Price (Wei):</label>
          <br></br>
          <br></br>
          <input
            type="number"
            id="price-input"
            placeholder="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <br />
          <br></br>
          <button type="submit">Sell Soybeans</button>
        </form>
      </div>
      <hr></hr>
      <div id="soybeanList">
        <h3>All processed and packed Soybeans:</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Batch Size</th>
              <th>Product</th>
              <th>Selling Price (Wei)</th>
              <th>Farmer</th>
              <th>Processor</th>
            </tr>
          </thead>
          <tbody>
            {soybeans
              .filter((soybean) => soybean.state === "3")
              .map((soybean, index) => (
                <tr key={index}>
                  <td>
                    <a
                      href={`http://localhost:3000/SoybeanInfo?soybeanId=${soybean.id}`}
                    >
                      {soybean.id}
                    </a>
                  </td>
                  <td>{soybean.quantity}</td>
                  <td>{soybean.product}</td>
                  <td>{soybean.prices[1]}</td>
                  <td>{soybean.farmer}</td>
                  <td>{soybean.processor}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DistributorPage;
