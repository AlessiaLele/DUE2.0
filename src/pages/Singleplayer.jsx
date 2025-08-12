import { useNavigate } from 'react-router-dom';
import '../assets/style4.css';
import React, { useState, useEffect, useRef } from 'react';

const GRID_SIZE = 10;
const LETTERS = 'ABCDEFGHIJ'.split('');

const INITIAL_SHIPS = [
    { size: 5, count: 1 },
    { size: 4, count: 1 },
    { size: 3, count: 2 },
    { size: 2, count: 1 },
];

const BattleshipGame = () => {
    const [playerGrid, setPlayerGrid] = useState(createEmptyGrid());
    const [botGrid, setBotGrid] = useState(createEmptyGrid());
    const [isPlacing, setIsPlacing] = useState(true);
    const [orientation, setOrientation] = useState('horizontal');
    const [placementTimeLeft, setPlacementTimeLeft] = useState(30);
    const [message, setMessage] = useState('');
    const [playerTurn, setPlayerTurn] = useState(false);
    const [availableShips, setAvailableShips] = useState(INITIAL_SHIPS);
    const [previewCells, setPreviewCells] = useState([]);
    const [botTargets, setBotTargets] = useState([]);
    const [botMode, setBotMode] = useState('hunt');
    const [botDirection, setBotDirection] = useState(null);
    const [lastHit, setLastHit] = useState(null);

    const navigate = useNavigate();
    const overlayRef = useRef(null);

    // Funzione per formattare coordinate (es: C5)
    function formatCoordinate(row, col) {
        return `${LETTERS[col]}${row + 1}`;
    }

    const apriPopup = () => {
        const popup = document.getElementById('confirm-popup');
        const overlay = document.getElementById('overlay');
        if (popup) popup.style.display = 'block';
        if (overlay) overlay.style.display = 'block';
    };

    const chiudiPopup = () => {
        const popup = document.getElementById('confirm-popup');
        const overlay = document.getElementById('overlay');
        if (popup) popup.style.display = 'none';
        if (overlay) overlay.style.display = 'none';
    };

    const confermaUscita = () => {
        navigate('/menu-page');
    };

    useEffect(() => {
        if (isPlacing && placementTimeLeft > 0) {
            const timer = setTimeout(() => setPlacementTimeLeft((t) => t - 1), 1000);
            return () => clearTimeout(timer);
        } else if (isPlacing && placementTimeLeft <= 0) {
            const completedGrid = placeRemainingShips(playerGrid, availableShips);
            setPlayerGrid(completedGrid);
            setBotGrid(placeShipsRandomly());
            setIsPlacing(false);
            setPlayerTurn(true);
            setMessage('Tempo scaduto! Le navi rimanenti sono state piazzate automaticamente. La partita inizia!');
        }
    }, [isPlacing, placementTimeLeft]);

    function createEmptyGrid() {
        return Array.from({ length: GRID_SIZE }, () =>
            Array.from({ length: GRID_SIZE }, () => ({ hasShip: false, hit: false }))
        );
    }

    function placeShipsRandomly() {
        const grid = createEmptyGrid();
        for (const ship of INITIAL_SHIPS) {
            for (let n = 0; n < ship.count; n++) {
                let placed = false;
                while (!placed) {
                    const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                    const row = Math.floor(Math.random() * GRID_SIZE);
                    const col = Math.floor(Math.random() * GRID_SIZE);
                    if (canPlaceShip(grid, row, col, ship.size, orientation)) {
                        for (let i = 0; i < ship.size; i++) {
                            const r = row + (orientation === 'vertical' ? i : 0);
                            const c = col + (orientation === 'horizontal' ? i : 0);
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
            const r = row + (orientation === 'vertical' ? i : 0);
            const c = col + (orientation === 'horizontal' ? i : 0);
            if (r < 0 || c < 0 || r >= GRID_SIZE || c >= GRID_SIZE) return false;
            if (grid[r][c].hasShip) return false;
        }
        return true;
    }

    function placeRemainingShips(grid, ships) {
        const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
        for (const ship of ships) {
            for (let n = 0; n < ship.count; n++) {
                let placed = false;
                while (!placed) {
                    const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                    const row = Math.floor(Math.random() * GRID_SIZE);
                    const col = Math.floor(Math.random() * GRID_SIZE);
                    if (canPlaceShip(newGrid, row, col, ship.size, orientation)) {
                        for (let i = 0; i < ship.size; i++) {
                            const r = row + (orientation === 'vertical' ? i : 0);
                            const c = col + (orientation === 'horizontal' ? i : 0);
                            newGrid[r][c].hasShip = true;
                        }
                        placed = true;
                    }
                }
            }
        }
        return newGrid;
    }

    function checkWin(grid) {
        return grid
            .flat()
            .filter((cell) => cell.hasShip)
            .every((cell) => cell.hit);
    }

    const handleDropShip = (startRow, startCol, size) => {
        if (!isPlacing || !size) return;
        const newGrid = playerGrid.map((r) => r.map((cell) => ({ ...cell })));
        if (canPlaceShip(newGrid, startRow, startCol, size, orientation)) {
            for (let i = 0; i < size; i++) {
                const r = startRow + (orientation === 'vertical' ? i : 0);
                const c = startCol + (orientation === 'horizontal' ? i : 0);
                newGrid[r][c].hasShip = true;
            }
            setPlayerGrid(newGrid);
            const updatedShips = availableShips.map((ship) =>
                ship.size === size && ship.count > 0 ? { ...ship, count: ship.count - 1 } : ship
            );
            setAvailableShips(updatedShips);
            const allPlaced = updatedShips.every((ship) => ship.count === 0);
            if (allPlaced) {
                setIsPlacing(false);
                setBotGrid(placeShipsRandomly());
                setPlayerTurn(true);
                setMessage('Hai posizionato tutte le navi. La partita inizia!');
            } else {
                setMessage('');
            }
        } else {
            setMessage('Posizione non valida!');
        }
    };

    const handleCellClick = (row, col) => {
        if (!playerTurn || botGrid[row][col].hit) return;
        const newBotGrid = botGrid.map((r) => r.map((cell) => ({ ...cell })));
        newBotGrid[row][col].hit = true;

        const coord = formatCoordinate(row, col);
        if (newBotGrid[row][col].hasShip) {
            setMessage(`💥 Colpito a ${coord}!`);
        } else {
            setMessage(`💦 Mancato a ${coord}.`);
        }

        setBotGrid(newBotGrid);
        if (checkWin(newBotGrid)) {
            setMessage(`🎉 Congratulazioni! Hai vinto! Ultimo colpo a ${coord}.`);
            setPlayerTurn(false);
            return;
        }
        setPlayerTurn(false);
        botMove();
    };

    const botMove = () => {
        setTimeout(() => {
            let row, col;
            let newPlayerGrid = playerGrid.map(r => r.map(cell => ({ ...cell })));
            let mode = botMode;
            let targets = [...botTargets];
            let direction = botDirection;
            let hitPos = lastHit;

            if (mode === 'target' && direction && hitPos) {
                const [r, c] = hitPos;
                if (direction === 'horizontal') {
                    const nextC = c + 1;
                    if (nextC < GRID_SIZE && !newPlayerGrid[r][nextC].hit) {
                        row = r; col = nextC;
                    } else {
                        const prevC = c - 1;
                        if (prevC >= 0 && !newPlayerGrid[r][prevC].hit) {
                            row = r; col = prevC;
                        } else {
                            direction = null;
                        }
                    }
                } else if (direction === 'vertical') {
                    const nextR = r + 1;
                    if (nextR < GRID_SIZE && !newPlayerGrid[nextR][c].hit) {
                        row = nextR; col = c;
                    } else {
                        const prevR = r - 1;
                        if (prevR >= 0 && !newPlayerGrid[prevR][c].hit) {
                            row = prevR; col = c;
                        } else {
                            direction = null;
                        }
                    }
                }
            }

            if (row === undefined) {
                if (mode === 'target' && targets.length > 0) {
                    [row, col] = targets.shift();
                } else {
                    const huntMoves = getHuntMoves(newPlayerGrid);
                    if (huntMoves.length > 0) {
                        [row, col] = huntMoves[Math.floor(Math.random() * huntMoves.length)];
                    } else {
                        const freeMoves = [];
                        for (let r = 0; r < GRID_SIZE; r++) {
                            for (let c = 0; c < GRID_SIZE; c++) {
                                if (!newPlayerGrid[r][c].hit) freeMoves.push([r, c]);
                            }
                        }
                        [row, col] = freeMoves[Math.floor(Math.random() * freeMoves.length)];
                    }
                }
            }

            newPlayerGrid[row][col].hit = true;
            const coord = formatCoordinate(row, col);

            if (newPlayerGrid[row][col].hasShip) {
                setMessage(`🤖 Il bot ha colpito la tua nave a ${coord}!`);
                if (mode === 'hunt') {
                    mode = 'target';
                    hitPos = [row, col];
                    targets = [...targets, ...getAdjacentCells(row, col, newPlayerGrid)];
                } else if (mode === 'target') {
                    if (hitPos && !direction) {
                        if (row === hitPos[0]) direction = 'horizontal';
                        if (col === hitPos[1]) direction = 'vertical';
                    }
                    hitPos = [row, col];
                    if (!direction) {
                        targets = [...targets, ...getAdjacentCells(row, col, newPlayerGrid)];
                    }
                }
            } else {
                setMessage(`🤖 Il bot ha sparato a ${coord}, ma ha mancato.`);
            }

            if (checkWin(newPlayerGrid)) {
                setMessage(`💀 Hai perso! Il bot ha affondato tutte le tue navi! Ultimo colpo a ${coord}.`);
                setPlayerTurn(false);
                setPlayerGrid(newPlayerGrid);
                return;
            }

            setBotMode(mode);
            setBotTargets(targets);
            setBotDirection(direction);
            setLastHit(hitPos);
            setPlayerGrid(newPlayerGrid);
            setPlayerTurn(true);
        }, 500);
    };

    function getHuntMoves(grid) {
        const moves = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (!grid[r][c].hit && (r + c) % 2 === 0) {
                    moves.push([r, c]);
                }
            }
        }
        return moves;
    }

    function getAdjacentCells(row, col, grid) {
        const adj = [
            [row - 1, col],
            [row + 1, col],
            [row, col - 1],
            [row, col + 1]
        ];
        return adj.filter(([r, c]) =>
            r >= 0 && r < GRID_SIZE &&
            c >= 0 && c < GRID_SIZE &&
            !grid[r][c].hit
        );
    }

    const renderCell = (cell, onClick, showShips, row, col) => {
        let bg = 'bg-blue-200';
        const key = `${row}-${col}`;
        if (cell.hit) {
            bg = cell.hasShip ? 'bg-red-600' : 'bg-gray-500';
        } else if (showShips && cell.hasShip) {
            bg = 'bg-gray-400';
        }
        if (previewCells.includes(key)) {
            bg = canPlacePreviewCell(key) ? 'bg-yellow-300' : 'bg-red-300';
        }
        return (
            <div
                className={`w-8 h-8 border border-black flex items-center justify-center ${bg}`}
                onClick={onClick}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    setPreviewCells([]);
                    if (showShips && isPlacing) {
                        try {
                            const payload = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
                            const { size, offset } = JSON.parse(payload);
                            let startRow = row;
                            let startCol = col;
                            if (orientation === 'horizontal') startCol = col - offset;
                            else startRow = row - offset;
                            handleDropShip(startRow, startCol, size);
                        } catch (err) {
                            console.error('drop parse error', err);
                        }
                    }
                }}
                onDragLeave={() => {
                    setPreviewCells((prev) => prev.filter((p) => p !== `${row}-${col}`));
                }}
            />
        );
    };

    const canPlacePreviewCell = (cellKey) => {
        const coords = cellKey.split('-').map(Number);
        const [r, c] = coords;
        return r >= 0 && c >= 0 && r < GRID_SIZE && c < GRID_SIZE;
    };

    const renderGridWithLabels = (grid, onClick, showShips) => {
        return (
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(11, 2rem)',
                gridTemplateRows: 'repeat(11, 2rem)',
            }}>
                <div />
                {LETTERS.map((letter) => (
                    <div key={`col-${letter}`} className="flex items-center justify-center font-bold">
                        {letter}
                    </div>
                ))}
                {grid.map((row, rowIndex) => (
                    <React.Fragment key={`row-${rowIndex}`}>
                        <div className="flex items-center justify-center font-bold">{rowIndex + 1}</div>
                        {row.map((cell, colIndex) => (
                            <div key={`cell-${rowIndex}-${colIndex}`}>
                                {renderCell(cell, () => onClick(rowIndex, colIndex), showShips, rowIndex, colIndex)}
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    const handleCellDragOver = (e, row, col) => {
        e.preventDefault();
        if (!isPlacing) return;
        try {
            const payload = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
            if (!payload) return;
            const { size, offset } = JSON.parse(payload);
            let startRow = row;
            let startCol = col;
            if (orientation === 'horizontal') startCol = col - offset;
            else startRow = row - offset;
            const cells = [];
            for (let i = 0; i < size; i++) {
                const r = startRow + (orientation === 'vertical' ? i : 0);
                const c = startCol + (orientation === 'horizontal' ? i : 0);
                cells.push(`${r}-${c}`);
            }
            setPreviewCells(cells);
        } catch (err) {}
    };

    const renderGridWithLabelsAdvanced = (grid, onClick, showShips) => {
        return (
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(11, 2rem)',
                gridTemplateRows: 'repeat(11, 2rem)',
            }}>
                <div />
                {LETTERS.map((letter) => (
                    <div key={`col-${letter}`} className="flex items-center justify-center font-bold">
                        {letter}
                    </div>
                ))}
                {grid.map((row, rowIndex) => (
                    <React.Fragment key={`row-${rowIndex}`}>
                        <div className="flex items-center justify-center font-bold">{rowIndex + 1}</div>
                        {row.map((cell, colIndex) => (
                            <div
                                key={`cell-${rowIndex}-${colIndex}`}
                                onDragOver={(e) => handleCellDragOver(e, rowIndex, colIndex)}
                                onDragEnter={(e) => handleCellDragOver(e, rowIndex, colIndex)}
                                onDragLeave={() => setPreviewCells([])}
                            >
                                {renderCell(cell, () => onClick(rowIndex, colIndex), showShips, rowIndex, colIndex)}
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    const resetGame = () => {
        setPlayerGrid(createEmptyGrid());
        setBotGrid(createEmptyGrid());
        setIsPlacing(true);
        setOrientation('horizontal');
        setPlacementTimeLeft(30);
        setMessage('');
        setPlayerTurn(false);
        setAvailableShips(INITIAL_SHIPS);
        setPreviewCells([]);
        setBotTargets([]);
        setBotMode('hunt');
        setBotDirection(null);
        setLastHit(null);
    };

    return (
        <div className="p-4">
            <button id="exit-btn" onClick={apriPopup} className="mb-4 px-3 py-1 bg-red-600 text-white rounded">Esci</button>
            <div id="overlay" ref={overlayRef} onClick={chiudiPopup} style={{ display: 'none' }}></div>
            <div id="confirm-popup" style={{ display: 'none' }}>
                <p>Sei sicuro di voler uscire dalla partita?</p>
                <button onClick={confermaUscita} className="mr-2 px-3 py-1 bg-green-600 text-white rounded">Sì</button>
                <button onClick={chiudiPopup} className="px-3 py-1 bg-gray-400 rounded">No</button>
            </div>

            <h1 className="text-xl font-bold mb-4">Battaglia Navale vs Bot</h1>

            {isPlacing && (
                <div className="mb-4">
                    <p className="mb-2">⏳ Tempo per il posizionamento: {placementTimeLeft} secondi</p>
                    <button
                        onClick={() => setOrientation((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'))}
                        className="px-4 py-2 bg-blue-500 text-white rounded mb-2"
                    >
                        Orientamento: {orientation === 'horizontal' ? 'Orizzontale' : 'Verticale'}
                    </button>

                    <div className="flex gap-2 flex-wrap">
                        {availableShips
                            .flatMap((ship) =>
                                Array.from({ length: ship.count }).map((_, i) => ({ size: ship.size, key: `${ship.size}-${i}` }))
                            )
                            .map((shipObj) => (
                                <div
                                    key={shipObj.key}
                                    draggable
                                    onDragStart={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        let offset = 0;
                                        if (orientation === 'horizontal') {
                                            const relX = e.clientX - rect.left;
                                            const unitWidth = rect.width / shipObj.size;
                                            offset = Math.floor(relX / unitWidth);
                                        } else {
                                            const relY = e.clientY - rect.top;
                                            const unitHeight = rect.height / shipObj.size;
                                            offset = Math.floor(relY / unitHeight);
                                        }
                                        if (offset < 0) offset = 0;
                                        if (offset >= shipObj.size) offset = shipObj.size - 1;
                                        const payload = JSON.stringify({ size: shipObj.size, offset });
                                        e.dataTransfer.setData('application/json', payload);
                                    }}
                                    className="bg-gray-400 text-white flex items-center justify-center rounded cursor-move"
                                    style={{
                                        width: orientation === 'horizontal' ? `${shipObj.size * 2}rem` : '2rem',
                                        height: orientation === 'vertical' ? `${shipObj.size * 2}rem` : '2rem',
                                    }}
                                >
                                    {shipObj.size}
                                </div>
                            ))}
                    </div>
                </div>
            )}

            <div className="flex gap-10">
                <div>
                    <h2 className="mb-2 font-semibold">La tua griglia</h2>
                    {renderGridWithLabelsAdvanced(playerGrid, () => {}, true)}
                </div>

                <div>
                    <h2 className="mb-2 font-semibold">Griglia Bot</h2>
                    {renderGridWithLabels(botGrid, handleCellClick, false)}
                </div>
            </div>

            <p className="mt-4 min-h-[2rem]">{message}</p>

            {(message.includes('vinto') || message.includes('perso')) && (
                <button
                    onClick={resetGame}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
                >
                    Ricomincia
                </button>
            )}
        </div>
    );
};

export default BattleshipGame;
