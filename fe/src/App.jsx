import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
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
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failure" element={<PaymentFailure />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={["1"]} />}>
            <Route path="/account" element={<AccountManager />} />
            <Route path="/managermovies" element={<AdminMovies />} />
            <Route path="/languages" element={<LanguagesManager />} />
            <Route path="/genres" element={<GenresManager />} />
            <Route path="/movietypes" element={<MovieTypesManager />} />
            <Route path="/screens" element={<ScreensManager />} />
            <Route path="/tickets" element={<TicketManagement />} />
          </Route>

          {/* User & Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={["1", "2"]} />}>
            <Route path="/booking/:id" element={<Booking />} />
            <Route path="/profile/:id" element={<UserProfile />} />
          </Route>
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
