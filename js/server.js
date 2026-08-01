const express = require ('express');
const mongoose = require ('mongoose');
const cors = require ('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Conectar ao MongoDB
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error(err));

const ReservaSchema = new mongoose.Schema({
    client_name: String,
    location: String,
    event_date: Date,
    items: [{item_id: Number, name: String, quantity: Number}],
    created_at: { type: Date, default: Date.now },
    status:{type:String, default: 'confirmed'}
});

const Reserva = mongooser.model('Reserva', ReservaSchema);

app.get('/reservas', async (req, res) => {
    const reservas = await Reserva.find();
    res.json(reservas);
});

app.post('/api/reservas', async (req, res) => {
  const nova = new Reserva(req.body);
  await nova.save();
  res.json(nova);
});

app.put('/api/reservas/:id', async (req, res) => {
  await Reserva.findByIdAndUpdate(req.params.id, req.body);
  res.json({ ok: true });
});

app.delete('/api/reservas/:id', async (req, res) => {
  await Reserva.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));