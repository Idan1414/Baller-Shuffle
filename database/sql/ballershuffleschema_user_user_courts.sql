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
-- Table structure for table `user_user_courts`
--

DROP TABLE IF EXISTS `user_user_courts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_user_courts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` varchar(45) DEFAULT NULL,
  `courtId` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=136 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_user_courts`
--

LOCK TABLES `user_user_courts` WRITE;
/*!40000 ALTER TABLE `user_user_courts` DISABLE KEYS */;
INSERT INTO `user_user_courts` VALUES (1,'1','1'),(2,'1','2'),(3,'1','3'),(4,'11','3'),(15,'41','39'),(22,'11','1'),(28,'11','42'),(33,'42','43'),(34,'1','42'),(36,'64','42'),(39,'65','3'),(40,'64','3'),(41,'66','45'),(49,'43','1'),(50,'68','52'),(51,'70','53'),(53,'15','53'),(59,'70','2'),(60,'71','2'),(61,'73','2'),(62,'73','3'),(63,'18','1'),(64,'66','1'),(75,'39','1'),(76,'73','1'),(77,'70','1'),(78,'72','1'),(79,'74','1'),(81,'85','1'),(83,'39','3'),(84,'12','3'),(85,'85','3'),(86,'7','3'),(87,'70','3'),(88,'72','2'),(89,'85','2'),(90,'84','2'),(91,'12','2'),(92,'13','2'),(93,'7','2'),(95,'75','1'),(105,'72','3'),(108,'70','42'),(109,'12','42'),(110,'66','42'),(111,'72','42'),(112,'73','42'),(113,'13','42'),(118,'39','42'),(119,'13','3'),(120,'74','3'),(121,'61','1'),(122,'88','1'),(123,'89','2'),(124,'90','69'),(127,'91','71'),(128,'91','2'),(129,'91','1'),(130,'91','3'),(132,'92','1'),(134,'14','3');
/*!40000 ALTER TABLE `user_user_courts` ENABLE KEYS */;
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
