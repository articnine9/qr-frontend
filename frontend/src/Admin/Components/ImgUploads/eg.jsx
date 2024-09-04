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

  // Fetch categories and banners
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("https://qr-backend-application.onrender.com/categories/category");
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
        const response = await axios.get("https://qr-backend-application.onrender.com/banner/banners");
        setBanners(response.data);
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };

    fetchCategories();
    fetchBanners();
  }, []);

  // Form validation functions
  const isMenuFormValid = () => itemName && price && categoryName && type && image;
  const isCategoryFormValid = () => categoryName && newImage;
  const isBannerFormValid = () => bannerImage;

  // Form handlers
  const handleImageUpload = async (e) => {
    e.preventDefault();

    if (!newImage || !categoryName) {
      setError("Please select an image and enter a category name.");
      return;
    }

    const existingCategory = categories.find((cat) => cat.categoryName === categoryName);

    if (existingCategory) {
      alert("Category already exists. Please choose a different category name.");
      setError("Category already exists.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", newImage);
      formData.append("categoryName", categoryName);

      const response = await axios.post(
        "https://qr-backend-application.onrender.com/categories/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.message === "Image uploaded successfully") {
        alert("Category uploaded successfully!");
        setNewImage(null);
        setCategoryName("");

        const categoryResponse = await axios.get("https://qr-backend-application.onrender.com/categories/category");
        setCategories(categoryResponse.data);
      } else {
        setError(response.data.message || "Failed to upload image.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image.");
    }
  };

  // More handlers (handleMenuSubmit, handleBannerSubmit, etc.)...

  return (
    <>
      <NavBar />
      <div className="upload-page">
        {/* Form components and other JSX */}
        {error && <div className="error-message">{error}</div>}
      </div>
    </>
  );
};

export default Uploads;
