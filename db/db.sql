CREATE DATABASE metro_db;

CREATE TABLE staff(
    staff_id SERIAL PRIMARY KEY NOT NULL,
    passport character varying(10) COLLATE pg_catalog."default" NOT NULL,
    phone character varying(10) COLLATE pg_catalog."default" NOT NULL,
    firstname character varying(50) COLLATE pg_catalog."default" NOT NULL,
    lastname character varying(50) COLLATE pg_catalog."default" NOT NULL,
    patronymic character varying(50) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT passport_unique UNIQUE (passport),
    CONSTRAINT phone_unique UNIQUE (phone),
    CONSTRAINT staff_passport_length CHECK (length(passport::text) = 10),
    CONSTRAINT staff_phone_length CHECK (length(phone::text) = 10)
);

CREATE TABLE lines(
    line_id SERIAL PRIMARY KEY NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    color character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT color_unique UNIQUE (color),
    CONSTRAINT name_unique UNIQUE (name),
    CONSTRAINT lines_name_length CHECK (length(name::text) >= 3) NOT VALID,
    CONSTRAINT lines_color_length CHECK (length(color::text) >= 3) NOT VALID
);

CREATE TABLE tickets(
    ticket_id SERIAL PRIMARY KEY NOT NULL,
    trips_count integer NOT NULL,
    balance numeric NOT NULL,
    fit_to timestamp without time zone NOT NULL,
    CONSTRAINT trips_count CHECK (trips_count <= 200)
);

CREATE TABLE stations(
    station_id SERIAL PRIMARY KEY NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    line integer NOT NULL,
    CONSTRAINT stations_name_unique UNIQUE (name, line),
    CONSTRAINT stations_line_fkey FOREIGN KEY (line)
        REFERENCES public.lines (line_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT stations_name_length CHECK (length(name::text) >= 3) NOT VALID
);

CREATE TABLE station_crossings(
    station1 integer NOT NULL,
    station2 integer NOT NULL,
    CONSTRAINT station_crossing_unique UNIQUE (station1, station2),
    CONSTRAINT station_crossings_station1_fkey FOREIGN KEY (station1)
        REFERENCES public.stations (station_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT station_crossings_station2_fkey FOREIGN KEY (station2)
        REFERENCES public.stations (station_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE lost_things(
    thing_id SERIAL PRIMARY KEY NOT NULL,
    title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    staff_found integer NOT NULL,
    station_found integer NOT NULL,
    CONSTRAINT lost_things_staff_found_fkey FOREIGN KEY (staff_found)
        REFERENCES public.staff (staff_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT lost_things_station_found_fkey FOREIGN KEY (station_found)
        REFERENCES public.stations (station_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT lost_things_title_length CHECK (length(title::text) >= 3) NOT VALID
);

CREATE OR REPLACE FUNCTION public.check_st_cross(
	integer,
	integer)
    RETURNS boolean
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE 
    
AS $BODY$DECLARE
	st_cr_count integer;
BEGIN
SELECT COUNT(*)
INTO st_cr_count
FROM station_crossings
WHERE station1 = $2 and station2 = $1;

IF st_cr_count > 0 THEN
	RAISE EXCEPTION 'такое пересечение уже существует';
ELSE 
	INSERT INTO station_crossings (station1, station2) VALUES ($1, $2);
END IF;
RETURN TRUE;
END;
$BODY$;