import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Carousel, Card, Row, Col, Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './menu.css'; // Ensure this file includes the blur effect styles
import { 
    setImageUrls, 
    setSelectedTable,
    setCategoryImages, 
    setFoodItemImages, 
    setUpdatedItems, 
    setLoading 
} from '../../../SlicesFolder/Slices/menuSlice';
import MenuNavbar from '../CustomerPageNavbar/navBar';
import axios from 'axios';

// Loader Component
const Loader = () => (
  <div className="loader-container">
    <div className="loader"></div>
  </div>
);

// Table Selection Popup Component
const TableSelectionPopup = ({ onClose, onTableSelect }) => {
  const handleTableSelect = (event) => {
    const tableNumber = event.target.value;
    onTableSelect(tableNumber);
    onClose(); // Close the popup after selection
  };

  return (
    <div style={popupStyles.overlay}>
      <div style={popupStyles.container}>
        <h2>Select Table Number</h2>
        <select onChange={handleTableSelect} style={popupStyles.select}>
          <option value="">Select Table</option>
          {[...Array(10).keys()].map(i => (
            <option key={i} value={i + 1}>Table {i + 1}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

const popupStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
  },
  select: {
    margin: '10px 0',
    padding: '5px',
    borderRadius: '5px',
    border: '1px solid #ddd',
  }
};

// Menu Component
const Menu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    imageUrls,
    selectedTable,
    categoryImages,
    foodItemImages,
    updatedItems,
    loading,
    showBottomNavbar,
    orderedFood
  } = useSelector(state => state.menu);

  console.log('selectedTable', selectedTable);
  console.log('orderedFood', orderedFood);
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isTableSelected, setIsTableSelected] = useState(!!selectedTable);
  const [showTablePopup, setShowTablePopup] = useState(!selectedTable);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const categoryRowRef = useRef(null);

  // Effect to show table selection popup if no table is selected
  useEffect(() => {
    if (!isTableSelected) {
      setShowTablePopup(true);
    }
  }, [isTableSelected]);

  // Effect to fetch data when component mounts or selectedTable changes
  useEffect(() => {
    const fetchBannerImages = async () => {
      try {
        const response = await axios.get('http://localhost:3500/banner/banners');
        const urls = response.data.map(file => `http://localhost:3500/banner/image/${file.fileId}`);
        dispatch(setImageUrls(urls));
      } catch (error) {
        console.error("Error fetching banner images: ", error);
      }
    };

    const fetchCategoryImages = async () => {
      try {
        const response = await axios.get('http://localhost:3500/categories/category');
       
        
        const responseData = response.data;
       
        const categoryData = responseData.map(item => ({
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          categoryUrl: `http://localhost:3500/categories/image/${item.fileId}`
        }));
        dispatch(setCategoryImages(categoryData));
      } catch (error) {
        console.error("Error fetching category images: ", error);
      }
    };

    console.log('categoryImages',categoryImages);
    

    const fetchFoodItemsImages = async () => {
      try {
        const response = await axios.get('http://localhost:3500/menu/stocks');
        const foodItemsData = response.data;
        const urls = foodItemsData.map(item => ({
          typeName: item.name,
          typeImageUrl: `http://localhost:3500/files/image/${item.imageId}`,
          typePrice: item.price,
          categoryName: item.categoryName,
          typeId: item._id,
          type: item.type,
          availability: item.availability
        }));
        dispatch(setFoodItemImages(urls));
        console.log('urls', urls);
        
        const itemsWithCounts = urls.map(item => ({
          name: item.typeName,
          count: 0,
          type: item.type,
          price: item.typePrice,
          categoryName: item.categoryName,
          typeId: item.typeId,
          availability: item.availability,
          tableNumber: selectedTable || null
        }));
        console.log('itemsWithCounts', itemsWithCounts);
        dispatch(setUpdatedItems(itemsWithCounts));
      } catch (error) {
        console.error("Error fetching food item images: ", error);
      }
    };

    const fetchData = async () => {
      await Promise.all([fetchBannerImages(), fetchCategoryImages(), fetchFoodItemsImages()]);
      dispatch(setLoading(false));
    };

    fetchData();
  }, [selectedTable, loading, dispatch]); // Added selectedTable to the dependency array

  const handleCountChange = (itemName, delta) => {
    const newItems = updatedItems.map(item =>
      item.name === itemName
        ? { ...item, count: Math.max(0, item.count + delta) }
        : item
    );
    dispatch(setUpdatedItems(newItems));
  };

  const handleAddToCart = () => {
    if (orderedFood.length > 0) {
      navigate('/addToCart');
    }
  };

  const handleNext = () => {
    setCarouselIndex(prevIndex => {
      const newIndex = Math.min(prevIndex + 1, categoryImages.length - 1);
      categoryRowRef.current.style.transform = `translateX(-${newIndex * 210}px)`;
      return newIndex;
    });
  };

  const handlePrevious = () => {
    setCarouselIndex(prevIndex => {
      const newIndex = Math.max(prevIndex - 1, 0);
      categoryRowRef.current.style.transform = `translateX(-${newIndex * 210}px)`;
      return newIndex;
    });
  };

  const handleTableSelect = (tableNumber) => {
    // Ensure that tableNumber is a valid number
    const tableNum = Number(tableNumber);

    // Check if the conversion to a number was successful
    if (!isNaN(tableNum)) {
      dispatch(setSelectedTable(tableNum)); // Dispatch the action to set the selected table
      localStorage.setItem("currentTableNumber", tableNum); // Store the table number in localStorage
      setIsTableSelected(true); // Ensure this function is defined in your component
    } else {
      console.error("Invalid table number:", tableNumber); // Error handling for invalid input
    }
  };

  const filteredFoodItems = selectedCategory
    ? foodItemImages.filter(item => item.categoryName === selectedCategory)
    : foodItemImages;

  return (
    <>
      <MenuNavbar />
      {showTablePopup && <TableSelectionPopup onClose={() => setShowTablePopup(false)} onTableSelect={handleTableSelect} />}
      
      {loading ? (
        <Loader />
      ) : (
        <>
          {/* Banner Section */}
          <div className="carousel-container">
            {imageUrls.length > 0 ? (
              <Carousel interval={3000} controls={false} indicators={false} pause={false}>
                {imageUrls.map((image, index) => (
                  <Carousel.Item key={index}>
                    <img
                      src={image}
                      className="d-block w-100 food-image"
                      alt={`Food ${index + 1}`}
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
            ) : (
              <p>No banner images available</p>
            )}
          </div>
        
          

          {/* Categories Display Section */}
          <div className="category-container">
            <div className="category-carousel">
              <button className="carousel-button left" onClick={handlePrevious}>
                &lt;
              </button>
              <div className="category-row" ref={categoryRowRef}>
                {categoryImages.map((category) => (
                  <div 
                    key={category.categoryId} 
                    className="category-item"
                    onClick={() => setSelectedCategory(category.categoryName)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={category.categoryUrl}
                      alt={category.categoryName}
                      className="category-image"
                    />
                    <div className="category-name">{category.categoryName}</div>
                  </div>
                ))}
              </div>
              <button className="carousel-button right" onClick={handleNext}>
                &gt;
              </button>
            </div>
          </div>

          <br />
          <hr />
          <br />

          {/* Food items Section */}
          {isTableSelected ? (
            <div className="food-items-container">
              <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                {filteredFoodItems.map((item, index) => (
                  <Col key={index} className="d-flex align-items-stretch">
                    <Card 
                      className={`food-item-card ${item.availability !== 'available' ? 'blur' : ''}`}
                    >
                      <Card.Img 
                        variant="top" 
                        src={item.typeImageUrl} 
                        className="food-item-image" 
                        style={{ width: '200px', height: '200px', objectFit: 'cover' }} 
                      />
                      <Card.Body>
                        <Card.Title>{item.typeName}</Card.Title>
                        <Card.Text>Price: {item.typePrice}</Card.Text>
                        <div style={styles.container}>
                          {item.availability === 'available' && updatedItems.find(i => i.name === item.typeName)?.count > 0 ? (
                            <div style={styles.counter}>
                              <button 
                                style={styles.button} 
                                onClick={() => handleCountChange(item.typeName, -1)}
                              >
                                -
                              </button>
                              <span style={styles.count}>
                                {updatedItems.find(i => i.name === item.typeName)?.count}
                              </span>
                              <button 
                                style={styles.button} 
                                onClick={() => handleCountChange(item.typeName, 1)}
                              >
                                +
                              </button>
                            </div>
                          ) : item.availability === 'available' ? (
                            <button 
                              style={styles.addButton} 
                              onClick={() => handleCountChange(item.typeName, 1)}
                            >
                              Add
                            </button>
                          ) : (
                            <button 
                              style={styles.addButton} 
                              disabled
                            >
                              Unavailable
                            </button>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ) : (
            <p>Please select a table to view the menu.</p>
          )}

          {/* Bottom Navbar */}
          {showBottomNavbar && (
            <div style={bottomNavbarStyles.container}>
              <div style={bottomNavbarStyles.left}>
                <span>{orderedFood.length} Items added</span>
              </div>
              <div style={bottomNavbarStyles.right}>
                <button 
                  style={bottomNavbarStyles.button} 
                  onClick={handleAddToCart}
                  disabled={!orderedFood.length}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          )}

          {/* Sticky Dropdown Button */}
          {isTableSelected && (
            <div style={dropdownStyles.container}>
              <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic" className='btn btn-primary'>
                  Menu 🥗
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {categoryImages.map(category => (
                    <Dropdown.Item 
                      key={category.categoryId}
                      onClick={() => setSelectedCategory(category.categoryName)}
                    >
                      {category.categoryName}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          )}
        </>
      )}
    </>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
  },
  counter: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ddd',
    borderRadius: '5px',
  },
  button: {
    backgroundColor: '#ff6f61',
    border: 'none',
    color: 'white',
    padding: '5px 10px',
    cursor: 'pointer',
    borderRadius: '5px',
  },
  count: {
    margin: '0 10px',
    fontSize: '16px',
  },
  addButton: {
    backgroundColor: '#ff6f61',
    border: 'none',
    color: 'white',
    padding: '5px 15px',
    cursor: 'pointer',
    borderRadius: '5px',
  }
};

const menuStyles = {
  button: {
    backgroundColor: '#ff6f61',
    color: 'white',
    border: 'none',
  },
};

const bottomNavbarStyles = {
  container: {
    position: 'fixed',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTop: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    boxShadow: '0 -2px 5px rgba(0,0,0,0.1)',
    zIndex: 1000,
  },
  left: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#ff6f61',
    border: 'none',
    color: 'white',
    padding: '10px 20px',
    cursor: 'pointer',
    borderRadius: '5px',
  }
};

const dropdownStyles = {
  container: {
    position: 'fixed',
    bottom: '10%',
    right: '10%',
    zIndex: 1100,
  },
};

export default Menu;
