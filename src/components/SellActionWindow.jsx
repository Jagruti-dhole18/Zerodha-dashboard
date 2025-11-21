import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { useToast } from "../context/ToastContext";

import GeneralContext from "./GeneralContext.jsx";

import "./BuyActionWindow.css";

const SellActionWindow = ({ uid }) => {
  const { closeSellWindow } = useContext(GeneralContext);
  const { isLoading, error, post } = useApi();
  const { showToast } = useToast();

  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);

  const handleSellClick = async () => {
    // Validation
    if (!stockQuantity || stockQuantity < 1 || !Number.isInteger(Number(stockQuantity))) {
      showToast("Quantity must be a positive integer", "error");
      return;
    }
    if (!stockPrice || stockPrice <= 0) {
      showToast("Price must be greater than 0", "error");
      return;
    }

    const result = await post("/newOrder", {
      name: uid,
      qty: parseInt(stockQuantity),
      price: parseFloat(stockPrice),
      mode: "SELL",
    });

    if (result.success) {
      showToast(`Sell order placed for ${uid}`, "success");
      closeSellWindow();
    } else {
      showToast(result.message || "Failed to place order", "error");
    }
  };

  const handleCancelClick = () => {
    closeSellWindow();
  };

  const marginRequired = (stockQuantity * stockPrice * 0.2).toFixed(2); // Assuming 20% margin

  return (
    <div className="container" id="buy-window" draggable="true">
      <div className="regular-order">
        {error && (
          <div style={{ color: "red", padding: "10px", marginBottom: "10px", fontSize: "0.9em" }}>
            ⚠️ {error}
          </div>
        )}

        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              onChange={(e) => setStockQuantity(e.target.value)}
              value={stockQuantity}
              disabled={isLoading}
              step="1"
              min="1"
            />
          </fieldset>

          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              step="0.05"
              onChange={(e) => setStockPrice(e.target.value)}
              value={stockPrice}
              disabled={isLoading}
              min="0"
            />
          </fieldset>
        </div>
      </div>

      <div className="buttons">
        <span>Margin required ₹{marginRequired}</span>
        <div>
          <Link
            className="btn btn-red"
            onClick={handleSellClick}
            style={{
              opacity: isLoading ? 0.5 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Placing..." : "Sell"}
          </Link>
          <Link
            className="btn btn-grey"
            onClick={handleCancelClick}
            style={{ cursor: "pointer" }}
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellActionWindow;
