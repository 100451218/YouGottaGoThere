-- YouGottaGoThere Database Schema
-- MVP: User profiles + restaurant reviews + tier list (top 5)

-- Drop existing tables (in reverse order of dependencies)
-- Drop both singular and plural versions to avoid residuals
DROP TABLE IF EXISTS friendships;
DROP TABLE IF EXISTS friendship;
DROP TABLE IF EXISTS restaurant_reviews;
DROP TABLE IF EXISTS restaurant_review;
DROP TABLE IF EXISTS category_restaurants;
DROP TABLE IF EXISTS category_restaurant;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS restaurant;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user;

-- ==========================================
-- Table: user
-- Description: Sistema de usuarios con autenticación
-- ==========================================
CREATE TABLE user (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NULL UNIQUE,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  profile_picture VARCHAR(255),
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Table: restaurant
-- Description: Catálogo de restaurantes
-- Localización: locationx, locationy como coordenadas simples
-- ==========================================
CREATE TABLE restaurant (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  locationx INT NOT NULL,
  locationy INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES user(id) ON DELETE SET NULL
);

-- ==========================================
-- Table: category
-- Description: Categorías de restaurantes (Italiano, Chino, etc)
-- ==========================================
CREATE TABLE category (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  icon VARCHAR(30)
);

-- ==========================================
-- Table: category_restaurant
-- Description: Relación entre restaurantes y categorías (muchos a muchos)
-- ==========================================
CREATE TABLE category_restaurant (
  restaurant_id INT NOT NULL,
  category_id INT NOT NULL,
  PRIMARY KEY (restaurant_id, category_id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurant(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
);

-- ==========================================
-- Table: restaurant_review
-- Description: Reviews de restaurantes por usuario
-- ranking: 1-5 para top 5 del usuario, NULL si sin clasificar
-- UNIQUE constraint: un usuario solo puede tener 1 review por restaurante
-- ==========================================
CREATE TABLE restaurant_review (
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  ranking INT,
  description VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, restaurant_id),
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurant(id) ON DELETE CASCADE,
  CONSTRAINT valid_ranking CHECK (ranking IS NULL OR (ranking >= 1 AND ranking <= 5))
);

-- ==========================================
-- Table: friendship
-- Description: Sistema de amigos (Fase 2 - preparado pero no usado en MVP)
-- status: 'pending', 'accepted', 'blocked'
-- ==========================================
CREATE TABLE friendship (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id_1 INT NOT NULL,
  user_id_2 INT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id_1) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id_2) REFERENCES user(id) ON DELETE CASCADE,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'blocked')),
  UNIQUE KEY unique_friendship (user_id_1, user_id_2)
);

-- ==========================================
-- Índices para optimización de búsquedas
-- ==========================================

-- Búsqueda de restaurantes por nombre (para búsqueda aproximada del wizard)
CREATE INDEX idx_restaurant_name ON restaurant(name);

-- Búsqueda de restaurantes por localización (para sugerencias cercanas)
CREATE INDEX idx_restaurant_location ON restaurant(locationx, locationy);

-- Búsqueda de reviews de un usuario
CREATE INDEX idx_review_user ON restaurant_review(user_id);

-- Búsqueda de amistades de un usuario
CREATE INDEX idx_friendship_users ON friendship(user_id_1, user_id_2);
