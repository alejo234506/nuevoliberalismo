import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import FormVotante from "./pages/FormVotante.jsx";
import FormVoluntario from "./pages/FormVoluntario.jsx";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <header className="nav">
        <div className="brand">Inscripciones</div>
      </header>

      <main className="container">
        <Routes>
          {/* raíz -> /registrados */}
          <Route path="/" element={<Navigate to="/registrados" replace />} />
          {/* listado */}
          <Route path="/registrados" element={<Home />} />
          {/* formularios */}
          <Route path="/registro/votante" element={<FormVotante />} />
          <Route path="/registro/nuevoliberalismo" element={<FormVoluntario />} />
          {/* fallback */}
          <Route path="*" element={<Navigate to="/registrados" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
