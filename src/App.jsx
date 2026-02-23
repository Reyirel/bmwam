import { Routes, Route, Link } from 'react-router-dom';
import Home from './views/Home';
import Formulario from './views/Formulario';
import AdminPanel from './views/AdminPanel';
import './App.css';

function App() {
  return (
    <div>
      <nav style={{ marginBottom: 20 }}>
        <Link to="/" style={{ marginRight: 10 }}>Home</Link>
        <Link to="/formulario" style={{ marginRight: 10 }}>Formulario</Link>
        <Link to="/admin">Admin Panel</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/formulario" element={<Formulario />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </div>
  );
}

export default App;
