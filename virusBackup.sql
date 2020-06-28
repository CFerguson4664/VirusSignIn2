-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.11-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             11.0.0.5919
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Dumping database structure for virussignin2
CREATE DATABASE IF NOT EXISTS `virussignin2` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE `virussignin2`;

-- Dumping structure for table virussignin2.authentication
CREATE TABLE IF NOT EXISTS `authentication` (
  `authId` int(11) NOT NULL AUTO_INCREMENT,
  `level` int(11) NOT NULL DEFAULT 0,
  `username` varchar(50) NOT NULL DEFAULT '0',
  `hash` char(128) NOT NULL DEFAULT '0',
  PRIMARY KEY (`authId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- Dumping data for table virussignin2.authentication: ~2 rows (approximately)
DELETE FROM `authentication`;
/*!40000 ALTER TABLE `authentication` DISABLE KEYS */;
INSERT INTO `authentication` (`authId`, `level`, `username`, `hash`) VALUES
	(1, 3, 'admin', '$argon2id$v=19$m=262144,t=3,p=1$KVuso7M/kaMnMboUV9PzMg$G7D7DUW4t5+c5Rwv6KgwwOcU9f3nVdeazJv3AcStLMs'),
	(2, 2, 'security', '$argon2id$v=19$m=262144,t=3,p=1$KVuso7M/kaMnMboUV9PzMg$G7D7DUW4t5+c5Rwv6KgwwOcU9f3nVdeazJv3AcStLMs');
/*!40000 ALTER TABLE `authentication` ENABLE KEYS */;

-- Dumping structure for table virussignin2.encryptionkeys
CREATE TABLE IF NOT EXISTS `encryptionkeys` (
  `keyId` int(11) NOT NULL AUTO_INCREMENT,
  `publicKey` char(128) NOT NULL DEFAULT '0',
  `privateKey` char(128) NOT NULL DEFAULT '0',
  `age` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`keyId`)
) ENGINE=InnoDB AUTO_INCREMENT=397 DEFAULT CHARSET=latin1;

-- Dumping data for table virussignin2.encryptionkeys: ~2 rows (approximately)
DELETE FROM `encryptionkeys`;
/*!40000 ALTER TABLE `encryptionkeys` DISABLE KEYS */;
INSERT INTO `encryptionkeys` (`keyId`, `publicKey`, `privateKey`, `age`) VALUES
	(395, '134,8,112,70,225,153,56,165,55,233,193,34,84,22,69,41,7,53,236,156,247,199,52,17,169,153,204,13,19,121,148,55', '209,203,12,16,195,128,143,132,196,224,94,246,252,162,181,183,160,90,28,130,66,8,16,192,130,74,159,142,159,44,1,128', 2),
	(396, '116,148,47,77,207,76,67,33,16,176,82,218,15,85,2,166,9,72,138,196,144,20,26,87,149,213,231,148,204,253,194,34', '59,185,161,125,69,239,147,166,170,201,181,138,68,80,22,230,52,232,37,76,86,134,242,33,7,78,12,173,88,105,170,110', 1);
/*!40000 ALTER TABLE `encryptionkeys` ENABLE KEYS */;

-- Dumping structure for table virussignin2.sessiondata
CREATE TABLE IF NOT EXISTS `sessiondata` (
  `sessionId` char(32) NOT NULL,
  `userId` int(11) NOT NULL DEFAULT 0,
  `survey` int(11) NOT NULL DEFAULT 0,
  `userActivityId` int(11) NOT NULL DEFAULT 0,
  `sessionDatetime` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`sessionId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table virussignin2.sessiondata: ~0 rows (approximately)
DELETE FROM `sessiondata`;
/*!40000 ALTER TABLE `sessiondata` DISABLE KEYS */;
INSERT INTO `sessiondata` (`sessionId`, `userId`, `survey`, `userActivityId`, `sessionDatetime`) VALUES
	('16d0676d6d4983a22f68fd3ce42f8212', 0, 0, 0, '2020-06-28 16:20:56'),
	('43fce340ad722bbc38a0a0305beab0c9', 0, 0, 0, '2020-06-28 16:02:14'),
	('a3b60c1d32b5d6db16f5847b076d28f9', 0, 0, 0, '2020-06-26 17:02:14'),
	('d1886c4cd673d65ef01aa685e5ab2ac0', 0, 0, 0, '2020-06-28 16:19:33'),
	('e347fafa156c4509883223e4f5570e6f', 0, 0, 0, '2020-06-28 15:21:39'),
	('f33191e0b576554546cfa59b70e5f1d8', 0, 0, 0, '2020-06-28 15:59:44');
/*!40000 ALTER TABLE `sessiondata` ENABLE KEYS */;

-- Dumping structure for table virussignin2.sessions
CREATE TABLE IF NOT EXISTS `sessions` (
  `sessionId` char(32) NOT NULL DEFAULT '',
  `level` int(11) NOT NULL DEFAULT 0,
  `creationDatetime` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `renewedDatetime` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`sessionId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table virussignin2.sessions: ~0 rows (approximately)
DELETE FROM `sessions`;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` (`sessionId`, `level`, `creationDatetime`, `renewedDatetime`) VALUES
	('16d0676d6d4983a22f68fd3ce42f8212', 1, '2020-06-28 16:20:56', '2020-06-28 16:20:56'),
	('43fce340ad722bbc38a0a0305beab0c9', 1, '2020-06-28 16:02:14', '2020-06-28 16:02:14'),
	('5ff495f74e91ceab352f03140d3d254d', 2, '2020-06-21 14:12:28', '2020-06-21 14:12:28'),
	('a3b60c1d32b5d6db16f5847b076d28f9', 1, '2020-06-26 17:02:14', '2020-06-26 17:02:14'),
	('d1886c4cd673d65ef01aa685e5ab2ac0', 1, '2020-06-28 16:19:33', '2020-06-28 16:19:33'),
	('dd492f3deb396ffb7829d2fbe1bcce3a', 2, '2020-06-28 16:20:27', '2020-06-28 16:20:27'),
	('e347fafa156c4509883223e4f5570e6f', 1, '2020-06-28 15:21:39', '2020-06-28 15:21:39'),
	('f33191e0b576554546cfa59b70e5f1d8', 1, '2020-06-28 15:59:44', '2020-06-28 15:59:44');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;

-- Dumping structure for table virussignin2.useractivity
CREATE TABLE IF NOT EXISTS `useractivity` (
  `activityId` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL DEFAULT 0,
  `admitted` int(11) NOT NULL DEFAULT 0,
  `userActivityDatetime` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`activityId`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=latin1;

-- Dumping data for table virussignin2.useractivity: ~16 rows (approximately)
DELETE FROM `useractivity`;
/*!40000 ALTER TABLE `useractivity` DISABLE KEYS */;
INSERT INTO `useractivity` (`activityId`, `userId`, `admitted`, `userActivityDatetime`) VALUES
	(19, 23, 0, '2020-05-16 13:18:14'),
	(20, 24, 1, '2020-05-16 14:33:16'),
	(21, 24, 0, '2020-05-16 14:33:43'),
	(22, 9, 1, '2020-05-18 10:38:31'),
	(23, 9, 1, '2020-05-22 12:37:03'),
	(24, 26, 1, '2020-05-22 12:37:04'),
	(25, 25, 1, '2020-05-22 12:37:17'),
	(26, 19, 1, '2020-05-22 12:37:19'),
	(27, 20, 1, '2020-05-22 12:37:20'),
	(28, 21, 1, '2020-05-22 12:37:21'),
	(29, 18, 1, '2020-05-22 12:37:32'),
	(30, 9, 0, '2020-05-22 12:38:42'),
	(31, 9, 1, '2020-05-22 14:04:43'),
	(32, 19, 1, '2020-06-21 14:13:13'),
	(33, 27, 1, '2020-06-21 14:13:14'),
	(34, 28, 1, '2020-06-21 14:13:15');
/*!40000 ALTER TABLE `useractivity` ENABLE KEYS */;

-- Dumping structure for table virussignin2.userbuffer
CREATE TABLE IF NOT EXISTS `userbuffer` (
  `bufferId` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL DEFAULT 0,
  `loaded` int(11) DEFAULT 0,
  PRIMARY KEY (`bufferId`)
) ENGINE=InnoDB AUTO_INCREMENT=128 DEFAULT CHARSET=latin1;

-- Dumping data for table virussignin2.userbuffer: ~0 rows (approximately)
DELETE FROM `userbuffer`;
/*!40000 ALTER TABLE `userbuffer` DISABLE KEYS */;
INSERT INTO `userbuffer` (`bufferId`, `userId`, `loaded`) VALUES
	(126, 29, 1),
	(127, 30, 1);
/*!40000 ALTER TABLE `userbuffer` ENABLE KEYS */;

-- Dumping structure for table virussignin2.users
CREATE TABLE IF NOT EXISTS `users` (
  `userId` int(11) NOT NULL AUTO_INCREMENT,
  `lName` varchar(50) NOT NULL DEFAULT '0',
  `fName` varchar(50) NOT NULL DEFAULT '0',
  `email` varchar(75) NOT NULL DEFAULT '0',
  `nNumber` char(9) NOT NULL DEFAULT '0',
  `signUpDatetime` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=latin1;

-- Dumping data for table virussignin2.users: ~11 rows (approximately)
DELETE FROM `users`;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`userId`, `lName`, `fName`, `email`, `nNumber`, `signUpDatetime`) VALUES
	(9, 'Ferguson', 'Christopher', 'email@email.com', 'N00192800', '2020-04-23 16:41:12'),
	(10, 'Joe', 'Bob', 'email@email2.com', '0', '2020-04-23 16:42:37'),
	(16, 'Doe', 'John', 'jdoe@mail.com', 'N00192801', '2020-05-14 09:52:53'),
	(17, 'Doe', 'Jane', 'jdoe@mail.co.uk', 'N00192802', '2020-05-14 09:53:45'),
	(18, 'Bob', 'Joe', 'jbob@mail.com', 'N00192803', '2020-05-14 10:08:43'),
	(19, 'Bob', 'Mary', 'mbob@mail.com', 'N00192804', '2020-05-14 10:12:13'),
	(20, 'Bob', 'Sally', 'sbob@mail.com', 'N00192805', '2020-05-14 10:35:11'),
	(21, 'Bob', 'Ed', 'ebob@mail.com', 'N0019280', '2020-05-14 10:49:59'),
	(22, 'Twist', 'Oliver', 'otwist@mail.com', 'N00192806', '2020-05-16 12:38:41'),
	(23, 'Lotte', 'Char', 'charlotte@mail.com', 'N00192807', '2020-05-16 13:18:03'),
	(24, 'Keeves', 'Reanue', 'rkeeves@gtfo.mf', 'N00192808', '2020-05-16 14:32:45'),
	(25, 'Ravenclaw', 'Helena', 'hravenclaw@mail.com', '0', '2020-05-18 12:33:40'),
	(26, 'wer', 'tert', 'rye@mail.com', 'N00192809', '2020-05-18 12:37:01'),
	(27, 'sdfs', 'sdf', 'sdf@g.v', '0', '2020-05-28 17:42:16'),
	(28, 'sdfsdf', 'sdf', 'sdf@m.c', '0', '2020-05-28 17:50:02'),
	(29, 'bob', 'Joe', 'jbob@mail.co', '0', '2020-06-28 16:20:06'),
	(30, 'bob', 'joe', 'a@mail.com', '', '2020-06-28 16:23:35');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
