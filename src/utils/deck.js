const colori = ['rosso', 'giallo', 'verde', 'blu'];
const numeri = [0, 2, 4, 6, 8, 'Piu2', '↺', '⛔']; // Puoi aggiungere speciali qui
const carteSpecialiNere = ['+4'];

export const creaMazzo = () => {
    let mazzo = [];

    colori.forEach(colore => {
        numeri.forEach(numero => {
            for (let i = 0; i < 2; i++) {
                mazzo.push({
                    colore,
                    numero,
                    img: `/assets/cards/${colore}${numero}.jpg`,
                    id: `${colore}-${numero}-${Math.random()}`
                });
            }
        });
    });

// Carte nere senza colore (es: +4)
    carteSpecialiNere.forEach(numero => {
        for (let i = 0; i < 4; i++) {
            mazzo.push({
                colore: 'nero',
                numero,
                img: `/assets/cards/nero${numero}.jpg`,
                id: `nero-${numero}-${Math.random()}`
            });
        }
    });

    return shuffleArray(mazzo);
};

const shuffleArray = (array) => {
    let copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};

export const pescaCarta = (mazzo) => {
    return mazzo.pop();
};


