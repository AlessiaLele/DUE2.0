import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import WelcomePage from "./pages/WelcomePage";
import Login from "./pages/Login";
import MenuPage from "./pages/MenuPage";
import GameMode from "./pages/GameMode";
import Singleplayer from "./pages/Singleplayer";
import Instructions from "./pages/Instructions";
import Lobby from "./pages/Lobby";
import CookieConsent from "./pages/CookieConsent";


import Room from "./pages/Room";

function App() {


    return (
        <Router>
           <CookieConsent/>

            <Routes>

                <Route path="/" element={<WelcomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/menu-page" element={<MenuPage />} />
                <Route path="/game-mode" element={<GameMode />} />
                <Route path="/singleplayer" element={<Singleplayer />} />
                <Route path="/instructions" element={<Instructions />} />
                <Route path="/lobby" element={<Lobby />} />
                <Route path="/room/:roomId" element={<Room />} />

            </Routes>
        </Router>
    );
}

export default App;
