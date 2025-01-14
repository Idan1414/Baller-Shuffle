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
-- Table structure for table `game_teams`
--

DROP TABLE IF EXISTS `game_teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `game_teams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `game_fk` int DEFAULT NULL,
  `team` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `game_fk` (`game_fk`),
  CONSTRAINT `game_teams_ibfk_1` FOREIGN KEY (`game_fk`) REFERENCES `games` (`game_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=345 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `game_teams`
--

LOCK TABLES `game_teams` WRITE;
/*!40000 ALTER TABLE `game_teams` DISABLE KEYS */;
INSERT INTO `game_teams` VALUES (101,31,'{\"playerIds\": [122, 140, 173]}'),(102,31,'{\"playerIds\": [145, 143, 167]}'),(103,31,'{\"playerIds\": [144, 123, 125, 168]}'),(116,21,'{\"playerIds\": [2, 3, 8, 7, 17]}'),(117,21,'{\"playerIds\": [1, 88, 87, 5, 19]}'),(118,21,'{\"playerIds\": [84, 22, 9, 20, 86]}'),(125,32,'{\"playerIds\": [178, 32, 27, 48, 174]}'),(126,32,'{\"playerIds\": [30, 46, 37, 43, 39]}'),(127,32,'{\"playerIds\": [45, 47, 38, 41, 31]}'),(128,23,'{\"playerIds\": [11, 7, 91]}'),(129,23,'{\"playerIds\": [3, 85, 12]}'),(130,23,'{\"playerIds\": [25, 6, 16]}'),(134,1,'{\"playerIds\": [3, 88, 23, 5, 89]}'),(135,1,'{\"playerIds\": [2, 22, 10, 8, 14]}'),(136,1,'{\"playerIds\": [24, 11, 9, 15, 20]}'),(140,28,'{\"playerIds\": [178, 47, 31, 34, 174]}'),(141,28,'{\"playerIds\": [27, 33, 32, 42, 29]}'),(142,28,'{\"playerIds\": [28, 40, 43, 44, 48]}'),(146,19,'{\"playerIds\": [22, 85, 15, 19, 5]}'),(147,19,'{\"playerIds\": [11, 9, 87, 7, 89]}'),(148,26,'{\"playerIds\": [2, 8, 4, 12, 21]}'),(149,26,'{\"playerIds\": [84, 6, 16, 89, 91]}'),(150,26,'{\"playerIds\": [9, 22, 85, 10, 5]}'),(210,33,'{\"playerIds\": [6, 3]}'),(211,33,'{\"playerIds\": [11, 12]}'),(212,33,'{\"playerIds\": [16, 7]}'),(216,2,'{\"playerIds\": [84, 16, 6, 17, 89]}'),(217,2,'{\"playerIds\": [1, 23, 8, 86, 19]}'),(218,2,'{\"playerIds\": [2, 3, 12, 91, 20]}'),(262,16,'{\"playerIds\": [3, 22, 11, 25, 7, 23, 91, 21, 187, 89]}'),(263,16,'{\"playerIds\": [84, 1, 9, 26, 4, 16, 12, 10, 86, 13]}'),(264,34,'{\"playerIds\": [1, 23, 87, 86, 17]}'),(265,34,'{\"playerIds\": [9, 25, 7, 5, 89]}'),(266,34,'{\"playerIds\": [3, 85, 6, 8, 12]}'),(269,36,'{\"playerIds\": [1, 3]}'),(270,36,'{\"playerIds\": [24, 2]}'),(271,35,'{\"playerIds\": [1]}'),(272,35,'{\"playerIds\": [22]}'),(273,35,'{\"playerIds\": [87, 5]}'),(318,38,'{\"playerIds\": [60, 66]}'),(319,38,'{\"playerIds\": [61, 58]}'),(320,38,'{\"playerIds\": [62, 70]}'),(321,38,'{\"playerIds\": [57, 67, 55]}'),(322,38,'{\"playerIds\": [49, 64, 72]}'),(323,38,'{\"playerIds\": [52, 50, 68]}'),(342,40,'{\"playerIds\": [1, 9, 20, 13, 3]}'),(343,40,'{\"playerIds\": [2, 15, 5, 12, 8]}'),(344,40,'{\"playerIds\": [11, 22, 6, 4, 23]}');
/*!40000 ALTER TABLE `game_teams` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-23 10:27:26
