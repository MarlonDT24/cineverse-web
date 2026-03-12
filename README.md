# CineVerse - Sistema de Gestión Cinematográfica

**CineVerse** es una solución tecnológica integral diseñada para la administración de complejos de cine, desarrollada como Proyecto Final de Grado para el Ciclo Superior de **Desarrollo de Aplicaciones Multiplataforma (DAM) 2026**.

Este repositorio centraliza toda la infraestructura web del ecosistema, utilizando una arquitectura de **Monorepo** para garantizar la coherencia entre el servidor y el panel administrativo.

---

## 📂 Estructura del Repositorio
El proyecto se divide en tres módulos principales claramente diferenciados:

* **/backend**: Servidor de lógica de negocio basado en **Spring Boot 3**. Gestiona la seguridad mediante **JWT**, la persistencia con **JPA/Hibernate** y la comunicación bidireccional por **WebSockets**.
* **/frontend**: Portal administrativo para empleados desarrollado con **React** y **Tailwind CSS**. Permite la gestión de cartelera y soporte técnico en tiempo real.
* **/database**: Contiene los scripts SQL necesarios para la inicialización de la estructura y los datos maestros en **MySQL**.

---

## 🛠️ Stack Tecnológico

### **Servidor (Backend)**
* **Lenguaje:** Java 17.
* **Framework:** Spring Boot 3.4.
* **Seguridad:** JSON Web Tokens (JWT) para autenticación basada en roles.
* **Mensajería:** Protocolo STOMP sobre WebSockets para el chat de soporte.
* **Testing:** JUnit 5 para pruebas unitarias de lógica de negocio.

### **Web (Frontend)**
* **Librería:** React 18.
* **Estilos:** Tailwind CSS.
* **Iconografía:** Lucide React.
* **Sincronización:** Fetch API para peticiones asíncronas al servidor.

### **Base de Datos**
* **Motor:** MySQL 8.0.
* **Administración:** phpMyAdmin para la gestión visual de las 10 tablas del sistema.

---

## 🚀 Guía de Instalación y Puesta en Marcha

Si desea replicar el entorno de ejecución, siga estos pasos:

### 1. Configuración de la Base de Datos
1.  Inicie su servidor MySQL (XAMPP o similar).
2.  Desde **phpMyAdmin**, cree una base de datos llamada `cineverse_db`.
3.  Importe el archivo `.sql` ubicado en la carpeta `/database`.

### 2. Ejecución del Backend
1.  Abra la carpeta `/backend` en **IntelliJ IDEA**.
2.  Verifique las credenciales en `src/main/resources/application.properties`.
3.  Ejecute la clase `BackendApplication.java`. El servidor iniciará en el puerto `8080`.

### 3. Ejecución del Frontend
1.  Abra una terminal en la carpeta `/frontend`.
2.  Instale las dependencias:
    ```bash
    npm install
    ```
3.  Inicie el portal:
    ```bash
    npm start
    ```
4.  La aplicación será accesible en `http://localhost:3000`.

---

## 🔑 Credenciales de Prueba (Staff)
* **Usuario:** `admin`
* **Contraseña:** `password`

---

## 👤 Autor
**Marlon Daniel Torres Sangacha**

*Nota: La aplicación móvil nativa para este ecosistema se encuentra en el repositorio independiente [CineVerse-Mobile](https://github.com/MarlonDT24/CineVerse-Mobile).*****
