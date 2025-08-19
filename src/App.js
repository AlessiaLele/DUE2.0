import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import WelcomePage from "./pages/WelcomePage";
import Login from "./pages/Login";
import MenuPage from "./pages/MenuPage";
import GameMode from "./pages/GameMode";
import Singleplayer from "./pages/Singleplayer";
import Settings from "./pages/Settings"
import Instructions from "./pages/Instructions";
import Lobby from "./pages/Lobby";
import GameLobby from './pages/GameLobby';
import Room from "./pages/Room";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/menu-page" element={<MenuPage />} />
                <Route path="/game-mode" element={<GameMode />} />
                <Route path="/singleplayer" element={<Singleplayer />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/instructions" element={<Instructions />} />
                <Route path="/lobby" element={<Lobby />} />
                <Route path="/room/:roomId" element={<Room />} />
                <Route path="/game-lobby/:roomId" element={<GameLobby />} />
            </Routes>
        </Router>
    );
}

export default App;
