const pool = require('./db');

async function issueNewTicket (req, res) {
  const userId = Number(req.body.userId);
  if( isNaN(userId) ) return res.status(400).send("Error wrong parameter");
  
  const client = await pool.connect();
  try {
    const userInfo = await client.query(`SELECT * FROM t_user WHERE id = $1`, [userId]);

    if( userInfo.rowCount === 0 ) {
      return res.status(404).send('Error no User');
    }

    const result = await client.query(`
    WITH newTicket AS (
      INSERT INTO t_ticket(owner_id) VALUES($1) RETURNING *
    )
    SELECT tnt.id as "ticketId", 
           tu.id as "userId", 
           tu.name as "userName", 
           tnt.issue_time as "issueTime"
      FROM newTicket as tnt, t_user as tu
     WHERE tnt.owner_id = tu.id;
    `, [userId]);

    if( result.rowCount === 0 ) return res.status(404).end('Error wrong user');
    
    return res.status(201).json({
      rows:result.rows,
      rowCount: result.rowCount
    })
  } catch (err) {
    console.error(err);
    res.status(500).end("Error " + err);
  } finally {
    client.release();
  }
}
async function deleteTicket (req, res) {
  const ticketId = Number(req.params.ticketId);
  if( isNaN(ticketId) ) return res.status(400).send("Error wrong parameter");
  
  const client = await pool.connect();
  try {

    const result = await client.query(`
    WITH newTicket AS (
      DELETE FROM t_ticket WHERE id=$1 RETURNING *
    )
    SELECT tnt.id as "ticketId", 
           tu.id as "userId", 
           tu.name as "userName", 
           tnt.issue_time as "issueTime"
      FROM newTicket as tnt, t_user as tu
     WHERE tnt.owner_id = tu.id;
    `, [ticketId]);
    return res.status(200).json({
      rows:result.rows,
      rowCount: result.rowCount
    })
  } catch (err) {
    console.error(err);
    res.status(500).send("Error " + err);
  } finally {
    client.release();
  }
}
async function getTicketList (req, res) {
  const client = await pool.connect();
  try {
    const result = await client.query( `
    SELECT tt.id as "ticketId", 
           tt.owner_id as "ownerId", 
           tu.name as "userName", 
           tt.issue_time as "issueTime"
      FROM t_ticket as tt
      LEFT OUTER JOIN t_user as tu
      ON tu.id = tt.owner_id;
    `);
    return res.status(200).json({
      rows:result.rows,
      rowCount: result.rowCount
    })
  } catch (err) {
    console.error(err);
    res.status(500).send("Error " + err);
  } finally {
    client.release();
  }
}
async function getTicketListByUser (req, res) {
  const client = await pool.connect();
  try {
    let userId = Number(req.params.userId);
    const result = await client.query( `
    SELECT tt.id as ticketId, 
           tt.owner_id, 
           tu.name as userName, 
           tt.issue_time
      FROM t_ticket as tt
      LEFT OUTER JOIN t_user as tu
      ON tu.id = tt.owner_id
     WHERE tu.id = $1;
    `, [userId]);
    return res.status(200).json({
      rows:result.rows,
      rowCount: result.rowCount
    })
  } catch (err) {
    console.error('getTicketListByUser', err);
    res.status(500).send("Error " + err);
  } finally {
    client.release();
  }
}
async function getTicketDetail (req, res) {
  const id = Number(req.params.ticketId);
  if( isNaN(id) ) return res.status(400).send("Error wrong parameter");
  
  const client = await pool.connect();
  try {

    const result = await client.query( `
    SELECT tt.id as "ticketId", 
           tt.owner_id "ownerId", 
           tu.name as "userName", 
           tt.issue_time as "issueTime"
      FROM t_ticket as tt
      LEFT OUTER JOIN t_user as tu
      ON tu.id = tt.owner_id
      WHERE tt.id = $1;
    `, [id]);

    if (result.rowCount === 0 ) return res.status(404).end('Error No Ticket Data');
    
    return res.status(200).json({
      rows:result.rows,
      rowCount: result.rowCount
    })
  } catch (err) {
    console.error('getTicketDetail', err);
    res.status(500).send("Error " + err);
  } finally {
    client.release();
  }
}
async function deleteTicketList (req, res) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      DELETE FROM t_ticket;
    `);
    return res.status(200).json({
      rows:result.rows,
      rowCount: result.rowCount
    })
  } catch (err) {
    console.error('deleteTicketList', err);
    res.send("Error " + err);
  } finally {
    client.release();
  }
}

module.exports.issueNewTicket = issueNewTicket;
module.exports.deleteTicket = deleteTicket;
module.exports.getTicketList = getTicketList;
module.exports.getTicketListByUser = getTicketListByUser;
module.exports.deleteTicketList = deleteTicketList;
module.exports.getTicketDetail = getTicketDetail;