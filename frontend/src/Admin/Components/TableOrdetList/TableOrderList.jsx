import React, { useState, useCallback, useEffect } from "react";
import "./tableorderlist.css";
import { IoCaretDownSharp } from "react-icons/io5";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import NavBar from "../AdminPageNavbar/NavBar";

const TableOrderList = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [selectedTable, setSelectedTable] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tablesWithData, setTablesWithData] = useState(new Set());

  const tableNumbers = Array.from({ length: 10 }, (_, i) => i + 1);

  // Memoize handleFilterChange using useCallback
  const handleFilterChange = useCallback((e) => {
    const table = e.target.value;
    setSelectedTable(table);

    if (table === "") {
      const allItems = data.flatMap((table) => table.items);
      setFilteredData(aggregateItems(allItems));
    } else {
      const tableItems = data
        .filter((t) => t.tableNumber === parseInt(table))
        .flatMap((t) => t.items);

      setFilteredData(aggregateItems(tableItems));
    }
  }, [data]);

  // Memoize fetchData using useCallback
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3500/cart/items");

      if (Array.isArray(response.data)) {
        setData(response.data);
        const tables = new Set(response.data.map((table) => table.tableNumber));
        setTablesWithData(tables);
        handleFilterChange({ target: { value: selectedTable } });
      } else {
        console.error("Unexpected data structure:", response.data);
        setError("Unexpected data structure.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error fetching data.");
    } finally {
      setLoading(false);
    }
  }, [selectedTable, handleFilterChange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const aggregateItems = (items) => {
    const aggregated = items.reduce((acc, item) => {
      if (acc[item.name]) {
        acc[item.name].count += item.count || 0;
      } else {
        acc[item.name] = { ...item };
      }
      return acc;
    }, {});
    return Object.values(aggregated);
  };

  const handleToggle = () => {
    setShowTable((prevShowTable) => !prevShowTable);
  };

  const handlePaidClick = async () => {
    const time = new Date().toLocaleTimeString();
    const date = new Date().toLocaleDateString();

    try {
      await axios.post("http://localhost:3500/bills/paid", {
        tableNumber: parseInt(selectedTable, 10),
        items: filteredData.map((item) => ({
          ...item,
          price: parseFloat(item.price),
        })),
        paidTime: time,
        paidDate: date,
      });
      alert("The Bill has been Paid");
      fetchData();
    } catch (error) {
      console.error("Error in making payments:", error);
      alert("Failed to mark as paid");
    }
  };

  const areAllItemsFinished = () => {
    return filteredData.every((item) => item.status === "finished");
  };

  return (
    <>
      <NavBar />
      <div className="tableorder-page">
        <div className="tableorder-section">
          <div className="container mt-5 mb-5">
            <table className="table">
              <thead>
                <tr>
                  <th className="btn-sec">
                    <button className="btn" onClick={handleToggle}>
                      <IoCaretDownSharp />
                    </button>
                  </th>
                  <th className="cntr table-sec">
                    <select
                      name="table"
                      id="table"
                      className="scrollable-select"
                      value={selectedTable}
                      onChange={handleFilterChange}
                    >
                      <option value="">TABLES</option>
                      {tableNumbers.map((tableNumber) => (
                        <option
                          key={tableNumber}
                          value={tableNumber}
                          style={{
                            backgroundColor: tablesWithData.has(tableNumber)
                              ? "darkgray"
                              : "transparent",
                            color: tablesWithData.has(tableNumber) ? "white" : "black",
                          }}
                        >
                          Table {tableNumber}
                        </option>
                      ))}
                    </select>
                  </th>
                  <th className="cntr">MENU NAME</th>
                  <th className="cntr">QUANTITY</th>
                  <th className="cntr">TYPE</th>
                  <th className="cntr">CATEGORY</th>
                  <th className="cntr">PRICE</th>
                  <th className="cntr">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      {error}
                    </td>
                  </tr>
                ) : showTable ? (
                  selectedTable === "" ? (
                    <tr>
                      <td colSpan="7" className="text-center">
                        --- NO TABLE HAS BEEN CHOSEN ---
                      </td>
                    </tr>
                  ) : filteredData.length > 0 ? (
                    <>
                      {filteredData.map((item, index) => (
                        <tr key={index}>
                          <td className="btn-sec"></td>
                          <td colSpan={2} className="foodname">
                            {item.name}
                          </td>
                          <td className="cntr">{item.count || "-"}</td>
                          <td className="cntr">{item.type || "-"}</td>
                          <td className="cntr">{item.categoryName || "-"}</td>
                          <td className="cntr">
                            ${Number(item.price).toFixed(2) || "0.00"}
                          </td>
                          <td className="cntr">{item.status || "Not Served"}</td>
                        </tr>
                      ))}
                      <tr>
                        <td className="btn-sec"></td>
                        <td colSpan="8" className="text-center">
                          <button
                            className="btn btn-primary"
                            onClick={handlePaidClick}
                            disabled={!areAllItemsFinished()}
                          >
                            Mark as Paid
                          </button>
                        </td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        --- NO ORDERS YET ---
                      </td>
                    </tr>
                  )
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default TableOrderList;
