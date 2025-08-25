import React from "react";
import { useNavigate } from "react-router-dom";
import "../assets/style3.css";

const MenuPage = () => {
    const navigate = useNavigate();

    const startGame = () => {
        navigate("/game-mode");
    };



    const showInstructions = () => {
        navigate("/Instructions");
    };

    const exitGame = () => {
        alert("Grazie per aver giocato a DUE!");
        navigate("/"); // oppure login/home
    };

    return (

        <div className="menu-container">
            <h1>Nome gioco</h1>
            <button className="menu-button" onClick={startGame}>▶️ Gioca</button>

            <button className="menu-button secondary" onClick={showInstructions}>❓ Istruzioni</button>
            <button className="menu-button danger" onClick={exitGame}>↩️ Log Out</button>
        </div>

    );
};

export default MenuPage;
