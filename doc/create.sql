-- User Table
CREATE TABLE t_user (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50),
  password VARCHAR(20) NOT NULL
);

-- Ticket Table
CREATE TABLE t_ticket (
  id SERIAL PRIMARY KEY,
  ownerId integer,
  issueTime timestamp without time zone NOT NULL default (now() at time zone 'utc')
);

-- Transfer Ticket Table
CREATE TABLE t_transfer_ticket (
  id SERIAL PRIMARY KEY,
  ticketId integer NOT NULL,
  idFrom integer NOT NULL,
  idTo integer DEFAULT NULL,
  allowance boolean DEFAULT NULL,
  regTime timestamp without time zone NOT NULL default (now() at time zone 'utc'),
  transferTime timestamp without time zone default NULL
);