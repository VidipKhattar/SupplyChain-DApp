// This code imports the necessary libraries and files
import React, { useState, useEffect } from "react"; // Imports React and its useState and useEffect hooks
import Web3 from "web3"; // Imports Web3 library
import SoybeanSupplyChain from "../contracts/SoybeanSupplyChain.json"; // Imports the SoybeanSupplyChain smart contract's JSON file
import "../components.css"; // Imports the component's CSS file

const AdminPage = () => {
  // This is a functional component named AdminPage
  const [web3, setWeb3] = useState(null); // State variable to hold Web3 instance
  const [accounts, setAccounts] = useState([]); // State variable to hold Ethereum accounts
  const [contract, setContract] = useState(null); // State variable to hold SoybeanSupplyChain smart contract instance
  const [allRoles, setAllRoles] = useState([]); // State variable to hold all possible user roles
  const [addressesWithRoles, setAddressesWithRoles] = useState([]); // State variable to hold all Ethereum addresses with their respective roles
  const [addressesWithNames, setAddressesWithNames] = useState([]); // State variable to hold all Ethereum addresses with their respective names
  const [address, setAddress] = useState(""); // State variable to hold Ethereum address to be assigned with a new role
  const [role, setRole] = useState(""); // State variable to hold the new role to be assigned to the Ethereum address
  const [name, setName] = useState(""); // State variable to hold the name of the user to be assigned with a new role
  const [soybeans, setSoybeans] = useState([]); // State variable to hold all the soybeans in the supply chain
  const states = {
    // State variable to map the integers of the soybean's state to their respective descriptions
    0: "Planted",
    1: "Harvested",
    2: "Processed",
    3: "Packed",
    4: "ForSale",
    5: "Sold",
    6: "Received",
  };

  useEffect(() => {
    // useEffect hook to be executed when the component mounts or when allRoles is updated
    const init = async () => {
      // This function initializes the state variables
      try {
        const web3 = new Web3(Web3.givenProvider); // Creates a new Web3 instance using the browser's Ethereum provider
        const accounts = await web3.eth.getAccounts(); // Retrieves all Ethereum accounts connected to the browser
        const networkId = await web3.eth.net.getId(); // Retrieves the ID of the current Ethereum network
        const deployedNetwork = SoybeanSupplyChain.networks[networkId]; // Retrieves the deployed network object of the SoybeanSupplyChain smart contract
        const contract = new web3.eth.Contract(
          SoybeanSupplyChain.abi, // Assigns the ABI of the SoybeanSupplyChain smart contract
          deployedNetwork && deployedNetwork.address // Assigns the contract's address on the current network
        );

        const role = await contract.methods
          .getRole(accounts[0]) // Retrieves the role of the current account
          .call({ from: accounts[0] }); // Specifies the account that will call the method
        const soybeans = await contract.methods.getAllSoybeans().call(); // Retrieves all the soybeans in the supply chain
        const addresses = await contract.methods.getAllAddresses().call(); // Retrieves all Ethereum addresses registered on the smart contract
        const addressesWithRoles = await Promise.all(
          // Retrieves all Ethereum addresses with their respective roles
          addresses.map(async (addr) => {
            const r = await contract.methods
              .getRole(addr)
              .call({ from: accounts[0] }); // Retrieves the role of the Ethereum address
            return { address: addr, role: r };
          })
        );

        // Retrieves Ethereum addresses with their respective names
        const addressesWithNames = await Promise.all(
          addresses.map(async (addr) => {
            const r = await contract.methods.getName(addr).call();
            return [addr, r];
          })
        );

        /* Reloads the window when the accounts in the wallet change */
        window.ethereum.on("accountsChanged", function (accounts) {
          window.location.reload();
        });

        // Sets the state of web3, accounts, contract, roles, soybeans, and addresses with roles
        setWeb3(web3);
        setAccounts(accounts);
        setContract(contract);
        setRole(role);
        setAllRoles(allRoles);
        setSoybeans(soybeans);
        setAddressesWithRoles(addressesWithRoles);
        setAddressesWithNames(addressesWithNames);
      } catch (error) {
        console.error(error);
      }
    };
    init();
  }, [allRoles]);

  // Assigns a role to an address and reloads the page
  const handleAssignRole = async (e) => {
    e.preventDefault();
    setRole(e.target.elements.role.value);
    setName(e.target.elements.name.value);

    try {
      await contract.methods
        .assignRole(address, role, name)
        .send({ from: accounts[0] });
      console.log(
        `Assigned role: ${e.target.elements.role.value} to address ${address} with name ${name}`
      );
      alert(
        `Assigned role successfully: ${e.target.elements.role.value} to address ${address} with name ${name}`
      );
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("An error occurred while assigning a role.");
    }
  };

  // Handles changes to input fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "address") {
      setAddress(value);
    } else if (name === "role") {
      setRole(value);
    } else if (name === "name") {
      setName(value);
    }
  };

  // Displays loading message if web3 or contract are not initialized yet

  if (!web3 || !contract) {
    return <div>Loading...</div>;
  }

  // Displays user information if not an admin
  if (accounts[0] !== "0x60493a7D4D1c05d6937c03CF2CB39cA8684DB06c") {
    return (
      <div>
        <p>Your address: {accounts.length > 0 ? accounts[0] : "Unknown"}</p>
        {role ? (
          <p>Your role: {role}, Only admin can access this page</p>
        ) : (
          <p>No role assigned ask admin to request role</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2>Admin Page</h2>
      <h3>Add new User</h3>
      <form onSubmit={handleAssignRole}>
        <label htmlFor="address">Address: </label>
        <input
          type="text"
          id="address"
          name="address"
          value={address}
          onChange={handleInputChange}
        />
        <br></br>
        <br></br>
        <label htmlFor="name">Name: </label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={handleInputChange}
        />
        <br />
        <br />
        <label htmlFor="role">Role: </label>
        <select id="role" name="role" onChange={handleInputChange}>
          <option>Choose Role</option>
          <option value="Farmer">Farmer</option>
          <option value="Processor">Processor</option>
          <option value="Distributor">Distributor</option>
          <option value="Retailer">Retailer</option>
        </select>

        <br />
        <br />
        <button type="submit">Assign Role</button>
      </form>
      <div id="soybeanList">
        <h3>All Soybeans:</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Price (Wei)</th>
              <th>State</th>
              <th>Product</th>
              <th>Farmer</th>
              <th>Planted</th>
              <th>Harvested</th>
              <th>Processor</th>
              <th>Processed</th>
              <th>Packed</th>
              <th>Distributor</th>
              <th>Distributed</th>
              <th>Retailer</th>
              <th>Sold</th>
            </tr>
          </thead>
          <tbody>
            {soybeans.map((soybean, index) => (
              <tr key={index}>
                <td>
                  <a
                    href={`http://localhost:3000/SoybeanInfo?soybeanId=${soybean.id}`}
                  >
                    {soybean.id}
                  </a>
                </td>
                <td>{soybean.prices[2]}</td>
                <td>{states[soybean.state]}</td>
                <td>{soybean.product}</td>
                <td>
                  {soybean.farmer ===
                  "0x0000000000000000000000000000000000000000"
                    ? ""
                    : soybean.farmer.substring(0, 6) +
                      "..." +
                      soybean.farmer.substring(38)}
                </td>
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

                <td>
                  {soybean.processor ===
                  "0x0000000000000000000000000000000000000000"
                    ? ""
                    : soybean.processor.substring(0, 6) +
                      "..." +
                      soybean.processor.substring(38)}
                </td>
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
                <td>
                  {soybean.distributor ===
                  "0x0000000000000000000000000000000000000000"
                    ? ""
                    : soybean.distributor.substring(0, 6) +
                      "..." +
                      soybean.distributor.substring(38)}
                </td>
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
                <td>
                  {soybean.retailer ===
                  "0x0000000000000000000000000000000000000000"
                    ? ""
                    : soybean.retailer.substring(0, 6) +
                      "..." +
                      soybean.retailer.substring(38)}
                </td>
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
            ))}
          </tbody>
        </table>
      </div>

      <hr />
      <h3>All Users</h3>
      <table>
        <thead>
          <tr>
            <th>Address</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {addressesWithNames.map((entry, index) => (
            <tr key={index}>
              <td>{entry[0]}</td>
              <td>{entry[1]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;
