const pool = require('./db');
async function issueNewTransfer (req, res) {
  const userId = Number(req.body.userId);
  const ticketId = Number(req.body.ticketId);
  if ( isNaN(userId) || isNaN(ticketId) ) return res.status(400).send('Error invalid parameter');
  
  const client = await pool.connect();
  try {
    const ticketUserInfo = await client.query(`
      SELECT 
        EXISTS( SELECT id FROM t_user WHERE id = $1 ) as "validId", 
        EXISTS( SELECT id FROM t_ticket WHERE id = $2 ) as "validTicketId";
    `, [userId, ticketId]);

    const {validId, validTicketId} =  ticketUserInfo.rows[0];
    if (!validId || !validTicketId) return res.status(404).send('Error invalid user id or ticket id');
    
    const result = await client.query( `
    WITH newT as (
      INSERT INTO t_transfer_ticket(ticket_id, from_user_id) 
           VALUES($1, $2) RETURNING *
    )
    SELECT id,
           ticket_id as "ticketId",
           from_user_id as "fromUserId",
           (select name from t_user where id = newT.from_user_id) as "fromUserName",
           to_user_id as "toUserId",
           null as "toUserName",
           allowance,
           reg_time as "regTime",
           transfer_time as "transferTime"
      FROM newT;
    `, [ticketId, userId]);

    if (result.rowCount === 0) return res.status(404).end('Error Invalid parameter value');

    return res.status(201).json({
      rows:result.rows,
      rowCount: result.rowCount
    })
  } catch (err) {
    console.error('issueNewTransfer', err);
    res.status(500).send("Error " + err);
  } finally {
    client.release();
  }
}
async function getTransferList (req, res) {
  const client = await pool.connect();
  try {
    const result = await client.query( `
    WITH tu as (
      SELECT * FROM t_user
    )
    SELECT ttt.id, 
           ttt.ticket_id as "ticketId", 
           ttt.from_user_id as "fromUserId",
           (select name from tu where tu.id = ttt.from_user_id) as "fromUserName",
           ttt.to_user_id as "toUserId",
           (select name from tu where tu.id = ttt.to_user_id) as "toUserName",
           ttt.allowance, 
           ttt.reg_time as "regTime",
           ttt.transfer_time as "transferTime"
     FROM t_transfer_ticket as ttt;
    `);

    return res.status(200).json({
      rows:result.rows,
      rowCount: result.rowCount
    })
  } catch (err) {
    console.error('getTransferList', err);
    res.status(500).send("Error " + err);
  } finally {
    client.release();
  }
}
async function deleteTransferList (req, res) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      DELETE FROM t_transfer_ticket;
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
async function getTransferDetail (req, res) {
  let id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).send('Error invalid type parameter');
  
  const client = await pool.connect();
  try {
    
    const result = await client.query( `
    WITH tu as (
      SELECT * FROM t_user
    )
    SELECT ttt.id, 
           ttt.ticket_id as "ticketId", 
           ttt.from_user_id as "fromUserId",
           (select name from tu where tu.id = ttt.from_user_id) as "fromUserName",
           ttt.to_user_id as "toUserId",
           (select name from tu where tu.id = ttt.to_user_id) as "toUserName",
           ttt.allowance, 
           ttt.reg_time as "regTime",
           ttt.transfer_time as "transferTime"
     FROM t_transfer_ticket as ttt
     WHERE ttt.id = $1;
    `, [id]);

    if (result.rowCount === 0 ) return res.status(404).send('Error invalid transfer id');

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
async function TransferApply (req, res) {
  const transferId = Number(req.body.transferId);
  const toUserId = Number(req.body.toUserId);
  if (isNaN(transferId) || isNaN(toUserId)) return res.status(400).end('Error invalid parameter');
  
  const client = await pool.connect();
  try {

    const checkInfo = await client.query(`
      WITH ttt AS (
        SELECT * FROM t_transfer_ticket WHERE id = $1
      )
      SELECT 
        EXISTS ( 
          SELECT id from t_user WHERE id = $2
        ) as "validUserId",
        ( SELECT id FROM ttt ) as "transferId",
        ( SELECT from_user_id FROM ttt ) as "fromUserId"
        ;
    `, [transferId, toUserId]);

    if (!checkInfo.rows[0].transferId) return res.status(409).end('Error invalid transfer Id');
    if (!checkInfo.rows[0].validUserId) return res.status(409).end('Error invalid User Id');
    if (checkInfo.rows[0].fromUserId === toUserId) return res.status(409).end('Error can not transfer yourself');

    const result = await client.query(`
      WITH t as (
        UPDATE t_transfer_ticket
          SET 
              to_user_id = $2
        WHERE id = $1 
          AND allowance IS NULL
        RETURNING *
      )
      SELECT
              t.id, 
              t.ticket_id as "ticketId", 
              t.from_user_id as "fromUserId",
              (select name from t_user tu where tu.id = t.from_user_id) as "fromUserName",
              t.to_user_id as "toUserId",
              (select name from t_user tu where tu.id = t.to_user_id) as "toUserName",
              t.allowance, 
              t.reg_time as "regTime",
              t.transfer_time as "transferTime" 
        FROM t;
    `, [transferId, toUserId]);

    const { rows, rowCount } = result;
    return res.status(200).json({
      rows, rowCount
    })
  } catch (err) {
    console.error('TransferApply', err);
    res.status(500).send('Error ' + err);
  } finally {
    client.release();
  }
}
async function TransferApproval (req, res) {
  const id = Number(req.body.transferId);
  const allowance = req.body.allowance;
  if (isNaN(id) || typeof allowance !== 'boolean') 
    return res.status(400).end('Error invalid parameter');
  
  const client = await pool.connect();
  try {
    const transferInfo = await client.query(`
      SELECT EXISTS ( SELECT id FROM t_transfer_ticket WHERE id = $1 ) as "validId";
    `, [id]);

    if (!transferInfo.rows[0].validId) return res.status(404).end('Error invalid transfer id');

    const query = allowance ? 
    `
    WITH t as (
      UPDATE t_transfer_ticket
        SET 
            allowance = $2,
            transfer_time = now()
      WHERE id = $1
        --AND allowance IS NULL
      RETURNING *
    ), tt as (
      UPDATE t_ticket
        SET owner_id = ( SELECT to_user_id FROM t_transfer_ticket WHERE id = $1 )
      WHERE id = ( SELECT ticket_id FROM t_transfer_ticket WHERE id = $1 )
      RETURNING *
    )
    SELECT
            t.id, 
            t.ticket_id as "ticketId", 
            t.from_user_id as "fromUserId",
            (select name from t_user tu where tu.id = t.from_user_id) as "fromUserName",
            t.to_user_id as "toUserId",
            (select name from t_user tu where tu.id = t.to_user_id) as "toUserName",
            t.allowance, 
            t.reg_time as "regTime",
            t.transfer_time as "transferTime" 
      FROM t;
    `
    :
    `
    WITH t as (
      UPDATE t_transfer_ticket
        SET 
            allowance = $2
      WHERE id = $1 
        --AND allowance IS NULL
      RETURNING *
    )
    SELECT
            t.id, 
            t.ticket_id as "ticketId", 
            t.from_user_id as "fromUserId",
            (select name from t_user tu where tu.id = t.from_user_id) as "fromUserName",
            t.to_user_id as "toUserId",
            (select name from t_user tu where tu.id = t.to_user_id) as "toUserName",
            t.allowance, 
            t.reg_time as "regTime",
            t.transfer_time as "transferTime" 
      FROM t;
    `;

    const result = await client.query(query, [id, allowance]);
    const { rows, rowCount } = result;

    return res.status(200).json({
      rows, rowCount
    });
  } catch (err) {
    console.error('TransferApproval', err);
    res.status(500).send('Error ' + err);
  } finally {
    client.release();
  }
}
async function TransferReceive (req, res) {
  const client = await pool.connect();
  try {
    // TODO: check receiver
    const id = req.body.id;
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
    });
  } catch (err) {
    console.error('TransferApproval', err);
    res.status(500).send('Error ' + err);
  } finally {
    client.release();
  }
}


module.exports.issueNewTransfer = issueNewTransfer;
module.exports.getTransferList = getTransferList;
module.exports.deleteTransferList = deleteTransferList;
module.exports.getTransferDetail = getTransferDetail;
module.exports.TransferApply = TransferApply;
module.exports.TransferApproval = TransferApproval;
module.exports.TransferReceive = TransferReceive;