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
import Qrcode from "../Customer/Components/QrCode/qrCode";
import Menu from "../Customer/Components/CustomerMenu/menu";
import AddToCart from "../Customer/Components/AddToCart/addToCart";
import OfflinePayment from "../Customer/Components/CustomerPayment/offlinePayment";
import OrderStatus from "../Customer/Components/CustomerOrderStatus/orderStatus";
import PhoneNumberLogin from "../Customer/Components/PhoneNumberLogin/phoneNumberLogin";
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

      <Route path="/qrCode" element={<Qrcode />} />
      <Route path="/customerPage" element={<Menu />} />
      <Route path="/addToCart" element={<AddToCart />} />
      <Route path="/payment" element={<OfflinePayment />} />
      <Route path="/orderStatus" element={<OrderStatus />} />
      <Route path="/login" element={<PhoneNumberLogin />} />

      <Route path="/kitchenPage" element={<KitchenPage/>}/>
         <Route path="/kitchenStocks" element={<KitchenStocks/>}/> 
    </Routes>
  </Router>
);

export default AppRoutes;
