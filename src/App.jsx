import { Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Draft from "./pages/Draft";
import Edit from "./pages/Edit";
import Entities from "./pages/Entities";
import "./App.css";

function App() {
  return (
    <div className="flex h-screen bg-white">
      <Navigation />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/draft" element={<Draft />} />
          <Route path="/edit" element={<Edit />} />
          <Route path="/entities" element={<Entities />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
