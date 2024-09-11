// src/Routes/appRoutes.js
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Login from '../Admin/Components/AdminLogin/Login';
import Register from '../Admin/Components/AdminRegister/Register';
import Stocks from '../Admin/Components/Stocks/Stocks';
import Uploads from '../Admin/Components/ImgUploads/Uploads';
import TableOrderList from '../Admin/Components/TableOrdetList/TableOrderList';
import Profile from '../Admin/Components/AdminProfile/Profile';
import RecentBills from '../Admin/Components/Recent/RecentBills';
import AdminOrder from '../Admin/Components/AdminOrder/AdminOrder';
import KitchenPage from '../Kitchen/Components/KitchenPage/kitchen';
import KitchenStocks from '../Kitchen/Components/KitchenStocks/kitchenStocks';
import NavBar from '../Admin/Components/AdminPageNavbar/NavBar';

const Layout = ({ children }) => {
  const location = useLocation();  
  // List of paths where the NavBar should be shown
  const showNavBar = [
    '/stocks',
    '/uploads',
    '/adminOrder',
    '/recent',
    '/profile',
    '/tableorder',
  ].includes(location.pathname);

  return (
    <div>
      {showNavBar && <NavBar />}
      <main>{children}</main>
    </div>
  );
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/Register" element={<Register />} />
    <Route path="/stocks" element={<Layout><Stocks /></Layout>} />
    <Route path="/uploads" element={<Layout><Uploads /></Layout>} />
    <Route path="/tableorder" element={<Layout><TableOrderList /></Layout>} />
    <Route path="/profile" element={<Layout><Profile /></Layout>} />
    <Route path="/recent" element={<Layout><RecentBills /></Layout>} />
    <Route path="/adminOrder" element={<Layout><AdminOrder /></Layout>} />
    <Route path="/kitchenPage" element={<KitchenPage />} />
    <Route path="/kitchenStocks" element={<KitchenStocks />} />
  </Routes>
);

export default AppRoutes;
