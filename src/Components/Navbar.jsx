import React, { useState, useEffect } from "react";
import { Home, People, ChatBubbleOutline, NotificationsNone, AccountCircle } from "@mui/icons-material";
import { Menu, MenuItem, Button, IconButton } from "@mui/material";

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

 
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    handleMenuClose();
    window.location.reload(); // optional: refresh page
  };

  return (
    <nav className="w-full flex items-center justify-between px-8 py-3 bg-white shadow-sm">
      {/* Left - Logo */}
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-xl">
          <span className="text-white text-xl font-bold">✦</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-800">
          <span className="text-blue-600">Inno</span>Connect
        </h1>
      </div>

      {/* Middle - Nav Links */}
      <div className="flex gap-10 text-gray-600">
        <button className="flex flex-col items-center hover:text-blue-600 transition">
          <Home fontSize="small" />
          <span className="text-sm font-medium">Home</span>
        </button>

        <button className="flex flex-col items-center hover:text-blue-600 transition">
          <People fontSize="small" />
          <span className="text-sm font-medium">My Network</span>
        </button>

        <button className="flex flex-col items-center hover:text-blue-600 transition">
          <ChatBubbleOutline fontSize="small" />
          <span className="text-sm font-medium">Messages</span>
        </button>

        <button className="flex flex-col items-center hover:text-blue-600 transition">
          <NotificationsNone fontSize="small" />
          <span className="text-sm font-medium">Notifications</span>
        </button>
      </div>

      {/* Right - Profile or Login */}
      <div>
        {isLoggedIn ? (
          <>
            <IconButton onClick={handleMenuOpen}>
              <AccountCircle sx={{ color: "#3b82f6", fontSize: 36 }} />
            </IconButton>

            {/* Dropdown Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>View Profile</MenuItem>
              <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
              <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            variant="contained"
            onClick={() => (window.location.href = "/login")}
            sx={{
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              borderRadius: "12px",
              textTransform: "none",
              px: 3,
              py: 1,
            }}
          >
            Login
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
