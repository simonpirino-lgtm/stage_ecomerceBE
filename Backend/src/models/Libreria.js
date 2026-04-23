module.exports = (sequelize, DataTypes) => {
  const Libreria = sequelize.define('Libreria', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_utente: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_gioco: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantita: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    tableName: 'libreria',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['id_utente', 'id_gioco']
      }
    ]
  });

  Libreria.associate = (models) => {
    Libreria.belongsTo(models.Utenti, {
      foreignKey: 'id_utente',
      as: 'utente'
    });

    Libreria.belongsTo(models.Giochi, {
      foreignKey: 'id_gioco',
      as: 'gioco'
    });
  };

  return Libreria;
};