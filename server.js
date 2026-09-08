//constancias
const express = require('express');
const mysql = require('mysql2/promise');
const path =require('path');


const app = express();
const port = 3000;

//base de datos config
const dbConfig = {
  host:'localhost',
  user:'root',
  password:'',
  database:'agendacontactos'
};

const pool=mysql.createPool(dbConfig);

app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));

app.get('/api/contactos',async (req,res)=>{
  try{
    const [filas] = await pool.query('SELECT *FROM contactos');
    res.json(filas);
  } catch (error){
    res.status(500).json({error:'Error al obtener los contactos'});
  }
});

app.get('/api/contactos/:id',async (req,res)=>{
  try{
    const [filas]= await pool.query('SELECT*FROM contactos WHERE id=?',[req.params.id]);  
  if(filas.length===0){
    res.status(404).json({error:'contacto no encontrado'});

  }
  res.json(filas[0]);
  } catch (error){
    res.status(500).json({error:'error al obtener el contacto'});
  }
})

app.post('/api/contactos',async (req,res)=>{
  try{
  const {nombre,telefono,gmail}=req.body;
  if(!nombre || !telefono){
    res.status(400).json({error:'nombre y telefono son obligatorios'});
  }
  const [resultado]=await pool.query('INSERT INTO contactos(nombre,telefono,gmail) VALUES(?,?,?)'[nombre,telefono,gmail || '']);

  res.status(201).json({id:resultado.insertId,nombre,telefono,gmail});
} catch (error){
  res.status(500).json({error:'error al crear el contacto'});
}
})

app.put('/api/contactos/:id',async (req,res)=>{

  try{const {nombre,telefono,gmail}=req.body;
    const [resultado]= await pool.query('UPDATE contactos SET nombre=?, teleofono=?, gmail=? WHERE id=?',
      [nombre,telefono,gmail,req.params.id]);
      if(resultado.affectedRows===0){
        res.status(404).json({error:'contacto no encontrado'});
      }
      res.json({id:req.params.id,nombre,telefono,gmail});
    } catch (error){
      res.status(500).json({error:'error al actualizar el contacto'});
    }});

app.delete('/api/contactos/:id',async (req,res)=>{
  try{
    const [resultado]= await pool.query('DELETE FROM contactos WHERE id=?',[req.params.id]);
    if(resultado.affectedRows===0){
      res.status(404).json({error:'contacto no encontrado'});

    }
    res.json({message:'contacto eliminado'});

  } catch (error){
    res.status(500).json({error:'error al eliminar el contacto'});
  }
});

app.listen(port,()=>{
console.log(`Servidor escuchando en http://localhost:${port}`);
console.log(`Conectado a la base de datos '${dbConfig.database}'`);

});