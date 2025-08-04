import { useNavigate } from 'react-router-dom';
import '../assets/style4.css';
import React, { useEffect, useState } from 'react';
import { creaMazzo, pescaCarta } from '../utils/deck.js';

function Singleplayer() {
    const navigate = useNavigate();
    const [mazzo, setMazzo] = useState([]);
    const [scarti, setScarti] = useState([]);
    const [giocatore, setGiocatore] = useState([]);
    const [bot, setBot] = useState([]);
    const [turnoGiocatore, setTurnoGiocatore] = useState(true);
    const [showDuePopup, setShowDuePopup] = useState(false);
    const [fineGioco, setFineGioco] = useState(false);
    const [vincitore, setVincitore] = useState(null);
    const [mostraPopupFinale, setMostraPopupFinale] = useState(false);
    const [mostraPopupConferma, setMostraPopupConferma] = useState(false);
    const [saltaTurno, setSaltaTurno] = useState(false);
    const [ordineInverso, setOrdineInverso] = useState(false); // in futuro utile per multiplayer




    // inizializzazione gioco
    useEffect(() => {
        const nuovoMazzo = creaMazzo();
        const manoGiocatore = Array.from({ length: 7 }, () => pescaCarta(nuovoMazzo));
        const manoBot = Array.from({ length: 7 }, () => pescaCarta(nuovoMazzo));
        const cartaIniziale = pescaCarta(nuovoMazzo);

        setGiocatore(manoGiocatore);
        setBot(manoBot);
        setScarti([cartaIniziale]);
        setMazzo(nuovoMazzo);
        setFineGioco(false);
        setVincitore(null);
    }, []);

    const handleDueClick = () => {
        setShowDuePopup(true);
        setTimeout(() => setShowDuePopup(false), 2000);
    };

    const pescaDalMazzo = () => {
        if (!turnoGiocatore || mazzo.length === 0 || fineGioco) return;

        const carta = pescaCarta(mazzo);
        if (carta) {
            setGiocatore([...giocatore, carta]);
            setMazzo([...mazzo]);
        }

        setTurnoGiocatore(false);
        setTimeout(turnoBot, 1000);
    };





    const giocaCarta = (carta, index) => {
        if (fineGioco) return;

        const topScarto = scarti[scarti.length - 1];

        const puòEssereGiocata = (
            carta.colore === topScarto.colore ||
            carta.numero === topScarto.numero ||
            carta.colore === 'nero'
        );

        if (puòEssereGiocata) {
            const nuovaMano = [...giocatore];
            nuovaMano.splice(index, 1);
            setGiocatore(nuovaMano);
            setScarti([...scarti, carta]);

            // Esegui effetto speciale
            switch (carta.numero) {
                case '+2':
                    setTimeout(() => {
                        const nuove = [pescaCarta(mazzo), pescaCarta(mazzo)];
                        setBot([...bot, ...nuove]);
                        setMazzo([...mazzo]);
                    }, 500);
                    break;
                case '+4':
                    setTimeout(() => {
                        const nuove = [pescaCarta(mazzo), pescaCarta(mazzo), pescaCarta(mazzo), pescaCarta(mazzo)];
                        setBot([...bot, ...nuove]);
                        setMazzo([...mazzo]);
                    }, 500);
                    break;
                case '↺':
                    setOrdineInverso(prev => !prev); // utile in futuro
                    break;
                case '⛔':
                    setSaltaTurno(true);
                    break;
            }

            if (nuovaMano.length === 0) {
                setVincitore("Giocatore");
                setFineGioco(true);
                setMostraPopupFinale(true);
                setTimeout(() => {
                    setMostraPopupFinale(false);
                    setMostraPopupConferma(true);
                }, 3000);
                return;
            }

            if (carta.numero !== '+2' && carta.numero !== '+4') {
                setTurnoGiocatore(false);
                setTimeout(turnoBot, 1000);
            } else {
                setTurnoGiocatore(false);
                setTimeout(turnoBot, 1500);
            }
        }
    };





    const turnoBot = () => {
        if (fineGioco) return;

        const top = scarti[scarti.length - 1];
        let nuovaMano = [...bot];
        let cartaGiocata = null;

        for (let i = 0; i < nuovaMano.length; i++) {
            if (
                nuovaMano[i].colore === top.colore ||
                nuovaMano[i].numero === top.numero
            ) {
                cartaGiocata = nuovaMano.splice(i, 1)[0];
                break;
            }
        }

        if (cartaGiocata) {
            setScarti([...scarti, cartaGiocata]);
            setBot(nuovaMano);

            if (nuovaMano.length === 0) {
                setVincitore("Bot");
                setFineGioco(true);
                setMostraPopupFinale(true);
                setTimeout(() => {
                    setMostraPopupFinale(false);
                    setMostraPopupConferma(true);
                }, 3000);
                return;
            }

        } else {
            const pescata = pescaCarta(mazzo);
            if (pescata) nuovaMano.push(pescata);
            setBot(nuovaMano);
            setMazzo([...mazzo]);
        }

        setTurnoGiocatore(true);
    };





    const apriPopup = () => {
        document.getElementById('confirm-popup').style.display = 'block';
        document.getElementById('overlay').style.display = 'block';
    };

    const chiudiPopup = () => {
        document.getElementById('confirm-popup').style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
    };

    const confermaUscita = () => {
        navigate('/menu-page');
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
                <div className="bot-hand">
                    {bot.map((_, i) => (
                        <img key={i} src="/assets/cards/cartaCoperta.png" alt="bot-card" className="card-img" />
                    ))}
                </div>

                <div className="table-area">
                    <div className="center-pile">
                        <h2>Scarti</h2>
                        <img
                            src={scarti.length ? scarti[scarti.length - 1].img : ''}
                            alt="carta scarto"
                            className="card-img"
                        />
                    </div>

                    <div id="draw-pile">
                        <button onClick={pescaDalMazzo} disabled={!turnoGiocatore || fineGioco}>
                            <img src="/assets/cards/cartaCoperta.png" alt="mazzo" className="card-img" />
                        </button>
                    </div>
                </div>

                <div className="player-hand">
                    <h2>Le tue carte</h2>
                    <div className="hand-cards">
                        {giocatore.map((carta, i) => (
                            <img
                                key={carta.id}
                                src={carta.img}
                                alt={`${carta.numero} ${carta.colore}`}
                                onClick={() => turnoGiocatore && giocaCarta(carta, i)}
                                className="card-img"
                            />
                        ))}
                    </div>
                </div>

                <button id="action-button" onClick={handleDueClick} disabled={!turnoGiocatore || fineGioco}>
                    DUE!
                </button>

                {showDuePopup && (
                    <div className="due-popup">
                        <h1>DUE!!!</h1>
                    </div>
                )}

                {fineGioco && (
                    <div className="endgame-popup">
                        <h1>{vincitore === "Giocatore" ? "Hai vinto!" : "Il bot ha vinto!"}</h1>

                        <button onClick={() => navigate('/menu-page')}>Torna  al menu</button>
                    </div>
                )}

                {mostraPopupConferma && (
                    <div className="confirm-exit-popup">
                        <h2>Vuoi tornare al menu?</h2>
                        <div className="popup-buttons">
                            <button onClick={() => navigate('/menu-page')}>Sì</button>
                            <button onClick={() => setMostraPopupConferma(false)}>No</button>
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
}

export default Singleplayer;
