import React from "react";
import { useNavigate } from "react-router-dom";
import "../assets/style5.css"; // Adatta il percorso se necessario

const GameMode = () => {
    const navigate = useNavigate();

    const playAgainstBot = () => {
        navigate("/Singleplayer.jsx");
    };

    const playMultiplayer = () => {
        navigate("/multiplayer");
    };

    return (
        <div className="mode-body">
            <div className="mode-container">
                <h2>Scegli la modalità di gioco</h2>
                <button className="mode-button bot" onClick={playAgainstBot}>
                    🤖 Gioca contro un bot
                </button>
                <button className="mode-button multiplayer" onClick={playMultiplayer}>
                    👥 Multiplayer
                </button>
            </div>
        </div>
    );
};

export default GameMode;