import { useSelector } from 'react-redux';
import './App.css';
import RenderModal from './modals/RenderModal/RenderModal';
import AppRoutes from './routes/AppRoutes';
import { ToastContainerCustom } from "./components/CustomToast/CustomToast"; //
function App() {
  const isModalOpen = useSelector((state) => state.modal.isOpen);
  return (
    
    <div className="App">
      <AppRoutes />
      {isModalOpen && <RenderModal />}
 <ToastContainerCustom /> {/* 👈 must be here */}
    </div>
  );
}

export default App;
