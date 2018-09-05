const pool = require('./db');
async function getUserList(req, res) {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * from t_user;`);
    return res.status(200).json({
      result
    })
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  } finally {
    client.release();
  }
}

module.exports.getUserList = getUserList;