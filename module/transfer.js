const pool = require('./db');
async function issueNewTransfer (req, res) {
  try {
    const userId = Number(req.body.userId);
    const ticketId = Number(req.body.ticketId);
    console.log('userId', userId);
    console.log('ticketId', ticketId);
    console.log('ticketId', req.body);
    const client = await pool.connect()
    const result = await client.query( `
    WITH newT as (
      INSERT INTO t_transfer_ticket(ticketId, idFrom) VALUES($1, $2) RETURNING *
    )
    SELECT * FROM newT;
    `, [ticketId, userId]);
    client.release();
    console.log('result', result);
    return res.status(200).json({
      rows:result.rows,
      rowCount: result.rowCount
    })
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
}
async function getTransferList (req, res) {
  try {
    const client = await pool.connect();
    const result = await client.query( `
    WITH tu as (
      SELECT * FROM t_user
    )
    SELECT ttt.id as transferId, ttt.ticketId as ticketId, 
           ttt.idFrom,
           (select name from tu where tu.id = ttt.idFrom) as nameFrom,
           ttt.idTo,
           (select name from tu where tu.id = ttt.idTo) as nameTo,
           ttt.allowance, ttt.regTime, ttt.transferTime
     FROM t_transfer_ticket as ttt;
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
async function deleteTransferList (req, res) {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      DELETE FROM t_transfer_ticket;
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
async function getTransferDetail (req, res) {
  try {
    let id = Number(req.params.id);
    const client = await pool.connect();
    const result = await client.query( `
    WITH tu as (
      SELECT * FROM t_user
    )
    SELECT ttt.id as transferId, ttt.ticketId as ticketId, 
           ttt.idFrom,
           (select name from tu where tu.id = ttt.idFrom) as nameFrom,
           ttt.idTo,
           (select name from tu where tu.id = ttt.idTo) as nameTo,
           ttt.allowance, ttt.regTime, ttt.transferTime
     FROM t_transfer_ticket as ttt
     WHERE ttt.id = $1;
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
async function TransferApply (req, res) {
  try {
    const id = req.body.id;
    const idTo = req.body.idTo;
    const client = await pool.connect();
    const result = await client.query(`
      WITH t as (
        UPDATE t_transfer_ticket
          SET 
              idTo = $2
        WHERE id = $1 
          AND allowance IS NULL
        RETURNING *
      )
      SELECT * FROM t;
    `, [id, idTo]);
    client.release();
    const { rows, rowCount } = result;
    return res.status(200).json({
      rows, rowCount
    })
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
}
async function TransferApproval (req, res) {
  try {
    const id = req.body.id;
    const allowance = req.body.allowance;
    const client = await pool.connect();
    const query = allowance ? 
    `WITH ttt as (
      UPDATE t_transfer_ticket
        SET 
            allowance = $2,
            transferTime = now()
      WHERE id = $1
        --AND allowance IS NULL
      RETURNING *
    ), tt as (
      UPDATE t_ticket
        SET ownerId = ( SELECT idTo FROM t_transfer_ticket WHERE id = $1 )
      WHERE id = ( SELECT ticketId FROM t_transfer_ticket WHERE id = $1 )
      RETURNING *
    )
    SELECT * FROM ttt;` 
    : 
    `WITH t as (
      UPDATE t_transfer_ticket
        SET 
            allowance = $2
      WHERE id = $1 
        --AND allowance IS NULL
      RETURNING *
    )
    SELECT * FROM t;`;
    const result = await client.query(query, [id, allowance]);
    client.release();
    const { rows, rowCount } = result;
    return res.status(200).json({
      rows, rowCount
    });
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
}
async function TransferReceive (req, res) {
  try {
    // TODO: check receiver
    const id = req.body.id;
    const client = await pool.connect();
    const result = await client.query(`
      WITH transfer as (
        UPDATE t_ticket
          SET ownerId = ( SELECT idTo FROM t_transfer_ticket WHERE id = $1 )
        WHERE id = ( SELECT ticketId FROM t_transfer_ticket WHERE id = $1 )
        RETURNING *
      )
      SELECT * FROM transfer;
    `, [id]);
    client.release();
    const { rows, rowCount } = result;
    return res.status(200).json({
      rows, rowCount
    })
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
}


module.exports.issueNewTransfer = issueNewTransfer;
module.exports.getTransferList = getTransferList;
module.exports.deleteTransferList = deleteTransferList;
module.exports.getTransferDetail = getTransferDetail;
module.exports.TransferApply = TransferApply;
module.exports.TransferApproval = TransferApproval;
module.exports.TransferReceive = TransferReceive;