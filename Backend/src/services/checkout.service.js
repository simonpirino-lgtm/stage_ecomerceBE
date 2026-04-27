const { OrdiniCarrello, Libreria, Giochi, Utenti, Checkout, CheckoutRighe } = require('../models');
const sequelize = require('../config/db');

const IVA_PERCENTUALE = 0.22;

const checkout = async (utenteId) => {
  const t = await sequelize.transaction();

  try {
    const items = await OrdiniCarrello.findAll({
      where: { id_utente: utenteId },
      include: [{ model: Giochi, as: 'gioco' }],
      transaction: t
    });

    if (!items.length) {
      throw new Error("Carrello vuoto");
    }

    const subtotale = items.reduce((acc, item) => {
      const prezzo = parseFloat(item.gioco?.prezzo || 0);
      return acc + (prezzo * item.quantita);
    }, 0);

    const iva = subtotale * IVA_PERCENTUALE;
    const totale = subtotale + iva;

    const utente = await Utenti.findByPk(utenteId, { transaction: t });
    if (!utente) {
      throw new Error("Utente non trovato");
    }

    const creditoAttuale = parseFloat(utente.credito);
    if (creditoAttuale < totale) {
      throw new Error("Credito insufficiente");
    }

    // 5. Scala credito
    await utente.update({
      credito: (creditoAttuale - totale).toFixed(2)
    }, { transaction: t });

    // 6. ✅ NUOVO: Crea record Checkout
    const nuovoCheckout = await Checkout.create({
      id_utente: utenteId,
      totale: totale.toFixed(2),
      iva: iva.toFixed(2)
    }, { transaction: t });

    // 7. ✅ NUOVO: Crea righe con snapshot e controllo gioco
    for (const item of items) 
      {
      if (!item.gioco) 
      {
        throw new Error(`Gioco con ID ${item.id_gioco} non più disponibile`);
      }

      const prezzoUnitario = parseFloat(item.gioco.prezzo);
      if (isNaN(prezzoUnitario)) 
      {
        throw new Error(`Prezzo non valido per il gioco: ${item.gioco.titolo}`);
      }

      await CheckoutRighe.create({
        id_checkout: nuovoCheckout.id,
        id_gioco: item.id_gioco,
        quantita: item.quantita,
        prezzo_unitario: prezzoUnitario.toFixed(2)
      }, { transaction: t });

      // 8. Aggiorna libreria
      const existing = await Libreria.findOne({
        where: { id_utente: utenteId, id_gioco: item.id_gioco },
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

    // 9. Svuota carrello
    await OrdiniCarrello.destroy({
      where: { id_utente: utenteId },
      transaction: t
    });

    await t.commit();

    return { 
      message: "Checkout completato", 
      idOrdine: nuovoCheckout.id, 
      totalePagato: totale.toFixed(2) 
    };

  } catch (err) {
    await t.rollback();
    throw err;
  }
};

module.exports = { checkout };