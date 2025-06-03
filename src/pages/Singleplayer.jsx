import { useNavigate } from 'react-router-dom';
import '../assets/style4.css';
import React, { useEffect, useState } from 'react';


function Singleplayer() {
    const navigate = useNavigate();
    const [showDuePopup, setShowDuePopup] = useState(false);

    const handleDueClick = () => {
        setShowDuePopup(true);
        setTimeout(() => {
            setShowDuePopup(false);
        }, 2000); // mostra per 10 secondi
    };

    useEffect(() => {
        const updateButtonState = () => {
            const hand = document.querySelectorAll('#player-hand .card');
            const button = document.getElementById('action-button');
            if (button) {
                button.disabled = hand.length !== 2;
            }
        };

        updateButtonState();


        const observer = new MutationObserver(updateButtonState);
        const playerHand = document.getElementById('player-hand');
        if (playerHand) {
            observer.observe(playerHand, {
                childList: true,
                subtree: false,
            });
        }

        return () => observer.disconnect();
    }, []);

    const apriPopup = () => {
        document.getElementById('confirm-popup').style.display = 'block';
        document.getElementById('overlay').style.display = 'block';
    };

    const chiudiPopup = () => {
        document.getElementById('confirm-popup').style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
    };

    const confermaUscita = () => {
        navigate('/menu-page'); // <-- Percorso SPA corretto
    };


    return (
        <div className="singleplayer">
            <button id="exit-btn" onClick={apriPopup}>Esci</button>


            <div id="overlay" onClick={chiudiPopup}></div>

            <div id="confirm-popup" style={{ display: 'none' }}>
                <div className="popup-content">
                    <h2>Sei sicuro di voler uscire?</h2>
                    <div className="popup-buttons">
                        <button id="confirm-yes" onClick={confermaUscita}>Sì</button>
                        <button id="confirm-no" onClick={chiudiPopup}>No</button>
                    </div>
                </div>
            </div>

            <h1>Modalità Singleplayer</h1>

            <div className="game-container">
                <div className="bot-hand" id="bot-hand">
                    <div className="card-back"></div>

                    <img src="/assets/cards/cartaCoperta.png" alt="card-back" />
                </div>

                <div className="table-area">
                    <button className="table" id="table">
                        <div id="table-card" className="card">
                            <img src="/assets/cards/cartaCoperta.png" alt="cartaCoperta" />
                        </div>
                    </button>

                    <div className="center-pile" id="discard-pile">
                        <img src="/assets/cards/0rosso.png" alt="ROSSO 0" />
                    </div>
                </div>

                <div className="player-hand" id="player-hand">
                    <h2>Le tue carte</h2>
                    <img src="/assets/cards/0rosso.png" alt="0rosso" />
                </div>

                <button id="action-button" onClick={handleDueClick}>2</button>
                {showDuePopup && (
                    <div className="due-popup">
                        <h1>DUE!!!</h1>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Singleplayer;
