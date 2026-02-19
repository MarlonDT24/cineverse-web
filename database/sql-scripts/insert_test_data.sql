-- CINEVERSE DATABASE - DATOS DE PRUEBA

USE cineverse_db;

-- ============================================================
-- USUARIOS
-- ============================================================
INSERT INTO users (username, email, password, first_name, last_name, phone, role) VALUES
-- Administradores
('admin', 'admin@cineverse.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'CineVerse', '666000001', 'ADMIN'),

-- Empleados
('empleado1', 'empleado1@cineverse.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Carlos', 'González', '666000002', 'EMPLOYEE'),
('empleado2', 'empleado2@cineverse.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'María', 'López', '666000003', 'EMPLOYEE'),

-- Clientes
('cliente1', 'cliente1@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Juan', 'Pérez', '666111001', 'CLIENT'),
('cliente2', 'cliente2@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ana', 'García', '666111002', 'CLIENT'),
('cliente3', 'cliente3@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pedro', 'Martín', '666111003', 'CLIENT');

-- ============================================================
-- PELÍCULAS
-- ============================================================
INSERT INTO movies (title, original_title, description, duration_minutes, genre, director, actors, release_date, rating) VALUES
('Avatar: El Camino del Agua', 'Avatar: The Way of Water', 'Jake Sully vive con su nueva familia formada en el planeta Pandora. Cuando una amenaza familiar regresa para terminar lo que se empezó anteriormente, Jake debe trabajar con Neytiri y el ejército de la raza Navi para proteger su planeta.', 192, 'Ciencia ficción', 'James Cameron', 'Sam Worthington, Zoe Saldana, Sigourney Weaver', '2022-12-16', 7.8),

('Top Gun: Maverick', 'Top Gun: Maverick', 'Después de más de treinta años de servicio como uno de los mejores aviadores de la Armada, Pete "Maverick" Mitchell está donde pertenece, superando los límites como un valiente piloto de prueba y esquivando el avance en rango que lo pondría en tierra.', 130, 'Acción', 'Joseph Kosinski', 'Tom Cruise, Miles Teller, Jennifer Connelly', '2022-05-27', 8.3),

('Black Panther: Wakanda Forever', 'Black Panther: Wakanda Forever', 'La reina Ramonda, Shuri, MBaku, Okoye y las Dora Milaje luchan para proteger su nación de las potencias mundiales que intervienen tras la muerte del rey TChalla.', 161, 'Acción', 'Ryan Coogler', 'Letitia Wright, Angela Bassett, Tenoch Huerta', '2022-11-11', 6.7),

('Jurassic World: Dominion', 'Jurassic World Dominion', 'Cuatro años después de la destrucción de Isla Nublar, los dinosaurios ahora viven y cazan junto a los humanos en todo el mundo. Este frágil equilibrio remodelará el futuro y determinará, de una vez por todas, si los seres humanos deben seguir siendo los depredadores dominantes en un planeta que ahora comparten con las criaturas más temibles de la historia.', 147, 'Aventura', 'Colin Trevorrow', 'Chris Pratt, Bryce Dallas Howard, Laura Dern', '2022-06-10', 5.6),

('Doctor Strange en el Multiverso de la Locura', 'Doctor Strange in the Multiverse of Madness', 'El Doctor Strange desata un mal innombrable al utilizar un hechizo prohibido que abre las puertas del multiverso.', 126, 'Fantasía', 'Sam Raimi', 'Benedict Cumberbatch, Elizabeth Olsen, Chiwetel Ejiofor', '2022-05-06', 6.9),

('Minions: El Origen de Gru', 'Minions: The Rise of Gru', 'En los años 70, Gru crece siendo un gran admirador de un grupo de supervillanos conocidos como Vicious 6. Para demostrar que puede ser malvado, Gru idea un plan para formar parte del grupo.', 87, 'Animación', 'Kyle Balda', 'Steve Carell, Pierre Coffin, Alan Arkin', '2022-07-01', 6.5);

-- ============================================================
-- SALAS DE CINE
-- ============================================================
INSERT INTO cinemas (name, total_seats, rows_count, seats_per_row, screen_type) VALUES
('Sala 1 - Pantalla Grande', 120, 10, 12, '2D'),
('Sala 2 - VIP Experience', 60, 6, 10, '3D'),
('Sala 3 - IMAX', 150, 12, 14, 'IMAX'),
('Sala 4 - Familiar', 80, 8, 10, '2D');

-- ============================================================
-- BUTACAS
-- ============================================================
INSERT INTO seats (cinema_id, row_letter, seat_number, seat_type)
SELECT 
    1 as cinema_id,
    CHAR(64 + row_num) as row_letter,
    seat_num,
    CASE 
        WHEN seat_num IN (5,6,7,8) THEN 'VIP'
        WHEN seat_num IN (1,12) THEN 'DISABLED' 
        ELSE 'NORMAL'
    END as seat_type
FROM 
    (SELECT 1 as row_num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 
     UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) r
CROSS JOIN
    (SELECT 1 as seat_num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 
     UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 
     UNION SELECT 11 UNION SELECT 12) s;

-- ============================================================
-- SESIONES (Horarios)
-- ============================================================
INSERT INTO sessions (movie_id, cinema_id, session_datetime, price_normal, price_vip, available_seats) VALUES
-- Avatar - Hoy y mañana
(1, 1, '2025-02-03 16:30:00', 8.50, 12.00, 120),
(1, 1, '2025-02-03 19:45:00', 8.50, 12.00, 120),
(1, 1, '2025-02-03 22:15:00', 8.50, 12.00, 120),
(1, 2, '2025-02-04 17:00:00', 10.00, 15.00, 60),
(1, 3, '2025-02-04 20:30:00', 14.00, 18.00, 150),

-- Top Gun
(2, 1, '2025-02-03 15:00:00', 8.50, 12.00, 120),
(2, 2, '2025-02-03 18:15:00', 10.00, 15.00, 60),
(2, 4, '2025-02-04 16:45:00', 7.50, 11.00, 80),

-- Black Panther
(3, 2, '2025-02-03 21:00:00', 10.00, 15.00, 60),
(3, 3, '2025-02-04 19:15:00', 14.00, 18.00, 150),

-- Jurassic World
(4, 4, '2025-02-03 17:30:00', 7.50, 11.00, 80),
(4, 1, '2025-02-04 20:00:00', 8.50, 12.00, 120);

-- ============================================================
-- RESERVAS
-- ============================================================
INSERT INTO bookings (user_id, session_id, total_amount, booking_code, status, payment_method) VALUES
(4, 1, 17.00, 'CV2025020300001', 'CONFIRMED', 'DIGITAL'),
(5, 2, 25.50, 'CV2025020300002', 'CONFIRMED', 'CARD'),
(6, 3, 8.50, 'CV2025020300003', 'PENDING', 'DIGITAL');

-- ============================================================
-- CONVERSACIONES DE CHAT
-- ============================================================
INSERT INTO chat_conversations (user_id, employee_id, status) VALUES
(4, 2, 'OPEN'),
(5, 2, 'CLOSED');

-- ============================================================
-- MENSAJES DE CHAT
-- ============================================================
INSERT INTO chat_messages (conversation_id, sender_id, message) VALUES
(1, 4, 'Hola, tengo un problema con mi reserva'),
(1, 2, 'Hola! En qué puedo ayudarte con tu reserva?'),
(1, 4, 'No me llega el código de confirmación'),
(1, 2, 'Déjame verificar tu reserva. ¿Cuál es tu email?'),

(2, 5, 'Quería cambiar mi entrada para otra sesión'),
(2, 2, 'Perfecto, ¿para qué película y horario te gustaría cambiarla?'),
(2, 5, 'Para Avatar a las 19:45'),
(2, 2, 'Hecho! Te he cambiado la entrada. Recibirás confirmación por email');

-- ============================================================
-- EVENTOS STAR WARS
-- ============================================================
INSERT INTO star_wars_events (swapi_id, title, description, character_name, event_date) VALUES
('1', 'Noche Luke Skywalker', 'Evento especial dedicado al héroe de la galaxia', 'Luke Skywalker', '2025-02-14'),
('4', 'Especial Darth Vader', 'La noche del lado oscuro', 'Darth Vader', '2025-02-21'),
('3', 'Maratón R2-D2', 'Proyección especial con el droide más querido', 'R2-D2', '2025-02-28');

-- ============================================================
-- MENSAJE DE CONFIRMACIÓN
-- ============================================================
SELECT 'Datos de prueba insertados correctamente' as status;

-- Verificar datos insertados
SELECT 'USUARIOS' as tabla, COUNT(*) as total FROM users
UNION ALL
SELECT 'PELÍCULAS', COUNT(*) FROM movies
UNION ALL  
SELECT 'SALAS', COUNT(*) FROM cinemas
UNION ALL
SELECT 'BUTACAS', COUNT(*) FROM seats  
UNION ALL
SELECT 'SESIONES', COUNT(*) FROM sessions
UNION ALL
SELECT 'RESERVAS', COUNT(*) FROM bookings;
