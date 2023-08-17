// This code defines a ProcessorPage component that allows processors to process and pack soybeans.
// It makes use of the SoybeanSupplyChain smart contract to keep track of the state of soybeans.
// The component uses the useState and useEffect hooks from React to manage state and side effects.
// It also makes use of the Web3 library to interact with the Ethereum blockchain.

import React, { useState, useEffect } from "react";
import Web3 from "web3";
import SoybeanSupplyChain from "../contracts/SoybeanSupplyChain.json";
import "../components.css";

const ProcessorPage = () => {
  // Declare and initialize state variables using the useState hook.
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [addressesWithNames, setAddressesWithNames] = useState([]);
  const [selectedSoybeanIdOne, setSelectedSoybeanIdOne] = useState("0");
  const [selectedSoybeanId, setSelectedSoybeanId] = useState("0");
  const [soybeans, setSoybeans] = useState([]);
  const [price, setPrice] = useState(""); // Price to sell soybeans
  const [product, setProduct] = useState("");

  // Use the useEffect hook to initialize Web3 and connect to the blockchain.
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

  // Use the useEffect hook to initialize the smart contract and load data from the blockchain.
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
        const name = await contract.methods.getName(accounts[0]).call();
        //console.log(soybean);
        //console.log(soybean.prices[0]);

        setSoybeans(soybeans);
        setWeb3(web3);
        setAccounts(accounts);
        setContract(contract);
        setRole(role);
        setName(name);
        setAddressesWithNames(addressesWithNames);
      } catch (error) {
        console.error(error);
      }
    };
    init();
  }, []);

  // Use the useEffect hook to update the accounts state variable when the user's account changes.
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

  // Define a function to handle the processing of soybeans.
  const handleProcessSoybeans = async (e) => {
    e.preventDefault();
    try {
      const soybean = soybeans.find((s) => s.id === selectedSoybeanIdOne);
      await contract.methods
        .processSoybeans(selectedSoybeanIdOne, accounts[0], product)
        .send({
          from: accounts[0],
          value: soybean.prices[0],
        });
      alert("Soybeans processed successfully!");
      window.location.reload();
    } catch (error) {
      alert("An error occurred while processing soybeans.");
      console.error(error);
    }
  };

  // Define a function to handle the packing of soybeans.
  const handlePackSoybeans = async (e) => {
    e.preventDefault();
    try {
      console.log(e);
      console.log(typeof price);
      console.log(price);
      await contract.methods
        .packSoybeans(selectedSoybeanId, price)
        .send({ from: accounts[0] });
      alert("Soybeans packed successfully!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("An error occurred while packing soybeans.");
    }
  };

  // Check if web3 and contract are available, show "Loading..." if not
  if (!web3 || !contract) {
    return <div>Loading...</div>;
  }

  /* Check if the current account has the role of "Processor",
display a message showing the current account's address, role, name,
and an error message if the current account is not a Processor */
  if (role !== "Processor") {
    return (
      <div>
        <p>Your address: {accounts.length > 0 ? accounts[0] : "Unknown"}</p>
        <p>Your role: {role} </p>
        <p>Your name: {name} </p>
        <p>Only Processor can access this page</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Processor Page</h2>
      <p>
        Welcome, {role}: {accounts[0]}
      </p>
      <h3>Buy and Process Soybeans</h3>
      <form onSubmit={handleProcessSoybeans}>
        <label htmlFor="soybeanId">Select a soybean batch to process:</label>
        <br></br>
        <br></br>
        <select
          id="soybeanId"
          value={selectedSoybeanIdOne}
          onChange={(e) => setSelectedSoybeanIdOne(e.target.value)}
        >
          <option value="">Select a soybean</option>
          {soybeans
            .filter((soybean) => soybean.state === "1")
            .map((soybean) => (
              <option key={soybean.id} value={soybean.id}>
                {`ID: ${soybean.id}`}
              </option>
            ))}
        </select>
        <br></br>
        <br></br>
        <label htmlFor="soybeanId">Select product to make:</label>
        <br></br>
        <br></br>
        <input
          type="text"
          id="product"
          value={product}
          placeholder="Product"
          onChange={(e) => setProduct(e.target.value)}
        />
        <br></br>
        <br></br>
        <button type="submit">Buy and Process Soybeans</button>
      </form>
      <hr></hr>
      <h3>Pack Soybean</h3>
      <form onSubmit={handlePackSoybeans}>
        <label htmlFor="soybeanId">Select a soybean batch to pack:</label>
        <br></br>
        <br></br>

        <select
          id="soybeanId"
          value={selectedSoybeanId}
          onChange={(e) => setSelectedSoybeanId(e.target.value)}
        >
          <option value="">Select a soybean batch</option>
          {soybeans
            .filter((soybean) => soybean.state === "2")
            .map((soybean) => (
              <option key={soybean.id} value={soybean.id}>
                {`ID: ${soybean.id}`}
              </option>
            ))}
        </select>
        <br></br>
        <br></br>
        <label htmlFor="distributorAddress">Enter Selling price:</label>
        <br></br>
        <br></br>
        <input
          type="number"
          id="sellingPrice"
          value={price}
          placeholder="selling price (Wei)"
          onChange={(e) => setPrice(e.target.value)}
        />
        <br></br>
        <br></br>
        <button type="submit">Pack Soybeans</button>
      </form>
      <hr></hr>
      <div id="soybeanList">
        <h3>All harvested Soybeans:</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Batch Size</th>
              <th>Selling Price (Wei)</th>
              <th>Farmer</th>
            </tr>
          </thead>
          <tbody>
            {soybeans
              .filter((soybean) => soybean.state === "1")
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
                  <td>{soybean.prices[0]}</td>
                  <td>{soybean.farmer}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <br></br>
      <div id="soybeanList">
        <h3>All processed Soybeans by you:</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Batch Size</th>
              <th>Product</th>
              <th>Farmer</th>
            </tr>
          </thead>
          <tbody>
            {soybeans
              .filter(
                (soybean) =>
                  soybean.state === "2" && soybean.processor === accounts[0]
              )
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
                  <td>{soybean.farmer}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ProcessorPage;
