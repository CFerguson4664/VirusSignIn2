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

-- Dumping structure for table virussignin2.sessiondata
CREATE TABLE IF NOT EXISTS `sessiondata` (
  `sessionId` char(32) NOT NULL,
  `userId` int(11) NOT NULL DEFAULT 0,
  `survey` int(11) NOT NULL DEFAULT 0,
  `userActivityId` int(11) NOT NULL DEFAULT 0,
  `sessionDatetime` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`sessionId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table virussignin2.sessiondata: ~1 rows (approximately)
/*!40000 ALTER TABLE `sessiondata` DISABLE KEYS */;
INSERT INTO `sessiondata` (`sessionId`, `userId`, `survey`, `userActivityId`, `sessionDatetime`) VALUES
	('f3f29a66954c5eb156daad5e3d26497b', 0, 0, 0, '2020-05-11 11:41:05');
/*!40000 ALTER TABLE `sessiondata` ENABLE KEYS */;

-- Dumping structure for table virussignin2.sessions
CREATE TABLE IF NOT EXISTS `sessions` (
  `sessionId` char(32) NOT NULL DEFAULT '',
  `level` int(11) NOT NULL DEFAULT 0,
  `creationDatetime` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `renewedDatetime` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`sessionId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table virussignin2.sessions: ~1 rows (approximately)
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` (`sessionId`, `level`, `creationDatetime`, `renewedDatetime`) VALUES
	('f3f29a66954c5eb156daad5e3d26497b', 1, '2020-05-11 11:41:05', '2020-05-11 11:41:05');
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
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table virussignin2.userbuffer: ~0 rows (approximately)
/*!40000 ALTER TABLE `userbuffer` DISABLE KEYS */;
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
	(9, 'Ferguson', 'Christopher', 'email@email.com', '0', '2020-04-23 16:41:12'),
	(10, 'Joe', 'Bob', 'email@email2.com', '0', '2020-04-23 16:42:37');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
