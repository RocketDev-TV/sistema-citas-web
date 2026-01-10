# 💈 Sistema de Citas - Barber King (Backend)

![Java](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=java)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4-brightgreen?style=for-the-badge&logo=springboot)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-blue?style=for-the-badge&logo=postgresql)
![Azure](https://img.shields.io/badge/Azure-Cloud-0078D4?style=for-the-badge&logo=microsoftazure)

Plataforma integral para la gestión y agendamiento de citas, desarrollada bajo **Arquitectura Hexagonal**. El sistema administra sucursales, empleados, servicios y clientes, integrando geolocalización espacial para las sucursales y validación estricta de horarios laborales.

**Institución:** UPIICSA - Instituto Politécnico Nacional (IPN)  
**Proyecto:** Sistema de Citas (3er Parcial)  
**Materia:** Programación Web / Ingeniería en Informatica

---

## 🚀 Características Clave

* **Arquitectura Hexagonal:** Desacoplamiento total entre la lógica de negocio (Dominio) y la infraestructura (Base de datos, API REST).
* **Geolocalización (PostGIS):** Almacenamiento y consulta de coordenadas geográficas para ubicación de sucursales.
* **Gestión de Horarios (Timezone Sensitive):** Sincronización estricta con zona horaria `America/Mexico_City` para evitar conflictos en citas (UTC handling).
* **Seguridad:** Encriptación de contraseñas con SHA-512 y gestión de roles (Admin, Empleado, Cliente).
* **Despliegue Cloud:** Optimizado para ejecución en servidores Linux (Ubuntu) en Microsoft Azure.

---

## 🛠️ Stack Tecnológico

* **Lenguaje:** Java 17 (JDK)
* **Framework:** Spring Boot 3.4.12
* **Base de Datos:** PostgreSQL 14 + Extensiones **PostGIS**
* **ORM:** Hibernate Spatial
* **Build Tool:** Maven
* **Utilerías:** Lombok, Jakarta EE

---

## ⚙️ Configuración de Base de Datos

El proyecto incluye scripts automatizados para entornos locales y de producción.

### Opción A: Entorno Local (Desarrollo)
1.  Navega a la carpeta de scripts:
    ```bash
    cd base-datos/scripts/local
    ```
2.  Ejecuta el constructor maestro (requiere cliente `psql`):
    ```bash
    sudo -u postgres psql -f build.sql
    ```

### Opción B: Producción (Seed Limpio)
Para restaurar la base de datos a un estado de fábrica (5 sucursales, 10 empleados, catálogos limpios):
```bash
psql -d citas -f base-datos/scripts/local/respaldo_produccion.sql
```

---

## ▶️ Ejecución y Despliegue

### 1. Entorno Local (IDE / Terminal)
```bash
mvn spring-boot:run
```

Acceso: `http://localhost:8080`

---

### 2. Producción (Linux / Azure VM)
Para ejecución en segundo plano (Daemon) asegurando la zona horaria correcta:

```bash
nohup java -Duser.timezone=America/Mexico_City -jar target/sistema-citas-0.0.1-SNAPSHOT.jar \
  --spring.datasource.url=jdbc:postgresql://localhost:5432/citas \
  --spring.datasource.username=postgres \
  --spring.datasource.password=TU_PASSWORD > log.txt 2>&1 &
```
---

## 🔌 Endpoints Principales

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| **POST** | `/api/citas` | Agendar nueva cita (Valida disponibilidad y horario laboral) |
| **GET** | `/api/citas` | Listar citas (Filtros por rol de usuario) |
| **POST** | `/api/sucursales` | Registrar sucursal con punto geográfico (Lat/Lon) |
| **GET** | `/api/servicios` | Catálogo de servicios y precios vigentes |
| **POST** | `/api/usuarios/login` | Autenticación de usuarios |

---

## ✒️ Autor:

* **Ivan Herrera** - *Desarrollador & DevOps*

---
*Hecho con ❤️ y mucho café en la CDMX.*
