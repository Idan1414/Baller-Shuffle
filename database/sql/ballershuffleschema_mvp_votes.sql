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
-- Table structure for table `mvp_votes`
--

DROP TABLE IF EXISTS `mvp_votes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mvp_votes` (
  `vote_id` int NOT NULL AUTO_INCREMENT,
  `game_id` int NOT NULL,
  `voter_user_id` int NOT NULL,
  `mvp_player_id` int NOT NULL,
  PRIMARY KEY (`vote_id`),
  UNIQUE KEY `game_id` (`game_id`,`voter_user_id`),
  KEY `voter_user_id` (`voter_user_id`),
  KEY `mvp_player_id` (`mvp_player_id`),
  CONSTRAINT `mvp_votes_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`game_id`) ON DELETE CASCADE,
  CONSTRAINT `mvp_votes_ibfk_2` FOREIGN KEY (`voter_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `mvp_votes_ibfk_3` FOREIGN KEY (`mvp_player_id`) REFERENCES `players` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mvp_votes`
--

LOCK TABLES `mvp_votes` WRITE;
/*!40000 ALTER TABLE `mvp_votes` DISABLE KEYS */;
INSERT INTO `mvp_votes` VALUES (1,24,1,5),(2,1,1,11),(3,31,64,123),(4,31,1,122),(5,24,5,1),(6,20,1,89),(7,23,1,24),(8,23,72,89),(9,21,72,84),(10,21,1,7),(11,32,91,27),(12,28,1,43),(13,19,1,11),(14,26,1,16),(15,33,1,9),(16,2,1,20),(17,17,1,54),(18,16,39,1),(19,16,1,3),(20,34,39,12),(21,34,1,7),(22,36,92,1),(23,35,1,5),(24,18,85,63),(25,38,1,57),(27,40,1,8);
/*!40000 ALTER TABLE `mvp_votes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-23 10:27:24
