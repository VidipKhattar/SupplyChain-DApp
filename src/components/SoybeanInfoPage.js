// The following code is a React component that displays the details of a soybean product for a consumer.

import React, { useState, useEffect } from "react"; // Importing necessary libraries
import Web3 from "web3";
import SoybeanSupplyChain from "../contracts/SoybeanSupplyChain.json";
import { useSearchParams } from "react-router-dom";

const ConsumerPage = ({ match }) => {
  const [web3, setWeb3] = useState(null); // State variable for Web3 instance
  const [contract, setContract] = useState(null); // State variable for contract instance
  const [soybean, setSoybean] = useState(null); // State variable for the soybean product
  const [params] = useSearchParams(); // Extracting the search parameters from the URL
  const [names, setNames] = useState({}); // State variable for storing the names of the involved parties
  const states = {
    // A dictionary for mapping the state numbers to their respective names
    0: "Harvested",
    1: "Processed",
    2: "Packed",
    3: "ForSale",
    4: "Sold",
    5: "Shipped",
    6: "Received",
  };

  // useEffect hook to initialize the Web3 instance
  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        // If the user has Metamask installed
        setWeb3(new Web3(window.ethereum)); // Set the Web3 instance to use the injected Ethereum provider
        try {
          await window.ethereum.enable(); // Request the user's permission to access their Ethereum account
        } catch (error) {
          console.error("User denied account access");
        }
      } else if (window.web3) {
        // If the user has an older version of Metamask installed
        setWeb3(new Web3(window.web3.currentProvider));
      } else {
        // If the user does not have Metamask installed
        console.error("No web3 provider detected");
      }
    };
    initWeb3();
  }, []);

  // useEffect hook to fetch the necessary data from the blockchain
  useEffect(() => {
    const init = async () => {
      try {
        const web3 = new Web3(Web3.givenProvider); // Create a new Web3 instance using the injected provider
        const networkId = await web3.eth.net.getId(); // Get the ID of the current network
        const deployedNetwork = SoybeanSupplyChain.networks[networkId]; // Get the contract deployment details for the current network
        const contract = new web3.eth.Contract(
          SoybeanSupplyChain.abi,
          deployedNetwork && deployedNetwork.address
        ); // Create an instance of the contract using the deployment details
        setWeb3(web3);
        setContract(contract);
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const id = urlParams.get("soybeanId"); // Get the ID of the soybean product from the URL
        const soybeans = await contract.methods.getAllSoybeans().call(); // Call the getAllSoybeans() function from the contract to get all soybean products
        const soybean = soybeans.find((s) => s.id === id); // Find the soybean product with the matching ID

        const addresses = [
          // An array of the addresses of the involved parties
          soybean.farmer,
          soybean.processor,
          soybean.distributor,
          soybean.retailer,
        ];

        const names = {}; // create an empty object to store names of each address
        for (const address of addresses) {
          // loop through each address
          const name = await contract.methods.getName(address).call(); // call the getName function from the contract to get the name for the current address
          names[address] = name; // add the name to the names object using the address as the key
        }

        setSoybean(soybean); // set the soybean state variable to the soybean object fetched from the contract
        setNames(names); // set the names state variable to the object containing names of each address
      } catch (error) {
        console.error(error); // handle any errors that occur during initialization
      }
    };
    init(); // call the initialization function on component mount
  }, []);

  return (
    <div class="soybean-info">
      {soybean ? (
        <div>
          <h1>Your Soybean Information</h1>
          <table>
            <tr>
              <td>ID:</td>
              <td>{soybean.id}</td>
            </tr>
            <tr>
              <td>Current State:</td>
              <td>{states[soybean.state]}</td>
            </tr>
            <tr>
              <td>Product Name:</td>
              <td>{soybean.product}</td>
            </tr>
            <tr>
              <td>Batch size:</td>
              <td>{soybean.quantity} Units</td>
            </tr>
            <tr>
              <td>Planted:</td>
              <td>
                {soybean.timestamps[0] === "0"
                  ? ""
                  : new Date(soybean.timestamps[0] * 1000).toLocaleDateString(
                      "en-US",
                      {
                        day: "numeric",
                        month: "short",
                      }
                    )}
              </td>
            </tr>
            <tr>
              <td>Harvested:</td>
              <td>
                {soybean.timestamps[1] === "0"
                  ? ""
                  : new Date(soybean.timestamps[1] * 1000).toLocaleDateString(
                      "en-US",
                      {
                        day: "numeric",
                        month: "short",
                      }
                    )}
              </td>
            </tr>
            <tr>
              <td>Selling Price to Processor (Wei):</td>
              <td>{soybean.prices[0]} Wei</td>
            </tr>
            <tr>
              <td>Processed:</td>
              <td>
                {soybean.timestamps[2] === "0"
                  ? ""
                  : new Date(soybean.timestamps[2] * 1000).toLocaleDateString(
                      "en-US",
                      {
                        day: "numeric",
                        month: "short",
                      }
                    )}
              </td>
            </tr>
            <tr>
              <td>Packed:</td>
              <td>
                {soybean.timestamps[3] === "0"
                  ? ""
                  : new Date(soybean.timestamps[3] * 1000).toLocaleDateString(
                      "en-US",
                      {
                        day: "numeric",
                        month: "short",
                      }
                    )}
              </td>
            </tr>
            <tr>
              <td>Selling Price to Distributor (Wei):</td>
              <td>{soybean.prices[1]} Wei</td>
            </tr>
            <tr>
              <td>Distributed:</td>
              <td>
                {soybean.timestamps[4] === "0"
                  ? ""
                  : new Date(soybean.timestamps[4] * 1000).toLocaleDateString(
                      "en-US",
                      {
                        day: "numeric",
                        month: "short",
                      }
                    )}
              </td>
            </tr>
            <tr>
              <td>Selling Price to Retailer (Wei):</td>
              <td>{soybean.prices[2]} Wei</td>
            </tr>
            <tr>
              <td>Sold:</td>
              <td>
                {soybean.timestamps[5] === "0"
                  ? ""
                  : new Date(soybean.timestamps[5] * 1000).toLocaleDateString(
                      "en-US",
                      {
                        day: "numeric",
                        month: "short",
                      }
                    )}
              </td>
            </tr>
            <tr>
              <td>Farmer:</td>
              <td>
                {" "}
                {soybean.farmer === "0x0000000000000000000000000000000000000000"
                  ? ""
                  : soybean.farmer}
              </td>
            </tr>
            <tr>
              <td>Farm Name:</td>
              <td>{names[soybean.farmer]}</td>
            </tr>
            <tr>
              <td>Processor:</td>
              <td>
                {" "}
                {soybean.processor ===
                "0x0000000000000000000000000000000000000000"
                  ? ""
                  : soybean.processor}
              </td>
            </tr>
            <tr>
              <td>Processor Name:</td>
              <td>{names[soybean.processor]}</td>
            </tr>
            <tr>
              <td>Distributor:</td>
              <td>
                {" "}
                {soybean.distributor ===
                "0x0000000000000000000000000000000000000000"
                  ? ""
                  : soybean.distributor}
              </td>
            </tr>
            <tr>
              <td>Distributor Name:</td>
              <td>{names[soybean.distributor]}</td>
            </tr>
            <tr>
              <td>Retailer:</td>
              <td>
                {" "}
                {soybean.retailer ===
                "0x0000000000000000000000000000000000000000"
                  ? ""
                  : soybean.retailer}
              </td>
            </tr>
            <tr>
              <td>Retailer Name:</td>
              <td>{names[soybean.retailer]}</td>
            </tr>
          </table>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ConsumerPage;
