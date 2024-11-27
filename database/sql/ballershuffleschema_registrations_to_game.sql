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
-- Table structure for table `registrations_to_game`
--

DROP TABLE IF EXISTS `registrations_to_game`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrations_to_game` (
  `registration_id` int NOT NULL AUTO_INCREMENT,
  `game_id` int NOT NULL,
  `player_id` int NOT NULL,
  `registered_by` int NOT NULL,
  `registration_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `approved` tinyint DEFAULT '0',
  PRIMARY KEY (`registration_id`),
  UNIQUE KEY `game_id` (`game_id`,`player_id`),
  UNIQUE KEY `unique_game_player` (`game_id`,`player_id`),
  KEY `player_id` (`player_id`),
  KEY `registered_by` (`registered_by`),
  CONSTRAINT `registrations_to_game_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`game_id`) ON DELETE CASCADE,
  CONSTRAINT `registrations_to_game_ibfk_2` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`),
  CONSTRAINT `registrations_to_game_ibfk_3` FOREIGN KEY (`registered_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=767 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registrations_to_game`
--

LOCK TABLES `registrations_to_game` WRITE;
/*!40000 ALTER TABLE `registrations_to_game` DISABLE KEYS */;
INSERT INTO `registrations_to_game` VALUES (70,18,58,11,'2024-10-13 09:24:05',0),(78,17,50,11,'2024-10-13 09:31:25',0),(84,2,3,1,'2024-10-13 13:16:47',1),(180,16,9,43,'2024-10-13 16:41:09',0),(186,20,9,43,'2024-10-13 16:44:39',0),(194,17,63,1,'2024-10-13 16:49:32',0),(196,17,54,1,'2024-10-13 16:49:34',0),(212,1,9,43,'2024-10-14 11:49:41',0),(216,20,10,1,'2024-10-14 12:13:31',0),(230,18,69,1,'2024-10-14 17:04:22',0),(236,21,22,1,'2024-10-14 17:12:03',0),(240,21,5,1,'2024-10-15 00:27:14',0),(251,22,31,1,'2024-10-15 10:34:55',0),(252,22,46,1,'2024-10-15 10:34:55',0),(255,22,38,1,'2024-10-15 10:35:03',0),(256,22,41,1,'2024-10-15 10:35:03',0),(258,22,34,1,'2024-10-15 10:35:11',0),(260,22,40,71,'2024-10-15 10:36:27',0),(261,22,42,71,'2024-10-15 10:36:27',0),(263,22,44,71,'2024-10-15 10:36:27',0),(267,22,45,71,'2024-10-15 10:36:40',0),(269,22,48,71,'2024-10-15 10:36:40',0),(270,22,33,71,'2024-10-15 10:37:58',0),(271,22,29,71,'2024-10-15 10:38:01',0),(274,22,43,1,'2024-10-15 10:47:14',0),(275,22,39,1,'2024-10-15 10:47:14',0),(276,22,32,1,'2024-10-15 10:47:36',0),(328,24,16,39,'2024-10-16 09:14:15',0),(330,24,5,39,'2024-10-16 09:14:15',0),(331,24,7,39,'2024-10-16 09:14:15',0),(334,24,11,39,'2024-10-16 09:14:26',0),(335,24,91,43,'2024-10-16 09:14:46',0),(336,24,4,43,'2024-10-16 09:14:46',0),(348,24,18,1,'2024-10-16 09:15:59',0),(350,24,84,84,'2024-10-16 09:34:21',0),(351,24,3,84,'2024-10-16 09:34:21',0),(352,24,86,84,'2024-10-16 09:34:21',0),(353,24,8,84,'2024-10-16 09:34:21',0),(354,24,20,84,'2024-10-16 09:34:21',0),(355,24,6,84,'2024-10-16 09:34:21',0),(358,24,25,84,'2024-10-16 09:34:31',0),(364,1,22,1,'2024-10-17 13:21:53',0),(370,24,23,1,'2024-10-17 19:46:06',0),(375,24,1,1,'2024-10-17 20:02:10',0),(382,24,24,1,'2024-10-17 20:02:17',0),(383,24,15,1,'2024-10-17 20:02:17',0),(384,1,5,88,'2024-10-17 21:24:39',0),(385,1,84,1,'2024-10-17 21:25:06',0),(386,1,2,1,'2024-10-17 21:25:06',0),(387,1,14,1,'2024-10-17 21:25:06',0),(389,1,24,1,'2024-10-17 21:25:06',0),(390,1,15,1,'2024-10-17 21:25:06',0),(392,1,11,1,'2024-10-17 21:25:06',0),(393,1,10,1,'2024-10-17 21:25:06',0),(394,1,20,1,'2024-10-17 21:25:06',0),(395,1,3,1,'2024-10-17 21:25:06',0),(397,1,23,1,'2024-10-17 21:25:06',0),(398,1,8,1,'2024-10-17 21:25:06',0),(399,10,32,89,'2024-10-17 22:07:19',0),(401,27,175,90,'2024-10-17 23:04:52',0),(403,26,10,1,'2024-10-19 00:25:32',0),(407,26,5,1,'2024-10-19 00:25:32',0),(411,26,8,1,'2024-10-19 00:25:32',0),(415,26,6,1,'2024-10-19 00:25:32',0),(417,26,91,1,'2024-10-19 00:25:37',0),(418,26,4,1,'2024-10-19 00:25:37',0),(424,26,2,1,'2024-10-19 12:15:59',0),(425,17,49,1,'2024-10-19 13:08:46',0),(427,17,68,1,'2024-10-19 13:08:46',0),(428,17,65,1,'2024-10-19 13:08:46',0),(431,26,21,66,'2024-10-19 13:38:02',0),(432,26,12,66,'2024-10-19 13:38:02',0),(433,26,84,1,'2024-10-19 20:33:44',0),(434,26,9,1,'2024-10-19 20:58:10',0),(436,16,4,1,'2024-10-20 11:18:58',1),(437,16,21,1,'2024-10-20 11:18:58',1),(439,16,26,1,'2024-10-20 11:18:58',1),(443,16,12,1,'2024-10-20 11:18:58',1),(446,16,86,1,'2024-10-20 11:18:58',1),(447,16,3,1,'2024-10-20 11:18:58',1),(448,16,23,1,'2024-10-20 11:18:58',1),(450,31,144,1,'2024-10-20 11:23:06',0),(451,31,140,1,'2024-10-20 11:23:06',0),(452,31,173,1,'2024-10-20 11:23:06',0),(453,31,167,1,'2024-10-20 11:23:06',0),(454,31,123,1,'2024-10-20 11:23:06',0),(455,31,125,1,'2024-10-20 11:23:06',0),(456,31,145,1,'2024-10-20 11:23:06',0),(457,31,122,1,'2024-10-20 11:23:06',0),(458,31,168,1,'2024-10-20 11:23:06',0),(459,31,143,1,'2024-10-20 11:23:06',0),(461,16,1,1,'2024-10-20 12:32:04',1),(464,23,7,1,'2024-10-20 17:23:56',0),(465,23,5,1,'2024-10-20 17:23:56',0),(466,23,22,1,'2024-10-20 17:23:56',0),(467,23,87,1,'2024-10-20 17:23:56',0),(470,23,9,1,'2024-10-20 17:23:56',0),(471,23,1,1,'2024-10-20 17:23:56',0),(472,23,11,1,'2024-10-20 17:23:56',0),(473,23,10,1,'2024-10-20 17:23:56',0),(474,23,85,1,'2024-10-20 17:23:56',0),(475,23,2,1,'2024-10-20 17:23:56',0),(476,23,24,1,'2024-10-20 17:23:56',0),(477,23,18,1,'2024-10-20 17:24:10',0),(478,23,21,1,'2024-10-20 17:24:10',0),(479,21,9,1,'2024-10-20 17:40:55',0),(481,21,87,1,'2024-10-20 17:40:55',0),(483,21,7,1,'2024-10-20 17:40:55',0),(484,21,20,1,'2024-10-20 17:40:55',0),(485,21,2,1,'2024-10-20 17:40:55',0),(487,21,84,1,'2024-10-20 17:40:55',0),(488,21,19,1,'2024-10-20 17:40:55',0),(490,21,86,1,'2024-10-20 17:40:55',0),(491,21,3,1,'2024-10-20 17:40:55',0),(492,21,8,1,'2024-10-20 17:40:55',0),(493,21,17,1,'2024-10-20 17:40:55',0),(494,21,1,72,'2024-10-20 17:44:06',0),(496,32,178,91,'2024-10-20 22:31:29',0),(497,32,46,91,'2024-10-20 22:31:29',0),(499,32,37,91,'2024-10-20 22:31:29',0),(500,32,32,91,'2024-10-20 22:31:29',0),(501,32,31,91,'2024-10-20 22:31:29',0),(502,32,39,91,'2024-10-20 22:31:29',0),(503,32,43,91,'2024-10-20 22:31:29',0),(504,32,27,91,'2024-10-20 22:31:29',0),(505,32,47,91,'2024-10-20 22:31:29',0),(506,32,48,91,'2024-10-20 22:31:29',0),(507,32,30,91,'2024-10-20 22:31:29',0),(508,32,38,91,'2024-10-20 22:31:29',0),(509,32,41,91,'2024-10-20 22:31:29',0),(510,32,45,91,'2024-10-20 22:31:29',0),(511,32,174,91,'2024-10-20 22:32:39',0),(512,26,22,1,'2024-10-21 13:06:06',0),(514,26,85,1,'2024-10-21 13:06:06',0),(515,26,16,1,'2024-10-21 13:06:06',0),(518,28,48,1,'2024-10-21 13:08:15',0),(519,28,47,1,'2024-10-21 13:08:15',0),(520,28,31,1,'2024-10-21 13:08:15',0),(521,28,27,1,'2024-10-21 13:08:15',0),(522,28,43,1,'2024-10-21 13:08:15',0),(523,28,29,1,'2024-10-21 13:08:15',0),(524,28,32,1,'2024-10-21 13:08:15',0),(525,28,178,1,'2024-10-21 13:08:15',0),(526,28,44,1,'2024-10-21 13:08:15',0),(527,28,34,1,'2024-10-21 13:08:15',0),(528,28,42,1,'2024-10-21 13:08:15',0),(529,28,174,1,'2024-10-21 13:08:15',0),(530,28,40,1,'2024-10-21 13:08:15',0),(531,28,28,1,'2024-10-21 13:08:15',0),(532,28,33,1,'2024-10-21 13:08:15',0),(533,19,7,1,'2024-10-21 13:56:58',0),(534,19,5,1,'2024-10-21 13:56:58',0),(535,19,9,1,'2024-10-21 13:56:58',0),(537,19,87,1,'2024-10-21 13:56:58',0),(538,19,85,1,'2024-10-21 13:56:58',0),(540,19,15,1,'2024-10-21 13:56:58',0),(541,19,11,1,'2024-10-21 13:56:58',0),(544,19,19,1,'2024-10-21 13:58:42',0),(546,19,1,1,'2024-10-21 14:03:02',0),(547,26,1,1,'2024-10-21 14:04:16',0),(548,26,11,1,'2024-10-21 14:04:16',0),(550,33,7,1,'2024-10-21 14:42:29',0),(551,33,22,1,'2024-10-21 14:42:29',0),(552,33,9,1,'2024-10-21 14:42:29',0),(553,33,5,1,'2024-10-21 14:42:29',0),(554,33,87,1,'2024-10-21 14:42:29',0),(555,33,1,1,'2024-10-21 14:43:02',0),(557,2,16,1,'2024-10-21 15:47:59',0),(559,2,86,1,'2024-10-21 15:47:59',0),(560,2,6,1,'2024-10-21 15:47:59',0),(561,2,20,1,'2024-10-21 15:47:59',0),(562,2,2,1,'2024-10-21 15:47:59',0),(563,2,19,1,'2024-10-21 15:47:59',0),(564,2,84,1,'2024-10-21 15:47:59',0),(565,2,23,1,'2024-10-21 15:47:59',0),(566,2,8,1,'2024-10-21 15:47:59',0),(567,2,17,1,'2024-10-21 15:47:59',0),(568,2,12,1,'2024-10-21 15:47:59',0),(569,2,91,1,'2024-10-21 15:47:59',0),(570,2,1,1,'2024-10-21 15:48:08',0),(571,18,49,1,'2024-10-21 19:19:12',0),(573,18,70,1,'2024-10-21 19:19:12',0),(574,18,57,1,'2024-10-21 19:19:12',0),(575,18,72,1,'2024-10-21 19:19:12',0),(576,18,60,1,'2024-10-21 19:19:12',0),(577,18,68,1,'2024-10-21 19:19:12',0),(578,18,54,1,'2024-10-21 19:19:12',0),(579,18,65,1,'2024-10-21 19:19:12',0),(580,18,63,1,'2024-10-21 19:19:12',0),(581,18,67,1,'2024-10-21 19:19:12',0),(582,18,52,1,'2024-10-21 19:19:12',0),(583,18,62,1,'2024-10-21 19:19:12',0),(584,18,50,1,'2024-10-21 19:19:12',0),(585,16,91,1,'2024-10-22 09:38:04',1),(586,16,84,1,'2024-10-22 09:44:14',1),(587,16,7,1,'2024-10-22 09:44:46',1),(589,16,25,1,'2024-10-22 09:45:28',1),(592,16,89,1,'2024-10-22 09:49:14',0),(593,16,11,1,'2024-10-22 09:49:14',0),(595,16,22,1,'2024-10-22 09:51:45',1),(598,16,13,1,'2024-10-22 09:51:45',0),(601,16,10,1,'2024-10-22 09:51:48',0),(602,16,16,1,'2024-10-22 09:51:48',0),(603,16,24,1,'2024-10-22 09:51:48',0),(611,18,66,39,'2024-10-22 10:07:22',0),(612,18,61,39,'2024-10-22 10:07:22',0),(625,34,25,39,'2024-10-22 10:13:09',1),(626,34,12,39,'2024-10-22 10:13:09',1),(627,34,6,39,'2024-10-22 10:13:09',1),(628,34,8,39,'2024-10-22 10:13:09',1),(629,34,17,39,'2024-10-22 10:13:09',1),(630,34,23,39,'2024-10-22 10:13:09',1),(631,34,3,39,'2024-10-22 10:13:09',1),(632,34,86,39,'2024-10-22 10:13:09',1),(633,34,87,1,'2024-10-22 10:13:13',1),(635,34,9,1,'2024-10-22 10:13:13',1),(636,34,7,1,'2024-10-22 10:13:13',1),(637,34,85,1,'2024-10-22 10:13:13',1),(638,34,1,1,'2024-10-22 10:13:13',1),(639,34,89,1,'2024-10-22 10:13:13',1),(640,34,5,1,'2024-10-22 10:13:13',1),(641,35,22,66,'2024-10-22 11:51:53',1),(642,35,5,66,'2024-10-22 11:51:53',0),(643,36,3,85,'2024-10-22 12:07:22',1),(644,36,1,85,'2024-10-22 12:07:22',0),(645,36,2,92,'2024-10-22 12:09:33',1),(646,36,24,92,'2024-10-22 12:09:33',0),(650,35,87,1,'2024-10-22 16:27:36',1),(651,35,1,1,'2024-10-22 16:27:52',1),(654,38,68,85,'2024-10-22 17:24:58',1),(655,38,49,85,'2024-10-22 17:24:58',1),(675,38,64,85,'2024-10-22 18:26:21',0),(676,38,55,85,'2024-10-22 18:26:21',1),(677,38,62,85,'2024-10-22 18:26:21',1),(678,38,50,85,'2024-10-22 18:26:21',0),(679,38,66,85,'2024-10-22 18:26:21',1),(680,38,52,85,'2024-10-22 18:26:21',1),(681,38,67,85,'2024-10-22 18:26:21',1),(682,38,61,85,'2024-10-22 18:26:21',1),(683,38,57,85,'2024-10-22 18:26:21',1),(684,38,72,85,'2024-10-22 18:26:22',0),(685,38,60,85,'2024-10-22 18:26:22',0),(686,38,70,85,'2024-10-22 18:26:22',0),(687,38,58,85,'2024-10-22 18:26:24',0),(707,38,63,1,'2024-10-22 19:36:54',0),(708,38,65,1,'2024-10-22 19:36:54',0),(724,38,59,1,'2024-10-22 19:44:43',0),(725,38,69,1,'2024-10-22 19:44:43',0),(731,38,54,1,'2024-10-22 19:45:24',0),(741,40,1,1,'2024-10-23 09:39:51',1),(743,40,11,92,'2024-10-23 09:40:04',1),(745,40,22,92,'2024-10-23 09:42:26',1),(746,40,8,1,'2024-10-23 09:49:02',1),(747,40,5,1,'2024-10-23 09:49:36',1),(748,40,89,1,'2024-10-23 09:49:36',0),(750,40,15,1,'2024-10-23 09:49:36',0),(751,40,85,1,'2024-10-23 09:49:36',0),(752,40,9,1,'2024-10-23 09:49:36',1),(754,40,6,1,'2024-10-23 09:49:36',1),(755,40,20,1,'2024-10-23 09:49:36',0),(756,40,23,1,'2024-10-23 09:49:36',1),(757,40,2,1,'2024-10-23 09:49:36',0),(758,40,86,1,'2024-10-23 09:49:36',0),(759,40,3,1,'2024-10-23 09:49:36',0),(761,40,13,1,'2024-10-23 09:49:36',0),(762,40,26,1,'2024-10-23 09:49:36',0),(763,40,25,1,'2024-10-23 09:49:36',0),(764,40,4,1,'2024-10-23 09:49:36',0),(765,40,91,1,'2024-10-23 09:49:36',0),(766,40,12,1,'2024-10-23 09:49:36',0);
/*!40000 ALTER TABLE `registrations_to_game` ENABLE KEYS */;
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