import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Documentation from "@/pages/Documentation";
import API from "@/pages/API";
import LendingSimulator from "@/pages/LendingSimulator";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/lending-simulator" element={<LendingSimulator />} />
      <Route path="/about" element={<About />} />
      <Route path="/documentation" element={<Documentation />} />
      <Route path="/api" element={<API />} />
    </Routes>
  );
}
