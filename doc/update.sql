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