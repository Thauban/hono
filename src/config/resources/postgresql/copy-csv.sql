-- Aufruf:   psql --dbname=soldat --username=postgres --file=/init/soldat/sql/copy-csv.sql

SET search_path TO soldat;

-- https://www.postgresql.org/docs/current/sql-copy.html
COPY soldat FROM '/init/soldat/csv/soldat.csv' (FORMAT csv, DELIMITER ';', HEADER true);
COPY ausruestung FROM '/init/soldat/csv/ausruestung.csv' (FORMAT csv, DELIMITER ';', HEADER true);
COPY verletzung FROM '/init/soldat/csv/verletzung.csv' (FORMAT csv, DELIMITER ';', HEADER true);
