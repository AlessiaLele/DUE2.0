import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import Login from "./pages/Login"; // assicurati che il path sia corretto
import MenuPage from "./pages/MenuPage";
import GameMode from "./pages/GameMode";
import Singleplayer from "./pages/Singleplayer.jsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/Login.jsx" element={<Login />} />
                <Route path="/MenuPage.jsx" element={<MenuPage />} />
                <Route path="/GameMode.jsx" element={<GameMode />} />
                <Route path="/Singleplayer.jsx" element={<Singleplayer />} />
            </Routes>
        </Router>
    );
}

export default App;
