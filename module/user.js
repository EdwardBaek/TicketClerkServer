const pool = require('./db');
async function getUserList(req, res) {
  try {
    const client = await pool.connect();
    const result = await client.query(`SELECT * from t_user;`);
    client.release();
    return res.status(200).json({
      result
    })
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
}

module.exports.getUserList = getUserList;