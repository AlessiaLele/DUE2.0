
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import '../assets/style4.css';

const GRID_SIZE = 10;
const LETTERS = 'ABCDEFGHIJ'.split('');
const INITIAL_SHIPS = [
    { size: 5, count: 1 },
    { size: 4, count: 1 },
    { size: 3, count: 2 },
    { size: 2, count: 1 },
];

// 👇 Tema informatico: icone per sistema
const SYSTEM_EMOJI = {
    'Data Center': '🖥️',
    'Firewall': '🔥',
    'Server Web': '🌐',
    'Database': '🗄️',
    'Router': '📡',
};

// 👇 Code dei sistemi per misura (usate per decidere il “tipo” al piazzamento)
const initialSystemQueues = {
    5: ['Data Center'],
    4: ['Firewall'],
    3: ['Server Web', 'Database'], // due sistemi da 3: prima Server Web, poi Database
    2: ['Router'],
};

function createEmptyGrid() {
    return Array.from({ length: GRID_SIZE }, () =>
        Array.from({ length: GRID_SIZE }, () => ({ hasShip: false, status: null, systemType: null }))
    );
}

export default function Room() {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [socket, setSocket] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [waitingTwo, setWaitingTwo] = useState(true);

    // Griglie
    const [myGrid, setMyGrid] = useState(createEmptyGrid());
    const [enemyGrid, setEnemyGrid] = useState(createEmptyGrid());

    // Stato piazzamento
    const [isPlacing, setIsPlacing] = useState(true);
    const [orientation, setOrientation] = useState('horizontal');

    const [placementTimeLeft, setPlacementTimeLeft] = useState(30);
    const [timerActive, setTimerActive] = useState(false);
    const [availableShips, setAvailableShips] = useState(INITIAL_SHIPS);
    const [previewCells, setPreviewCells] = useState([]);
    const [message, setMessage] = useState('');

    // Turni
    const [myTurn, setMyTurn] = useState(false);

    // Flotta piazzata come array di navi (ogni nave = array di celle {r,c})
    const placedShipsRef = useRef([]);
    const overlayRef = useRef(null);

    // 👇 Coda per assegnare il tipo/emoji ad ogni sistema piazzato
    const [systemQueues, setSystemQueues] = useState(initialSystemQueues);

    const formatCoordinate = (row, col) => `${LETTERS[col]}${row + 1}`;

    // ————— Connessione socket & join —————
    useEffect(() => {
        const tokenS1 = localStorage.getItem("tokenS1");
        const s = io("http://localhost:5001", { auth: { tokenS1 } });

        if (!tokenS1) {
            alert("tokenS1 mancante: effettua il login");
            navigate("/"); // oppure comportamento che preferisci
            return;
        }

        s.emit("joinRoom", roomId);

        s.on("roomFull", (msg) => {
            alert(msg);
            navigate("/lobby");
        });

        // Quando entrano in due
        s.on("bothConnected", () => {
            setWaitingTwo(false);
            setTimerActive(true);
            // Il client resta comunque in "isPlacing" finché non invia ready
        });

        // Start effettivo quando entrambi hanno mandato ready
        s.on("gameStart", ({ firstTurnSocketId }) => {
            setGameStarted(true);
            setMessage("🛡️ La cyber-battaglia è iniziata!");
            setMyTurn(s.id === firstTurnSocketId);
        });

        s.on("turnChanged", ({ turnSocketId }) => {
            setMyTurn(s.id === turnSocketId);
        });

        // Difensore: colpo ricevuto sul mio campo
        s.on("attackResult", ({ x, y, hit }) => {
            const coord = formatCoordinate(y, x); // NB: y = row, x = col
            setMyGrid(prev => {
                const g = prev.map(r => r.map(c => ({ ...c })));
                g[y][x].status = hit ? "hit" : "miss";
                return g;
            });
            setMessage(hit
                ? `⚠️ Attacco avversario in ${coord}: sistema compromesso!`
                : `🛡️ Tentativo avversario bloccato in ${coord}.`);
        });

        // Attaccante: feedback sul campo nemico (per marcare dove ho tirato)
        s.on("opponentMove", ({ x, y, hit, sunk, sunkSize }) => {
            const coord = formatCoordinate(y, x);
            setEnemyGrid(prev => {
                const g = prev.map(r => r.map(c => ({ ...c })));
                g[y][x].status = hit ? "hit" : "miss";
                return g;
            });
            if (hit) {
                setMessage(
                    sunk
                        ? `🎯 Compromesso e disattivato (${coord}, sistema da ${sunkSize})!`
                        : `💥 Sistema avversario compromesso in ${coord}!`
                );
            } else {
                setMessage(`🛡️ Tentativo bloccato in ${coord}.`);
            }
        });

        s.on("gameOver", ({ winner, forfeit }) => {
            setMyTurn(false);
            setMessage(
                forfeit
                    ? `🏁 Attacco concluso per ritiro. Vincitore: ${winner}`
                    : `🏁 Attacco concluso. Vincitore: ${winner}`
            );
        });

        s.on("errorMessage", (msg) => setMessage(msg));

        s.on("moveIgnored", ({ x, y }) => {
            const coord = formatCoordinate(y, x);
            setMessage(`⚠️ Hai già provato ${coord}. Mossa ignorata, puoi riprovare.`);
            // Ripristino il turno: il client si era già tolto il turno quando ha emesso l'attack
            setMyTurn(true);
        });

        setSocket(s);
        return () => s.disconnect();
    }, [roomId, navigate]);

    // ————— Timer piazzamento —————
    useEffect(() => {
        if (!isPlacing || !timerActive) return;
        if (placementTimeLeft > 0) {
            const t = setTimeout(() => setPlacementTimeLeft(tl => tl - 1), 1000);
            return () => clearTimeout(t);
        }
        // tempo scaduto → completa automaticamente e manda ready
        autoCompleteAndReady();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlacing, timerActive, placementTimeLeft]);

    // Piazzamento con controllo
    function canPlaceShip(grid, row, col, size, ori) {
        for (let i = 0; i < size; i++) {
            const r = row + (ori === 'vertical' ? i : 0);
            const c = col + (ori === 'horizontal' ? i : 0);
            if (r < 0 || c < 0 || r >= GRID_SIZE || c >= GRID_SIZE) return false;
            if (grid[r][c].hasShip) return false;
        }
        return true;
    }

    // Autoposizionamento completo con assegnazione dei tipi (ignora il parziale, come l’originale)
    function placeShipsRandomlyWithGroups() {
        const grid = createEmptyGrid();
        const groups = [];
        // copia mutabile delle code per dimensione
        const qBySize = JSON.parse(JSON.stringify(initialSystemQueues));

        for (const ship of INITIAL_SHIPS) {
            for (let n = 0; n < ship.count; n++) {
                let placed = false;
                while (!placed) {
                    const ori = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                    const row = Math.floor(Math.random() * GRID_SIZE);
                    const col = Math.floor(Math.random() * GRID_SIZE);
                    if (canPlaceShip(grid, row, col, ship.size, ori)) {
                        // prendi il tipo dalla coda relativa alla dimensione
                        const q = qBySize[ship.size] || [];
                        const systemType = q.length ? q.shift() :
                            (ship.size === 5 ? 'Data Center'
                                : ship.size === 4 ? 'Firewall'
                                    : ship.size === 3 ? 'Server Web'
                                        : 'Router');

                        const cells = [];
                        for (let i = 0; i < ship.size; i++) {
                            const r = row + (ori === 'vertical' ? i : 0);
                            const c = col + (ori === 'horizontal' ? i : 0);
                            grid[r][c].hasShip = true;
                            grid[r][c].systemType = systemType; // 👈 salva il tipo per l’icona
                            cells.push({ r, c, systemType });
                        }
                        groups.push(cells);
                        placed = true;
                    }
                }
            }
        }
        return { grid, groups };
    }

    function handleDropShip(startRow, startCol, size) {
        if (!isPlacing || !size) return;
        const newGrid = myGrid.map(r => r.map(c => ({ ...c })));
        if (canPlaceShip(newGrid, startRow, startCol, size, orientation)) {
            // tipo (e icona) per la nave che stai piazzando ORA
            const typeQueue = systemQueues[size] || [];
            const systemType = typeQueue.length
                ? typeQueue[0]
                : (size === 5 ? 'Data Center'
                    : size === 4 ? 'Firewall'
                        : size === 3 ? 'Server Web'
                            : 'Router');

            const cells = [];
            for (let i = 0; i < size; i++) {
                const r = startRow + (orientation === 'vertical' ? i : 0);
                const c = startCol + (orientation === 'horizontal' ? i : 0);
                newGrid[r][c].hasShip = true;
                newGrid[r][c].systemType = systemType; // 👈 assegna tipo per mostrare l’icona
                cells.push({ r, c, systemType });
            }
            setMyGrid(newGrid);

            // registra la nave
            placedShipsRef.current = [...placedShipsRef.current, cells];

            // aggiorna scorte
            const updated = availableShips.map(s =>
                s.size === size && s.count > 0 ? { ...s, count: s.count - 1 } : s
            );
            setAvailableShips(updated);

            // scala la coda del tipo usato
            setSystemQueues(prev => ({
                ...prev,
                [size]: (prev[size] && prev[size].length) ? prev[size].slice(1) : [],
            }));

            const allPlaced = updated.every(s => s.count === 0);
            if (allPlaced) finishPlacementAndReady();
        } else {
            setMessage('Posizione non valida!');
        }
    }

    function autoCompleteAndReady() {
        // completa: rigenera una flotta completa random (ignora il parziale), come l’originale
        const { grid, groups } = placeShipsRandomlyWithGroups();
        setMyGrid(grid);
        placedShipsRef.current = groups;
        finishPlacementAndReady(true);
    }

    function finishPlacementAndReady(auto = false) {
        setIsPlacing(false);
        if (auto) setMessage('⏱️ Tempo scaduto! I sistemi sono stati piazzati automaticamente. In attesa dell’avvio…');

        // invia flotta e ready
        socket?.emit("placeFleet", { roomId, ships: placedShipsRef.current });
        socket?.emit("ready", { roomId });
    }

    // ————— Attacco —————
    function attack(row, col) {
        if (!gameStarted || !myTurn || isPlacing) return;

        const cell = enemyGrid[row][col];
        if (cell.hit) return; // (lasciato come nell’originale)

        socket?.emit("attack", { roomId, x: col, y: row });
        setMyTurn(false); // attendo esito/turnChanged dal server
    }

    // ————— Drag & Drop helpers —————
    const canPlacePreviewCell = (key) => {
        const [r, c] = key.split('-').map(Number);
        return r >= 0 && c >= 0 && r < GRID_SIZE && c < GRID_SIZE;
    };

    const renderCell = (grid, cell, onClick, showShips, row, col) => {
        let bg = 'bg-blue-200';
        const key = `${row}-${col}`;
        if (cell.status === "hit") {
            bg = 'bg-red-600';   // colpito
        } else if (cell.status === "miss") {
            bg = 'bg-gray-600';  // mancato (grigio scuro)
        } else if (showShips && cell.hasShip) {
            bg = 'bg-gray-400';  // sistema visibile solo sulla propria griglia
        }
        if (previewCells.includes(key)) {
            bg = canPlacePreviewCell(key) ? 'bg-yellow-300' : 'bg-red-300';
        }

        // 👇 icona del sistema (solo sulla tua griglia e se non è stato ancora colpito/mancato)
        let content = null;
        if (showShips && cell.hasShip && !cell.status) {
            const emoji = SYSTEM_EMOJI[cell.systemType] || '💻';
            content = <span style={{ fontSize: '1rem', lineHeight: 1 }}>{emoji}</span>;
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
                        } catch {}
                    }
                }}
                onDragLeave={() => setPreviewCells((prev) => prev.filter((p) => p !== key))}
            >
                {content}
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
        } catch {}
    };

    const renderGridWithLabels = (grid, onClick, showShips, advanced = false) => {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 2rem)', gridTemplateRows: 'repeat(11, 2rem)' }}>
                <div />
                {LETTERS.map((l) => (
                    <div key={`col-${l}`} className="flex items-center justify-center font-bold">{l}</div>
                ))}
                {grid.map((row, ri) => (
                    <div key={`row-${ri}`} style={{ display: 'contents' }}>
                        <div className="flex items-center justify-center font-bold">{ri + 1}</div>
                        {row.map((cell, ci) => (
                            <div
                                key={`cell-${ri}-${ci}`}
                                {...(advanced ? { onDragOver: (e) => handleCellDragOver(e, ri, ci), onDragEnter: (e) => handleCellDragOver(e, ri, ci), onDragLeave: () => setPreviewCells([]) } : {})}
                            >
                                {renderCell(grid, cell, () => onClick(ri, ci), showShips, ri, ci)}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );
    };

    // ————— UI extra (popup) —————
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
    const confermaUscita = () => navigate('/menu-page');

    // ————— Render —————
    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="p-4">
            <button id="exit-btn" onClick={apriPopup} className="mb-4 px-3 py-1 bg-red-600 text-white rounded">Esci</button>
            <div id="overlay" ref={overlayRef} onClick={chiudiPopup} style={{ display: 'none' }}></div>
            <div id="confirm-popup" style={{ display: 'none' }}>
                <p>Sei sicuro di voler uscire dalla partita?</p>
                <button onClick={confermaUscita} className="mr-2 px-3 py-1 bg-green-600 text-white rounded">Sì</button>
                <button onClick={chiudiPopup} className="px-3 py-1 bg-gray-400 rounded">No</button>
            </div>

            <h2 className="text-xl font-bold mb-2">Cyber-battaglia privata: {roomId}</h2>

            {!gameStarted && (
                <>
                    {waitingTwo ? (
                        <p>⏳ In attesa di un altro giocatore...</p>
                    ) : (
                        <p>👥 Siete in due. Completa il posizionamento dei sistemi per iniziare.</p>
                    )}
                </>
            )}

            {isPlacing && (
                <div className="mb-4">
                    <p className="mb-2">⏳ Tempo per il posizionamento: {placementTimeLeft} secondi</p>
                    <button
                        onClick={() => setOrientation(o => (o === 'horizontal' ? 'vertical' : 'horizontal'))}
                        className="px-4 py-2 bg-blue-500 text-white rounded mb-2"
                    >
                        Orientamento: {orientation === 'horizontal' ? 'Orizzontale' : 'Verticale'}
                    </button>

                    <div className="flex gap-2 flex-wrap">
                        {availableShips
                            .flatMap((ship) =>
                                Array.from({ length: ship.count }).map((_, i) => {
                                    // Nome del sistema in base alla dimensione e all’indice (per distinguere i due da 3)
                                    let systemName = '';
                                    if (ship.size === 5) systemName = 'Data Center';
                                    else if (ship.size === 4) systemName = 'Firewall';
                                    else if (ship.size === 3) systemName = i === 0 ? 'Server Web' : 'Database';
                                    else if (ship.size === 2) systemName = 'Router';
                                    return { size: ship.size, key: `${ship.size}-${i}`, name: systemName };
                                })
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
                                        // clamp
                                        offset = Math.max(0, Math.min(offset, shipObj.size - 1));
                                        e.dataTransfer.setData('application/json', JSON.stringify({ size: shipObj.size, offset }));
                                    }}
                                    className="bg-gray-400 text-white flex items-center justify-center rounded cursor-move text-sm font-semibold"
                                    style={{
                                        width: orientation === 'horizontal' ? `${shipObj.size * 2}rem` : '2rem',
                                        height: orientation === 'vertical' ? `${shipObj.size * 2}rem` : '2rem',
                                        position: "relative",
                                        overflow: "hidden",
                                    }}
                                >
                                    <span
                                        style={{
                                            writingMode: orientation === "vertical" ? "vertical-rl" : "horizontal-tb",
                                            textOrientation: "upright",
                                        }}
                                    >
                                        {shipObj.name}
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            <div className="flex gap-10">
                <div>
                    <h3 className="mb-2 font-semibold">La tua rete</h3>
                    {renderGridWithLabels(myGrid, () => {}, true, true)}
                </div>

                <div>
                    <h3 className="mb-2 font-semibold">Rete avversaria</h3>
                    {renderGridWithLabels(enemyGrid, (r, c) => attack(r, c), false)}
                    <p className="mt-2">{myTurn ? "Tocca a te!" : "Turno avversario..."}</p>
                </div>
            </div>

            <p className="mt-4 min-h-[2rem]">{message}</p>
        </div>
        </div>
    );
}
