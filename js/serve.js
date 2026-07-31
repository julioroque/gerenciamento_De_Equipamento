const express = require ('express');
const mongoose = require ('mongoose');
const cors = require ('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Conectar ao MongoDB
mongoose.connect('mongodb+srv://julioroquesilva18_db_user:<Q7Z5zi9GoAFxPUNt>@gerenciamento.eaybidp.mongodb.net/?appName=gerenciamento')
.then(() => console.log('Conectado ao MongoDB'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

const ReservaSchema = new mongoose.Schema({
    client_name: String,
    location: String,
    event_date: Date,
    items: [{item_id: Number, name: String, quantity: Number}],
    created_at: { type: Date, default: Date.now },
    status:{type:String, default: 'confirmed'}
});
