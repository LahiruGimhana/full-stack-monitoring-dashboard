-- schema.sql

-- Create app
CREATE TABLE IF NOT EXISTS app (
    aid INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    ip TEXT NOT NULL,
    rest_port INTEGER NOT NULL,
    ws_port INTEGER NOT NULL,
    prof_port INTEGER NOT NULL,
    zid TEXT NOT NULL, 
    key TEXT NOT NULL, 
    desc TEXT NOT NULL,
    enable INTEGER NOT NULL,
    cid INTEGER NOT NULL,
    FOREIGN KEY (cid) REFERENCES company(cid)  -- Adding foreign key constraint
);

-- Create user
CREATE TABLE IF NOT EXISTS user (
    uid INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    hashed_password TEXT NOT NULL,
    enable INTEGER NOT NULL,
    cid INTEGER NOT NULL,
    utid INTEGER NOT NULL,
    FOREIGN KEY (cid) REFERENCES company(cid),  -- Adding foreign key constraint
    FOREIGN KEY (utid) REFERENCES userRole(utid)     -- Adding foreign key constraint
);

INSERT INTO user (name, email, hashed_password, enable, cid, utid)
VALUES ('super-admin','super-admin@gamail.com','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',1,'*',0);  

-- Create userRoleTble
CREATE TABLE IF NOT EXISTS userRole (
    utid INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL
);

-- Insert initial data into userRole table
INSERT INTO userRole (utid, type) VALUES (0, 'super_admin');
INSERT INTO userRole (utid, type) VALUES (1, 'admin');
INSERT INTO userRole (utid, type) VALUES (2, 'user');

-- Create company
CREATE TABLE IF NOT EXISTS company (
    cid INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    enable INTEGER NOT NULL
);


-- Create appUnitTable
CREATE TABLE IF NOT EXISTS appUnit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cid INTEGER NOT NULL,
    zid TEXT NOT NULL,
    uname TEXT NOT NULL,
    pool_size INTEGER NOT NULL,
    enable INTEGER NOT NULL,
    ifname TEXT NOT NULL,
    path INTEGER NOT NULL,
    name INTEGER NOT NULL,
    FOREIGN KEY (cid) REFERENCES company(cid)  -- Adding foreign key constraint
);