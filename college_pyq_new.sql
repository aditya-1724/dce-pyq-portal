-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: college_pyq
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `otp_verification`
--

DROP TABLE IF EXISTS `otp_verification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp_verification` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp_verification`
--

LOCK TABLES `otp_verification` WRITE;
/*!40000 ALTER TABLE `otp_verification` DISABLE KEYS */;
INSERT INTO `otp_verification` VALUES (2,'teset@gmail.com','753446','2026-02-25 12:15:26','2026-02-25 06:35:25'),(3,'testa@gmail.com','779632','2026-02-25 12:32:14','2026-02-25 06:52:14'),(7,'adityagupta242001@gmail.com','171053','2026-02-27 12:00:35','2026-02-27 06:20:34');
/*!40000 ALTER TABLE `otp_verification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pyqs`
--

DROP TABLE IF EXISTS `pyqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pyqs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subject_id` int DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `title` varchar(200) DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `branch` varchar(50) DEFAULT NULL,
  `semester` int DEFAULT NULL,
  `year` varchar(4) DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_subject_branch_sem` (`subject_id`,`branch`,`semester`),
  CONSTRAINT `pyqs_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pyqs`
--

LOCK TABLES `pyqs` WRITE;
/*!40000 ALTER TABLE `pyqs` DISABLE KEYS */;
INSERT INTO `pyqs` VALUES (1,120,'Sessional','','maths_unit_3.pdf','CSIT',4,NULL,'2026-02-24 12:14:49'),(2,3,'PreUniversity','pree','CSIT_Sem1_PPS_PreUniversity_2026.pdf','CSIT',1,NULL,'2026-02-26 08:16:55'),(3,72,'Sessional','aa','CSIT_Sem3_ARTIFICIAL_INTELLIGENCE_Sessional_2026.docx','CSIT',3,NULL,'2026-02-27 06:55:46'),(4,75,'Sessional','ADSA Sessional 2021','CSIT_Sem3_ADSA_Sessional_2021.pdf','CSIT',3,'2021','2026-02-27 07:36:26'),(5,72,'Sessional','ARTIFICIAL INTELLIGENCE Sessional 2021','CSIT_Sem3_ARTIFICIAL_INTELLIGENCE_Sessional_2021.docx','CSIT',3,'2021','2026-02-27 08:27:06'),(6,72,'Sessional','ARTIFICIAL INTELLIGENCE Sessional 2022','CSIT_Sem3_ARTIFICIAL_INTELLIGENCE_Sessional_2022.pdf','CSIT',3,'2022','2026-02-27 08:43:28'),(7,71,'Sessional','C++ Sessional 2021','CSIT_Sem3_C++_Sessional_2021.pdf','CSIT',3,'2021','2026-02-28 08:05:56'),(8,70,'Sessional','MATHEMATICS-3 Sessional 2021','CSIT_Sem3_MATHEMATICS-3_Sessional_2021.pdf','CSIT',3,'2021','2026-02-28 08:18:33'),(9,70,'Sessional','MATHEMATICS-3 Sessional 2020','CSIT_Sem3_MATHEMATICS-3_Sessional_2020.pdf','CSIT',3,'2020','2026-02-28 08:19:47');
/*!40000 ALTER TABLE `pyqs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subject_name` varchar(100) DEFAULT NULL,
  `branch` varchar(50) DEFAULT NULL,
  `semester` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=142 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES (2,'ENGLISH','CSIT',1),(3,'PPS','CSIT',1),(4,'MATHEMATICS-1','CSIT',1),(5,'BES','CSIT',1),(6,'PHYSICS','CSIT',1),(7,'PPS','CSE',1),(8,'ENGLISH','CSE',1),(10,'MATHEMATICS-1','CSE',1),(11,'BES','CSE',1),(12,'PHYSICS','CSE',1),(13,'ENGLISH','IOT',1),(14,'MATHEMATICS-1','IOT',1),(15,'PPS','IOT',1),(16,'BES','IOT',1),(17,'PHYSICS','IOT',1),(18,'ENGLISH','ECS',1),(19,'MATHEMATICS-1','ECS',1),(20,'PPS','ECS',1),(21,'BES','ECS',1),(22,'PHYSICS','ECS',1),(23,'ENGLISH','ME/R&A',1),(24,'PPS','ME/R&A',1),(25,'MATHEMATICS-1','ME/R&A',1),(26,'BES','ME/R&A',1),(27,'BEEE','ME/R&A',1),(28,'ENGLISH','ECE/EEE',1),(29,'MATHEMATICS-1','ECE/EEE',1),(30,'PPS','ECE/EEE',1),(31,'BES','ECE/EEE',1),(32,'BEE','ECE/EEE',1),(33,'ENGLISH','AI&ML',1),(34,'MATHEMATICS-1','AI&ML',1),(35,'PPS','AI&ML',1),(36,'BES','AI&ML',1),(37,'BEEE','AI&ML',1),(38,'MATHEMATICS-2','CSIT',2),(39,'PYTHON','CSIT',2),(40,'DATA STRUCTURE','CSIT',2),(41,'BEEE','CSIT',2),(42,'HVSS','CSIT',2),(43,'MATHEMATICS-2','CSE',2),(44,'PYTHON','CSE',2),(45,'DATA STRUCTURE','CSE',2),(46,'BEEE','CSE',2),(47,'HVSS','CSE',2),(48,'MATHEMATICS-2','IOT',2),(49,'PYTHON','IOT',2),(50,'BEEE','IOT',2),(51,'DATA STRUCTURE','IOT',2),(52,'HVSS','IOT',2),(54,'MATHEMATICS-2','ECS',2),(55,'BEEE','ECS',2),(56,'DATA STRUCTURE','ECS',2),(57,'PYTHON','ECS',2),(58,'HVSS','ECS',2),(59,'PHYSICS','ME/R&A',2),(60,'MATHEMATICS-2','ME/R&A',2),(61,'ENGINEERING MECHANICS','ME/R&A',2),(62,'M.SC','ME/R&A',2),(63,'HVSS','ME/R&A',2),(64,'ELECTRONICS ENGINEERING-1','ECE/EEE',2),(65,'PHYSICS','ECE/EEE',2),(66,'MATHEMATICS-2','ECE/EEE',2),(67,'PYTHON','ECE/EEE',2),(68,'DATA STRUCTURE','ECE/EEE',2),(69,'HVSS','ECE/EEE',2),(70,'MATHEMATICS-3','CSIT',3),(71,'C++','CSIT',3),(72,'ARTIFICIAL INTELLIGENCE','CSIT',3),(73,'DIGITAL ELECTRONICS','CSIT',3),(74,'DBMS','CSIT',3),(75,'ADSA','CSIT',3),(76,'MATHEMATICS-3','CSE',3),(77,'C++','CSE',3),(78,'DIGITAL ELECTRONICS','CSE',3),(79,'ADSA','CSE',3),(80,'DBMS','CSE',3),(81,'ARTIFICIAL INTELLIGENCE','CSE',3),(82,'MATHEMATICS-3','IOT',3),(83,'C++','IOT',3),(84,'DIGITAL ELECTRONICS','IOT',3),(85,'ADSA','IOT',3),(86,'DBMS','IOT',3),(87,'BLOCK CHAIN','IOT',3),(88,'PT&ST','ECS',3),(89,'NA&S','ECS',3),(90,'DIGITAL ELECTRONICS','ECS',3),(91,'ADSA','ECS',3),(92,'DBMS','ECS',3),(93,'ARTIFICIAL INTELLIGENCE','ECS',3),(94,'MATHEMATICS-3','ME',3),(95,'PP-1','ME',3),(96,'FM','ME',3),(97,'SOM','ME',3),(98,'THERMO','ME',3),(99,'I&A','ME',3),(100,'MATHEMATICS-3','R&A',3),(101,'C++','R&A',3),(102,'DE','R&A',3),(103,'SOM','R&A',3),(104,'THERMO','R&A',3),(105,'EDC','R&A',3),(106,'A&DCS','ECE',3),(107,'NA&S','ECE',3),(108,'DE','ECE',3),(109,'S&S','ECE',3),(110,'EMFT','ECE',3),(111,'M&CT','ECE',3),(112,'EMI','EEE',3),(113,'NA&S','EEE',3),(114,'DE','EEE',3),(115,'S&S','EEE',3),(116,'EMFT','EEE',3),(117,'M&CT','EEE',3),(118,'DM','CSIT',4),(119,'R PROGRAMMING','CSIT',4),(120,'JAVA','CSIT',4),(121,'MPMC','CSIT',4),(122,'COA','CSIT',4),(123,'OS','CSIT',4),(124,'DM','CSE',4),(125,'R PROGRAMMING','CSE',4),(126,'JAVA','CSE',4),(127,'MPMC','CSE',4),(128,'COA','CSE',4),(129,'OS','CSE',4),(130,'OS','IOT',4),(131,'IoT','IOT',4),(132,'JAVA','IOT',4),(133,'DM','IOT',4),(134,'MPMC','IOT',4),(135,'COA','IOT',4),(136,'DM','ECS',4),(137,'COA','ECS',4),(138,'EDC','ECS',4),(139,'EMFT','ECS',4),(140,'ADC','ECS',4),(141,'DAA','ECS',4);
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `name` varchar(100) DEFAULT NULL,
  `branch` varchar(50) DEFAULT NULL,
  `year` int DEFAULT NULL,
  `semester` int DEFAULT NULL,
  `roll_number` int DEFAULT NULL,
  `role` varchar(20) DEFAULT 'student',
  `is_verified` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `unique_roll` (`roll_number`,`branch`,`year`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'test@gmail.com','$2b$12$NucNo2tL07ZTgpP3eNYfvOr9mcSVbgL1KTmCbeZNN1UFJyTyn.mqa','2026-02-08 04:57:38',NULL,NULL,NULL,NULL,NULL,'student',0),(2,'ad@gmial.com','$2b$12$8/siF0zmUGGFb.OSsAXHOuru0Niw4T9HsXM.OjhcbkQKyq.k4ytDW','2026-02-13 13:08:18','xyz',NULL,NULL,NULL,NULL,'student',0),(3,'vansh@gmail.com','$2b$12$GT2C0kbOSC7yrY0YRusrs.CVKtpLGVgHRhLLkEYby67mkoF6s1nQu','2026-02-14 06:42:56','vansh','CSIT',NULL,NULL,NULL,'student',0),(4,'admin@dce.com','$2b$12$06z7SCDuGhNMSKzkKq6xd.OBu/Kqh6kRtMiQXegRxb5KB/ouLZOYq','2026-02-22 08:13:02','Admin User','Admin',0,0,0,'admin',0),(11,'testa@gmail.com','$2b$12$xY9VEcMy8awtxWHV9eWptuy8aimIrbFfLZEFj8Wdul8FgNVspCE6m','2026-02-25 06:52:09','a','ECE',1,7,11,'student',0),(12,'adityagupta242001@gmail.com','$2b$12$YzC3gyl2mBnPi0Und0QXh.XPUPVTXM6UIob41JDg9h2wM5VHE4.92','2026-02-25 09:34:37','Aditya Gupta ','CSIT',2,3,26424,'student',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_backup`
--

DROP TABLE IF EXISTS `users_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_backup` (
  `id` int NOT NULL DEFAULT '0',
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `name` varchar(100) DEFAULT NULL,
  `branch` varchar(50) DEFAULT NULL,
  `year` int DEFAULT NULL,
  `semester` int DEFAULT NULL,
  `roll_number` varchar(20) DEFAULT NULL,
  `role` varchar(20) DEFAULT 'student'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_backup`
--

LOCK TABLES `users_backup` WRITE;
/*!40000 ALTER TABLE `users_backup` DISABLE KEYS */;
INSERT INTO `users_backup` VALUES (1,'test@gmail.com','12345','2026-02-08 04:57:38',NULL,NULL,NULL,NULL,NULL,'student'),(2,'ad@gmial.com','gmal','2026-02-13 13:08:18','xyz',NULL,NULL,NULL,NULL,'student'),(3,'vansh@gmail.com','1234','2026-02-14 06:42:56','vansh','CSIT',NULL,NULL,NULL,'student'),(4,'admin@dce.com','admin123','2026-02-22 08:13:02','Admin User','Admin',0,0,'0000','admin');
/*!40000 ALTER TABLE `users_backup` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-02 14:28:09
