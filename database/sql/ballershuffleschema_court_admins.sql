-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: ballershuffleschema
-- ------------------------------------------------------
-- Server version	8.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `court_admins`
--

DROP TABLE IF EXISTS `court_admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `court_admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `court_id` int DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `court_id` (`court_id`),
  CONSTRAINT `court_admins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `court_admins_ibfk_2` FOREIGN KEY (`court_id`) REFERENCES `courts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `court_admins`
--

LOCK TABLES `court_admins` WRITE;
/*!40000 ALTER TABLE `court_admins` DISABLE KEYS */;
INSERT INTO `court_admins` VALUES (13,1,1,1),(14,1,2,1),(15,1,33,1),(16,1,34,1),(17,1,35,1),(18,1,36,1),(19,1,37,1),(20,1,38,1),(21,41,39,1),(22,1,40,1),(23,1,41,1),(24,11,42,1),(25,42,43,1),(26,1,3,1),(27,65,44,1),(28,66,45,1),(29,1,46,1),(30,1,47,1),(31,1,48,1),(32,1,49,1),(33,1,50,1),(34,67,51,1),(35,68,52,1),(36,70,53,1),(37,1,54,1),(38,1,55,1),(39,1,56,1),(40,1,57,1),(41,1,58,1),(42,1,59,1),(43,1,60,1),(44,1,61,1),(45,1,62,1),(46,1,63,1),(47,1,64,1),(48,1,65,1),(49,1,66,1),(50,1,67,1),(51,66,68,1),(52,90,69,1),(53,1,70,1),(54,91,71,1),(55,1,72,1),(56,85,1,1),(57,14,1,1),(59,43,1,1),(60,66,1,1),(61,11,3,1),(62,91,3,1),(63,1,73,1),(64,1,74,1);
/*!40000 ALTER TABLE `court_admins` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-23 10:27:23
