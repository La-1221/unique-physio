import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import PublicNavbar from './PublicNavbar';
import Footer from './Footer';

const PublicLayout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
