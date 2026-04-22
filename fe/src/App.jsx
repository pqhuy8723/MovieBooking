import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserLayout from "./Components/layout/UserLayout";
import AdminLayout from "./Components/layout/AdminLayout";
import CinemaInfo from "./Components/pages/CinemaInfo";
import TicketPricing from "./Components/pages/TicketPricing";
import LoginRegister from "./Components/pages/LoginRegister.jsx";
import AdminMovies from "./Components/AdminPage/AdminMovies.jsx";
import MoviePage from "./Components/pages/MoviePage.jsx";
import LanguagesManager from "./Components/AdminPage/LanguagesManager.jsx";
import GenresManager from "./Components/AdminPage/GenresManager.jsx";
import ActorsManager from "./Components/AdminPage/ActorsManager.jsx";
import DirectorsManager from "./Components/AdminPage/DirectorsManager.jsx";
import MovieTypesManager from "./Components/AdminPage/MovieTypesManager.jsx";
import CinemasManager from "./Components/AdminPage/CinemasManager.jsx";
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
        <Routes>
          {/* User Routes */}
          <Route element={<UserLayout />}>
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

            {/* User Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "USER"]} />}>
              <Route path="/booking/:id" element={<Booking />} />
              <Route path="/profile/:id" element={<UserProfile />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/account" element={<AccountManager />} />
              <Route path="/managermovies" element={<AdminMovies />} />
              <Route path="/languages" element={<LanguagesManager />} />
              <Route path="/genres" element={<GenresManager />} />
              <Route path="/actors" element={<ActorsManager />} />
              <Route path="/directors" element={<DirectorsManager />} />
              <Route path="/movietypes" element={<MovieTypesManager />} />
              <Route path="/cinemas" element={<CinemasManager />} />
              <Route path="/screens" element={<ScreensManager />} />
              <Route path="/tickets" element={<TicketManagement />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
