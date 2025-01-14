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
-- Table structure for table `courts`
--

DROP TABLE IF EXISTS `courts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `courtName` varchar(255) DEFAULT NULL,
  `courtType` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courts`
--

LOCK TABLES `courts` WRITE;
/*!40000 ALTER TABLE `courts` DISABLE KEYS */;
INSERT INTO `courts` VALUES (1,'2024-03-01 17:02:23','Shishi Savyon ','Basketball'),(2,'2024-03-01 17:02:23','BeerSheva Matmidim','Basketball'),(3,'2024-03-01 17:02:23','Ganey Tikva','Football'),(31,'2024-08-26 08:44:06','test','Basketball'),(32,'2024-08-26 08:46:19','testing','Basketball'),(33,'2024-08-26 08:58:38','ff','Basketball'),(34,'2024-08-26 09:01:04','testing 2','Basketball'),(35,'2024-08-26 09:02:32','123123','Basketball'),(36,'2024-08-26 13:10:35','new test','Basketball'),(37,'2024-08-26 13:12:38','test','Basketball'),(38,'2024-08-26 13:16:06','test','Football'),(39,'2024-09-04 12:49:59','Kfar Saba','Basketball'),(40,'2024-09-04 12:51:40','sdfsdf','Basketball'),(41,'2024-10-03 15:28:23','new','Basketball'),(42,'2024-10-05 11:31:09','test','Basketball'),(43,'2024-10-06 11:29:33','Mozkin shishi','Basketball'),(44,'2024-10-06 22:03:20',',nkjn','Football'),(45,'2024-10-10 14:35:16','תל אביב בדיקה','Basketball'),(46,'2024-10-11 16:28:28','check','Football'),(47,'2024-10-11 16:29:59','asdsdasd','Football'),(48,'2024-10-11 16:30:14','xcvxcvbvcb','Football'),(49,'2024-10-11 16:30:29','kolli','Basketball'),(50,'2024-10-11 16:34:31','kjbn','Football'),(51,'2024-10-11 19:08:42','Yes Tests','Basketball'),(52,'2024-10-14 13:06:23','Footbal New test','Football'),(53,'2024-10-14 21:32:39','ttt','Basketball'),(54,'2024-10-15 05:34:25','test if sent','Football'),(55,'2024-10-15 05:36:22','testt','Basketball'),(56,'2024-10-15 05:47:03','test fott','Football'),(57,'2024-10-15 05:48:11','test fott','Football'),(58,'2024-10-15 05:48:27','idantest','Basketball'),(59,'2024-10-16 15:47:56','Testf','Football'),(60,'2024-10-16 15:51:54','Testr','Football'),(61,'2024-10-16 15:52:29','testsss','Basketball'),(62,'2024-10-16 15:53:19','testsss','Football'),(63,'2024-10-16 15:55:55','tets','Basketball'),(64,'2024-10-16 15:57:51','tetss','Football'),(65,'2024-10-16 16:13:22','tesrttt','Football'),(66,'2024-10-16 23:03:49','a','Football'),(67,'2024-10-16 23:03:56','sdc','Basketball'),(68,'2024-10-17 11:05:21','ADvjz','Football'),(69,'2024-10-17 20:03:05','  GOOD BASH','Basketball'),(70,'2024-10-20 15:25:56','דידי','Basketball'),(71,'2024-10-20 19:27:55','Chicago Gang','Basketball'),(72,'2024-10-21 16:20:51','Ad','Football'),(73,'2024-10-22 16:24:42','teaserfsd','Basketball'),(74,'2024-10-23 06:15:23','test','Basketball');
/*!40000 ALTER TABLE `courts` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-23 10:27:25
