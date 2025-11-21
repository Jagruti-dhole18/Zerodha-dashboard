import React, { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";

const Orders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const { isLoading, error, get } = useApi();

  useEffect(() => {
    const fetchOrders = async () => {
      await get("/allOrders", (data) => {
        setAllOrders(data);
      });
    };

    fetchOrders();
  }, []);

  if (isLoading && allOrders.length === 0) {
    return (
      <div className="orders">
        <p style={{ textAlign: "center", padding: "20px" }}>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="orders">
      {error && (
        <div style={{ color: "red", padding: "10px", marginBottom: "10px" }}>
          ⚠️ {error}
        </div>
      )}

      {allOrders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders today</p>
          <a href="/dashboard" className="btn">Get started</a>
        </div>
      ) : (
        <div className="order-table">
          <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Price</th>
              <th>Mode</th>
              <th>Status</th>
              <th>Executed Qty</th>
            </tr>
          </thead>
          <tbody>
            {allOrders.map((order, index) => (
              <tr key={order._id || index}>
                <td>{order.name}</td>
                <td>{order.qty}</td>
                <td>₹{order.price.toFixed(2)}</td>
                <td>
                  <span className={order.mode === "BUY" ? "profit" : "loss"}>
                    {order.mode}
                  </span>
                </td>
                <td>
                  <span
                    className={
                      order.status === "Completed"
                        ? "profit"
                        : order.status === "Cancelled"
                        ? "loss"
                        : ""
                    }
                  >
                    {order.status || "Pending"}
                  </span>
                </td>
                <td>{order.executedQty || 0}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
