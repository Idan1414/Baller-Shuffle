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
-- Table structure for table `games`
--

DROP TABLE IF EXISTS `games`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `games` (
  `game_id` int NOT NULL AUTO_INCREMENT,
  `court_id` int NOT NULL,
  `game_start_time` datetime NOT NULL,
  `registration_open_time` datetime DEFAULT NULL,
  `registration_close_time` datetime DEFAULT NULL,
  `max_players` int NOT NULL DEFAULT '15',
  `num_of_teams` int DEFAULT '3',
  `created_by` int NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `description` text,
  `max_players_each_user_can_add` int DEFAULT '2',
  `mvps` json DEFAULT NULL,
  PRIMARY KEY (`game_id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `games`
--

LOCK TABLES `games` WRITE;
/*!40000 ALTER TABLE `games` DISABLE KEYS */;
INSERT INTO `games` VALUES (1,1,'2024-10-21 11:56:00','2024-10-17 09:00:00','2024-10-18 17:00:00',15,3,1,'אולם סביון בדיקה','Weekly כדורסל match',21,'[1, 2]'),(2,1,'2024-10-20 13:00:00','2024-10-21 09:00:00','2025-10-21 17:00:00',15,3,1,'GTCT','DUDEDUDEDUDE TEST  vasketball match',22,'[20]'),(10,2,'2024-10-18 13:57:00','2024-10-17 13:57:00','2024-10-18 13:57:00',14,3,1,'fgnyjkuip;','oophiugu',2,NULL),(16,1,'2024-10-21 08:06:00','2024-10-22 09:00:00','2024-10-23 10:29:00',20,2,1,'TEST','asdasdsad',20,'[3, 1]'),(17,3,'2024-10-19 14:02:00','2024-10-19 11:31:00','2024-10-30 11:31:00',18,3,1,'Zofim','ba tsofim ganey tikva',6,'[54]'),(18,3,'2024-10-21 19:24:00','2024-10-20 21:24:00','2024-10-22 21:24:00',15,3,1,'asdasdas','asdasdasd',15,NULL),(19,1,'2024-10-20 08:35:00','2024-10-20 12:28:00','2024-10-22 14:35:00',10,2,43,'Idan testing now','asd',10,'[11]'),(20,1,'2024-10-19 14:41:00','2024-10-13 16:39:00','2024-10-15 16:44:00',2,2,43,'MAX PLAYER 2','MAX PLAYER 2',2,'[89]'),(21,1,'2024-10-19 16:11:00','2024-10-19 17:11:00','2024-10-20 16:11:00',15,3,1,'SAVYON TEST !','testing',17,'[7, 84]'),(22,2,'2024-10-16 09:45:00','2024-10-15 09:45:00','2024-10-16 09:45:00',15,3,1,'BASH','testing shit',8,NULL),(23,1,'2024-10-19 16:19:00','2024-10-18 14:19:00','2024-10-19 18:19:00',15,3,1,'TESTYYY','בדיקונתg',15,'[24, 89]'),(24,1,'2024-10-17 22:00:00','2024-10-17 09:04:00','2024-10-18 13:00:00',15,3,39,'GTCT bball','edition Test',7,'[5, 1]'),(25,2,'2024-10-17 02:22:00','2024-10-18 02:22:00','2024-10-18 02:22:00',15,3,1,'גני תקווה לידר','24 שניות',2,NULL),(26,1,'2024-10-19 12:38:00','2024-10-19 00:20:00','2024-10-22 14:30:00',17,3,1,'Kans','',15,'[16]'),(27,69,'2024-10-17 23:04:00','2024-10-17 23:04:00','2024-10-18 23:04:00',15,3,90,'LAMDAN 15','אזמה מלך',2,NULL),(28,2,'2024-10-20 11:19:00','2024-10-21 00:19:00','2024-10-23 00:19:00',15,3,1,'Tae','',15,'[43]'),(29,2,'2024-10-19 00:19:00','2024-10-19 00:19:00','2024-10-19 00:19:00',15,3,1,'Testr','',2,NULL),(30,2,'2024-10-19 00:20:00','2024-10-19 00:20:00','2024-10-19 00:20:00',15,3,1,'','',2,NULL),(31,42,'2024-10-20 11:22:00','2024-10-20 11:22:00','2024-10-21 11:22:00',15,3,1,'','',15,'[122, 123]'),(32,2,'2024-10-18 21:30:00','2024-10-20 22:30:00','2024-10-21 07:10:00',15,3,91,'Chicago','Nananana',15,'[27]'),(33,1,'2024-10-15 12:24:00','2024-10-20 14:24:00','2024-10-22 14:24:00',15,3,1,'','',15,'[9]'),(34,1,'2024-10-21 08:00:00','2024-10-22 10:13:00','2024-10-22 10:54:00',15,3,39,'אולם סביון','סופרים 24 שניות בדקה האחרונה\n3 עבירות בדקה האחרונה זה זריקה ',8,'[7, 12]'),(35,1,'2024-10-21 12:51:00','2024-10-22 11:51:00','2024-10-22 17:51:00',15,3,66,'','',2,'[5]'),(36,1,'2024-10-21 09:05:00','2024-10-22 12:06:00','2024-10-22 14:06:00',4,2,85,'סביון להראות לעמרי','OMRI GOLEM',2,'[1]'),(38,3,'2024-10-22 18:24:00','2024-10-21 17:24:00','2024-10-22 17:24:00',15,6,85,'test','test',15,NULL),(40,1,'2024-10-21 07:39:00','2024-10-23 09:39:00','2024-10-24 09:39:00',15,3,1,'TEST','TEST delete button',22,'[8]');
/*!40000 ALTER TABLE `games` ENABLE KEYS */;
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
