import { useNavigate } from 'react-router-dom';
import '../assets/style4.css';
import React, { useState, useEffect } from "react";

const GRID_SIZE = 10;
const LETTERS = "ABCDEFGHIJ".split("");

// Configurazione iniziale delle navi
const INITIAL_SHIPS = [
    { size: 5, count: 1 },
    { size: 4, count: 1 },
    { size: 3, count: 2 },
    { size: 2, count: 1 }
];

const BattleshipGame = () => {
    const [playerGrid, setPlayerGrid] = useState(createEmptyGrid());
    const [botGrid, setBotGrid] = useState(createEmptyGrid());
    const [isPlacing, setIsPlacing] = useState(true);
    const [orientation, setOrientation] = useState("horizontal");
    const [draggedShipSize, setDraggedShipSize] = useState(null);
    const [placementTimeLeft, setPlacementTimeLeft] = useState(30);
    const [message, setMessage] = useState("");
    const [playerTurn, setPlayerTurn] = useState(false);
    const [availableShips, setAvailableShips] = useState(INITIAL_SHIPS);
    const navigate = useNavigate();

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

    useEffect(() => {
        if (isPlacing && placementTimeLeft > 0) {
            const timer = setTimeout(
                () => setPlacementTimeLeft((time) => time - 1),
                1000
            );
            return () => clearTimeout(timer);
        } else if (isPlacing && placementTimeLeft <= 0) {
            // Piazzamento automatico delle navi mancanti
            const completedGrid = placeRemainingShips(playerGrid, availableShips);
            setPlayerGrid(completedGrid);

            // Piazza navi del bot e avvia partita
            setBotGrid(placeShipsRandomly());
            setIsPlacing(false);
            setPlayerTurn(true);
            setMessage("Tempo scaduto! Le navi rimanenti sono state piazzate automaticamente. La partita inizia!");
        }
    }, [isPlacing, placementTimeLeft]);

    function createEmptyGrid() {
        return Array(GRID_SIZE)
            .fill(null)
            .map(() =>
                Array(GRID_SIZE).fill({ hasShip: false, hit: false })
            );
    }

    function placeShipsRandomly() {
        const grid = createEmptyGrid();
        for (const ship of INITIAL_SHIPS) {
            for (let n = 0; n < ship.count; n++) {
                let placed = false;
                while (!placed) {
                    const orientation =
                        Math.random() < 0.5 ? "horizontal" : "vertical";
                    const row = Math.floor(Math.random() * GRID_SIZE);
                    const col = Math.floor(Math.random() * GRID_SIZE);

                    if (canPlaceShip(grid, row, col, ship.size, orientation)) {
                        for (let i = 0; i < ship.size; i++) {
                            const r = row + (orientation === "vertical" ? i : 0);
                            const c = col + (orientation === "horizontal" ? i : 0);
                            grid[r][c] = { ...grid[r][c], hasShip: true };
                        }
                        placed = true;
                    }
                }
            }
        }
        return grid;
    }

    function canPlaceShip(grid, row, col, size, orientation) {
        for (let i = 0; i < size; i++) {
            const r = row + (orientation === "vertical" ? i : 0);
            const c = col + (orientation === "horizontal" ? i : 0);
            if (r >= GRID_SIZE || c >= GRID_SIZE || grid[r][c].hasShip) {
                return false;
            }
        }
        return true;
    }

    function placeRemainingShips(grid, ships) {
        // Copia della griglia
        const newGrid = grid.map(row => row.map(cell => ({ ...cell })));

        // Per ogni tipo di nave ancora disponibile
        for (const ship of ships) {
            for (let n = 0; n < ship.count; n++) {
                let placed = false;
                while (!placed) {
                    const orientation = Math.random() < 0.5 ? "horizontal" : "vertical";
                    const row = Math.floor(Math.random() * GRID_SIZE);
                    const col = Math.floor(Math.random() * GRID_SIZE);

                    if (canPlaceShip(newGrid, row, col, ship.size, orientation)) {
                        for (let i = 0; i < ship.size; i++) {
                            const r = row + (orientation === "vertical" ? i : 0);
                            const c = col + (orientation === "horizontal" ? i : 0);
                            newGrid[r][c].hasShip = true;
                        }
                        placed = true;
                    }
                }
            }
        }
        return newGrid;
    }

    // Funzione per controllare se tutte le navi sono colpite
    function checkWin(grid) {
        return grid
            .flat()
            .filter(cell => cell.hasShip)
            .every(cell => cell.hit);
    }

    const handleDropShip = (row, col) => {
        if (!isPlacing || draggedShipSize == null) return;

        const size = draggedShipSize;
        const newGrid = playerGrid.map((r) =>
            r.map((cell) => ({ ...cell }))
        );

        if (canPlaceShip(newGrid, row, col, size, orientation)) {
            for (let i = 0; i < size; i++) {
                const r = row + (orientation === "vertical" ? i : 0);
                const c = col + (orientation === "horizontal" ? i : 0);
                newGrid[r][c].hasShip = true;
            }
            setPlayerGrid(newGrid);
            setDraggedShipSize(null);

            // Aggiorna le navi disponibili
            const updatedShips = availableShips.map(ship =>
                ship.size === size && ship.count > 0
                    ? { ...ship, count: ship.count - 1 }
                    : ship
            );
            setAvailableShips(updatedShips);

            // Controlla se tutte le navi sono state piazzate
            const allPlaced = updatedShips.every(ship => ship.count === 0);
            if (allPlaced) {
                setIsPlacing(false);
                setBotGrid(placeShipsRandomly());
                setPlayerTurn(true);
                setMessage("Hai posizionato tutte le navi. La partita inizia!");
            }
        } else {
            setMessage("Posizione non valida!");
        }
    };

    const handleCellClick = (row, col) => {
        if (!playerTurn || botGrid[row][col].hit) return;

        const newBotGrid = botGrid.map((r) =>
            r.map((cell) => ({ ...cell }))
        );
        newBotGrid[row][col].hit = true;
        setBotGrid(newBotGrid);

        if (checkWin(newBotGrid)) {
            setMessage("🎉 Congratulazioni! Hai vinto!");
            setPlayerTurn(false); // blocca partita
            return;
        }

        setPlayerTurn(false);
        botMove();
    };

    const botMove = () => {
        setTimeout(() => {
            let row, col;
            let validMove = false;
            const newPlayerGrid = playerGrid.map((r) =>
                r.map((cell) => ({ ...cell }))
            );

            while (!validMove) {
                row = Math.floor(Math.random() * GRID_SIZE);
                col = Math.floor(Math.random() * GRID_SIZE);
                if (!newPlayerGrid[row][col].hit) {
                    validMove = true;
                }
            }

            newPlayerGrid[row][col].hit = true;
            setPlayerGrid(newPlayerGrid);

            if (checkWin(newPlayerGrid)) {
                setMessage("💀 Hai perso! Il bot ha affondato tutte le tue navi!");
                setPlayerTurn(false); // blocca partita
                return;
            }

            setPlayerTurn(true);
        }, 500);
    };

    const renderCell = (cell, onClick, showShips, row, col) => {
        let bg = "bg-blue-200";
        if (cell.hit) {
            bg = cell.hasShip ? "bg-red-600" : "bg-gray-500";
        } else if (showShips && cell.hasShip) {
            bg = "bg-gray-400";
        }

        return (
            <div
                className={`w-8 h-8 border border-black flex items-center justify-center ${bg}`}
                onClick={onClick}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    if (showShips && isPlacing) handleDropShip(row, col);
                }}
            />
        );
    };

    const renderGridWithLabels = (grid, onClick, showShips) => {
        return (
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(11, 2rem)",
                    gridTemplateRows: "repeat(11, 2rem)",
                }}
            >
                <div />
                {LETTERS.map((letter) => (
                    <div
                        key={`col-${letter}`}
                        className="flex items-center justify-center font-bold"
                    >
                        {letter}
                    </div>
                ))}

                {grid.map((row, rowIndex) => (
                    <React.Fragment key={`row-${rowIndex}`}>
                        <div className="flex items-center justify-center font-bold">
                            {rowIndex + 1}
                        </div>
                        {row.map((cell, colIndex) => (
                            <div key={`cell-${rowIndex}-${colIndex}`}>
                                {renderCell(
                                    cell,
                                    () => onClick(rowIndex, colIndex),
                                    showShips,
                                    rowIndex,
                                    colIndex
                                )}
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <div className="p-4">
            <button id="exit-btn" onClick={apriPopup} className="mb-4 px-3 py-1 bg-red-600 text-white rounded">Esci</button>
            <div id="overlay" onClick={chiudiPopup} style={{ display: "none" }}></div>
            <div id="confirm-popup" style={{ display: "none" }}>
                <p>Sei sicuro di voler uscire dalla partita?</p>
                <button onClick={confermaUscita} className="mr-2 px-3 py-1 bg-green-600 text-white rounded">Sì</button>
                <button onClick={chiudiPopup} className="px-3 py-1 bg-gray-400 rounded">No</button>
            </div>

            <h1 className="text-xl font-bold mb-4">Battaglia Navale vs Bot</h1>

            {/* Posizionamento sopra le griglie */}
            {isPlacing && (
                <div className="mb-4">
                    <p className="mb-2">⏳ Tempo per il posizionamento: {placementTimeLeft} secondi</p>
                    <button
                        onClick={() =>
                            setOrientation((prev) =>
                                prev === "horizontal" ? "vertical" : "horizontal"
                            )
                        }
                        className="px-4 py-2 bg-blue-500 text-white rounded mb-2"
                    >
                        Orientamento: {orientation === "horizontal" ? "Orizzontale" : "Verticale"}
                    </button>

                    <div className="flex gap-2 flex-wrap">
                        {availableShips.flatMap(ship =>
                            Array.from({ length: ship.count }).map((_, i) => ({
                                size: ship.size,
                                id: `${ship.size}-${i}-${Math.random()}`
                            }))
                        ).map((shipObj) => (
                            <div
                                key={shipObj.id}
                                draggable
                                onDragStart={() => setDraggedShipSize(shipObj.size)}
                                className="bg-gray-400 text-white flex items-center justify-center rounded cursor-move"
                                style={{
                                    width: orientation === "horizontal" ? `${shipObj.size * 2}rem` : "2rem",
                                    height: orientation === "vertical" ? `${shipObj.size * 2}rem` : "2rem",
                                }}
                            >
                                {shipObj.size}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Griglie affiancate */}
            <div className="flex gap-8">
                <div>
                    <h2 className="font-bold mb-2">Tua griglia</h2>
                    {renderGridWithLabels(playerGrid, isPlacing ? handleDropShip : () => {}, true)}
                </div>
                <div>
                    <h2 className="font-bold mb-2">Griglia nemica</h2>
                    {renderGridWithLabels(botGrid, handleCellClick, false)}
                </div>
            </div>

            {/* Messaggio sotto le griglie */}
            {message && <p className="mt-4 font-bold">{message}</p>}
        </div>
    );
};

export default BattleshipGame;
