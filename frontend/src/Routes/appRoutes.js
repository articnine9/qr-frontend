import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "../Admin/Components/AdminLogin/Login";
import Register from "../Admin/Components/AdminRegister/Register";
import Stocks from "../Admin/Components/Stocks/Stocks";
import Uploads from "../Admin/Components/ImgUploads/Uploads";
import TableOrderList from "../Admin/Components/TableOrdetList/TableOrderList";
import Profile from "../Admin/Components/AdminProfile/Profile";
import RecentBills from "../Admin/Components/Recent/RecentBills";
import AdminOrder from "../Admin/Components/AdminOrder/AdminOrder";

import KitchenPage from '../Kitchen/Components/KitchenPage/kitchen';
import KitchenStocks from '../Kitchen/Components/KitchenStocks/kitchenStocks';

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/Stocks" element={<Stocks />} />
      <Route path="/uploads" element={<Uploads />} />
      <Route path="/tableorder" element={<TableOrderList />} />
      <Route path="/Profile" element={<Profile />} />
      <Route path="/recent" element={<RecentBills />} />
      <Route path="/adminOrder" element={<AdminOrder />} />



      <Route path="/kitchenPage" element={<KitchenPage/>}/>
         <Route path="/kitchenStocks" element={<KitchenStocks/>}/> 
    </Routes>
  </Router>
);

export default AppRoutes;
