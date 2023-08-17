// This code includes single line // and multi line /* */ comments to explain each section of the code

// Import required modules
import React, { useState, useEffect } from "react"; // React library for building UI components
import Web3 from "web3"; // Ethereum web3 library for interacting with Ethereum blockchain
import SoybeanSupplyChain from "../contracts/SoybeanSupplyChain.json"; // Import the contract JSON file
import "../components.css"; // Import stylesheet for this component

const QRCode = require("qrcode"); // Import QRCode library for generating QR codes

// Define RetailerPage component
const RetailerPage = () => {
  // Define component state variables using the useState hook
  const [web3, setWeb3] = useState(null); // Ethereum web3 instance
  const [contract, setContract] = useState(null); // Contract instance
  const [accounts, setAccounts] = useState(null); // User's Ethereum account
  const [role, setRole] = useState(""); // User's role in the supply chain
  const [selectedSoybeanId, setSelectedSoybeanId] = useState("0"); // Currently selected soybean ID
  const [soybeans, setSoybeans] = useState([]); // Array of all soybeans
  const [soybean, setSoybean] = useState([]); // Currently selected soybean

  // This effect initializes the web3 instance when the component mounts
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

  /* This effect retrieves all necessary data from the blockchain
and updates the component state variables accordingly */
  useEffect(() => {
    const init = async () => {
      try {
        const web3 = new Web3(Web3.givenProvider); // Get the web3 instance
        const accounts = await web3.eth.getAccounts(); // Get the user's account
        const networkId = await web3.eth.net.getId(); // Get the current network ID
        const deployedNetwork = SoybeanSupplyChain.networks[networkId]; // Get the network configuration for the contract
        const contract = new web3.eth.Contract( // Instantiate the contract
          SoybeanSupplyChain.abi,
          deployedNetwork && deployedNetwork.address
        );
        const role = await contract.methods.getRole(accounts[0]).call(); // Get the user's role
        const soybeans = await contract.methods.getAllSoybeans().call(); // Get all soybeans
        const soybean = soybeans.find((s) => s.id === selectedSoybeanId); // Find the currently selected soybean
        setSoybeans(soybeans);
        setWeb3(web3);
        setAccounts(accounts);
        setContract(contract);
        setRole(role);
        setSoybean(soybean);
      } catch (error) {
        console.error(error);
      }
    };
    init();
  }, [selectedSoybeanId]);

  /* This effect retrieves the user's Ethereum account and listens for account changes */
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

  // The following function handles the buy soybeans action and is executed when the form is submitted
  const handleBuySoybeans = async (e) => {
    e.preventDefault(); // prevents the default form submission behavior
    try {
      console.log(soybean.prices[2]);
      await contract.methods
        .buySoybeans(selectedSoybeanId)
        .send({ from: accounts[0], value: soybean.prices[2] }); // Calls the buySoybeans method of the contract
      alert("Soybeans bought successfully!"); // Displays an alert if the transaction is successful
      window.location.reload(); // Reloads the page to show the updated soybean data
    } catch (error) {
      console.error(error);
      alert("An error occurred while buying soybeans.");
    }
  };

  /* The following function generates a QR code for a given soybean ID and replaces the placeholder button with the image*/

  const generateQRCode = async (soybeanId) => {
    try {
      const qrCodeUrl = await QRCode.toDataURL(
        `http://localhost:3000/SoybeanInfo?soybeanId=${soybeanId}`
      );
      const qrCodeImg = document.createElement("img");
      qrCodeImg.src = qrCodeUrl;
      qrCodeImg.alt = `QR Code for Soybean ID ${soybeanId}`;
      const button = document.getElementById("qrCodeholder");
      button.parentNode.replaceChild(qrCodeImg, button);
    } catch (error) {
      console.error(error);
      alert("An error occurred while generating QR code.");
    }
  };

  // The following code checks if web3 and contract are present and returns a loading message if not
  if (!web3 || !contract) {
    return <div>Loading...</div>;
  }
  // The following code checks the user's role and returns a message if they are not a retailer
  if (role !== "Retailer") {
    return (
      <div>
        <div>
          <p>Your address: {accounts.length > 0 ? accounts[0] : "unknown"}</p>
          <p> Your role: {role}</p>
          <p>Only Retailer can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Retailer Page</h1>
      {role !== "Retailer" ? (
        <p>You are not authorized to view this page.</p>
      ) : (
        <>
          <h2>Buy Soybeans</h2>
          <form onSubmit={handleBuySoybeans}>
            <div className="form-group">
              <label htmlFor="soybean-select">Select a soybean:</label>
              <br></br>
              <br></br>
              <select
                className="form-control"
                id="soybean-select"
                value={selectedSoybeanId}
                onChange={(e) => setSelectedSoybeanId(e.target.value)}
              >
                <option>Select Soybean Batch</option>
                {soybeans
                  .filter((soybean) => soybean.state === "4")
                  .map((soybean) => (
                    <option key={soybean.id} value={soybean.id}>
                      Id: {soybean.id}
                    </option>
                  ))}
              </select>
            </div>
            <br></br>
            <button type="submit" className="btn btn-primary">
              Buy Soybeans
            </button>
          </form>
          <hr></hr>
          <h2>Soybean batches to buy</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Batch Size</th>
                <th>Product</th>
                <th>Selling Price (Wei)</th>
                <th>Farmer</th>
                <th>Processor</th>
                <th>Distributor</th>
              </tr>
            </thead>
            <tbody>
              {soybeans
                .filter((soybean) => soybean.state === "4")
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
                    <td>{soybean.prices[2]}</td>
                    <td>
                      {" "}
                      {soybean.farmer ===
                      "0x0000000000000000000000000000000000000000"
                        ? ""
                        : soybean.farmer.substring(0, 6) +
                          "..." +
                          soybean.farmer.substring(38)}
                    </td>
                    <td>
                      {" "}
                      {soybean.processor ===
                      "0x0000000000000000000000000000000000000000"
                        ? ""
                        : soybean.processor.substring(0, 6) +
                          "..." +
                          soybean.processor.substring(38)}
                    </td>
                    <td>
                      {" "}
                      {soybean.distributor ===
                      "0x0000000000000000000000000000000000000000"
                        ? ""
                        : soybean.distributor.substring(0, 6) +
                          "..." +
                          soybean.distributor.substring(38)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <hr></hr>
          <h2>Soybean List</h2>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Date Bought</th>
                <th scope="col">Product</th>
                <th scope="col">QR Code</th>
              </tr>
            </thead>
            <tbody>
              {soybeans
                .filter((soybean) => soybean.state === "5")
                .map((soybean) => (
                  <tr key={soybean.id}>
                    <th scope="row">
                      {" "}
                      <a
                        href={`http://localhost:3000/SoybeanInfo?soybeanId=${soybean.id}`}
                      >
                        {soybean.id}
                      </a>
                    </th>
                    <td>
                      {" "}
                      {new Date(
                        soybean.timestamps[5] * 1000
                      ).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td>{soybean.product}</td>
                    <td>
                      <button
                        className="btn btn-primary"
                        id="generate-button"
                        onClick={() => generateQRCode(soybean.id)}
                      >
                        Generate QR Code
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div id="qrCodeholder"></div>
        </>
      )}
    </div>
  );
};

export default RetailerPage;
