import React, { useEffect, useState, useRef } from 'react'; 
import { useSelector, useDispatch } from 'react-redux'; 
import { useNavigate } from 'react-router-dom'; 
import { Carousel, Card, Row, Col } from 'react-bootstrap'; 
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
    orderedFood 
  } = useSelector(state => state.menu); 
 
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const [isTableSelected, setIsTableSelected] = useState(!!selectedTable); 
  const [showTablePopup, setShowTablePopup] = useState(!selectedTable); 
  const categoryRowRef = useRef(null); 
 
  // Effect to show table selection popup if no table is selected 
  useEffect(() => { 
    if (!isTableSelected) { 
      setShowTablePopup(true); 
    } 
  }, [isTableSelected]); 
 
  // Effect to fetch data when component mounts or selectedTable changes 
  useEffect(() => { 
    const fetchData = async () => { 
      try { 
        const bannerResponse = await axios.get('http://localhost:3500/banner/banners'); 
        const bannerUrls = bannerResponse.data.map(file => `http://localhost:3500/banner/image/${file.fileId}`); 
        dispatch(setImageUrls(bannerUrls)); 
         
        const categoryResponse = await axios.get('http://localhost:3500/categories/category'); 
        const categories = categoryResponse.data.map(item => ({ 
          categoryId: item.categoryId, 
          categoryName: item.categoryName, 
          categoryUrl: `http://localhost:3500/categories/image/${item.fileId}` 
        })); 
        dispatch(setCategoryImages(categories)); 
         
        const foodItemsResponse = await axios.get('http://localhost:3500/menu/stocks'); 
        const foodItems = foodItemsResponse.data.map(item => ({ 
          typeName: item.name, 
          typeImageUrl: `http://localhost:3500/files/image/${item.imageId}`, 
          typePrice: item.price, 
          categoryName: item.categoryName, 
          typeId: item._id, 
          type: item.type, 
          availability: item.availability 
        }));


dispatch(setFoodItemImages(foodItems)); 
         
        const itemsWithCounts = foodItems.map(item => ({ 
          name: item.typeName, 
          count: 0, 
          type: item.type, 
          price: item.typePrice, 
          categoryName: item.categoryName, 
          typeId: item.typeId, 
          availability: item.availability, 
          tableNumber: selectedTable || null 
        })); 
        dispatch(setUpdatedItems(itemsWithCounts)); 
         
      } catch (error) { 
        console.error("Error fetching data: ", error); 
      } finally { 
        dispatch(setLoading(false)); 
      } 
    }; 
 
    fetchData(); 
  }, [selectedTable, dispatch]); 
 
  const handleCountChange = (itemName, delta) => { 
    const updated = updatedItems.map(item => 
      item.name === itemName 
        ? { ...item, count: Math.max(0, item.count + delta) } 
        : item 
    ); 
    dispatch(setUpdatedItems(updated)); 
  }; 
 
  const handleAddToCart = () => { 
    if (orderedFood.length > 0) { 
      navigate('/addToCart'); 
    } 
  }; 
 
  const handleNext = () => { 
    const newIndex = Math.min((categoryRowRef.current.scrollLeft / 210) + 1, categoryImages.length - 1); 
    categoryRowRef.current.scrollTo({ left: newIndex * 210, behavior: 'smooth' }); 
  }; 
 
  const handlePrevious = () => { 
    const newIndex = Math.max((categoryRowRef.current.scrollLeft / 210) - 1, 0); 
    categoryRowRef.current.scrollTo({ left: newIndex * 210, behavior: 'smooth' }); 
  }; 
 
  const handleTableSelect = (tableNumber) => { 
    const tableNum = Number(tableNumber); 
    if (!isNaN(tableNum)) { 
      dispatch(setSelectedTable(tableNum)); 
      localStorage.setItem("currentTableNumber", tableNum); 
      setIsTableSelected(true); 
      setShowTablePopup(false); 
    } else { 
      console.error("Invalid table number:", tableNumber); 
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
                        style={{ width: '200px', height: '200px' }}  
                      /> 
                      <Card.Body> 
                        <Card.Title>{item.typeName}</Card.Title> 
                        <Card.Text> 
                          Price: ${item.typePrice} 
                        </Card.Text> 
                        {item.availability === 'available' && ( 
                          <div className="food-item-actions"> 
                            <button onClick={() => handleCountChange(item.typeName, 1)}>Add</button> 
                            <button onClick={() => handleCountChange(item.typeName, -1)}>Remove</button> 
                          </div> 
                        )} 
                      </Card.Body> 
                    </Card> 
                  </Col> 
                ))} 
              </Row> 
              <button className="add-to-cart-button" onClick={handleAddToCart}> 
                Add to Cart 
              </button> 
            </div> 
          ) : ( 
            <p>Please select a table to view the menu.</p> 
          )} 
        </> 
      )} 
    </> 
  ); 
}; 
 
export default Menu;
