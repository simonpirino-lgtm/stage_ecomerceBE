const { Libreria, Giochi, Notifiche } = require('../models');

const sequelize = require('../config/db');

const findAllByUserId = async (userId) => {
    return await Libreria.findAll({
        where: { id_utente: userId },
        include: [{ model: Giochi, as: 'gioco' }]
    });
};

const regalaGiocoRepo = async (idMittente, idDestinatario, idGioco) => {
  const t = await sequelize.transaction();

  try {
    // 1. Mittente
    const recordMittente = await Libreria.findOne({
      where: { id_utente: idMittente, id_gioco: idGioco },
      transaction: t
    });

    if (!recordMittente) {
      throw new Error("Non possiedi questo gioco");
    }

    if (recordMittente.quantita <= 1) {
      throw new Error("Non hai copie sufficienti da regalare");
    }

    const gioco = await Giochi.findByPk(idGioco, { transaction: t });

    // 2. Destinatario
    const recordDestinatario = await Libreria.findOne({
      where: { id_utente: idDestinatario, id_gioco: idGioco },
      transaction: t
    });

    if (recordDestinatario) {
      // aumenta quantità
      await recordDestinatario.update({
        quantita: recordDestinatario.quantita + 1
      }, { transaction: t });
    } else {
      // crea nuovo
      await Libreria.create({
        id_utente: idDestinatario,
        id_gioco: idGioco,
        quantita: 1
      }, { transaction: t });
    }

    // 3. Scala mittente
    await recordMittente.update({
        quantita: recordMittente.quantita - 1
    }, { transaction: t });

    await Notifiche.create({
        id_utente: idDestinatario,
        messaggio: `Hai ricevuto ${gioco.titolo} in regalo!`
    }, { transaction: t });

    await t.commit();
    return true;

  } catch (err) {
    await t.rollback();
    throw err;
  }
};
module.exports = { findAllByUserId, regalaGiocoRepo };