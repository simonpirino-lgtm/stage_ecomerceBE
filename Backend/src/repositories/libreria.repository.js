const { Libreria, Giochi } = require('../models');

const findAllByUserId = async (userId) => {
    return await Libreria.findAll({
        where: { id_utente: userId },
        include: [{ model: Giochi, as: 'gioco' }]
    });
};

const regalaGiocoRepo = async (idMittente, idDestinatario, idGioco) => {
    // 1. Controlla se il destinatario ha già il gioco
    const posseduto = await Libreria.findOne({
        where: { id_utente: idDestinatario, id_gioco: idGioco }
    });

    if (posseduto) {
        throw new Error("L'utente ha già questo gioco in libreria!");
    }

    // 2. Diminuisci quantità al mittente
    const recordMittente = await Libreria.findOne({
        where: { id_utente: idMittente, id_gioco: idGioco }
    });
    
    if (recordMittente.quantita > 1) {
        recordMittente.quantita -= 1;
        await recordMittente.save();
    } else {
        throw new Error("Non hai abbastanza copie da regalare!");
    }

    // 3. Aggiungi al destinatario
    return await Libreria.create({
        id_utente: idDestinatario,
        id_gioco: idGioco,
        quantita: 1
    });
};
module.exports = { findAllByUserId, regalaGiocoRepo };