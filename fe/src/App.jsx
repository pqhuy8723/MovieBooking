import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./Components/pages/Header";
import Footer from "./Components/pages/Footer";
import CinemaInfo from "./Components/pages/CinemaInfo";
import TicketPricing from "./Components/pages/TicketPricing";
import LoginRegister from "./Components/pages/LoginRegister.jsx";
import AdminMovies from "./Components/AdminPage/AdminMovies.jsx";
import MoviePage from "./Components/pages/MoviePage.jsx";
import LanguagesManager from "./Components/AdminPage/LanguagesManager.jsx";
import GenresManager from "./Components/AdminPage/GenresManager.jsx";
import MovieTypesManager from "./Components/AdminPage/MovieTypesManager.jsx";
import ScreensManager from "./Components/AdminPage/ScreensManager.jsx";
import Page404 from "./Components/pages/Page404.jsx";
import HomePage from "./Components/pages/HomePage.jsx";
import MovieDetail from "./Components/pages/MovieDetail.jsx";
import AccountManager from "./Components/AdminPage/AccountManager.jsx";
import ShowTime from "./Components/pages/ShowtimePage.jsx";
import Booking from "./Components/pages/Booking.jsx";
import UserProfile from "./Components/pages/UserProfile.jsx";
import TicketManagement from "./Components/AdminPage/TicketManagement.jsx";
import PaymentSuccess from "./Components/pages/PaymentSuccess.jsx";
import PaymentFailure from "./Components/pages/PaymentFailure.jsx";

function App() {
  const account = JSON.parse(localStorage.getItem("rememberedAccount")) || JSON.parse(sessionStorage.getItem("account"));
  const userRole = account ? account.role : null;
  const ProtectedRoute = ({ element, allowedRoles }) => {
    if (!userRole || !allowedRoles.includes(userRole)) {
      return <Navigate to="/login" />;
    }
    return element;
  };

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<LoginRegister />} />
        <Route path="*" element={<Page404 />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/info" element={<CinemaInfo />} />
        <Route path="/price" element={<TicketPricing />} />
        <Route path="/showtime" element={<ShowTime />} />
        <Route path="/movie" element={<MoviePage />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute element={<AccountManager />} allowedRoles={["1"]} />
          }
        />
        <Route
          path="/managermovies"
          element={
            <ProtectedRoute element={<AdminMovies />} allowedRoles={["1"]} />
          }
        />
        <Route
          path="/languages"
          element={
            <ProtectedRoute element={<LanguagesManager />} allowedRoles={["1"]} />
          }
        />
        <Route
          path="/genres"
          element={
            <ProtectedRoute element={<GenresManager />} allowedRoles={["1"]} />
          }
        />
        <Route
          path="/movietypes"
          element={
            <ProtectedRoute
              element={<MovieTypesManager />}
              allowedRoles={["1"]}
            />
          }
        />
        <Route
          path="/screens"
          element={
            <ProtectedRoute element={<ScreensManager />} allowedRoles={["1"]} />
          }
        />
        <Route
          path="/booking/:id"
          element={
            <ProtectedRoute element={<Booking />} allowedRoles={["1", "2"]} />
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute element={<UserProfile />} allowedRoles={["1", "2"]} />
          }
        />
        <Route path="/tickets" element={
          <ProtectedRoute element={<TicketManagement />} allowedRoles={["1"]} />
        }
        />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failure" element={<PaymentFailure />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
