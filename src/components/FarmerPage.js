// This code is a React component that displays the Farmer page. It allows a farmer to plant soybeans and harvest them.

// Import the necessary modules and files.
import React, { useState, useEffect } from "react";
import Web3 from "web3";
import SoybeanSupplyChain from "../contracts/SoybeanSupplyChain.json";
import "../components.css";

// Define the FarmerPage function.
const FarmerPage = () => {
  // Define the state variables and their setter functions.
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [plantAmount, setPlantAmount] = useState(0);
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [selectedSoybeanId, setSelectedSoybeanId] = useState("0");
  const [soybeans, setSoybeans] = useState([]);
  const [price, setPrice] = useState(""); // Price to sell soybeans

  // Set up an effect to initialize web3.
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

  // Set up an effect to initialize the contract and get the farmer's information.
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
        const name = await contract.methods.getName(accounts[0]).call();
        const soybeans = await contract.methods.getAllSoybeans().call();
        setSoybeans(soybeans);
        setWeb3(web3);
        setAccounts(accounts);
        setContract(contract);
        setRole(role);
        setName(name);
      } catch (error) {
        console.error(error);
      }
    };
    init();
  }, []);

  // Set up an effect to get the current accounts and reload the page when the account changes.
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

  // Define a function to handle planting soybeans.
  const handlePlantSoybeans = async (e) => {
    e.preventDefault();
    try {
      await contract.methods
        .plantSoybeans(plantAmount)
        .send({ from: accounts[0] });
      alert("Successfully planted soybeans.");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("An error occurred while planting soybeans.");
    }
  };

  // Define a function to handle harvesting soybeans.
  const handleHarvestSoybeans = async (e) => {
    e.preventDefault();
    console.log(typeof price);
    await contract.methods
      .harvestSoybeans(selectedSoybeanId, price)
      .send({ from: accounts[0] });
    alert("Successfully harvested soybeans.");
    window.location.reload();
  };

  if (!web3 || !contract) {
    console.log("Not loading");
    return <div>Loading...</div>;
  }

  // This function checks if the current user's role is "Farmer"
  if (role !== "Farmer") {
    /* If the user's role is not "Farmer", then the following JSX will be rendered.
     It displays the user's address, role, and name, along with a message stating 
     that only farmers can access the page */
    return (
      <div>
        <p>Your address: {accounts.length > 0 ? accounts[0] : "Unknown"}</p>
        <p>Your role: {role} </p>
        <p>Your name: {name} </p>
        <p>Only Farmer can access this page</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Farmer Page</h1>
      {accounts ? (
        <>
          <p>
            Welcome, {role}: {accounts[0]}
          </p>
          <form onSubmit={handlePlantSoybeans}>
            <label htmlFor="plantAmount">Quantity (bushel) to plant:</label>
            <br></br>

            <input
              type="number"
              id="plantAmount"
              name="plantAmount"
              value={plantAmount}
              onChange={(e) => setPlantAmount(e.target.value)}
            />
            <br></br>
            <br></br>
            <button type="submit">Plant Soybeans</button>
          </form>
          <hr></hr>
          <br />
          <label>Harvest soybeans and put for sale:</label>
          <form onSubmit={handleHarvestSoybeans}>
            <select
              value={selectedSoybeanId}
              onChange={(e) => setSelectedSoybeanId(e.target.value)}
            >
              <option>Choose Soybean batch</option>
              {soybeans
                .filter(
                  (soybean) =>
                    soybean.state === "0" && soybean.farmer === accounts[0]
                )
                .map((soybean) => (
                  <option key={soybean.id} value={soybean.id}>
                    {`Soybean ${soybean.id}`}
                  </option>
                ))}
            </select>
            <br></br>
            <br></br>
            <input
              type="number"
              id="price-input"
              placeholder="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <br></br>
            <br></br>
            <button type="submit">Harvest</button>
          </form>

          <hr></hr>
          <div id="soybeanList">
            <h3>All Soybeans planted by you:</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Batch Size</th>
                  <th>Date Planted</th>
                </tr>
              </thead>
              <tbody>
                {soybeans
                  .filter(
                    (soybean) =>
                      soybean.state === "0" && soybean.farmer === accounts[0]
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
                      <td>
                        {" "}
                        {new Date(
                          soybean.timestamps[0] * 1000
                        ).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};
export default FarmerPage;
