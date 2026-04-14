const utentiService = require('../services/utenti.service');

const findAll = async (req,res) => 
{
    try
    {
        const utenti = await utentiService.findAll();
        return res.status(200).json({utenti});
    } 
    catch(error)
    {
        console.error(error);
        return res.status(404).json({ message: "Errore nel ritrovamento dei dati", errore: error});
    }
}

const register = async (req, res) => 
{
    try 
    {
        // Passiamo i dati del corpo della richiesta (nome, email, password, ecc.) al service
        const utenti = await utentiService.register(req.body);
        
        // Rispondiamo con successo
        return res.status(201).json({ 
            message: "Utente registrato con successo", 
            utente: utenti 
        });
    }
     catch (error) 
    {
        console.error("Errore register controller:", error);
        return res.status(400).json({ 
            message: "Errore durante la registrazione", 
            errore: error.message 
        });
    }
};

const login = async (req,res) => 
{
    try 
    {
        const utenti = await utentiService.login(req.body);
        return res.status(200).json({utenti});
    } 
    catch (error) 
    {
        return res.status(401).json({ message: "Utente o password non corretti", errore: error});
    }
}
const user = async (req, res) => 
{
    try 
    {
        // Logica per recuperare l'utente corrente
        return res.status(200).json({ utente: req.user }); 
    } 
    catch (error) 
    {
        return res.status(500).json({ message: "Errore" });
    }
}

module.exports = {findAll, login, register, user};