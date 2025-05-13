import express from 'express';
import PG from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

const pool = new PG.Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT
});

// Lister tous les paquets
app.get('/api/paquets', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM paquet');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur lors de la récupération des paquets', details: err.message });
  }
});

// Lister toutes les cartes d’un paquet
app.get('/api/paquets/:id/cartes', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query(
      'SELECT * FROM cartes WHERE id_paquet = $1',
      [id]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ erreur: `Erreur lors de la récupération des cartes du paquet ${id}`, details: err.message });
  }
});

// Ajouter un paquet
app.post('/api/paquets', async (req, res) => {
  const { nom, logo } = req.body;
  if (!nom) return res.status(400).json({ erreur: "Le champ 'nom' est requis." });
  try {
    const result = await pool.query(
      'INSERT INTO paquet (nom, logo) VALUES ($1, $2) RETURNING *',
      [nom, logo]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur lors de la création du paquet', details: err.message });
  }
});

// Supprimer un paquet
app.delete('/api/paquets/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query('DELETE FROM paquet WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ erreur: `Aucun paquet trouvé avec l'id ${id}` });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erreur: `Erreur lors de la suppression du paquet ${id}`, details: err.message });
  }
});

// Ajouter une carte
app.post('/api/cartes', async (req, res) => {
  const { nom, imageURL, id_paquet } = req.body;
  if (!nom) return res.status(400).json({ erreur: "Le champ 'nom' est requis." });
  try {
    const result = await pool.query(
      'INSERT INTO cartes (nom, imageURL, id_paquet) VALUES ($1, $2, $3) RETURNING *',
      [nom, imageURL, id_paquet]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur lors de l’ajout de la carte', details: err.message });
  }
});


// Supprimer une carte
app.delete('/api/cartes/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query('DELETE FROM cartes WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ erreur: `Aucune carte trouvée avec l'id ${id}` });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erreur: `Erreur lors de la suppression de la carte ${id}`, details: err.message });
  }
});

// Modifier le nom d’un paquet
app.put('/api/paquets/:id', async (req, res) => {
  const id = req.params.id;
  const { nom } = req.body;
  if (!nom) return res.status(400).json({ erreur: "Le champ 'nom' est requis." });
  try {
    const result = await pool.query('UPDATE paquet SET nom = $1 WHERE id = $2 RETURNING *', [nom, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ erreur: `Aucun paquet trouvé avec l'id ${id}` });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erreur: `Erreur lors de la modification du paquet ${id}`, details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
