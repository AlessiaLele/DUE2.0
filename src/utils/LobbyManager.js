// LobbyManager.js

// Simulazione di "database" temporaneo in memoria
let lobbies = [];

export const createLobby = (name) => {
    const exists = lobbies.find(lobby => lobby.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        return { success: false, message: 'Lobby già esistente.' };
    }

    const newLobby = { name, players: 1 };
    lobbies.push(newLobby);
    return { success: true, lobby: newLobby };
};

export const searchLobby = (name) => {
    const found = lobbies.find(lobby => lobby.name.toLowerCase() === name.toLowerCase());
    if (found) {
        return { success: true, lobby: found };
    } else {
        return { success: false, message: 'Lobby non trovata.' };
    }
};

export const joinByLink = (code = 'DefaultLinkLobby') => {
    const lobby = { name: code, players: 1 };
    return { success: true, lobby };
};

export const joinRandomLobby = () => {
    if (lobbies.length === 0) {
        return { success: false, message: 'Nessuna lobby disponibile.' };
    }
    const randomIndex = Math.floor(Math.random() * lobbies.length);
    return { success: true, lobby: lobbies[randomIndex] };
};

// Per test/debug
export const getAllLobbies = () => lobbies;
