import React, { useState, useContext, useEffect, useCallback } from "react";
import { Tooltip, Grow } from "@mui/material";
import { BarChartOutlined, KeyboardArrowDown, KeyboardArrowUp, MoreHoriz } from "@mui/icons-material";
import GeneralContext from "./GeneralContext.jsx";
import { useApi } from "../hooks/useApi";
import { useToast } from "../context/ToastContext";
import { DoughnutGraph } from "./DoughnutGraph.jsx";

const WatchList = () => {
  const [watchlistData, setWatchlistData] = useState([]);
  const [newStock, setNewStock] = useState("");
  const [stockPrice, setStockPrice] = useState("");

  const { isLoading, error, get, post } = useApi();
  const { showToast } = useToast();

  const fetchAllData = useCallback(async () => {
    try {
      const watchlistResult = await new Promise((resolve) => {
        get("/watchlist", (data) => resolve(data || []));
      });

      const holdingsResult = await new Promise((resolve) => {
        get("/allHoldings", (data) => resolve(data || []));
      });

      const holdingsAsWatchlist = holdingsResult.map((h, idx) => ({
        _id: `holding-${idx}`,
        stockSymbol: h.name.toUpperCase(),
        stockName: h.name,
        currentPrice: h.price,
        priceChange: (h.price - h.avg).toFixed(2),
        percentChange: ((((h.price - h.avg) / h.avg) * 100) || 0).toFixed(2),
        isHolding: true,
      }));

      const watchlistSymbols = watchlistResult.map((w) => w.stockSymbol?.toUpperCase());

      const combined = [
        ...watchlistResult,
        ...holdingsAsWatchlist.filter(h => !watchlistSymbols.includes(h.stockSymbol)),
      ];

      setWatchlistData(combined);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }, [get]);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!newStock.trim() || !stockPrice.trim()) {
      showToast("Please enter stock symbol and price", "warning");
      return;
    }

    const result = await post("/watchlist", {
      stockSymbol: newStock.toUpperCase(),
      stockName: newStock.toUpperCase(),
      currentPrice: parseFloat(stockPrice),
      priceChange: 0,
      percentChange: 0,
    });

    if (result.success) {
      showToast(`${newStock} added to watchlist`, "success");
      setNewStock("");
      setStockPrice("");
      fetchAllData();
    } else {
      showToast(result.message || "Failed to add stock", "error");
    }
  };

  const labels = watchlistData.map((stock) => stock.stockName || stock.stockSymbol);
  const data = {
    labels,
    datasets: [
      {
        label: "Price",
        data: watchlistData.map((stock) => stock.currentPrice || 0),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="watchlist-container">

      {error && <div style={{ color: "red", padding: "10px", marginBottom: "10px" }}>⚠️ {error}</div>}

      <div className="search-container">
        <form onSubmit={handleAddStock} style={{ display: "flex", width: "100%", gap: "10px" }}>
          <input
            type="text"
            placeholder="Stock symbol (e.g., TCS)"
            className="search"
            value={newStock}
            onChange={(e) => setNewStock(e.target.value)}
            style={{ flex: 1 }}
          />
          <input
            type="number"
            placeholder="Price"
            value={stockPrice}
            onChange={(e) => setStockPrice(e.target.value)}
            style={{ width: "80px" }}
            step="0.01"
          />
          <button
            type="submit"
            className="add-stock-btn"
          >
            Add
          </button>
        </form>

        <span className="counts">
          {watchlistData.length} items
          {isLoading && <span style={{ marginLeft: "10px", fontSize: "0.8em" }}>Updating...</span>}
        </span>
      </div>

      <div className="list-wrapper">
        <ul className="list">
          {watchlistData.length === 0 ? (
            <li style={{ padding: "20px", textAlign: "center" }}>
              {isLoading ? "Loading watchlist..." : "No stocks in watchlist. Add one above!"}
            </li>
          ) : (
            watchlistData.map((stock) => (
              <WatchListItem stock={stock} key={stock._id} onUpdate={fetchAllData} />
            ))
          )}
        </ul>
      </div>

      {watchlistData.length > 0 && <DoughnutGraph data={data} />}
    </div>
  );
};

export default WatchList;


const WatchListItem = ({ stock, onUpdate }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);
  const { delete: deleteWatchlist } = useApi();
  const { showToast } = useToast();

  const handleRemove = async () => {
    if (stock.isHolding) {
      showToast("Cannot remove holdings from watchlist", "warning");
      return;
    }

    const result = await deleteWatchlist(`/watchlist/${stock._id}`);

    if (result.success) {
      showToast(`${stock.stockName} removed from watchlist`, "success");
      onUpdate();
    }
  };

  const isDown = (stock.percentChange || 0) < 0;

  return (
    <li
      onMouseEnter={() => setShowWatchlistActions(true)}
      onMouseLeave={() => setShowWatchlistActions(false)}
    >
      <div className="item">
        <p className={isDown ? "down" : "up"}>
          {stock.stockSymbol}
          {stock.isHolding && <span style={{ fontSize: "0.8em", opacity: 0.7 }}>(Holding)</span>}
        </p>

        <div className="itemInfo">
          <span className="percent">{stock.percentChange || 0}%</span>
          {isDown ? <KeyboardArrowDown className="down" /> : <KeyboardArrowUp className="up" />}
          <span className="price">₹{stock.currentPrice || 0}</span>
        </div>
      </div>

      {showWatchlistActions && (
        <WatchListActions
          uid={stock.stockSymbol}
          onRemove={handleRemove}
          isHolding={stock.isHolding}
        />
      )}
    </li>
  );
};


const WatchListActions = ({ uid, onRemove, isHolding }) => {
  const { openBuyWindow, openSellWindow } = useContext(GeneralContext);

  return (
    <span className="actions">
      <span>
        <Tooltip title="Buy (B)" placement="top" arrow TransitionComponent={Grow}>
          <button className="buy" onClick={() => openBuyWindow(uid)}>Buy</button>
        </Tooltip>

        <Tooltip title="Sell (S)" placement="top" arrow TransitionComponent={Grow}>
          <button className="chart" onClick={() => openSellWindow(uid)}>Sell</button>
        </Tooltip>

        <Tooltip title="Analytics (A)" placement="top" arrow TransitionComponent={Grow}>
          <button className="action">
            <BarChartOutlined className="icon" />
          </button>
        </Tooltip>

        <Tooltip
          title={isHolding ? "Cannot remove holdings" : "Remove from watchlist"}
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button onClick={onRemove} disabled={isHolding}>
            <MoreHoriz />
          </button>
        </Tooltip>
      </span>
    </span>
  );
};
