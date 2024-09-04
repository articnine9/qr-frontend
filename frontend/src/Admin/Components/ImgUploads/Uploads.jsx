import React, { useState, useEffect } from "react";
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

    fetchCategories();
    fetchBanners();
  }, []);

  const isMenuFormValid = () => {
    return itemName && price && categoryName && type && image;
  };

  const isCategoryFormValid = () => {
    return categoryName && newImage;
  };

  const isBannerFormValid = () => {
    return bannerImage;
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();

    if (!newImage || !categoryName) {
      setError("Please select an image and enter a category name.");
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

;

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
        setNewImage(null);
        setCategoryName("");

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
      console.error("Error uploading banner image:", error);
      setError("Error uploading banner image.");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!categoryId) {
      console.error("No category ID provided for deletion");
      setError("No category ID provided.");
      return;
    }

    try {
      await axios.post(
        `https://qr-backend-application.onrender.com/categories/category/${categoryId}`
      );
      alert("Category deleted successfully!");

      const response = await axios.get(
        "https://qr-backend-application.onrender.com/categories/category"
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Error deleting category:", error);
      setError("Error deleting category.");
    }
  };

  const handleDeleteBanner = async (fileId) => {
    if (!fileId) {
      console.error("No banner ID provided for deletion");
      setError("No banner ID provided.");
      return;
    }

    try {
      await axios.delete(
        `https://qr-backend-application.onrender.com/banner/banners/${fileId}`
      );
      alert("Banner deleted successfully!");

      const updatedBanners = await axios.get(
        "https://qr-backend-application.onrender.com/banner/banners"
      );
      setBanners(updatedBanners.data);
    } catch (error) {
      console.error("Error deleting banner:", error);
      setError("Error deleting banner.");
    }
  };

  return (
    <>
      <NavBar />
      <div className="upload-page">
        <div className="upload-section">
          <div className="menu-add">
            <h2>ADD MENU ITEM</h2>
            <form onSubmit={handleMenuSubmit}>
              <div>
                <input
                  type="text"
                  id="itemName"
                  name="itemName"
                  placeholder="Enter the Name"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                />
                <input
                  type="number"
                  id="price"
                  name="price"
                  step="0.01"
                  placeholder="Enter the Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div>
                <select
                  id="categoryName"
                  name="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.categoryName}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
                <select
                  id="type"
                  name="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                >
                  <option value="">Select a type</option>
                  <option value="Veg">Veg</option>
                  <option value="Non Veg">Non Veg</option>
                </select>
              </div>
              <div>
                <label>Availability:</label>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="availability"
                      value="available"
                      checked={availability === "available"}
                      onChange={() => setAvailability("available")}
                    />
                    Available
                  </label>
                </div>
              </div>

              <div>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </div>

              <button
                type="submit"
                disabled={!isMenuFormValid()}
                className={`submit-button ${isMenuFormValid() ? "active" : ""}`}
              >
                Submit Menu
              </button>
            </form>
          </div>

          <div className="banner-add flex">
            <div className="bannerbox">
              <h2>ADD BANNER</h2>
              <form onSubmit={handleBannerSubmit}>
                <div className="form-group">
                  <label htmlFor="bannerImage">Select Banner Image:</label>
                  <input
                    type="file"
                    id="bannerImage"
                    name="bannerImage"
                    accept="image/*"
                    onChange={(e) => setBannerImage(e.target.files[0])}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={!isBannerFormValid()}
                  className={`submit-button ${
                    isBannerFormValid() ? "active" : ""
                  }`}
                >
                  Submit Banner
                </button>
              </form>
            </div>

            <div className="bannerbox">
              <h2>Existing Banners</h2>
              <div className="banners-list">
                {banners.map((banner) => (
                  <div key={banner._id} className="banner-item">
                    <p>{banner.filename}</p>
                    <button onClick={() => handleDeleteBanner(banner.fileId)}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="upload-section category">
          <div className="uploadbox">
            <h2>Upload New Category Image</h2>
            <form onSubmit={handleImageUpload}>
              <div className="form-group">
                <label htmlFor="categoryName">Category Name:</label>
                <input
                  type="text"
                  id="categoryName"
                  name="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newImage">Select Image:</label>
                <input
                  type="file"
                  id="newImage"
                  name="newImage"
                  accept="image/*"
                  onChange={(e) => setNewImage(e.target.files[0])}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={!isCategoryFormValid()}
                className={`submit-button ${
                  isCategoryFormValid() ? "active" : ""
                }`}
              >
                Submit Category
              </button>
            </form>
          </div>
          <div className="uploadbox category-list">
            <h2>Existing Categories</h2>
            <div className="categories-list">
              {categories.map((cat) => {
                return (
                  <div key={cat._id} className="category-item">
                    <p>{cat.categoryName}</p>
                    <button
                      onClick={() => handleDeleteCategory(cat.categoryId)}
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    </>
  );
};

export default Uploads;
