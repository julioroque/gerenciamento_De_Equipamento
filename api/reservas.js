import mongoose from 'mongoose';
import { Schema, model } from 'mongoose';

// Conecta ao MongoDB usando variável de ambiente
const MONGODB_URI = process.env.MONGODB_URI;

if (!mongoose.connection.readyState) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB conectado'))
    .catch(err => console.error('Erro ao conectar MongoDB:', err));
}

// Definição do schema
const ReservaSchema = new Schema({
  client_name: String,
  location: String,
  event_date: String,
  items: [{ item_id: Number, name: String, quantity: Number }],
  created_at: { type: Date, default: Date.now },
  status: { type: String, default: 'confirmed' }
});

const Reserva = mongoose.models.Reserva || model('Reserva', ReservaSchema);

// Handler da API
export default async function handler(req, res) {
  if (req.method === 'GET') {
    const reservas = await Reserva.find();
    return res.status(200).json(reservas);
  }

  if (req.method === 'POST') {
    const nova = new Reserva(req.body);
    await nova.save();
    return res.status(201).json(nova);
  }

  if (req.method === 'PUT') {
    const { id } = req.query;
    await Reserva.findByIdAndUpdate(id, req.body);
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    await Reserva.findByIdAndDelete(id);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
