import { Link } from 'react-router-dom';
import { Home as HomeIcon } from 'lucide-react';
import Logo from '../components/Logo';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
      <Logo size="md" />
      <p className="font-display font-extrabold text-7xl text-teal mt-10">404</p>
      <p className="text-dim mt-3 mb-8">This page doesn't exist or has moved.</p>
      <Link to="/" className="btn-primary">
        <HomeIcon size={18} /> Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
