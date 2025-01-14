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
-- Table structure for table `players`
--

DROP TABLE IF EXISTS `players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `players` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `courtId` int DEFAULT NULL,
  `type` varchar(20) DEFAULT NULL,
  `user_fk` int DEFAULT NULL,
  `creator_user_fk` int DEFAULT NULL,
  `num_of_mvps` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `courtId` (`courtId`),
  KEY `fk_user_fk` (`user_fk`),
  CONSTRAINT `fk_user_fk` FOREIGN KEY (`user_fk`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=192 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `players`
--

LOCK TABLES `players` WRITE;
/*!40000 ALTER TABLE `players` DISABLE KEYS */;
INSERT INTO `players` VALUES (1,'Idan Cohen',1,'Basketball',1,1,5),(2,'Omri Weisleder',1,'Basketball',92,1,NULL),(3,'Rave Roda',1,'Basketball',85,2,2),(4,'Yotam Sarfati',1,'Basketball',43,1,NULL),(5,'Ben Baruch',1,'Basketball',88,3,1),(6,'Roi Green',1,'Basketball',14,11,NULL),(7,'Avri Dalva',1,'Basketball',NULL,5,1),(8,'Rotem Struss',1,'Basketball',NULL,5,1),(9,'Amir Strauss',1,'Basketball',16,7,NULL),(10,'Itay Nave',1,'Basketball',NULL,7,NULL),(11,'Itay Vizel',1,'Basketball',14,7,NULL),(12,'Tal Kidron',1,'Basketball',66,7,1),(13,'Yuval Raviv',1,'Basketball',NULL,9,NULL),(14,'Noam Mishal',1,'Basketball',NULL,1,NULL),(15,'Jonathan Shaulian',1,'Basketball',14,7,13),(16,'Ilay Patt',1,'Basketball',NULL,7,NULL),(17,'Stav Yechiel',1,'Basketball',13,7,NULL),(18,'Yuval Refael',1,'Basketball',14,1,NULL),(19,'Omri Dan',1,'Basketball',72,7,NULL),(20,'Ori Konfino',1,'Basketball',91,1,1),(21,'Yoav Strauss',1,'Basketball',73,17,NULL),(22,'Amir Nagar',1,'Basketball',18,2,NULL),(23,'Ori Reighbenbach',1,'Basketball',75,2,NULL),(24,'Nir Rashti',1,'Basketball',61,2,NULL),(25,'Tomer Alon',1,'Basketball',39,2,NULL),(26,'Tomer Weisleder',1,'Basketball',14,2,NULL),(27,'Idan Cohen',2,'Basketball',1,NULL,NULL),(28,'Tal Evelin',2,'Basketball',NULL,NULL,NULL),(29,'Erez Miller',2,'Basketball',NULL,NULL,NULL),(30,'Noam Barak',2,'Basketball',72,NULL,NULL),(31,'Golan Madar',2,'Basketball',NULL,NULL,NULL),(32,'Eran Fish',2,'Basketball',70,NULL,NULL),(33,'Raz Polak',2,'Basketball',71,NULL,NULL),(34,'Roi Turiski',2,'Basketball',73,NULL,NULL),(35,'Tomer Ashkenzi',2,'Basketball',NULL,NULL,NULL),(36,'Roi Noyman',2,'Basketball',NULL,NULL,NULL),(37,'Amit Zamir',2,'Basketball',NULL,NULL,NULL),(38,'Omri Zadok',2,'Basketball',NULL,NULL,NULL),(39,'Moshe Zaliga',2,'Basketball',NULL,NULL,NULL),(40,'Yuval Dayan',2,'Basketball',NULL,NULL,NULL),(41,'Omer Kesler',2,'Basketball',NULL,NULL,NULL),(42,'Tomer Assayag',2,'Basketball',85,NULL,NULL),(43,'Idan Orpaz',2,'Basketball',84,NULL,NULL),(44,'Roy Yona',2,'Basketball',NULL,NULL,NULL),(45,'Omer Elyahu',2,'Basketball',12,NULL,NULL),(46,'Eyal Ben Baruch',2,'Basketball',7,NULL,NULL),(47,'Nadav Levi',2,'Basketball',NULL,NULL,NULL),(48,'Nadav Sheffer',2,'Basketball',13,NULL,NULL),(49,'Idan Cohen',3,'Football',1,1,NULL),(50,'Tomer Shapira',3,'Football',11,1,NULL),(52,'Tal Doiff',3,'Football',91,1,NULL),(54,'Matan Sinai',3,'Football',65,1,1),(55,'Ron Katz',3,'Football',14,1,NULL),(57,'Raz Aharon',3,'Football',13,1,NULL),(58,'Erez',3,'Football',73,1,NULL),(59,'Amit',3,'Football',74,1,NULL),(60,'Omer Nissim',3,'Football',72,1,NULL),(61,'Yuval',3,'Football',70,1,NULL),(62,'Tomer Cohen',3,'Football',85,1,NULL),(63,'Gili Nachum',3,'Football',12,1,NULL),(64,'Sagi',3,'Football',69,1,NULL),(65,'Eyal Yakubov',3,'Football',NULL,1,NULL),(66,'Yair Haras',3,'Football',39,1,NULL),(67,'Talco',3,'Football',7,1,NULL),(68,'Ilay Chait',3,'Football',NULL,1,NULL),(69,'Amit Malichi',3,'Football',NULL,1,NULL),(70,'Ofek Samiah',3,'Football',64,1,NULL),(72,'Omri Nachum',3,'Football',NULL,1,NULL),(84,'Omer Cohen',1,'Basketball',14,11,NULL),(85,'Ido Feingold',1,'Basketball',74,1,NULL),(86,'Roi Feingold',1,'Basketball',70,1,NULL),(87,'Adam Rofeim',1,'Basketball',14,11,NULL),(89,'Daniel Koren',1,'Basketball',15,1,NULL),(91,'Yoav Tiz',1,'Basketball',12,1,NULL),(102,'cxvxcvxcv',35,'Basketball',NULL,NULL,NULL),(103,'idanssss',35,'Basketball',NULL,NULL,NULL),(109,'testsome',36,'Basketball',NULL,NULL,NULL),(115,'asdasdfsd',39,'Basketball',NULL,NULL,NULL),(122,'idan cohen test',42,'Basketball',1,11,1),(123,'omer levi',42,'Basketball',11,11,1),(125,'asdasd',42,'Basketball',70,1,NULL),(129,'idan',43,'Basketball',NULL,42,NULL),(140,'omerCreatedMe',42,'Basketball',64,11,NULL),(143,'Yotam Test',42,'Basketball',66,1,NULL),(144,'TEst Istaek',42,'Basketball',12,1,NULL),(145,'Testtttttttttttt',42,'Basketball',72,1,NULL),(148,'hadar ziv',45,'Basketball',NULL,66,NULL),(153,'ttt cohen',53,'Basketball',70,70,NULL),(155,'ttt ziv',53,'Basketball',15,70,NULL),(166,'Idan',45,'Basketball',NULL,66,NULL),(167,'testtttttttas',42,'Basketball',73,1,NULL),(168,'Yahvss',42,'Basketball',13,1,NULL),(173,'asdsdvfgdfg',42,'Basketball',39,1,NULL),(174,'Yair Sela',2,'Basketball',89,1,NULL),(175,'Idan Azama',69,'Basketball',90,90,NULL),(178,'Andrew',2,'Basketball',91,1,NULL);
/*!40000 ALTER TABLE `players` ENABLE KEYS */;
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
