require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

function toRecord(row) {
  return row;
}

// -------------------------
// SQUADS
// -------------------------
app.get('/api/squads', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM squads ORDER BY name');
    res.json(result.rows.map(toRecord));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/squads', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      'INSERT INTO squads (name) VALUES ($1) RETURNING id, name',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/squads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const result = await pool.query(
      'UPDATE squads SET name = $1 WHERE id = $2 RETURNING id, name',
      [name, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/squads/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM squads WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------
// ONCALLS
// -------------------------
app.get('/api/oncalls', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        squad_id AS "squadId",
        person_name AS "personName",
        phone,
        hours,
        role,
        observation,
        "orderIndex",
        is_lead AS "isLead",
        has_phone AS "hasPhone",
        subgroup,
        is_off AS "isOff"
      FROM oncalls
      ORDER BY "orderIndex"
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/oncalls', async (req, res) => {
  try {
    const p = req.body;
    const result = await pool.query(`
      INSERT INTO oncalls (
        squad_id, person_name, phone, hours, role, observation,
        "orderIndex", is_lead, has_phone, subgroup, is_off
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, squad_id AS "squadId", person_name AS "personName", phone, hours, role, observation, "orderIndex", is_lead AS "isLead", has_phone AS "hasPhone", subgroup, is_off AS "isOff"
    `, [
      p.squadId,
      p.personName,
      p.phone,
      p.hours,
      p.role,
      p.observation,
      p.orderIndex || 99,
      !!p.isLead,
      p.hasPhone !== false,
      p.subgroup || '',
      !!p.isOff
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/oncalls/:id', async (req, res) => {
  try {
    const p = req.body;
    const result = await pool.query(`
      UPDATE oncalls SET
        squad_id = $1,
        person_name = $2,
        phone = $3,
        hours = $4,
        role = $5,
        observation = $6,
        "orderIndex" = $7,
        is_lead = $8,
        has_phone = $9,
        subgroup = $10,
        is_off = $11
      WHERE id = $12
      RETURNING id, squad_id AS "squadId", person_name AS "personName", phone, hours, role, observation, "orderIndex", is_lead AS "isLead", has_phone AS "hasPhone", subgroup, is_off AS "isOff"
    `, [
      p.squadId,
      p.personName,
      p.phone,
      p.hours,
      p.role,
      p.observation,
      p.orderIndex || 99,
      !!p.isLead,
      p.hasPhone !== false,
      p.subgroup || '',
      !!p.isOff,
      req.params.id
    ]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/oncalls/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM oncalls WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------
// CDS
// -------------------------
app.get('/api/cds', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM cds ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cds', async (req, res) => {
  try {
    const result = await pool.query(
      'INSERT INTO cds (name) VALUES ($1) RETURNING id, name',
      [req.body.name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cds/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE cds SET name = $1 WHERE id = $2 RETURNING id, name',
      [req.body.name, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cds/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM cds WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------
// CD CONTACTS
// -------------------------
app.get('/api/cd-contacts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        cd_id AS "cdId",
        person_name AS "personName",
        phone,
        role,
        observation,
        "orderIndex"
      FROM cd_contacts
      ORDER BY "orderIndex"
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cd-contacts', async (req, res) => {
  try {
    const p = req.body;
    const result = await pool.query(`
      INSERT INTO cd_contacts (cd_id, person_name, phone, role, observation, "orderIndex")
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, cd_id AS "cdId", person_name AS "personName", phone, role, observation, "orderIndex"
    `, [p.cdId, p.personName, p.phone, p.role, p.observation, p.orderIndex || 99]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cd-contacts/:id', async (req, res) => {
  try {
    const p = req.body;
    const result = await pool.query(`
      UPDATE cd_contacts SET
        cd_id = $1,
        person_name = $2,
        phone = $3,
        role = $4,
        observation = $5,
        "orderIndex" = $6
      WHERE id = $7
      RETURNING id, cd_id AS "cdId", person_name AS "personName", phone, role, observation, "orderIndex"
    `, [p.cdId, p.personName, p.phone, p.role, p.observation, p.orderIndex || 99, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cd-contacts/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM cd_contacts WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------
// FILIAIS
// -------------------------
app.get('/api/filiais', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        store_number AS "storeNumber",
        name,
        regional,
        manager_name AS "managerName",
        phone,
        address,
        address_number AS "addressNumber",
        neighborhood,
        cep,
        city,
        state,
        hours,
        open_sunday AS "openSunday"
      FROM filiais
      ORDER BY store_number::int
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/filiais', async (req, res) => {
  try {
    const p = req.body;
    const result = await pool.query(`
      INSERT INTO filiais (
        store_number, name, regional, manager_name, phone, address,
        address_number, neighborhood, cep, city, state, hours, open_sunday
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, store_number AS "storeNumber", name, regional, manager_name AS "managerName", phone, address, address_number AS "addressNumber", neighborhood, cep, city, state, hours, open_sunday AS "openSunday"
    `, [
      p.storeNumber,
      p.name,
      p.regional,
      p.managerName,
      p.phone,
      p.address,
      p.addressNumber,
      p.neighborhood,
      p.cep,
      p.city,
      p.state,
      p.hours,
      p.openSunday
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/filiais/:id', async (req, res) => {
  try {
    const p = req.body;
    const result = await pool.query(`
      UPDATE filiais SET
        store_number = $1,
        name = $2,
        regional = $3,
        manager_name = $4,
        phone = $5,
        address = $6,
        address_number = $7,
        neighborhood = $8,
        cep = $9,
        city = $10,
        state = $11,
        hours = $12,
        open_sunday = $13
      WHERE id = $14
      RETURNING id, store_number AS "storeNumber", name, regional, manager_name AS "managerName", phone, address, address_number AS "addressNumber", neighborhood, cep, city, state, hours, open_sunday AS "openSunday"
    `, [
      p.storeNumber,
      p.name,
      p.regional,
      p.managerName,
      p.phone,
      p.address,
      p.addressNumber,
      p.neighborhood,
      p.cep,
      p.city,
      p.state,
      p.hours,
      p.openSunday,
      req.params.id
    ]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/filiais/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM filiais WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------
// FILIAL CONTACTS
// -------------------------
app.get('/api/filial-contacts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        store_number AS "storeNumber",
        person_name AS "personName",
        phone,
        role,
        observation
      FROM filial_contacts
      ORDER BY person_name
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/filial-contacts', async (req, res) => {
  try {
    const p = req.body;
    const result = await pool.query(`
      INSERT INTO filial_contacts (store_number, person_name, phone, role, observation)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, store_number AS "storeNumber", person_name AS "personName", phone, role, observation
    `, [p.storeNumber, p.personName, p.phone, p.role, p.observation]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/filial-contacts/:id', async (req, res) => {
  try {
    const p = req.body;
    const result = await pool.query(`
      UPDATE filial_contacts SET
        store_number = $1,
        person_name = $2,
        phone = $3,
        role = $4,
        observation = $5
      WHERE id = $6
      RETURNING id, store_number AS "storeNumber", person_name AS "personName", phone, role, observation
    `, [p.storeNumber, p.personName, p.phone, p.role, p.observation, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/filial-contacts/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM filial_contacts WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------
// LOGS
// -------------------------
app.get('/api/logs', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        action,
        target,
        details,
        user_name AS "userName",
        created_at AS "createdAt"
      FROM logs
      ORDER BY created_at DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/logs', async (req, res) => {
  try {
    const { action, target, details, userName } = req.body;
    const result = await pool.query(`
      INSERT INTO logs (action, target, details, user_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, action, target, details, user_name AS "userName", created_at AS "createdAt"
    `, [action, target, details, userName || 'Sistema Anônimo']);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
