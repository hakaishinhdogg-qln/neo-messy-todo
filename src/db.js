import pg from 'pg';

var conString = process.env.DATABASE_URL;

function query(text, values = []) {
  return new Promise((resolve, reject) => (
    pg.connect(conString, (err, client, done) => {
      if (err) return reject(new Error(err));
      client.query(text, values, (err, result) => {
        if (err) {
          done();
          return reject(new Error(err));
        }
        done();
        resolve(result.rows);
      });
    })
  ));
}

function all(table) {
  return query(`SELECT * FROM ${table}`);
}

function clear(table) {
  return query(`DELETE FROM ${table}`);
}

function create(table, params) {
  const assigns = Object.keys(params);
  const values = Object.values(params);
  const placeholders = values.map((value, index) => `$${index + 1}`);
  return query(`INSERT INTO ${table} (${assigns}) VALUES (${placeholders}) RETURNING *`, values);
}

function getById(table, id) {
  return query(`SELECT * FROM ${table} WHERE id=$1`, [id]);
}

function update(table, id, params) {
  if (params.id) delete params.id;
  const assigns = Object.keys(params);
  const values = assigns.map((key) => params[key]);
  const setClause = assigns.map((key, index) => `${key}=$${index + 1}`).join(', ');
  values.push(id);
  return query(`UPDATE ${table} SET ${setClause} WHERE id=$${values.length} RETURNING *`, values);
}

function deleteById(table, id) {
  return query(`DELETE FROM ${table} WHERE id = $1`, [id]);
}

export default {all, clear, create, deleteById, getById, update};
