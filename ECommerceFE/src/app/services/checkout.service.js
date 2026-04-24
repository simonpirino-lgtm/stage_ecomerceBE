const { OrdiniCarrello, Libreria, Giochi, Utenti } = require('../models');
const sequelize = require('../config/db');

const IVA_PERCENTUALE = 0.22;

const checkout = async (utenteId) => {
  const t = await sequelize.transaction();

  try {
    // 1. prendi carrello + prezzi giochi
    const items = await OrdiniCarrello.findAll({
      where: { id_utente: utenteId },
      include: [{
        model: Giochi,
        as: 'gioco'
      }],
      transaction: t
    });

    if (!items.length) {
      throw new Error("Carrello vuoto");
    }

    // 2. calcolo totale
    const subtotale = items.reduce((acc, item) => {
      const prezzo = parseFloat(item.gioco?.prezzo || 0);
      return acc + (prezzo * item.quantita);
    }, 0);

    const iva = subtotale * IVA_PERCENTUALE;
    const totale = subtotale + iva;

    // 3. recupera utente
    const utente = await Utenti.findByPk(utenteId, { transaction: t });

    if (!utente) {
      throw new Error("Utente non trovato");
    }

    const creditoAttuale = parseFloat(utente.credito);

    // 4. controllo credito
    if (creditoAttuale < totale) {
      throw new Error("Credito insufficiente");
    }

    // 5. SCALA CREDITO 🔥
    await utente.update({
      credito: (creditoAttuale - totale).toFixed(2)
    }, { transaction: t });

    // 6. aggiorna libreria
    for (const item of items) {
      const existing = await Libreria.findOne({
        where: {
          id_utente: utenteId,
          id_gioco: item.id_gioco
        },
        transaction: t
      });

      if (existing) {
        await existing.update({
          quantita: existing.quantita + item.quantita
        }, { transaction: t });
      } else {
        await Libreria.create({
          id_utente: utenteId,
          id_gioco: item.id_gioco,
          quantita: item.quantita
        }, { transaction: t });
      }
    }

    // 7. svuota carrello
    await OrdiniCarrello.destroy({
      where: { id_utente: utenteId },
      transaction: t
    });

    await t.commit();

    return { 
      message: "Checkout completato",
      totalePagato: totale
    };

  } catch (err) {
    await t.rollback();
    throw err;
  }
};

module.exports = { checkout };