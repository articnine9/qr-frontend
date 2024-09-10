const handleImageUpload = async (e) => {
  e.preventDefault();

  if (!isCategoryFormValid()) {
    return;
  }

  const existingCategory = categories.find(
    (cat) => cat.categoryName === categoryName
  );

  if (existingCategory) {
    alert("Category already exists. Please choose a different category name.");
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
        imageInputRef.current.value = null;
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

categoryRouter.post('/category/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongodb.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid category ID format' });
  }

  try {
    const database = await db.getDatabase();
    const categoriesCollection = database.collection('categories');
    
    const category = await categoriesCollection.findOne({ _id: new mongodb.ObjectId(id) });
    if (category && category.fileId) {
      const fileId = category.fileId;
      const bucket = new mongodb.GridFSBucket(await db.getDatabase());
      bucket.delete(new mongodb.ObjectId(fileId), (err) => {
        if (err) {
          console.error('Error deleting image:', err);
        }
      });
    }

    const result = await categoriesCollection.deleteOne({ _id: new mongodb.ObjectId(id) });
    if (result.deletedCount === 1) {
      res.status(200).json({ message: 'Category deleted successfully' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});