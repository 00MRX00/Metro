CREATE DATABASE metro_db;

CREATE TABLE staff(
    staff_id SERIAL PRIMARY KEY,
    passport VARCHAR(10),
    phone VARCHAR(10),
    firstname VARCHAR(50),
    lastname VARCHAR(50),
    patronymic VARCHAR(50),
    UNIQUE (passport, phone)
);

CREATE TABLE lines(
    line_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    color VARCHAR(255),
    UNIQUE (name, color)
);

CREATE TABLE tickets(
    ticket_id SERIAL PRIMARY KEY,
    trips_count integer,
    balance numeric,
    fit_to date
);

CREATE TABLE stations(
    station_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    line integer,
    UNIQUE (name),
    FOREIGN KEY (line) REFERENCES public.lines (line_id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE station_crossings(
    station1 integer,
    station2 integer,
    FOREIGN KEY (station1) REFERENCES public.stations (station_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (station2) REFERENCES public.stations (station_id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE lost_things(
    thing_id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    staff_found integer,
    station_found integer,
    FOREIGN KEY (staff_found) REFERENCES public.staff (staff_id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (station_found) REFERENCES public.stations (station_id) ON UPDATE CASCADE ON DELETE SET NULL
);