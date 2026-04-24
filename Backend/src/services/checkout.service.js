const { OrdiniCarrello, Libreria } = require('../models');
const sequelize = require('../config/db');

const checkout = async (utenteId) => {
  const t = await sequelize.transaction();

  try {
    // 1. prendi carrello
    const items = await OrdiniCarrello.findAll({
      where: { id_utente: utenteId },
      transaction: t
    });

    if (!items.length) {
      throw new Error("Carrello vuoto");
    }

    // 2. ciclo item (NO bulkCreate per via UNIQUE)
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

    // 3. svuota carrello
    await OrdiniCarrello.destroy({
      where: { id_utente: utenteId },
      transaction: t
    });

    await t.commit();

    return { message: "Checkout completato" };

  } catch (err) {
    await t.rollback();
    throw err;
  }
};

module.exports = { checkout };