CREATE DATABASE IF NOT EXISTS wallet_database;

CREATE TABLE wallets (
    t_id BIGINT NOT NULL PRIMARY KEY,
    encrypted_key VARCHAR(66) NOT NULL,
    address VARCHAR(42) NOT NULL
);

CREATE TABLE wallet_database (
    t_id BIGINT NOT NULL PRIMARY KEY,
    encrypted_key VARCHAR(255) NOT NULL,
    address VARCHAR(42) NOT NULL
);

CREATE DATABASE test;

CREATE TABLE test_table (
    t_id SERIAL PRIMARY KEY,
    key VARCHAR(255)
);

INSERT INTO wallets (description)
VALUES ('your_private_key');
