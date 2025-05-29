import React, { useState } from "react";
import "../assets/style6.css"; // Assicurati che il path sia corretto

function Settings() {
    const [players, setPlayers] = useState(4);
    const [mode, setMode] = useState("classic");
    const [turnTime, setTurnTime] = useState(30);
    const [specialCards, setSpecialCards] = useState(true);

    const saveSettings = () => {
        const settings = {
            players,
            mode,
            turnTime,
            specialCards,
        };

        console.log("Impostazioni salvate:", settings);
        alert("Impostazioni salvate!");
        // Puoi aggiungere localStorage o chiamate a backend qui
    };

    return (
        <div className="settings-body">
            <div className="settings-container">
                <h1>Impostazioni</h1>

                <label htmlFor="players">Numero di giocatori</label>
                <input
                    type="number"
                    id="players"
                    min="2"
                    max="10"
                    value={players}
                    onChange={(e) => setPlayers(Number(e.target.value))}
                />

                <label htmlFor="mode">Modalità di gioco</label>
                <select id="mode" value={mode} onChange={(e) => setMode(e.target.value)}>
                    <option value="classic">Classica</option>
                    <option value="custom">Personalizzata</option>
                </select>

                <label htmlFor="turnTime">Tempo per turno (secondi)</label>
                <input
                    type="number"
                    id="turnTime"
                    min="10"
                    max="120"
                    value={turnTime}
                    onChange={(e) => setTurnTime(Number(e.target.value))}
                />

                <div className="checkbox-label">
                    <input
                        type="checkbox"
                        id="specialCards"
                        checked={specialCards}
                        onChange={(e) => setSpecialCards(e.target.checked)}
                    />
                    <label htmlFor="specialCards">Carte speciali attive</label>
                </div>

                <button onClick={saveSettings}>Salva Impostazioni</button>
            </div>
        </div>
    );
}

export default Settings;
