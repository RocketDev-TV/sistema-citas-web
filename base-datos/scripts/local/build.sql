SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='citas';

DROP DATABASE IF EXISTS "citas";

CREATE DATABASE "citas";

\c citas
BEGIN;
CREATE EXTENSION postgis;
\i create.sql
\i catalogos.sql
COMMIT;