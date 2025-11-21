import React, { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";

const Positions = () => {
  const [allPositions, setAllPositions] = useState([]);
  const { isLoading, error, get } = useApi();

  useEffect(() => {
    const fetchPositions = async () => {
      await get("/allPositions", (data) => {
        setAllPositions(data);
      });
    };

    fetchPositions();
  }, []);

  if (isLoading && allPositions.length === 0) {
    return (
      <div>
        <h3 className="title">Positions</h3>
        <p style={{ textAlign: "center", padding: "20px" }}>Loading positions...</p>
      </div>
    );
  }

  return (
    <>
      <h3 className="title">
        Positions ({allPositions.length})
        {isLoading && <span style={{ fontSize: "0.8em", marginLeft: "10px" }}>Updating...</span>}
      </h3>

      {error && (
        <div style={{ color: "red", padding: "10px", marginBottom: "10px" }}>
          ⚠️ {error}
        </div>
      )}

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg.</th>
              <th>LTP</th>
              <th>P&L</th>
              <th>Chg.</th>
            </tr>
          </thead>

          <tbody>
            {allPositions.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                  No open positions
                </td>
              </tr>
            ) : (
              allPositions.map((stock, index) => {
                const curValue = stock.price * stock.qty;
                const pnl = curValue - stock.avg * stock.qty;
                const pnlPercent = stock.avg > 0 ? ((pnl / (stock.avg * stock.qty)) * 100).toFixed(2) : 0;
                const isProfit = pnl >= 0;
                const profClass = isProfit ? "profit" : "loss";
                const dayClass = stock.isLoss ? "loss" : "profit";

                return (
                  <tr key={stock._id || index}>
                    <td>{stock.product}</td>
                    <td>{stock.name}</td>
                    <td>{stock.qty}</td>
                    <td>₹{stock.avg.toFixed(2)}</td>
                    <td>₹{stock.price.toFixed(2)}</td>
                    <td className={profClass}>
                      ₹{pnl.toFixed(2)} ({pnlPercent}%)
                    </td>
                    <td className={dayClass}>{stock.day}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Positions;
