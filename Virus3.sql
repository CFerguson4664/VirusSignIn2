-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.12-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             10.3.0.5771
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
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table virussignin2.authentication: ~0 rows (approximately)
/*!40000 ALTER TABLE `authentication` DISABLE KEYS */;
/*!40000 ALTER TABLE `authentication` ENABLE KEYS */;

-- Dumping structure for table virussignin2.encryptionkeys
CREATE TABLE IF NOT EXISTS `encryptionkeys` (
  `keyId` int(11) NOT NULL AUTO_INCREMENT,
  `publicKey` char(128) NOT NULL DEFAULT '0',
  `privateKey` char(128) NOT NULL DEFAULT '0',
  `age` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`keyId`)
) ENGINE=InnoDB AUTO_INCREMENT=123 DEFAULT CHARSET=latin1;

-- Dumping data for table virussignin2.encryptionkeys: ~2 rows (approximately)
/*!40000 ALTER TABLE `encryptionkeys` DISABLE KEYS */;
INSERT INTO `encryptionkeys` (`keyId`, `publicKey`, `privateKey`, `age`) VALUES
	(121, '110,177,10,227,168,0,103,138,31,77,167,126,243,186,6,13,212,145,25,71,36,77,33,38,98,118,166,165,37,125,93,114', '203,185,15,212,14,24,17,79,117,216,238,216,232,71,247,16,130,244,9,121,50,199,34,193,227,214,124,144,203,132,198,49', 2),
	(122, '85,222,20,171,171,78,41,254,241,219,76,45,233,107,162,185,212,139,158,141,101,162,190,212,37,191,194,105,104,65,3,105', '108,228,160,128,15,250,35,32,145,35,221,99,208,199,130,78,159,109,150,246,210,48,170,57,119,140,125,229,47,6,206,131', 1);
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
/*!40000 ALTER TABLE `sessiondata` DISABLE KEYS */;
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
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;

-- Dumping structure for table virussignin2.useractivity
CREATE TABLE IF NOT EXISTS `useractivity` (
  `activityId` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL DEFAULT 0,
  `admitted` int(11) NOT NULL DEFAULT 0,
  `userActivityDatetime` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`activityId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table virussignin2.useractivity: ~0 rows (approximately)
/*!40000 ALTER TABLE `useractivity` DISABLE KEYS */;
/*!40000 ALTER TABLE `useractivity` ENABLE KEYS */;

-- Dumping structure for table virussignin2.userbuffer
CREATE TABLE IF NOT EXISTS `userbuffer` (
  `bufferId` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`bufferId`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

-- Dumping data for table virussignin2.userbuffer: ~6 rows (approximately)
/*!40000 ALTER TABLE `userbuffer` DISABLE KEYS */;
INSERT INTO `userbuffer` (`bufferId`, `userId`) VALUES
	(1, 9),
	(2, 9),
	(3, 9),
	(4, 9),
	(5, 9),
	(6, 9);
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;

-- Dumping data for table virussignin2.users: ~2 rows (approximately)
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`userId`, `lName`, `fName`, `email`, `nNumber`, `signUpDatetime`) VALUES
	(9, 'Ferguson', 'Christopher', 'email@email.com', 'N00192800', '2020-04-23 16:41:12'),
	(10, 'Joe', 'Bob', 'email@email2.com', '0', '2020-04-23 16:42:37');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
