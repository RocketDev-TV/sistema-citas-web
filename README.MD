# 📅 Sistema de Citas - Backend

Backend para la gestión de citas desarrollado con **Spring Boot 3** y **PostgreSQL**. Implementa **Arquitectura Hexagonal**, manejo de coordenadas geográficas (mapas) con **PostGIS** y flujo completo de agendamiento.

**Institución:** UPIICSA - Instituto Politécnico Nacional (IPN)  
**Proyecto:** Sistema de Citas (3er Parcial)

## 🚀 Tecnologías

* **Java 17** (JDK)
* **Spring Boot 3.4.12**
* **PostgreSQL 14+** + **PostGIS**
* **Hibernate Spatial**
* **Maven**
* **Lombok**

## ⚙️ Instalación de Base de Datos

El proyecto incluye scripts para levantar la BD desde cero.

1.  Entra a la carpeta de scripts:
    ```bash
    cd base-datos/scripts/local
    ```
2.  Ejecuta el script maestro:
    ```bash
    sudo -u postgres psql -f build.sql
    ```

## ▶️ Ejecución

Para levantar el servidor:

```bash
mvn spring-boot:run