import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import Login from "./pages/Login"; // assicurati che il path sia corretto
import MenuPage from "./pages/MenuPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/Login.jsx" element={<Login />} />
                <Route path="/MenuPage.jsx" element={<MenuPage />} />
            </Routes>
        </Router>
    );
}

export default App;
