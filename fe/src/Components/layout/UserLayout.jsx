import React from 'react';
import Header from '../pages/Header';
import Footer from '../pages/Footer';
import { Outlet } from 'react-router-dom';

const UserLayout = () => {
  return (
    <>
      <Header />
      <main style={{ minHeight: '80vh' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default UserLayout;
