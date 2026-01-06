--
-- PostgreSQL database dump
--

\restrict DfjtrC3vcVgHSmq1pf5lk27lHdDWWudVOxElLOubFb1kEWJq7OGYs40pHRpmKbQ

-- Dumped from database version 14.20 (Ubuntu 14.20-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.20 (Ubuntu 14.20-0ubuntu0.22.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cca01_genero; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cca01_genero (
    id_genero integer NOT NULL,
    tx_nombre character varying(50) NOT NULL,
    tx_descripcion character varying(255) NOT NULL,
    st_activo boolean NOT NULL
);


ALTER TABLE public.cca01_genero OWNER TO postgres;

--
-- Name: cca02_rol; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cca02_rol (
    id_rol integer NOT NULL,
    tx_nombre character varying(50) NOT NULL,
    tx_descripcion character varying(255) NOT NULL,
    st_activo boolean NOT NULL
);


ALTER TABLE public.cca02_rol OWNER TO postgres;

--
-- Name: cci01_servicio_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cci01_servicio_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cci01_servicio_id_seq OWNER TO postgres;

--
-- Name: cci01_servicio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cci01_servicio (
    id_servicio integer DEFAULT nextval('public.cci01_servicio_id_seq'::regclass) NOT NULL,
    tx_nombre character varying(50) NOT NULL,
    tx_descripcion character varying(255) NOT NULL,
    st_activo integer NOT NULL,
    nu_duracion integer NOT NULL,
    nu_precio numeric(10,2)
);


ALTER TABLE public.cci01_servicio OWNER TO postgres;

--
-- Name: tca01_persona; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tca01_persona (
    id_persona integer NOT NULL,
    fk_id_genero integer NOT NULL,
    tx_nombre character varying(100) NOT NULL,
    tx_primer_apellido character varying(100) NOT NULL,
    tx_segundo_apellido character varying(100),
    fh_nacimiento date NOT NULL,
    tx_correo character varying(150)
);


ALTER TABLE public.tca01_persona OWNER TO postgres;

--
-- Name: tca01_persona_id_persona_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tca01_persona_id_persona_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tca01_persona_id_persona_seq OWNER TO postgres;

--
-- Name: tca01_persona_id_persona_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tca01_persona_id_persona_seq OWNED BY public.tca01_persona.id_persona;


--
-- Name: tca02_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tca02_usuario (
    id_usuario integer NOT NULL,
    fk_id_rol integer NOT NULL,
    tx_login character varying(100) NOT NULL,
    tx_password character varying(255) NOT NULL,
    st_activo boolean NOT NULL,
    tx_token_verificacion character varying(10),
    nu_intentos integer DEFAULT 0,
    fh_desbloqueo timestamp without time zone
);


ALTER TABLE public.tca02_usuario OWNER TO postgres;

--
-- Name: tce01_establecimiento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tce01_establecimiento (
    id_establecimiento integer NOT NULL,
    tx_nombre character varying(100) NOT NULL
);


ALTER TABLE public.tce01_establecimiento OWNER TO postgres;

--
-- Name: tce01_establecimiento_id_establecimiento_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tce01_establecimiento_id_establecimiento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tce01_establecimiento_id_establecimiento_seq OWNER TO postgres;

--
-- Name: tce01_establecimiento_id_establecimiento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tce01_establecimiento_id_establecimiento_seq OWNED BY public.tce01_establecimiento.id_establecimiento;


--
-- Name: tce02_sucursal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tce02_sucursal (
    id_sucursal integer NOT NULL,
    fk_id_establecimiento integer NOT NULL,
    tx_nombre character varying(100) NOT NULL,
    gm_ubicacion public.geometry,
    st_activo boolean DEFAULT true
);


ALTER TABLE public.tce02_sucursal OWNER TO postgres;

--
-- Name: tce02_sucursal_id_sucursal_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tce02_sucursal_id_sucursal_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tce02_sucursal_id_sucursal_seq OWNER TO postgres;

--
-- Name: tce02_sucursal_id_sucursal_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tce02_sucursal_id_sucursal_seq OWNED BY public.tce02_sucursal.id_sucursal;


--
-- Name: tce03_empleado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tce03_empleado (
    id_empleado integer NOT NULL,
    fk_id_sucursal integer NOT NULL,
    st_activo integer DEFAULT 1
);


ALTER TABLE public.tce03_empleado OWNER TO postgres;

--
-- Name: tce04_dia_laboral; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tce04_dia_laboral (
    id_dia integer NOT NULL,
    tx_nombre character varying(50) NOT NULL,
    tx_descripcion character varying(255) NOT NULL,
    st_activo integer NOT NULL
);


ALTER TABLE public.tce04_dia_laboral OWNER TO postgres;

--
-- Name: tce04_dia_laboral_id_dia_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tce04_dia_laboral_id_dia_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tce04_dia_laboral_id_dia_seq OWNER TO postgres;

--
-- Name: tce04_dia_laboral_id_dia_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tce04_dia_laboral_id_dia_seq OWNED BY public.tce04_dia_laboral.id_dia;


--
-- Name: tce05_dia_descanso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tce05_dia_descanso (
    id_dia_descanso integer NOT NULL,
    fk_id_empleado integer NOT NULL,
    fh_descanso date NOT NULL
);


ALTER TABLE public.tce05_dia_descanso OWNER TO postgres;

--
-- Name: tce05_dia_descanso_id_dia_descanso_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tce05_dia_descanso_id_dia_descanso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tce05_dia_descanso_id_dia_descanso_seq OWNER TO postgres;

--
-- Name: tce05_dia_descanso_id_dia_descanso_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tce05_dia_descanso_id_dia_descanso_seq OWNED BY public.tce05_dia_descanso.id_dia_descanso;


--
-- Name: tce06_empleado_horario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tce06_empleado_horario (
    fk_id_horario integer NOT NULL,
    fk_id_persona integer NOT NULL
);


ALTER TABLE public.tce06_empleado_horario OWNER TO postgres;

--
-- Name: tce07_bloque_cita; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tce07_bloque_cita (
    fk_id_sucursal integer NOT NULL,
    fk_id_cita integer,
    fh_inicio timestamp without time zone NOT NULL,
    fh_fin timestamp without time zone NOT NULL
);


ALTER TABLE public.tce07_bloque_cita OWNER TO postgres;

--
-- Name: tce08_horario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tce08_horario (
    id_horario integer NOT NULL,
    fk_id_sucursal integer NOT NULL,
    fk_id_dia integer NOT NULL,
    tm_inicio time without time zone NOT NULL,
    tm_fin time without time zone NOT NULL
);


ALTER TABLE public.tce08_horario OWNER TO postgres;

--
-- Name: tce08_horario_id_horario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tce08_horario_id_horario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tce08_horario_id_horario_seq OWNER TO postgres;

--
-- Name: tce08_horario_id_horario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tce08_horario_id_horario_seq OWNED BY public.tce08_horario.id_horario;


--
-- Name: tci01_estado_lista_precio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tci01_estado_lista_precio (
    id_estado integer NOT NULL,
    tx_nombre character varying(50) NOT NULL
);


ALTER TABLE public.tci01_estado_lista_precio OWNER TO postgres;

--
-- Name: tci01_estado_lista_precio_id_estado_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tci01_estado_lista_precio_id_estado_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tci01_estado_lista_precio_id_estado_seq OWNER TO postgres;

--
-- Name: tci01_estado_lista_precio_id_estado_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tci01_estado_lista_precio_id_estado_seq OWNED BY public.tci01_estado_lista_precio.id_estado;


--
-- Name: tci02_servicio_lista_precio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tci02_servicio_lista_precio (
    fk_id_servicio integer NOT NULL,
    fk_id_lista_precio integer NOT NULL,
    nu_precio integer NOT NULL
);


ALTER TABLE public.tci02_servicio_lista_precio OWNER TO postgres;

--
-- Name: tci03_lista_precio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tci03_lista_precio (
    id_lista_precio integer NOT NULL,
    fk_id_estado integer NOT NULL,
    tx_nombre character varying(50) NOT NULL,
    fh_inicio timestamp without time zone NOT NULL,
    fh_fin timestamp without time zone
);


ALTER TABLE public.tci03_lista_precio OWNER TO postgres;

--
-- Name: tci03_lista_precio_id_lista_precio_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tci03_lista_precio_id_lista_precio_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tci03_lista_precio_id_lista_precio_seq OWNER TO postgres;

--
-- Name: tci03_lista_precio_id_lista_precio_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tci03_lista_precio_id_lista_precio_seq OWNED BY public.tci03_lista_precio.id_lista_precio;


--
-- Name: tci05_cita; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tci05_cita (
    id_cita integer NOT NULL,
    fk_id_persona integer NOT NULL,
    fk_id_servicio integer NOT NULL,
    fk_id_lista_precio integer NOT NULL,
    fk_id_sucursal integer NOT NULL,
    fk_id_empleado integer NOT NULL
);


ALTER TABLE public.tci05_cita OWNER TO postgres;

--
-- Name: tci05_cita_id_cita_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tci05_cita_id_cita_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tci05_cita_id_cita_seq OWNER TO postgres;

--
-- Name: tci05_cita_id_cita_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tci05_cita_id_cita_seq OWNED BY public.tci05_cita.id_cita;


--
-- Name: tca01_persona id_persona; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tca01_persona ALTER COLUMN id_persona SET DEFAULT nextval('public.tca01_persona_id_persona_seq'::regclass);


--
-- Name: tce01_establecimiento id_establecimiento; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tce01_establecimiento ALTER COLUMN id_establecimiento SET DEFAULT nextval('public.tce01_establecimiento_id_establecimiento_seq'::regclass);


--
-- Name: tce02_sucursal id_sucursal; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tce02_sucursal ALTER COLUMN id_sucursal SET DEFAULT nextval('public.tce02_sucursal_id_sucursal_seq'::regclass);


--
-- Name: tce04_dia_laboral id_dia; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tce04_dia_laboral ALTER COLUMN id_dia SET DEFAULT nextval('public.tce04_dia_laboral_id_dia_seq'::regclass);


--
-- Name: tce05_dia_descanso id_dia_descanso; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tce05_dia_descanso ALTER COLUMN id_dia_descanso SET DEFAULT nextval('public.tce05_dia_descanso_id_dia_descanso_seq'::regclass);


--
-- Name: tce08_horario id_horario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tce08_horario ALTER COLUMN id_horario SET DEFAULT nextval('public.tce08_horario_id_horario_seq'::regclass);


--
-- Name: tci01_estado_lista_precio id_estado; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tci01_estado_lista_precio ALTER COLUMN id_estado SET DEFAULT nextval('public.tci01_estado_lista_precio_id_estado_seq'::regclass);


--
-- Name: tci03_lista_precio id_lista_precio; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tci03_lista_precio ALTER COLUMN id_lista_precio SET DEFAULT nextval('public.tci03_lista_precio_id_lista_precio_seq'::regclass);


--
-- Name: tci05_cita id_cita; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tci05_cita ALTER COLUMN id_cita SET DEFAULT nextval('public.tci05_cita_id_cita_seq'::regclass);


--
-- Data for Name: cca01_genero; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cca01_genero (id_genero, tx_nombre, tx_descripcion, st_activo) FROM stdin;
1	Hombre	Hombre	t
2	Mujer	Mujer	t
\.


--
-- Data for Name: cca02_rol; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cca02_rol (id_rol, tx_nombre, tx_descripcion, st_activo) FROM stdin;
1	Admin	Admin	t
2	Empleado	Empleado	t
3	Cliente	Cliente	t
\.


--
-- Data for Name: cci01_servicio; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cci01_servicio (id_servicio, tx_nombre, tx_descripcion, st_activo, nu_duracion, nu_precio) FROM stdin;
4	Rapado Navaja Libre	Afeitado craneal completo con navaja libre, aceites esenciales y masaje.	1	40	200.00
2	Ritual de Barba	Toalla caliente, aceites esenciales, perfilado con navaja y bálsamo.	1	30	200.00
6	Colorimetría / Tinte	Oculta canas o cambia de look. Incluye lavado y tratamiento hidratante.	1	90	600.00
3	Combo Rey (Corte + Barba)	Servicio completo con toalla caliente, mascarilla negra y bebida de cortesía.	1	60	455.00
7	Ej servicio	Servicio ej	0	25	150.00
5	Perfilado de Ceja & Oreja	Detallado fino con navaja y cera para una apariencia impecable.	1	20	250.00
1	Corte de Cabello	Corte básico de caballero	1	30	180.00
8	Ej	Ej	0	40	100.00
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: tca01_persona; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tca01_persona (id_persona, fk_id_genero, tx_nombre, tx_primer_apellido, tx_segundo_apellido, fh_nacimiento, tx_correo) FROM stdin;
100	1	Aldo	Pruebas	\N	2000-01-01	\N
2	1	Ivan	Rex	\N	2003-06-16	\N
6	2	El pecas	xddd	\N	2025-12-28	pecasxd@gmail.com
1	1	Ivan Admin	Herr	Gom	2003-06-16	\N
4	1	Ricardo 	Aguas	Tinoco	2004-12-22	\N
9	1	Empleado	Prub	New	2025-12-30	\N
3	1	Ivan	Staff 	Opc	2025-12-08	\N
10	1	Prueba	Staff	New	2026-01-05	\N
12	1	Alex	Gonz	Gar	2026-01-05	\N
13	1	Axel	Gonz	Gar	2026-01-05	\N
14	1	New	Prueba	2	2026-01-05	\N
16	1	Pruebas	user	new	2026-01-05	\N
\.


--
-- Data for Name: tca02_usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tca02_usuario (id_usuario, fk_id_rol, tx_login, tx_password, st_activo, tx_token_verificacion, nu_intentos, fh_desbloqueo) FROM stdin;
3	2	ivan_staff	1ARVn2Auq2/WAqx2gNrL+q3RNjAzXpUfCXrzkA6d4Xa22yhRLy4AC50E+6UTPoscbo31nbOoq51gvkuXzJ6B2w==	t	\N	0	\N
1	2	recepcion_1	1ARVn2Auq2/WAqx2gNrL+q3RNjAzXpUfCXrzkA6d4Xa22yhRLy4AC50E+6UTPoscbo31nbOoq51gvkuXzJ6B2w==	t	\N	0	\N
100	1	ivanadm	1ARVn2Auq2/WAqx2gNrL+q3RNjAzXpUfCXrzkA6d4Xa22yhRLy4AC50E+6UTPoscbo31nbOoq51gvkuXzJ6B2w==	t	\N	0	\N
16	2	prueba_staff	PJkJr+wlNU1VHa4hWQuybjjVPyFzuNPcPu5MBH56scHri4UQPjvnumE7MbtcnDYhTcnxSkL9ei/bhIVrylxEwg==	t	\N	0	\N
9	2	Pruebas	Yk36S9IaHFchnKZDrGiaL69MB73YRmgbSMUnZMPMZyn09ddh+Q0ggQ/TRBs6C/CAJp8ATHNLzbWo6UUVislNRw==	t	\N	0	\N
4	3	richi	1ARVn2Auq2/WAqx2gNrL+q3RNjAzXpUfCXrzkA6d4Xa22yhRLy4AC50E+6UTPoscbo31nbOoq51gvkuXzJ6B2w==	t	\N	0	\N
2	3	Ivan	1ARVn2Auq2/WAqx2gNrL+q3RNjAzXpUfCXrzkA6d4Xa22yhRLy4AC50E+6UTPoscbo31nbOoq51gvkuXzJ6B2w==	t	\N	0	\N
6	3	pecas	yB6ktCpuKTPs1jKJN9BYAUjKcLHTq1GWabCOfFSZOhSh7C8sXdhg1Kk2+FAj3aEnXtcOpUGaCZJZrxkEafgDDQ==	t	\N	0	\N
14	2	axelito	PJkJr+wlNU1VHa4hWQuybjjVPyFzuNPcPu5MBH56scHri4UQPjvnumE7MbtcnDYhTcnxSkL9ei/bhIVrylxEwg==	t	\N	0	\N
13	2	axel	PJkJr+wlNU1VHa4hWQuybjjVPyFzuNPcPu5MBH56scHri4UQPjvnumE7MbtcnDYhTcnxSkL9ei/bhIVrylxEwg==	t	\N	0	\N
\.


--
-- Data for Name: tce01_establecimiento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tce01_establecimiento (id_establecimiento, tx_nombre) FROM stdin;
1	IPN Central
\.


--
-- Data for Name: tce02_sucursal; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tce02_sucursal (id_sucursal, fk_id_establecimiento, tx_nombre, gm_ubicacion, st_activo) FROM stdin;
1	1	Sucursal UPIICSA	0101000000C442AD69DEC558C0DAACFA5C6D653340	t
6	1	Sucursal Norte	\N	t
7	1	Sucursal Oriente	\N	t
8	1	Sucursal Sur	\N	t
9	1	Sucursal Prueba	\N	f
12	1	Sucursal UPIICSA 2	\N	f
\.


--
-- Data for Name: tce03_empleado; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tce03_empleado (id_empleado, fk_id_sucursal, st_activo) FROM stdin;
1	1	1
3	1	1
10	8	1
100	12	1
12	7	0
13	7	0
14	12	0
9	6	0
16	6	1
\.


--
-- Data for Name: tce04_dia_laboral; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tce04_dia_laboral (id_dia, tx_nombre, tx_descripcion, st_activo) FROM stdin;
1	Lunes	Día laboral estándar	1
2	Martes	Día laboral estándar	1
3	Miércoles	Día laboral estándar	1
4	Jueves	Día laboral estándar	1
5	Viernes	Día laboral estándar	1
6	Sábado	Fin de semana	1
7	Domingo	Fin de semana	1
\.


--
-- Data for Name: tce05_dia_descanso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tce05_dia_descanso (id_dia_descanso, fk_id_empleado, fh_descanso) FROM stdin;
2	3	2026-01-06
3	3	2026-01-07
4	9	2026-01-17
6	16	2026-01-09
\.


--
-- Data for Name: tce06_empleado_horario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tce06_empleado_horario (fk_id_horario, fk_id_persona) FROM stdin;
101	9
103	9
105	9
107	9
43	3
45	3
47	3
49	3
52	3
101	16
103	16
105	16
107	16
133	10
135	10
139	10
141	10
\.


--
-- Data for Name: tce07_bloque_cita; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tce07_bloque_cita (fk_id_sucursal, fk_id_cita, fh_inicio, fh_fin) FROM stdin;
1	4	2025-12-09 21:04:00	2025-12-09 22:04:00
1	17	2025-12-24 21:05:00	2025-12-24 22:05:00
1	19	2025-12-27 18:17:00	2025-12-27 18:37:00
1	20	2026-01-02 18:19:00	2026-01-02 18:49:00
7	21	2026-01-06 20:03:00	2026-01-06 20:33:00
6	22	2026-01-05 18:31:00	2026-01-05 19:31:00
\.


--
-- Data for Name: tce08_horario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tce08_horario (id_horario, fk_id_sucursal, fk_id_dia, tm_inicio, tm_fin) FROM stdin;
143	12	1	09:00:00	14:00:00
144	12	1	16:00:00	20:00:00
145	12	2	09:00:00	14:00:00
146	12	2	16:00:00	20:00:00
147	12	3	09:00:00	14:00:00
148	12	3	16:00:00	20:00:00
149	12	4	09:00:00	14:00:00
150	12	4	16:00:00	20:00:00
151	12	5	09:00:00	14:00:00
152	12	5	16:00:00	20:00:00
43	1	1	09:00:00	14:00:00
44	1	1	16:00:00	20:00:00
45	1	2	09:00:00	14:00:00
46	1	2	16:00:00	20:00:00
47	1	3	09:00:00	14:00:00
48	1	3	16:00:00	20:00:00
49	1	4	09:00:00	14:00:00
50	1	4	16:00:00	20:00:00
51	1	5	09:00:00	14:00:00
52	1	5	16:00:00	20:00:00
53	1	6	09:00:00	14:00:00
54	1	6	16:00:00	20:00:00
55	7	1	09:00:00	14:00:00
56	7	1	16:00:00	20:00:00
57	7	2	09:00:00	14:00:00
58	7	2	16:00:00	20:00:00
59	7	3	09:00:00	14:00:00
60	7	3	16:00:00	20:00:00
61	7	4	09:00:00	14:00:00
62	7	4	16:00:00	20:00:00
63	7	5	09:00:00	14:00:00
64	7	5	16:00:00	20:00:00
65	7	6	09:00:00	14:00:00
66	7	6	16:00:00	20:00:00
101	6	1	09:00:00	14:00:00
102	6	1	16:00:00	20:00:00
103	6	2	09:00:00	14:00:00
104	6	2	16:00:00	20:00:00
105	6	3	09:00:00	14:00:00
106	6	3	16:00:00	20:00:00
107	6	4	09:00:00	14:00:00
108	6	4	16:00:00	20:00:00
109	6	5	09:00:00	14:00:00
110	6	5	16:00:00	20:00:00
111	9	1	09:00:00	14:00:00
112	9	1	16:00:00	20:00:00
113	9	2	09:00:00	14:00:00
114	9	2	16:00:00	20:00:00
115	9	3	09:00:00	14:00:00
116	9	3	16:00:00	20:00:00
117	9	4	09:00:00	14:00:00
118	9	4	16:00:00	20:00:00
119	9	5	09:00:00	14:00:00
120	9	5	16:00:00	20:00:00
121	9	7	09:00:00	14:00:00
122	9	7	16:00:00	20:00:00
133	8	1	09:00:00	14:00:00
134	8	1	16:00:00	20:00:00
135	8	2	09:00:00	14:00:00
136	8	2	16:00:00	20:00:00
137	8	3	09:00:00	14:00:00
138	8	3	16:00:00	20:00:00
139	8	4	09:00:00	14:00:00
140	8	4	16:00:00	20:00:00
141	8	5	09:00:00	14:00:00
142	8	5	16:00:00	20:00:00
\.


--
-- Data for Name: tci01_estado_lista_precio; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tci01_estado_lista_precio (id_estado, tx_nombre) FROM stdin;
1	Activa
\.


--
-- Data for Name: tci02_servicio_lista_precio; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tci02_servicio_lista_precio (fk_id_servicio, fk_id_lista_precio, nu_precio) FROM stdin;
1	1	200
3	1	450
4	1	250
5	1	100
6	1	600
2	1	180
7	1	200
\.


--
-- Data for Name: tci03_lista_precio; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tci03_lista_precio (id_lista_precio, fk_id_estado, tx_nombre, fh_inicio, fh_fin) FROM stdin;
1	1	General 2025	2025-12-06 13:12:48.74664	\N
\.


--
-- Data for Name: tci05_cita; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tci05_cita (id_cita, fk_id_persona, fk_id_servicio, fk_id_lista_precio, fk_id_sucursal, fk_id_empleado) FROM stdin;
4	1	3	1	1	1
17	4	3	1	1	3
19	4	5	1	1	1
20	2	1	1	1	3
21	4	2	1	7	1
22	2	3	1	6	9
\.


--
-- Name: cci01_servicio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cci01_servicio_id_seq', 8, true);


--
-- Name: tca01_persona_id_persona_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tca01_persona_id_persona_seq', 21, true);


--
-- Name: tce01_establecimiento_id_establecimiento_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tce01_establecimiento_id_establecimiento_seq', 1, true);


--
-- Name: tce02_sucursal_id_sucursal_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tce02_sucursal_id_sucursal_seq', 12, true);


--
-- Name: tce04_dia_laboral_id_dia_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tce04_dia_laboral_id_dia_seq', 1, false);


--
-- Name: tce05_dia_descanso_id_dia_descanso_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tce05_dia_descanso_id_dia_descanso_seq', 6, true);


--
-- Name: tce08_horario_id_horario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tce08_horario_id_horario_seq', 152, true);


--
-- Name: tci01_estado_lista_precio_id_estado_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tci01_estado_lista_precio_id_estado_seq', 1, false);


--
-- Name: tci03_lista_precio_id_lista_precio_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tci03_lista_precio_id_lista_precio_seq', 1, false);


--
-- Name: tci05_cita_id_cita_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tci05_cita_id_cita_seq', 23, true);


--
-- Name: cca01_genero cca01_genero_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cca01_genero
    ADD CONSTRAINT cca01_genero_pkey PRIMARY KEY (id_genero);


--
-- Name: cca02_rol cca02_rol_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cca02_rol
    ADD CONSTRAINT cca02_rol_pkey PRIMARY KEY (id_rol);


--
-- Name: cci01_servicio cci01_servicio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cci01_servicio
    ADD CONSTRAINT cci01_servicio_pkey PRIMARY KEY (id_servicio);


--
-- Name: tca01_persona tca01_persona_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tca01_persona
    ADD CONSTRAINT tca01_persona_pkey PRIMARY KEY (id_persona);


--
-- Name: tca02_usuario tca02_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tca02_usuario
    ADD CONSTRAINT tca02_usuario_pkey PRIMARY KEY (id_usuario);


--
-- Name: tce01_establecimiento tce01_establecimiento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tce01_establecimiento
    ADD CONSTRAINT tce01_establecimiento_pkey PRIMARY KEY (id_establecimiento);


--
-- Name: tce02_sucursal tce02_sucursal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tce02_sucursal
    ADD CONSTRAINT tce02_sucursal_pkey PRIMARY KEY (id_sucursal);


--
-- Name: tce03_empleado tce03_empleado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tce03_empleado
    ADD CONSTRAINT tce03_empleado_pkey PRIMARY KEY (id_empleado);


--
-- Name: tce04_dia_laboral tce04_dia_laboral_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tce04_dia_laboral
    ADD CONSTRAINT tce04_dia_laboral_pkey PRIMARY KEY (id_dia);


--
-- Name: tce05_dia_descanso tce05_dia_descanso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tce05_dia_descanso
    ADD CONSTRAINT tce05_dia_descanso_pkey PRIMARY KEY (id_dia_descanso);


--
-- Name: tce06_empleado_horario tce06_empleado_horario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tce06_empleado_horario
    ADD CONSTRAINT tce06_empleado_horario_pkey PRIMARY KEY (fk_id_horario, fk_id_persona);


--
-- Name: tce08_horario tce08_horario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tce08_horario
    ADD CONSTRAINT tce08_horario_pkey PRIMARY KEY (id_horario);


--
-- Name: tci01_estado_lista_precio tci01_estado_lista_precio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tci01_estado_lista_precio
    ADD CONSTRAINT tci01_estado_lista_precio_pkey PRIMARY KEY (id_estado);


--
-- Name: tci02_servicio_lista_precio tci02_servicio_lista_precio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tci02_servicio_lista_precio
    ADD CONSTRAINT tci02_servicio_lista_precio_pkey PRIMARY KEY (fk_id_servicio, fk_id_lista_precio);


--
-- Name: tci03_lista_precio tci03_lista_precio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tci03_lista_precio
    ADD CONSTRAINT tci03_lista_precio_pkey PRIMARY KEY (id_lista_precio);


--
-- Name: tci05_cita tci05_cita_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tci05_cita
    ADD CONSTRAINT tci05_cita_pkey PRIMARY KEY (id_cita);


--
-- Name: tca01_persona uk_persona_correo; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tca01_persona
    ADD CONSTRAINT uk_persona_correo UNIQUE (tx_correo);


--
-- Name: tca01_persona fktca01_pers852780; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tca01_persona
    ADD CONSTRAINT fktca01_pers852780 FOREIGN KEY (fk_id_genero) REFERENCES public.cca01_genero(id_genero);


--
-- Name: tca02_usuario fktca02_usua571784; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tca02_usuario
    ADD CONSTRAINT fktca02_usua571784 FOREIGN KEY (fk_id_rol) REFERENCES public.cca02_rol(id_rol);


--
-- Name: tca02_usuario fktca02_usua862702; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tca02_usuario
    ADD CONSTRAINT fktca02_usua862702 FOREIGN KEY (id_usuario) REFERENCES public.tca01_persona(id_persona);


--
-- Name: tce02_sucursal fktce02_sucu179423; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tce02_sucursal
    ADD CONSTRAINT fktce02_sucu179423 FOREIGN KEY (fk_id_establecimiento) REFERENCES public.tce01_establecimiento(id_establecimiento);


--
-- Name: tce03_empleado fktce03_empl270344; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tce03_empleado
    ADD CONSTRAINT fktce03_empl270344 FOREIGN KEY (id_empleado) REFERENCES public.tca01_persona(id_persona);


--
-- Name: tce03_empleado fktce03_empl771275; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tce03_empleado
    ADD CONSTRAINT fktce03_empl771275 FOREIGN KEY (fk_id_sucursal) REFERENCES public.tce02_sucursal(id_sucursal);


--
-- Name: tce05_dia_descanso fktce05_dia_792374; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tce05_dia_descanso
    ADD CONSTRAINT fktce05_dia_792374 FOREIGN KEY (fk_id_empleado) REFERENCES public.tce03_empleado(id_empleado);


--
-- Name: tce06_empleado_horario fktce06_empl130066; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tce06_empleado_horario
    ADD CONSTRAINT fktce06_empl130066 FOREIGN KEY (fk_id_persona) REFERENCES public.tce03_empleado(id_empleado);


--
-- Name: tce06_empleado_horario fktce06_empl703363; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tce06_empleado_horario
    ADD CONSTRAINT fktce06_empl703363 FOREIGN KEY (fk_id_horario) REFERENCES public.tce08_horario(id_horario);


--
-- Name: tce07_bloque_cita fktce07_bloq429895; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tce07_bloque_cita
    ADD CONSTRAINT fktce07_bloq429895 FOREIGN KEY (fk_id_sucursal) REFERENCES public.tce02_sucursal(id_sucursal);


--
-- Name: tce07_bloque_cita fktce07_bloq663954; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tce07_bloque_cita
    ADD CONSTRAINT fktce07_bloq663954 FOREIGN KEY (fk_id_cita) REFERENCES public.tci05_cita(id_cita);


--
-- Name: tce08_horario fktce08_hora383650; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tce08_horario
    ADD CONSTRAINT fktce08_hora383650 FOREIGN KEY (fk_id_sucursal) REFERENCES public.tce02_sucursal(id_sucursal);


--
-- Name: tce08_horario fktce08_hora893106; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tce08_horario
    ADD CONSTRAINT fktce08_hora893106 FOREIGN KEY (fk_id_dia) REFERENCES public.tce04_dia_laboral(id_dia);


--
-- Name: tci02_servicio_lista_precio fktci02_serv131929; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tci02_servicio_lista_precio
    ADD CONSTRAINT fktci02_serv131929 FOREIGN KEY (fk_id_servicio) REFERENCES public.cci01_servicio(id_servicio);


--
-- Name: tci02_servicio_lista_precio fktci02_serv753638; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tci02_servicio_lista_precio
    ADD CONSTRAINT fktci02_serv753638 FOREIGN KEY (fk_id_lista_precio) REFERENCES public.tci03_lista_precio(id_lista_precio);


--
-- Name: tci03_lista_precio fktci03_list512910; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tci03_lista_precio
    ADD CONSTRAINT fktci03_list512910 FOREIGN KEY (fk_id_estado) REFERENCES public.tci01_estado_lista_precio(id_estado);


--
-- Name: tci05_cita fktci05_cita165698; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tci05_cita
    ADD CONSTRAINT fktci05_cita165698 FOREIGN KEY (fk_id_servicio, fk_id_lista_precio) REFERENCES public.tci02_servicio_lista_precio(fk_id_servicio, fk_id_lista_precio);


--
-- Name: tci05_cita fktci05_cita559502; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tci05_cita
    ADD CONSTRAINT fktci05_cita559502 FOREIGN KEY (fk_id_persona) REFERENCES public.tca01_persona(id_persona);


--
-- Name: tci05_cita fktci05_cita70185; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tci05_cita
    ADD CONSTRAINT fktci05_cita70185 FOREIGN KEY (fk_id_sucursal) REFERENCES public.tce02_sucursal(id_sucursal);


--
-- Name: tci05_cita fktci05_cita867560; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tci05_cita
    ADD CONSTRAINT fktci05_cita867560 FOREIGN KEY (fk_id_empleado) REFERENCES public.tce03_empleado(id_empleado);


--
-- PostgreSQL database dump complete
--

\unrestrict DfjtrC3vcVgHSmq1pf5lk27lHdDWWudVOxElLOubFb1kEWJq7OGYs40pHRpmKbQ

