import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ApperIcon from '../components/ApperIcon';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-surface to-white">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center p-8 max-w-md"
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { repeat: Infinity, duration: 4 },
            scale: { repeat: Infinity, duration: 3, delay: 1 }
          }}
          className="mb-6"
        >
          <ApperIcon name="CloudOff" className="w-20 h-20 text-gray-300 mx-auto" />
        </motion.div>
        
        <h1 className="text-6xl font-heading font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-xl font-medium text-gray-700 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 gradient-primary text-white rounded-lg font-medium shadow-sm"
          >
            Go to My Files
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="w-full px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go Back
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;