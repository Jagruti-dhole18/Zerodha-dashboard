import React from "react";

import Dashboard from "./Dashboard";
import TopBar from "./TopBar";

const Home = ({ onLogout }) => {
  return (
    <>
      <TopBar onLogout={onLogout} />
      <Dashboard />
    </>
  );
};

export default Home;