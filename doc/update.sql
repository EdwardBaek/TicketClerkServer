-- ADD password column in user table 
ALTER TABLE t_user ADD password VARCHAR(20);
ALTER TABLE t_user ALTER password SET NOT NULL;

-- ALTER camel notaion to underscore notaion
-- User table
ALTER TABLE t_ticket RENAME COLUMN ownerid TO owner_id;
ALTER TABLE t_ticket RENAME COLUMN issuetime TO issue_time;
-- Transfer table
ALTER TABLE t_transfer_ticket RENAME COLUMN ticketId TO ticket_id;
ALTER TABLE t_transfer_ticket RENAME COLUMN idFrom TO id_from;
ALTER TABLE t_transfer_ticket RENAME COLUMN idTo TO id_to;
ALTER TABLE t_transfer_ticket RENAME COLUMN regTime TO reg_time;
ALTER TABLE t_transfer_ticket RENAME COLUMN transferTime TO transfer_time;

-- Modify column regulation
ALTER TABLE t_transfer_ticket RENAME COLUMN id_from TO from_id;
ALTER TABLE t_transfer_ticket RENAME COLUMN id_to TO to_id;

-- Modify column specific
ALTER TABLE t_transfer_ticket RENAME COLUMN from_id TO from_user_id;
ALTER TABLE t_transfer_ticket RENAME COLUMN to_id TO to_user_id;

-- ADD foreign key to ticket
-- data backup
CREATE TABLE t_b_ticket (
  id INTEGER,
  owner_id INTEGER,
  issue_time timestamp without time zone,
  backup_time timestamp without time zone NOT NULL default (now() at time zone 'utc')
);

-- DELETE ticket data with wrong user id
WITH td AS (
  DELETE FROM t_ticket WHERE owner_id NOT IN (SELECT id from t_user)
  RETURNING *
)
INSERT INTO t_b_ticket (id, owner_id, issue_time)
    SELECT td.id, td.owner_id, td.issue_time FROM td;

-- ADD constraint foreign key to owner_id
ALTER TABLE t_ticket
  ADD CONSTRAINT fk_user_id
  FOREIGN KEY (owner_id)
  REFERENCES t_user (id);


-- ADD foreign key to ticket
-- DELETE transfer data with wrong ticket id
DROP TABLE t_b_transfer_ticket;
CREATE TABLE t_b_transfer_ticket (
  id integer,
  ticket_id integer,
  from_user_id integer,
  to_user_id integer DEFAULT NULL,
  allowance boolean DEFAULT NULL,
  reg_time timestamp without time zone NOT NULL,
  transfer_time timestamp without time zone default NULL,
  backup_time timestamp without time zone NOT NULL default (now() at time zone 'utc')
);
-- Backup data
WITH td AS (
  DELETE FROM t_transfer_ticket WHERE ticket_id NOT IN (SELECT id from t_ticket)
  RETURNING *
)
INSERT INTO t_b_transfer_ticket
    SELECT * FROM td;

-- ADD constraint foreign key to 
ALTER TABLE t_transfer_ticket
  ADD CONSTRAINT fk_ticket_id FOREIGN KEY (ticket_id) REFERENCES t_ticket (id);



-- Modify constraint foreign key of owner_id
ALTER TABLE t_ticket
  DROP CONSTRAINT fk_user_id;
--ALTER TABLE t_ticket
--  ADD CONSTRAINT fk_user_id
--  FOREIGN KEY (owner_id)
--  REFERENCES t_user (id) ON DELETE SET NULL;

ALTER TABLE t_transfer_ticket
  DROP CONSTRAINT fk_ticket_id;
--ALTER TABLE t_transfer_ticket
--  ADD CONSTRAINT fk_ticket_id 
--  FOREIGN KEY (ticket_id) 
--  REFERENCES t_ticket (id) ON DELETE SET NULL;
