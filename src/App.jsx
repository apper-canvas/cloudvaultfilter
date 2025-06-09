import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Layout from './components/Layout';
import HomePage from './components/pages/HomePage';
import Recent from './pages/Recent';
import Shared from './pages/Shared';
import Trash from './pages/Trash';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <div className="h-screen flex flex-col overflow-hidden bg-background">
        <Routes>
          <Route path="/" element={<Layout />}>
<Route index element={<HomePage />} />
            <Route path="files/*" element={<HomePage />} />
            <Route path="recent" element={<Recent />} />
            <Route path="shared" element={<Shared />} />
            <Route path="trash" element={<Trash />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          className="z-[9999]"
          toastClassName="!bg-white !text-gray-900 !border !border-gray-200 !rounded-lg !shadow-card"
          progressClassName="!bg-primary"
        />
      </div>
    </BrowserRouter>
  );
}

export default App;