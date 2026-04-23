const Utenti = require('./Utenti');
const Carrello = require('./Carrello');
const Categoria = require('./Categoria');
const OrdiniCarrello = require('./OrdiniCarrello');
const Giochi = require('./Giochi');
const CheckoutRighe = require('./CheckoutRighe');
const Checkout = require('./Checkout');
const Magazzino = require('./Magazzino');
/* const PonteGiochiCategorie = require('./PonteGiochiCategorie'); */

/* Utenti.hasOne(Carrello, {
  foreignKey: {
    name: 'id_utente'
  },
  as: 'carrello'
});

Carrello.belongsTo(Utenti, {
  foreignKey: {
    name: 'id_utente'
  },
  as: 'utente'
}); */

Giochi.belongsToMany(Categoria, {
  through: 'ponte_giochi_categorie',
  foreignKey: 'id_gioco',
  otherKey: 'id_categoria',
  as: 'categoria',
  timestamps: false
});

Categoria.belongsToMany(Giochi, {
  through: 'ponte_giochi_categorie',
  foreignKey: 'id_categoria',
  otherKey: 'id_gioco',
  as: 'giochi',
  timestamps: false
});

/* Carrello.belongsToMany(Giochi, {
  through: OrdiniCarrello,
  foreignKey: 'id_utente',
  otherKey: 'id_gioco',
  as: 'giochi'
});

Giochi.belongsToMany(Carrello, {
  through: OrdiniCarrello,
  foreignKey: 'id_gioco',
  otherKey: 'id_utente'
});

Carrello.hasMany(OrdiniCarrello, {
  foreignKey: 'id_utente',
  as: 'items'
});

OrdiniCarrello.belongsTo(Carrello, {
  foreignKey: 'id_utente'
}); */

Utenti.hasMany(models.Libreria, {
  foreignKey: 'id_utente',
  as: 'libreria'
});

Giochi.hasMany(models.Libreria, {
  foreignKey: 'id_gioco',
  as: 'librerie'
});



OrdiniCarrello.belongsTo(Giochi, {
  foreignKey: 'id_gioco',
  as: 'gioco'
});

Checkout.hasMany(CheckoutRighe, {
  foreignKey: 'id_checkout',
  as: 'righe'
});

CheckoutRighe.belongsTo(Checkout, {
  foreignKey: 'id_checkout'
});

CheckoutRighe.belongsTo(Giochi, {
  foreignKey: 'id_gioco',
  as: 'gioco'
});

Giochi.hasMany(CheckoutRighe, {
  foreignKey: 'id_gioco',
  as: 'checkoutRighe'
});

Giochi.hasOne(Magazzino, {
  foreignKey: 'id_gioco',
  as: 'magazzino'
});

Magazzino.belongsTo(Giochi, {
  foreignKey: 'id_gioco',
  as: 'gioco'
});



module.exports = {
  Utenti,
  Carrello,
  Categoria,
  OrdiniCarrello,
  Giochi,
  Checkout,
  CheckoutRighe,
  Magazzino
};