const { OrdiniCarrello, Libreria, Giochi, Utenti } = require('../models');
const sequelize = require('../config/db');

const checkout = async (utenteId) => {
    const t = await sequelize.transaction(); // Usiamo una transazione per sicurezza

    try {
        // 1. Recupera gli articoli nel carrello
        const items = await OrdiniCarrello.findAll({
            where: { id_utente: utenteId },
            include: [{ model: Giochi, as: 'gioco' }],
            transaction: t
        });

        if (!items || items.length === 0) {
            throw new Error("Il carrello è vuoto");
        }

        // 2. Calcola il totale (facoltativo se lo hai già fatto altrove, ma sicuro)
        let totale = 0;
        items.forEach(item => {
            totale += parseFloat(item.gioco.prezzo) * item.quantita;
        });

        // 3. Controlla credito utente
        const utente = await Utenti.findByPk(utenteId, { transaction: t });
        if (utente.credito < totale) {
            throw new Error("Credito insufficiente");
        }

        // 4. Scala il credito
        await utente.update({ credito: utente.credito - totale }, { transaction: t });

        // 5. SPOSTA IN LIBRERIA 🔥
        for (const item of items) {
            // Controlliamo se ha già il gioco (magari ne aggiunge quantità)
            const [libreriaItem, created] = await Libreria.findOrCreate({
                where: { id_utente: utenteId, id_gioco: item.id_gioco },
                defaults: { quantita: item.quantita },
                transaction: t
            });

            if (!created) {
                // Se esiste già, aumenta la quantità
                await libreriaItem.update({ 
                    quantita: libreriaItem.quantita + item.quantita 
                }, { transaction: t });
            }
        }

        // 6. Svuota il carrello
        await OrdiniCarrello.destroy({
            where: { id_utente: utenteId },
            transaction: t
        });

        await t.commit();
        return { success: true, message: "Acquisto completato e libreria aggiornata" };

    } catch (error) {
        await t.rollback();
        throw error;
    }
};

module.exports = { checkout };