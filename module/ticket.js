const pool = require('./db');

async function issueNewTicket (req, res) {
  try {
    const userId = Number(req.body.userId);
    const client = await pool.connect();
    const result = await client.query(`
    WITH newTicket AS (
      INSERT INTO t_ticket(ownerId) VALUES($1) RETURNING *
    )
    SELECT tnt.id as ticketId, tu.id as userId, tu.name as userName, tnt.issuetime
      FROM newTicket as tnt, t_user as tu
     WHERE tnt.ownerId = tu.id;
    `, [userId]);
    client.release();
    return res.status(200).json({
      rows:result.rows,
      rowCount: result.rowCount
    })
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
}
async function deleteTicket (req, res) {
  try {
    const ticketId = Number(req.body.ticketId);
    const client = await pool.connect();
    const result = await client.query(`
    WITH newTicket AS (
      DELETE FROM t_ticket WHERE id=$1 RETURNING *
    )
    SELECT tnt.id as ticketId, tu.id as userId, tu.name as userName, tnt.issuetime
      FROM newTicket as tnt, t_user as tu
     WHERE tnt.ownerId = tu.id;
    `, [ticketId]);
    client.release();
    return res.status(200).json({
      rows:result.rows,
      rowCount: result.rowCount
    })
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
}
async function getTicketList (req, res) {
  try {
    const client = await pool.connect();
    const result = await client.query( `
    SELECT tt.id as ticketId, tt.ownerid, tu.name as userName, tt.issueTime
      FROM t_ticket as tt
      LEFT OUTER JOIN t_user as tu
      ON tu.id = tt.ownerid;
    `);
    client.release();
    return res.status(200).json({
      rows:result.rows,
      rowCount: result.rowCount
    })
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
}
async function getTicketListByUser (req, res) {
  try {
    let userId = Number(req.params.userId);
    const client = await pool.connect();
    const result = await client.query( `
    SELECT tt.id as ticketId, tt.ownerid, tu.name as userName, tt.issueTime
      FROM t_ticket as tt
      LEFT OUTER JOIN t_user as tu
      ON tu.id = tt.ownerid
     WHERE tu.id = $1;
    `, [userId]);
    client.release();
    return res.status(200).json({
      rows:result.rows,
      rowCount: result.rowCount
    })
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
}
async function getTicketDetail (req, res) {
  try {
    const id = Number(req.params.id);
    const client = await pool.connect();
    const result = await client.query( `
    SELECT tt.id as ticketId, tt.ownerid, tu.name as userName, tt.issueTime
      FROM t_ticket as tt
      LEFT OUTER JOIN t_user as tu
      ON tu.id = tt.ownerid
      WHERE tt.id = $1;
    `, [id]);
    client.release();
    return res.status(200).json({
      rows:result.rows,
      rowCount: result.rowCount
    })
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
}
async function deleteTicketList (req, res) {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      DELETE FROM t_ticket;
    `);
    client.release();
    return res.status(200).json({
      rows:result.rows,
      rowCount: result.rowCount
    })
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
}

module.exports.issueNewTicket = issueNewTicket;
module.exports.deleteTicket = deleteTicket;
module.exports.getTicketList = getTicketList;
module.exports.getTicketListByUser = getTicketListByUser;
module.exports.deleteTicketList = deleteTicketList;
module.exports.getTicketDetail = getTicketDetail;