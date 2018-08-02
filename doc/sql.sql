-- User Table
CREATE TABLE t_user (
  id SERIAL PRIMARY KEY,
  name varchar(50)
);
INSERT INTO t_user(name) VALUES('EDWARD');
INSERT INTO t_user(name) VALUES('YOYO');
INSERT INTO t_user(name) VALUES('DORIS');

CREATE TABLE t_ticket (
  id SERIAL PRIMARY KEY,
  ownerId integer,
  issueTime timestamp without time zone NOT NULL default (now() at time zone 'utc')
);
INSERT INTO t_ticket(ownerId) VALUES(1);
INSERT INTO t_ticket(ownerId) VALUES(2);

-- Ticket List
SELECT tt.id as ticketId, tu.id as userId, tu.name as userName, tt.issueTime
 FROM t_ticket as tt
 LEFT OUTER JOIN t_user as tu
 ON tu.id = tt.ownerid;

 -- New Ticket
WITH newTicket AS (
  INSERT INTO t_ticket(ownerId) VALUES(1) RETURNING *
)
SELECT tnt.id as ticketId, tu.id as userId, tu.name as userName, tnt.issuetime
  FROM newTicket as tnt, t_user as tu
 WHERE tnt.ownerId = tu.id;


-- select id, ownerId, issueTime at time zone 'utc' at time zone 'Asia/Taipei' from t_ticket;
-- select id, ownerId, issueTime at time zone 'Asia/Taipei' as issueTime from t_ticket;

CREATE TABLE t_transfer_ticket (
  id SERIAL PRIMARY KEY,
  ticketId integer NOT NULL,
  idFrom integer NOT NULL,
  idTo integer DEFAULT NULL,
  allowance boolean DEFAULT NULL,
  regTime timestamp without time zone NOT NULL default (now() at time zone 'utc'),
  transferTime timestamp without time zone default NULL
);

INSERT INTO t_transfer_ticket(ticketId, idFrom) VALUES(1, 1);

-- Transfer List
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
 
-- New Transfer Ticket
WITH newT as (
  INSERT INTO t_transfer_ticket(ticketId, idFrom) VALUES(2, 1) RETURNING *
)
SELECT * FROM newT;

BEGIN
IF EXISTS (SELECT * FROM t_transfer_ticket WHERE ticketId = 2)
  UPDATE t_transfer_ticket SET idFrom = 1 WHERE ticketId = 2
ELSE
  INSERT INTO t_transfer_ticket(ticketId, idFrom) VALUES(2, 1)
END IF
END

-- Update Transfer Ticket Receiver Info
--
-- UPDATE t_transfer_ticket
--     SET 
--         allowance = true,
--         idTo = NULL,
--         transferTime = NULL
--   WHERE id = 1 

WITH t as (
  UPDATE t_transfer_ticket
    SET 
        allowance = true,
        idTo = 2,
        transferTime = now()
  WHERE id = 1 
    AND allowance = false
  RETURNING *
)
SELECT * FROM t;

WITH t as (
  UPDATE t_transfer_ticket
    SET 
        idTo = 2,
        transferTime = now()
  WHERE id = 1 
    --AND allowance = null
  RETURNING *
)
SELECT * FROM t;


-- Transfer ticket from to
WITH transfer as (
  UPDATE t_ticket
     SET ownerId = ( SELECT idTo FROM t_transfer_ticket WHERE id = 1 )
  WHERE id = 1
  RETURNING *
)
SELECT * FROM transfer;




WITH transfer as (
  UPDATE t_ticket
    SET ownerId = ( SELECT idTo FROM t_transfer_ticket WHERE id = 3 )
  WHERE id = ( SELECT ticketId FROM t_transfer_ticket WHERE id = 3 )
  RETURNING *
)
SELECT * FROM transfer;



WITH ttt as (
  UPDATE t_transfer_ticket
    SET 
        allowance = true,
        transferTime = now()
  WHERE id = 12 
    AND allowance IS NULL
  RETURNING *
), tt as (
  UPDATE t_ticket
    SET ownerId = ( SELECT idTo FROM t_transfer_ticket WHERE id = 12 )
  WHERE id = ( SELECT ticketId FROM t_transfer_ticket WHERE id = 12 )
  RETURNING *
)
SELECT * FROM tt;


WITH transfer as (
  UPDATE t_ticket
    SET ownerId = ( SELECT idTo FROM t_transfer_ticket WHERE id = $1 )
  WHERE id = ( SELECT ticketId FROM t_transfer_ticket WHERE id = $1 )
  RETURNING *
)
SELECT * FROM transfer;



WITH t as (
  UPDATE t_transfer_ticket
    SET 
        allowance = false
  WHERE id = 18
    AND allowance IS NULL
  RETURNING *
)
SELECT * FROM t