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