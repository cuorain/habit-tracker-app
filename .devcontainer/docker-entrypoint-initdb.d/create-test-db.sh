#!/bin/bash
set -e

# Wait for PostgreSQL to be ready
until pg_isready -h localhost -U "$POSTGRES_USER"; do
  echo "Waiting for PostgreSQL..."
  sleep 1
done

# Create the test database if it doesn't exist
echo "Creating database: $POSTGRES_DB_TEST"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE "$POSTGRES_DB_TEST";
EOSQL

