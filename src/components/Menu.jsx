import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const Menu = ({ onLogout }) => {
  const [selectedMenu,setSelectedMenu]=useState(0);
  const [isProfileDropdownOpen,setIsProfileDropdownOpen]=useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const handleMenuClick=(index)=>{
setSelectedMenu(index);
    // close mobile menu after navigation
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  const handleProfileClick=(index)=>{
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = () => {
    onLogout();
    // navigate("/login");
  };

const handleBackToHome = (e) => {
  e.stopPropagation();
  
  sessionStorage.setItem("stopRedirect", "true");

  const url = `${import.meta.env.VITE_FRONTEND_URL}/`;
  window.location.href = url;
};

  // Close mobile menu on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMobileMenuOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuRef]);


  const menuClass="menu";
  const activeMenuClass="menu selected";


  return (
    <div className="menu-container" ref={menuRef}>
      <div className="menu-header">
        <img src="/logo.png" className="menu-logo" alt="logo" />
        {/* Mobile menu toggle */}
        <button
          className="menu-toggle"
          aria-controls="dashboard-menu"
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsMobileMenuOpen((s) => !s)}
        >
          <span className="hamburger" />
        </button>
      </div>

      <div id="dashboard-menu" className={`menus ${isMobileMenuOpen ? 'open' : 'collapsed'}`}>
        <ul>
          <li>
            <Link style={{textDecoration:"none"}} to="/dashboard" onClick={()=>handleMenuClick(0)}>
            <p className={selectedMenu==0 ? activeMenuClass : menuClass}>Dashboard</p>
            </Link>
          </li>
          <li>
             <Link style={{textDecoration:"none"}} to="/dashboard/orders" onClick={()=>handleMenuClick(1)}>
            <p className={selectedMenu==1 ? activeMenuClass : menuClass}>Orders</p>
            </Link>
          </li>
          <li>
             <Link style={{textDecoration:"none"}} to="/dashboard/holdings" onClick={()=>handleMenuClick(2)}>
            <p className={selectedMenu==2 ? activeMenuClass : menuClass}>Holdings</p>
            </Link>
          </li>
          <li>
             <Link style={{textDecoration:"none"}} to="/dashboard/positions" onClick={()=>handleMenuClick(3)}>
            <p className={selectedMenu==3 ? activeMenuClass : menuClass}>Positions</p>
            </Link>
          </li>
          <li>
            <Link style={{textDecoration:"none"}} to="/dashboard/funds" onClick={()=>handleMenuClick(4)}>
            <p className={selectedMenu==4 ? activeMenuClass : menuClass}>Funds</p>
            </Link>
          </li>
          <li>
            <Link style={{textDecoration:"none"}} to="/dashboard/apps" onClick={()=>handleMenuClick(5)}>
            <p className={selectedMenu==5 ? activeMenuClass : menuClass}>Apps</p>
            </Link>
          </li>
        </ul>
        <hr />
        
        <div className="profile" onClick={handleProfileClick}>
          <div className="avatar">{user.username?.charAt(0).toUpperCase() || "U"}</div>
          <p className="username">{user.username || "User"}</p>
          {isProfileDropdownOpen && (
            <div className="profile-dropdown">
              <button 
                onClick={handleBackToHome}
                className="back-home-btn"
              >
                ← Back to Home
              </button>
              {/* <button onClick={handleLogout} className="logout-btn">Logout</button> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;