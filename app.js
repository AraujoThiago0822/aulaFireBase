const express = require('express');
const app = express();
const handlebars = require('express-handlebars').engine;
const bodyParser = require('body-parser');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const serviceAccount = require('./devweb2-dc978-firebase-adminsdk-hrbzu-62b6495ef3.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

app.engine('handlebars', handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.render('primeira_pagina');
});

app.get('/consulta', async function(req, res) {
    try {
        const snapshot = await db.collection('pessoas').get();
        if (snapshot.empty) {
            console.log('Documentos não encontrados');
            res.status(404).send('Documentos não encontrados');
            return;
        }

        const documents = [];
        snapshot.forEach(doc => {
            documents.push({ id: doc.id, ...doc.data() });
        });

        res.render('consulta', { documents });
    } catch (error) {
        console.error('Erro ao obter documentos: ', error);
        res.status(500).send('Erro Interno do Servidor');
    }
});

app.get("/editar/:id", async function (req, res) {
    try {
        const docRef = db.collection('pessoas').doc(req.params.id);
        const doc = await docRef.get();
        if (!doc.exists) {
            console.error("Dados não encontrados");
            res.status(404).send("Dados não encontrados");
        } else {
            res.render("editar", { id: req.params.id, agendamento: doc.data() })
        }
    } catch (error) {
        console.error("Erro interno do servidor: ", error);
        res.status(500).send("Erro interno do servidor");
    }
})

app.post('/atualizar',async(req,res)=>{
    try{
      const docId = req.body.id;
      const docRef = db.collection('pessoas').doc(docId);
      await docRef.update({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
      })
      res.redirect('/consulta')
    }catch{
      console.log("erro ao atualizar")
    }});
  

app.post('/cadastrar', function(req, res) {
    var pessoas = db.collection('pessoas').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function() {
        console.log('Pessoa cadastrada com sucesso!')
        res.redirect('/')
    });
});

app.listen(8081, function() {
    console.log('Servidor ativo');
});
