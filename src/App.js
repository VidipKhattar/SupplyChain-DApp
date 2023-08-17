import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./App.css";
import logo from "./logoSmall.png";

// Import additional components for each role page
import FarmerPage from "./components/FarmerPage";
import AdminPage from "./components/AdminPage";
import ProcessorPage from "./components/ProcessorPage";
import DistributorPage from "./components/DistributorPage";
import RetailerPage from "./components/RetailerPage";
import SoybeanInfoPage from "./components/SoybeanInfoPage";

const App = () => {
  useEffect(() => {
    const init = async () => {};
    init();
  }, []);

  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/">Exeter Soybean SCM</Link>
          </li>
          <li>
            <Link to="/farmer">Farmer</Link>
          </li>
          <li>
            <Link to="/processor">Processor</Link>
          </li>
          <li>
            <Link to="/distributor">Distributor</Link>
          </li>
          <li>
            <Link to="/retailer">Retailer</Link>
          </li>
          <li>
            <Link to="/admin">Admin</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/farmer" element={<FarmerPage />} />
        <Route path="/processor" element={<ProcessorPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/retailer" element={<RetailerPage />} />
        <Route path="/distributor" element={<DistributorPage />} />
        <Route path="/soybeanInfo" element={<SoybeanInfoPage />} />
      </Routes>
    </>
  );
};

function HomePage() {
  return (
    <>
      <h1>Welcome to the Exeter Soybean Supply Chain Management System</h1>
      <h2>Trace every bean, Trust every sip</h2>
      <p>
        This system tracks the movement of soybeans from farm to retailer to
        ensure transparency and accountability in the supply chain.
      </p>

      <img src={logo} className="App-logo"></img>
    </>
  );
}

export default App;
