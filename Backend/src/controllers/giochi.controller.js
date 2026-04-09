const giochiServizio = require('../services/giochi.service');

const findAll =  async (req,res) =>
{
try 
{
    const giochi = await giochiServizio.findAll();
    return res.status(200).json({giochi});
} 
catch (error) 
{
    console.error(error)
    return res.status(404).json({message: "errore nl ritrovamento dei dati", errore : error})
}
}
module.exports = {findAll};