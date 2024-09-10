import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./uploads.css";
import NavBar from "../AdminPageNavbar/NavBar";

const Uploads = () => {
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [type, setType] = useState("");
  const [image, setImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [availability, setAvailability] = useState("available");
  const [comboItems, setComboItems] = useState([
    { id: Date.now(), name: "", quantity: "" },
  ]);
  const [comboName, setComboName] = useState("");
  const [comboImage, setComboImage] = useState(null);
  const [combos, setCombos] = useState([]);
  const [comboItemType, setComboItemType] = useState({});

  const imageInputRef = useRef(null);

  useEffect(() => {
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

    const fetchBanners = async () => {
      try {
        const response = await axios.get(
          "https://qr-backend-application.onrender.com/banner/banners"
        );
        setBanners(response.data);
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };
    const fetchCombos = async () => {
      try {
        const response = await axios.get(
          "https://qr-backend-application.onrender.com/combos/combo"
        );
        setCombos(response.data);
      } catch (error) {
        console.error("Error fetching combos:", error);
      }
    };
    fetchCombos();
    fetchCategories();
    fetchBanners();
  }, []);

  const handleAddRow = () => {
    setComboItems([...comboItems, { id: Date.now(), name: "", quantity: "" }]);
  };

  const handleDeleteRow = (index) => {
    const updatedItems = comboItems.filter((_, i) => i !== index);
    setComboItems(updatedItems);
    const newComboItemType = { ...comboItemType };
    delete newComboItemType[index];
    setComboItemType(newComboItemType);
  };

  const handleRowChange = (e, index) => {
    const { name, value } = e.target;
    const updatedItems = [...comboItems];
    updatedItems[index] = { ...updatedItems[index], [name]: value };
    setComboItems(updatedItems);
    setComboItemType((prevState) => ({
      ...prevState,
      [index]: name === "type" ? value : prevState[index],
    }));
  };

  const handleComboSubmit = async (e) => {
    e.preventDefault();

    if (!comboName.trim() || !comboImage) {
      setError("Please provide both combo name and image.");
      return;
    }

    const formData = new FormData();
    formData.append("comboName", comboName);
    formData.append("comboImage", comboImage);
    formData.append(
      "comboItems",
      JSON.stringify(
        comboItems.map((item, index) => ({
          name: item.name,
          quantity: item.quantity,
          type: comboItemType[index] || "",
        }))
      )
    );

    try {
      await axios.post(
        "https://qr-backend-application.onrender.com/combos/add",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert("Combo added successfully!");
      setComboName("");
      setComboImage(null);
      setComboItems([{ id: Date.now(), name: "", quantity: "" }]);
      setComboItemType({});
      setError("");
      const updatedCombo = await axios.get(
        "https://qr-backend-application.onrender.com/combos/combo"
      );
      setCombos(updatedCombo.data);
    } catch (error) {
      console.error(
        "Error uploading combo data:",
        error.response ? error.response.data : error.message
      );
      setError("Error uploading combo data.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `https://qr-backend-application.onrender.com/combos/${id}`
      );
      alert(response.data.message);
      setCombos(combos.filter((combo) => combo._id !== id));
      const updatedItems = await axios.get(
        "https://qr-backend-application.onrender.com/combos/combo"
      );
      setCombos(updatedItems.data);
    } catch (error) {
      console.error("Error deleting combo:", error);
      alert("Error deleting combo.");
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();

    if (!isCategoryFormValid()) {
      return;
    }

    const existingCategory = categories.find(
      (cat) => cat.categoryName === categoryName
    );

    if (existingCategory) {
      alert(
        "Category already exists. Please choose a different category name."
      );
      setError("Category already exists.");
      return;
    }

    const formData = new FormData();
    formData.append("image", newImage);
    formData.append("categoryName", categoryName);

    try {
      const response = await axios.post(
        "https://qr-backend-application.onrender.com/categories/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.message === "Image uploaded successfully") {
        alert("Category uploaded successfully!");

        // Reset form fields and file input
        setCategoryName("");
        setNewImage(null);

        // Clear file input value
        if (imageInputRef.current) {
          imageInputRef.current.value = ""; // Ensure file input value is cleared
        }

        // Refresh categories
        const categoryResponse = await axios.get(
          "https://qr-backend-application.onrender.com/categories/category"
        );
        setCategories(categoryResponse.data);
      } else {
        setError(response.data.message || "Failed to upload image.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image.");
    }
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.append("name", itemName);
    formData.append("price", price);
    formData.append("categoryName", categoryName);
    formData.append("type", type);
    formData.append("availability", availability);

    if (image) formData.append("image", image);

    try {
      const response = await axios.post(
        "https://qr-backend-application.onrender.com/files/add",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert("Menu upload successful: " + response.data.message);

      setItemName("");
      setPrice("");
      setCategoryName("");
      setType("");
      setImage(null);
      setAvailability("available");
    } catch (error) {
      console.error("Error uploading menu data:", error);
      setError("Error uploading menu data.");
    }
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    if (!bannerImage) {
      setError("Please select a banner image.");
      return;
    }
    setError("");

    const formData = new FormData();
    formData.append("bannerImage", bannerImage);

    try {
      const response = await axios.post(
        "https://qr-backend-application.onrender.com/banner/add",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert("Banner upload successful: " + response.data.message);

      setBannerImage(null);

      const updatedBanners = await axios.get(
        "https://qr-backend-application.onrender.com/banner/banners"
      );
      setBanners(updatedBanners.data);
    } catch (error) {
      console.error("Error uploading banner data:", error);
      setError("Error uploading banner data.");
    }
  };

  const isCategoryFormValid = () => {
    if (!categoryName.trim()) {
      setError("Category name is required.");
      return false;
    }
    if (!newImage) {
      setError("Please select an image.");
      return false;
    }
    return true;
  };

  return (
    <div className="uploads">
      <NavBar />
      <div className="uploads-form">
        <h2>Upload Menu Item</h2>
        <form onSubmit={handleMenuSubmit}>
          <input
            type="text"
            placeholder="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <select
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.categoryName}>
                {cat.categoryName}
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Select Type</option>
            <option value="food">Food</option>
            <option value="drink">Drink</option>
          </select>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          >
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <button type="submit">Upload Menu Item</button>
        </form>

        <h2>Upload Category Image</h2>
        <form onSubmit={handleImageUpload}>
          <input
            type="text"
            placeholder="Category Name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
          <input
            type="file"
            ref={imageInputRef}
            onChange={(e) => setNewImage(e.target.files[0])}
          />
          <button type="submit">Upload Category Image</button>
        </form>

        <h2>Upload Banner</h2>
        <form onSubmit={handleBannerSubmit}>
          <input
            type="file"
            onChange={(e) => setBannerImage(e.target.files[0])}
          />
          <button type="submit">Upload Banner</button>
        </form>

        <h2>Create Combo</h2>
        <form onSubmit={handleComboSubmit}>
          <input
            type="text"
            placeholder="Combo Name"
            value={comboName}
            onChange={(e) => setComboName(e.target.value)}
          />
          <input
            type="file"
            onChange={(e) => setComboImage(e.target.files[0])}
          />
          <div className="combo-items">
            {comboItems.map((item, index) => (
              <div key={item.id} className="combo-item">
                <input
                  type="text"
                  name="name"
                  placeholder="Item Name"
                  value={item.name}
                  onChange={(e) => handleRowChange(e, index)}
                />
                <input
                  type="text"
                  name="quantity"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) => handleRowChange(e, index)}
                />
                <select
                  name="type"
                  value={comboItemType[index] || ""}
                  onChange={(e) => handleRowChange(e, index)}
                >
                  <option value="">Select Type</option>
                  <option value="food">Food</option>
                  <option value="drink">Drink</option>
                </select>
                <button type="button" onClick={() => handleDeleteRow(index)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={handleAddRow}>
            Add Item
          </button>
          <button type="submit">Create Combo</button>
        </form>

        {error && <div className="error-message">{error}</div>}

        <h2>Existing Combos</h2>
        <ul>
          {combos.map((combo) => (
            <li key={combo._id}>
              {combo.comboName}
              <button onClick={() => handleDelete(combo._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Uploads;
