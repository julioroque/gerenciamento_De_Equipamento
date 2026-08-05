import mongoose from 'mongoose';
import { Schema, model } from 'mongoose';

// Conexão com MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

if (!mongoose.connection.readyState) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB conectado'))
    .catch(err => console.error('Erro ao conectar MongoDB:', err));
}

// Schema de Equipamento
const EquipSchema = new Schema({
  name: String,
  code: String,
  total: Number,
  created_at: { type: Date, default: Date.now }
});

const Equipamento = mongoose.models.Equipamento || model('Equipamento', EquipSchema);

// Handler da API
export default async function handler(req, res) {
  if (req.method === 'GET') {
    const equipamentos = await Equipamento.find();
    return res.status(200).json(equipamentos);
  }

  if (req.method === 'POST') {
    const novo = new Equipamento(req.body);
    await novo.save();
    return res.status(201).json(novo);
  }

  if (req.method === 'PUT') {
    const { id } = req.query;
    await Equipamento.findByIdAndUpdate(id, req.body);
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    await Equipamento.findByIdAndDelete(id);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
