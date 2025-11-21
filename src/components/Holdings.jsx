import React, { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { VerticalGraph} from "./VerticalGraph";

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const { isLoading, error, get } = useApi();

  const fetchHoldings = async () => {
    const result = await get("/allHoldings", (data) => {
      setAllHoldings(data);
    });
    return result;
  };

  useEffect(() => {
    fetchHoldings();

    const interval = setInterval(fetchHoldings, 2000);

    return () => clearInterval(interval);
  }, []);

  const labels=allHoldings.map((subArray)=>subArray["name"]);
  const data={
    labels,
    datasets:[
       {
      label: 'Stock Price',
      data: allHoldings.map((stock) =>stock.price), 
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    }
    ]
  }

  return (
    <>
      <h3 className="title">
        Holdings ({allHoldings.length})
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
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg. cost</th>
              <th>LTP</th>
              <th>Cur. val</th>
              <th>P&L</th>
              <th>Net chg.</th>
              <th>Day chg.</th>
            </tr>
          </thead>

          <tbody>
            {allHoldings.map((stock, index) => {
              const curValue = stock.price * stock.qty;
              const investedValue = stock.avg * stock.qty;
              const pnl = curValue - investedValue;
              const pnlPercent = investedValue > 0 ? ((pnl / investedValue) * 100).toFixed(2) : 0;
              const isProfit = pnl >= 0;
              const profClass = isProfit ? "profit" : "loss";
              const dayClass = stock.isLoss ? "loss" : "profit";

              return (
                <tr key={index}>
                  <td>{stock.name}</td>
                  <td>{stock.qty}</td>
                  <td>₹{stock.avg.toFixed(2)}</td>
                  <td>₹{stock.price.toFixed(2)}</td>
                  <td>₹{curValue.toFixed(2)}</td>
                  <td className={profClass}>
                    ₹{pnl.toFixed(2)} ({pnlPercent}%)
                  </td>
                  <td className={profClass}>{stock.net}</td>
                  <td className={dayClass}>{stock.day}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="row">
        {(() => {
          const totalInvestment = allHoldings.reduce((sum, stock) => sum + (stock.avg * stock.qty), 0);
          const currentValue = allHoldings.reduce((sum, stock) => sum + (stock.price * stock.qty), 0);
          const totalPnL = currentValue - totalInvestment;
          const pnlPercent = totalInvestment > 0 ? ((totalPnL / totalInvestment) * 100).toFixed(2) : 0;
          const pnlClass = totalPnL >= 0 ? "profit" : "loss";

          return (
            <>
              <div className="col">
                <h5>
                  ₹{totalInvestment.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </h5>
                <p>Total investment</p>
              </div>
              <div className="col">
                <h5>
                  ₹{currentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </h5>
                <p>Current value</p>
              </div>
              <div className="col">
                <h5 className={pnlClass}>
                  ₹{totalPnL.toLocaleString("en-IN", { maximumFractionDigits: 2 })} ({pnlPercent}%)
                </h5>
                <p>P&L</p>
              </div>
            </>
          );
        })()}
      </div>
      <VerticalGraph data={data}/>
    </>
  );
};

export default Holdings;
