import React, { useEffect, useState } from "react";
import "./adminOrder.css";
import axios from "axios";
import NavBar from "../AdminPageNavbar/NavBar";

const AdminOrder = () => {
  const [data, setData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [selectedTable, setSelectedTable] = useState("");
  const [tablesWithOrders, setTablesWithOrders] = useState(new Set());

  const fetchData = async () => {
    try {
      const response = await axios.get(
        "https://qr-backend-application.onrender.com/menu/stocks"
      );
      const dataWithAvailability = response.data.map((item) => ({
        ...item,
        availability: "available",
      }));
      setData(dataWithAvailability);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "https://qr-backend-application.onrender.com/categories/category"
      );

      if (Array.isArray(response.data)) {
        const uniqueCategories = response.data.reduce((acc, current) => {
          if (!acc.some((cat) => cat.categoryName === current.categoryName)) {
            acc.push(current);
          }
          return acc;
        }, []);

        setCategories(uniqueCategories);
      } else {
        console.error("Unexpected data structure:", response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  useEffect(() => {
    let filtered = data;
    if (selectedCategory) {
      filtered = filtered.filter(
        (item) =>
          item.categoryName.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    if (selectedType) {
      filtered = filtered.filter(
        (item) => item.type.toLowerCase() === selectedType.toLowerCase()
      );
    }
    setFilteredData(filtered);
  }, [selectedCategory, selectedType, data]);

  const handleTableChange = (e) => {
    setSelectedTable(e.target.value);
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleAddItem = (item) => {
    setSelectedItems((prevItems) => {
      const newItems = { ...prevItems };
      if (newItems[item._id]) {
        newItems[item._id] = {
          ...newItems[item._id],
          count: newItems[item._id].count + 1,
        };
      } else {
        newItems[item._id] = { 
          ...item, 
          count: 1,
          status: "not served" // Add this line
        };
      }
      setTablesWithOrders((prev) => new Set([...prev, item.tableNumber]));
      return newItems;
    });
  };
  

  const handleRemove = (id) => {
    setSelectedItems((prevItems) => {
      const newItems = { ...prevItems };
      if (newItems[id]) {
        if (newItems[id].count > 1) {
          newItems[id] = {
            ...newItems[id],
            count: newItems[id].count - 1,
          };
        } else {
          delete newItems[id];
        }
      }
      return newItems;
    });
  };

  const handleClearTable = () => {
    setSelectedItems({});
    setSelectedTable("");
  };

  const handleOrderNow = async () => {
    if (!selectedTable) {
      alert("Please choose a table");
      return;
    }

    if (Object.keys(selectedItems).length === 0) {
      alert("Please choose the order");
      return;
    }

    const tableNumber = parseInt(selectedTable.split(" ")[1], 10);
    const orderData = {
      tableNumber: tableNumber,
      items: Object.values(selectedItems).map((item) => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        categoryName: item.categoryName,
        type: item.type,
        count: item.count,
        availability: item.availability,
      })),
    };

    try {
      const response = await axios.post(
        "https://qr-backend-application.onrender.com/cart/cartitems",
        orderData
      );
      if (response.status === 201) {
        handleClearTable();
        setSelectedTable("");
        alert("The Order has been placed");
      } else {
        alert("Failed to place order");
        console.error("Failed to place order", response.data);
      }
    } catch (error) {
      console.error("Error placing order", error);
    }
  };

  return (
    <>
      <NavBar />
      <div className="adminOrder-page">
        <div className="adminOrder-section">
          <div className="box">
            <div className="navBar">
              <select
                name="table"
                id="table"
                className="category-dropdown"
                onChange={handleTableChange}
                value={selectedTable}
              >
                <option value="">Select Table</option>
                {[...Array(10).keys()].map((i) => (
                  <option
                    key={i + 1}
                    value={`Table ${i + 1}`}
                    style={{
                      backgroundColor: tablesWithOrders.has(i + 1)
                        ? "#4f4f4f"
                        : "transparent",
                      color: tablesWithOrders.has(i + 1) ? "white" : "black",
                    }}
                  >
                    Table {i + 1}
                  </option>
                ))}
              </select>

              <select
                name="category"
                id="category"
                className="category-dropdown"
                onChange={handleCategoryChange}
                value={selectedCategory}
              >
                <option value="">FOOD</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>

              <select
                name="type"
                id="type"
                className="category-dropdown"
                onChange={handleTypeChange}
                value={selectedType}
              >
                <option value="">TYPE</option>
                <option value="Veg">Veg</option>
                <option value="Non Veg">Non Veg</option>
              </select>
            </div>

            <div className="menu-sec flex">
              {filteredData.map((item) => (
                <div className="menu-button" key={item._id}>
                  <button onClick={() => handleAddItem(item)}>
                    {item.name}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="box">
            <div className="navBar">
              <button onClick={handleClearTable}>Clear Table</button>
              <button onClick={handleOrderNow}>Order Now</button>
            </div>
            <table className="table">
              <thead className="primary">
                <tr>
                  <th>QTY</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(selectedItems).map((item) => (
                  <tr key={item._id}>
                    <td>{item.count}</td>
                    <td>{item.name}</td>
                    <td>{item.type}</td>
                    <td>{item.categoryName}</td>
                    <td>
                      <button onClick={() => handleRemove(item._id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminOrder;
