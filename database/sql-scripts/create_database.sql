-- CINEVERSE DATABASE

CREATE DATABASE IF NOT EXISTS cineverse_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cineverse_db;

-- ============================================================
-- 1. TABLA USERS (Usuarios)
-- ============================================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role ENUM('CLIENT', 'EMPLOYEE', 'ADMIN') DEFAULT 'CLIENT',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. TABLA MOVIES (Películas)
-- ============================================================
CREATE TABLE movies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    original_title VARCHAR(200),
    description TEXT,
    duration_minutes INT NOT NULL,
    genre VARCHAR(100),
    director VARCHAR(100),
    actors TEXT,
    release_date DATE,
    poster_url VARCHAR(500),
    trailer_url VARCHAR(500),
    rating DECIMAL(3,1),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. TABLA CINEMAS (Salas)
-- ============================================================
CREATE TABLE cinemas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    total_seats INT NOT NULL,
    rows_count INT NOT NULL,
    seats_per_row INT NOT NULL,
    screen_type ENUM('2D', '3D', 'IMAX', '4DX') DEFAULT '2D',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. TABLA SEATS (Butacas)
-- ============================================================
CREATE TABLE seats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cinema_id INT NOT NULL,
    row_letter CHAR(1) NOT NULL,
    seat_number INT NOT NULL,
    seat_type ENUM('NORMAL', 'VIP', 'DISABLED') DEFAULT 'NORMAL',
    active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (cinema_id) REFERENCES cinemas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_seat (cinema_id, row_letter, seat_number)
);

-- ============================================================
-- 5. TABLA SESSIONS (Sesiones/Horarios)
-- ============================================================
CREATE TABLE sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT NOT NULL,
    cinema_id INT NOT NULL,
    session_datetime DATETIME NOT NULL,
    price_normal DECIMAL(5,2) NOT NULL,
    price_vip DECIMAL(5,2) NOT NULL,
    available_seats INT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (cinema_id) REFERENCES cinemas(id) ON DELETE CASCADE
);

-- ============================================================
-- 6. TABLA BOOKINGS (Reservas)
-- ============================================================
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_id INT NOT NULL,
    total_amount DECIMAL(8,2) NOT NULL,
    booking_code VARCHAR(20) UNIQUE NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'USED') DEFAULT 'PENDING',
    payment_method ENUM('CASH', 'CARD', 'DIGITAL') DEFAULT 'DIGITAL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- ============================================================
-- 7. TABLA BOOKING_SEATS (Reserva-Butacas)
-- ============================================================
CREATE TABLE booking_seats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    seat_id INT NOT NULL,
    price DECIMAL(5,2) NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id),
    UNIQUE KEY unique_booking_seat (booking_id, seat_id)
);

-- ============================================================
-- 8. TABLA CHAT_CONVERSATIONS (Conversaciones)
-- ============================================================
CREATE TABLE chat_conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    employee_id INT NULL,
    status ENUM('OPEN', 'CLOSED', 'WAITING') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (employee_id) REFERENCES users(id)
);

-- ============================================================
-- 9. TABLA CHAT_MESSAGES (Mensajes)
-- ============================================================
CREATE TABLE chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    message TEXT NOT NULL,
    message_type ENUM('TEXT', 'IMAGE', 'FILE') DEFAULT 'TEXT',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- ============================================================
-- 10. TABLA STAR_WARS_EVENTS (Eventos Star Wars)
-- ============================================================
CREATE TABLE star_wars_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    swapi_id VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    character_name VARCHAR(100),
    character_data JSON,
    event_date DATE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================================
CREATE INDEX idx_sessions_movie_datetime ON sessions(movie_id, session_datetime);
CREATE INDEX idx_sessions_cinema_datetime ON sessions(cinema_id, session_datetime);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_code ON bookings(booking_code);
CREATE