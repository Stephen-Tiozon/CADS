-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 20, 2026 at 09:04 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cads_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `assessments`
--

CREATE TABLE `assessments` (
  `id` int(11) NOT NULL,
  `case_id` int(11) NOT NULL,
  `lmd` int(11) NOT NULL,
  `risk_index` int(11) NOT NULL,
  `ivj` int(11) NOT NULL,
  `ffc` int(11) NOT NULL,
  `cfc` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `assessments`
--

INSERT INTO `assessments` (`id`, `case_id`, `lmd`, `risk_index`, `ivj`, `ffc`, `cfc`) VALUES
(1, 1, 45, 21, 41, 5, 21),
(2, 2, 80, 15, 43, 29, 11),
(3, 3, 20, 33, 52, 22, 20),
(4, 4, 45, 13, 1, 23, 7),
(5, 5, 80, 19, 20, 16, 24),
(6, 6, 20, 49, 25, 22, 16),
(7, 7, 45, 26, 52, 31, 20),
(8, 8, 80, 48, 14, 3, 12),
(9, 9, 20, 35, 36, 26, 6),
(10, 10, 45, 48, 43, 11, 11),
(11, 11, 80, 44, 13, 9, 19),
(12, 12, 20, 8, 31, 14, 19),
(13, 13, 45, 10, 6, 29, 16),
(14, 14, 80, 57, 19, 18, 20),
(15, 15, 20, 36, 8, 25, 13),
(16, 16, 45, 34, 46, 14, 0),
(17, 17, 80, 54, 16, 25, 24),
(18, 18, 20, 45, 2, 27, 19),
(19, 19, 45, 36, 54, 20, 3),
(20, 20, 80, 43, 20, 0, 10),
(21, 21, 20, 17, 10, 28, 21),
(22, 22, 45, 46, 27, 11, 17),
(23, 23, 80, 46, 25, 23, 12),
(24, 24, 20, 28, 36, 29, 5),
(25, 25, 45, 22, 0, 9, 17),
(26, 26, 80, 46, 6, 18, 15),
(27, 27, 20, 35, 44, 6, 25),
(28, 28, 45, 45, 43, 18, 11),
(29, 29, 80, 25, 5, 13, 0),
(30, 30, 20, 24, 47, 13, 4);

-- --------------------------------------------------------

--
-- Table structure for table `assessment_answers`
--

CREATE TABLE `assessment_answers` (
  `id` int(11) NOT NULL,
  `case_id` int(11) NOT NULL,
  `question_category` varchar(50) NOT NULL,
  `question_text` text NOT NULL,
  `selected_answer` text NOT NULL,
  `score_weight` int(11) NOT NULL,
  `recommended_intervention` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `assessment_answers`
--

INSERT INTO `assessment_answers` (`id`, `case_id`, `question_category`, `question_text`, `selected_answer`, `score_weight`, `recommended_intervention`) VALUES
(5, 4, 'General', 'Nena is a 14-year-old girl who discovered that her classmate Kristine has been stealing money from their teacher\'s drawer. Nena is Kristine\'s close friend. Kristine begged Nena not to tell anyone, saying that her family is in desperate need of money for food. Should Nena report what she saw to the teacher?', 'No, because Kristine is her friend and she should protect her.', 0, NULL),
(6, 4, 'General', 'Rodrigo is a 15-year-old boy who witnessed a group of his peers vandalizing the school wall. They pressured him to join in, threatening to exclude him from the group. Rodrigo knows that the school recently used community funds to repaint the walls. What should Rodrigo do?', 'Refuse to join and remind his peers that vandalism is wrong.', 2, NULL),
(7, 4, 'General', 'During a community event, Emilio, age 16, found a wallet containing ₱3,500 cash and several identification cards. His family is struggling financially and his younger siblings haven\'t eaten since morning. What is the most morally appropriate action for Emilio?', 'Keep only what his family needs for food and leave the rest.', 1, NULL),
(8, 4, 'General', 'Ana was asked by her older cousin to deliver a suspicious package to an address in another barangay. Her cousin told her it was \"just clothes\" and offered her ₱500 for the errand. Ana suspects the package might contain illegal items. What should Ana do?', 'Refuse and, if pressured, report her concern to a trusted adult.', 3, NULL),
(9, 5, 'General', 'Natapunan ng softdrinks ang damit mo ng isang pasahero sa jeep. Ano ang gagawin mo? Bakit?', 'Magagalit ako kasi hindi siya maingat.', 0, NULL),
(10, 5, 'General', 'Nilason ng inyong kapitbahay ang inyong alagang aso. Ano ang gagawin mo? Bakit?', 'Alamin ko ang dahilan para manatili ang aming pagkakaibigan.', 2, NULL),
(11, 5, 'General', 'Napatid mo ang alambre ng kuryente sa kalye habang nanunungkit ka ng mangga. Ano ang gagawin mo? Bakit?', 'Sasabihin ko sa kinauukulan, kasi kailangan maibalik nang tama ang alamre.', 3, NULL),
(12, 5, 'General', 'Nakita mo ang grupo ng mga kabataan na sinisira ang bintana sa eskuwelahan ng inyong lugar. Ano ang gagawin mo? Bakit?', 'Hindi ko na lang papansinin, para walang gulong mangyari.', 1, NULL),
(13, 5, 'General', 'Napagtripan ng iyong barkada ang isang bagong salta sa barangay. Ano ang gagawin mo? Bakit?', 'Pagsasabihan ko sila na tumigil, para hindi naman gawin sa amin ng iba.', 1, NULL),
(14, 5, 'General', 'Hinuli ka ng pulis sa kasalanang hindi mo alam. Para pakawalan ka, humihingi siya ng suhol na pera. Ano ang gagawin mo? Bakit?', 'Kailangan ko munang malaman sa kanya kung bakit ako hinuhuli, kasi wala naman akong ginagawang masama.', 2, NULL),
(15, 5, 'General', 'Pinahiya ng inyong kapitbahay ang iyong nanay. Ano ang gagawin mo? Bakit?', 'Hihingi ako ng paliwanag, kasi hindi dapat mabahiran ng masama ang aming magandang pangalan.', 2, NULL),
(16, 5, 'General', 'Pinilit ka ng iyong barakada na gumamit ng ipinagbabawal na gamot? Ano ang gagawin mo? Bakit?', 'Hindi ako gagamit kasi labag sa batas ang ipinagbabawal na gamot.', 3, NULL),
(17, 5, 'General', 'Siniraan ka ng iyong kasamahan sa barangay. Ano ang gagawin mo? Bakit?', 'Pabayaan na lang, kasi bahala ng manghusga ang sambayanan.', 4, NULL),
(18, 5, 'General', 'Naiinis ka sa mga kapatid mo dahil lagi nilang pinakikialaman ang mga gamit mo. Ano ang gagawin mo? Bakit?', 'Ipaliliwanag ko sa kanila na puwede ko namang ibahagi sa kanila ang mga gamit ko, basta magpaalam sila.', 4, NULL),
(19, 5, 'General', 'Pinagagalitan ka ng iyong mga magulang dahil nakikipagbarkada ka sa mga kabataan na gumagawa ng hindi maganda. Ano ang gagawin mo? Bakit?', 'Makikinig ako sa aking mga magulang para masabi nila na masunurin ako.', 2, NULL),
(20, 5, 'General', 'Nagastos mo ang perang pambayad ng iyong nanay sa tindahan. Ano ang gagawin mo? Bakit?', 'Sasabihin ko ang totoo kasi kailangan magawan ng paraan na mabayaran ang tindahan. Para ito sa kabutihan ng lahat.', 4, NULL),
(21, 5, 'General', 'Nasuklian ka ng sobra sa tindahan. Ano ang gagawin mo? Bakit?', 'Ibabalik ko yong sobra kasi yon ay isang magandang kaugalian.', 4, NULL),
(22, 5, 'General', 'Saksi ka sa pagnanakaw ng iyong kaibigan. Ano ang gagawin mo? Bakit?', 'Pababayan ko sila, kasi baka magalit sila sa akin.', 0, NULL),
(23, 6, 'General', 'Natapunan ng softdrinks ang damit mo ng isang pasahero sa jeep. Ano ang gagawin mo? Bakit?', 'Magagalit ako kasi hindi siya maingat.', 0, NULL),
(24, 6, 'General', 'Nilason ng inyong kapitbahay ang inyong alagang aso. Ano ang gagawin mo? Bakit?', 'Aawayin ko siya at pababayaran ko ang aso.', 0, NULL),
(25, 6, 'General', 'Napatid mo ang alambre ng kuryente sa kalye habang nanunungkit ka ng mangga. Ano ang gagawin mo? Bakit?', 'Sasabihin ko sa kinauukulan, kasi kailangan maibalik nang tama ang alamre.', 3, NULL),
(26, 6, 'General', 'Nakita mo ang grupo ng mga kabataan na sinisira ang bintana sa eskuwelahan ng inyong lugar. Ano ang gagawin mo? Bakit?', 'Isusumbong ko sa guwardiya o sa opisyal ng barangay upang matuwa naman sila sa akin.', 2, NULL),
(27, 6, 'General', 'Napagtripan ng iyong barkada ang isang bagong salta sa barangay. Ano ang gagawin mo? Bakit?', 'Pagsasabihan ko sila at kung ayaw nilang magpaawat, tatawag ako ng barangay tanod para awatin sila, kasi kailangan maging tahimik ang lugar.', 4, NULL),
(28, 6, 'General', 'Hinuli ka ng pulis sa kasalanang hindi mo alam. Para pakawalan ka, humihingi siya ng suhol na pera. Ano ang gagawin mo? Bakit?', 'Magbibigay na lang ako kung kaya ko, para makawala ako.', 0, NULL),
(29, 6, 'General', 'Pinahiya ng inyong kapitbahay ang iyong nanay. Ano ang gagawin mo? Bakit?', 'Hihingi ako ng paliwanag para manatili ang aming magandang samahan.', 4, NULL),
(30, 6, 'General', 'Pinilit ka ng iyong barakada na gumamit ng ipinagbabawal na gamot? Ano ang gagawin mo? Bakit?', 'Hindi ako gagamit kasi labag sa batas ang ipinagbabawal na gamot.', 3, NULL),
(31, 6, 'General', 'Siniraan ka ng iyong kasamahan sa barangay. Ano ang gagawin mo? Bakit?', 'Pabayaan na lang, kasi malinis naman ang pangalan ko sa barangay.', 2, NULL),
(32, 6, 'General', 'Naiinis ka sa mga kapatid mo dahil lagi nilang pinakikialaman ang mga gamit mo. Ano ang gagawin mo? Bakit?', 'Ipaliliwanag ko sa kanila na puwede ko namang ibahagi sa kanila ang mga gamit ko, basta magpaalam sila.', 4, NULL),
(33, 6, 'General', 'Pinagagalitan ka ng iyong mga magulang dahil nakikipagbarkada ka sa mga kabataan na gumagawa ng hindi maganda. Ano ang gagawin mo? Bakit?', 'Ipagtatanggol ko ang aking mga barkada, kasi wala naman kaming masamang ginagawa.', 1, NULL),
(34, 6, 'General', 'Nagastos mo ang perang pambayad ng iyong nanay sa tindahan. Ano ang gagawin mo? Bakit?', 'Sasabihin ko ang totoo, kasi ang pagiging tapat ay pagsasama ng maluwat.', 3, NULL),
(35, 6, 'General', 'Nasuklian ka ng sobra sa tindahan. Ano ang gagawin mo? Bakit?', 'Ibabalik ko yong sobra kasi yon ang naaayon sa batas.', 3, NULL),
(36, 6, 'General', 'Saksi ka sa pagnanakaw ng iyong kaibigan. Ano ang gagawin mo? Bakit?', 'Pagsasabihan ko sila na ang ganoon ay hindi gawain ng mga mabuting bata.', 2, NULL),
(37, 6, 'IVJ', 'Reading a good book. (Pagbasa ng magandang libro)', 'No', 1, NULL),
(38, 6, 'IVJ', 'Respecting one’s parents (Paggalang sa magulang)', 'No', 1, NULL),
(39, 6, 'IVJ', 'Running away from home and being astray (Paglayas ng bahay at magpalaboy-laboy)', 'No', 0, NULL),
(40, 6, 'IVJ', 'Smoking cigarettes (Paninigarilyo)', 'No', 0, NULL),
(41, 6, 'IVJ', 'Cutting classes (Di pagpasok sa klase)', 'Yes', 1, NULL),
(42, 6, 'IVJ', 'Believing in God (Paniniwala sa Diyos)', 'No', 1, NULL),
(43, 6, 'IVJ', 'Destroying the properties of others (Pagsira sa gamit ng ibang tao)', 'No', 0, NULL),
(44, 6, 'IVJ', 'Cheating during examinations (Pandaraya sa eksam)', 'No', 0, NULL),
(45, 6, 'IVJ', 'Quarreling with brothers and sisters. (Pakikipag-away sa mga kapatid)', 'No', 0, NULL),
(46, 6, 'IVJ', 'Keeping the house clean. (Pagpapanatiling malinis ang bahay.)', 'No', 1, NULL),
(47, 6, 'IVJ', 'Shoplifting. (Pagnanakaw sa tindahan/grocery/department store)', 'Yes', 1, NULL),
(48, 6, 'IVJ', 'Eating with dirty hands. (Pagkain na marumi ang kamay)', 'Yes', 1, NULL),
(49, 6, 'IVJ', 'Treating someone cruelly. (Pang-aapi sa kapwa)', 'Yes', 1, NULL),
(50, 6, 'IVJ', 'Cruelty to animals. (Pagmamalupit sa hayop)', 'Yes', 1, NULL),
(51, 6, 'IVJ', 'Studying lessons well. (Pag-aaral nang mabuti)', 'Yes', 0, NULL),
(52, 6, 'IVJ', 'Coming home late at night. (Pag-uwi nang gabing-gabi.)', 'Yes', 1, NULL),
(53, 6, 'IVJ', 'Playing very loud and disturbing music. (Pagpapatugtog ng malakas at nakakaistorbong musika)', 'Yes', 1, NULL),
(54, 6, 'IVJ', 'Creating trouble in school. (Pangugulo sa eskewlahan)', 'No', 0, NULL),
(55, 6, 'IVJ', 'Taking care of personal belongings. (Pag-aalaga sa sariling gamit)', 'Yes', 0, NULL),
(56, 6, 'IVJ', 'Going to church/place of worship and praying. (Pagsimba at pagdarasal)', 'Yes', 0, NULL),
(57, 6, 'IVJ', 'Coming to school always late. (Palaging huli sa klase)', 'Yes', 1, NULL),
(58, 6, 'IVJ', 'Stealing (Pagnanakaw)', 'Yes', 1, NULL),
(59, 6, 'IVJ', 'Discussing about bad and malicious things. (Pag-uusap tungkol sa mga bagay na masasama at mapanira sa kapwa)', 'Yes', 1, NULL),
(60, 6, 'IVJ', 'Keeping good friends. (Pagpapanatili sa mabubuting kaibigan.)', 'Yes', 0, NULL),
(61, 6, 'IVJ', 'Arguing and fighting with parents and elders. (Pakikipag-away sa mga mgaulang at nakatatanda)', 'Yes', 1, NULL),
(62, 6, 'IVJ', 'Spending tuition fee. (Pagwaldas ng perang pambayad sa iskul.)', 'Yes', 1, NULL),
(63, 6, 'IVJ', 'Keeping oneself healthy. (Pagiging malusog).', 'No', 1, NULL),
(64, 6, 'IVJ', 'Dropping out of school. (Pagtigil sa pag-aaral.)', 'No', 0, NULL),
(65, 6, 'IVJ', 'Attempting to commit suicide. (Tangkang magpakamatay.)', 'No', 0, NULL),
(66, 6, 'IVJ', 'Obeying traffic rules. (Pagsunod sa trapiko)', 'Yes', 0, NULL),
(67, 6, 'IVJ', 'Getting high grades in school. (Pagkakaroon ng matataas na marka)', 'Yes', 0, NULL),
(68, 6, 'IVJ', 'Doing responsible household chores. (Paggawa ng gawaing bahay)', 'Yes', 0, NULL),
(69, 6, 'IVJ', 'Killing the neighbor’s pet. (Pagpatay sa alagang hayop ng kapitbahay)', 'Yes', 1, NULL),
(70, 6, 'IVJ', 'Driving while drunk. (Pagmamaneho ng lasing.)', 'No', 0, NULL),
(71, 6, 'IVJ', 'Doing a job well. (Paggawa nang maayos ng trabaho.)', 'No', 1, NULL),
(72, 6, 'IVJ', 'Disobeying parents. (Pagsiway sa utos ng magulang.)', 'Yes', 1, NULL),
(73, 6, 'IVJ', 'Taking prohibited drugs. (Paggamit ng droga o bawal na gamot)', 'Yes', 1, NULL),
(74, 6, 'IVJ', 'Coming home straight from school. (Pag-uwi ng deretso sa bahay.)', 'No', 1, NULL),
(75, 6, 'IVJ', 'Mother neglecting her family. (Pagpapabaya ni nanay sa pamilya)', 'No', 0, NULL),
(76, 6, 'IVJ', 'Being dishonest. (Pandaraya.)', 'Yes', 1, NULL),
(77, 6, 'IVJ', 'Having regular exercise for good health. (Pag-eehersisyo para sa kalusugan)', 'Yes', 0, NULL),
(78, 6, 'IVJ', 'Avoiding trouble. (Pag-iwas sa gulo)', 'No', 1, NULL),
(79, 6, 'IVJ', 'Beating someone. (Pananakit sa kapwa)', 'No', 0, NULL),
(80, 6, 'IVJ', 'Helping to benefit a younger sibling. (Pagtulong sa ikabubuti ng nakababatang kapatid)', 'Yes', 0, NULL),
(81, 6, 'IVJ', 'Volunteering in community work. (Pagtulong ng kusa o boluntaryong paggawa)', 'Yes', 0, NULL),
(82, 6, 'IVJ', 'Staging a hold up (Panghohold-up)', 'No', 0, NULL),
(83, 6, 'IVJ', 'Giving donations to charity. (Pagtulong sa nangangailangan)', 'No', 1, NULL),
(84, 6, 'IVJ', 'Keeping the environment clean. (Pagpapanatiling malinis sa kapaligiran)', 'Yes', 0, NULL),
(85, 6, 'IVJ', 'Disobeying traffic rules. (Paglabag sa batas trapiko.)', 'Yes', 1, NULL),
(86, 6, 'IVJ', 'Having bad work habits. (Hindi maayos na pagtatrabaho)', 'Yes', 1, NULL),
(87, 6, 'IVJ', 'Staying away from bad influence. (Pag-iwas sa masasamang barkada)', 'No', 1, NULL),
(88, 6, 'IVJ', 'Doing something good for somebody. (Paggawa ng mabuti sa iba.)', 'Yes', 0, NULL),
(89, 6, 'IVJ', 'Does not want to work. (Ayaw magtrabaho/tamad.)', 'No', 0, NULL),
(90, 6, 'IVJ', 'Attending to the needs of the family. (Pagtugon sa pangangailangan ng pamilya.)', 'Yes', 0, NULL),
(91, 6, 'Cognitive/Intellectual', 'Difficulty understanding consequences of actions', 'Checked', 2, 'Cognitive Behavioral Therapy (CBT)'),
(92, 6, 'Cognitive/Intellectual', 'Displays distorted reasoning regarding the offense', 'Checked', 3, 'Values Formation & Cognitive Restructuring Program'),
(93, 6, 'Psychological/Emotional', 'Shows no remorse or empathy for the victim', 'Checked', 3, 'Empathy Training & Victim Offender Mediation'),
(94, 6, 'Psychological/Emotional', 'Exhibits highly impulsive or erratic behavior', 'Checked', 2, 'Self-Regulation and Anger Management Program'),
(95, 6, 'Psychological/Emotional', 'Displays signs of severe trauma or untreated depression', 'Checked', 3, 'Trauma-Informed Therapy & Psychiatric Evaluation'),
(96, 6, 'Social/Behavioral', 'Easily influenced by negative peer pressure', 'Checked', 2, 'Peer Mentorship & Positive Youth Development Program'),
(97, 6, 'Social/Behavioral', 'History of aggressive behavior towards others or animals', 'Checked', 3, 'Intensive Behavioral Intervention'),
(98, 6, 'Social/Behavioral', 'Shows blatant disrespect for authority figures', 'Checked', 2, 'Life Skills Training & Authority Respect Module'),
(99, 6, 'Family Dynamics', 'High level of conflict or domestic violence in the home', 'Checked', 4, 'Domestic Violence Intervention & Safe House Placement'),
(100, 6, 'Family Dynamics', 'History of criminal behavior among family members', 'Checked', 3, 'Multi-Systemic Therapy (MST)'),
(101, 6, 'Family Dynamics', 'Substance abuse present within the household', 'Checked', 3, 'Family Rehabilitation Support Program'),
(102, 6, 'Family Dynamics', 'Child has poor relationship/attachment with primary caregivers', 'Checked', 2, 'Attachment-Based Family Therapy'),
(103, 6, 'Parenting & Discipline', 'Parents/guardians employ harsh or physical discipline', 'Checked', 3, 'Parenting Effectiveness Seminar (PES)'),
(104, 6, 'Parenting & Discipline', 'Lack of supervision or parental guidance', 'Checked', 3, 'Family Counseling & Supervision Plan Formulation'),
(105, 6, 'Parenting & Discipline', 'Inconsistent rules and boundary setting', 'Checked', 2, 'Family Therapy on Boundary Setting'),
(106, 6, 'Parenting & Discipline', 'Parents tolerate or encourage delinquent behavior', 'Checked', 4, 'Intensive Family Intervention & Protective Custody Review'),
(107, 6, 'Socio-Economic Stressors', 'Family experiences severe financial instability', 'Checked', 2, 'Livelihood Assistance & Cash Transfer Program Referral'),
(108, 6, 'Socio-Economic Stressors', 'Child is forced to work or provide for the family', 'Checked', 3, 'Educational Assistance & Child Labor Intervention'),
(109, 6, 'Socio-Economic Stressors', 'Living environment is unsafe or highly criminogenic', 'Checked', 2, 'Relocation Assessment & Community Support');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_name` varchar(100) NOT NULL,
  `action` varchar(255) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `user_name`, `action`, `entity_type`, `entity_id`, `details`, `ip_address`, `created_at`) VALUES
(1, 3, 'Stephen L. Tiozon', 'User Logged In', 'User', 3, '', '::1', '2026-09-26 17:13:18'),
(2, 2, 'Juan Delos Reyes', 'User Logged In', 'User', 2, '', '::1', '2026-09-27 14:34:39'),
(3, 2, 'Juan Delos Reyes', 'User Logged In', 'User', 2, '', '::1', '2026-09-27 14:57:33'),
(4, 2, 'Juan Delos Reyes', 'User Logged In', 'User', 2, '', '::1', '2026-09-28 08:51:31'),
(5, 2, 'Juan Delos Reyes', 'User Logged In', 'User', 2, '', '::1', '2026-09-28 08:56:20'),
(6, 2, 'Juan Delos Reyes', 'User Logged In', 'User', 2, '', '::1', '2026-09-28 20:03:52'),
(7, 2, 'Juan Delos Reyes', 'User Logged In', 'User', 2, '', '::1', '2026-10-01 15:48:37'),
(8, 2, 'Juan Delos Reyes', 'User Logged In', 'User', 2, '', '::1', '2026-10-04 15:35:42'),
(9, 2, 'Juan Delos Reyes', 'User Logged In', 'User', 2, '', '::1', '2026-10-04 15:45:13'),
(10, 2, 'Juan Delos Reyes', 'User Logged In', 'User', 2, '', '::1', '2026-10-05 15:51:21'),
(11, 2, 'Juan Delos Reyes', 'User Logged In', 'User', 2, '', '::1', '2026-10-06 05:03:11'),
(12, 2, 'Juan Delos Reyes', 'User Logged In', 'User', 2, '', '::1', '2026-10-06 08:07:03'),
(13, 2, 'Juan Delos Reyes', 'User Logged In', 'User', 2, '', '::1', '2026-10-12 13:26:29'),
(14, 2, 'Juan Delos Reyes', 'User Logged In', 'User', 2, '', '::1', '2026-10-20 12:42:47'),
(15, 2, 'Juan Delos Reyes', 'User Logged In', 'User', 2, '', '::1', '2026-10-20 19:03:44');

-- --------------------------------------------------------

--
-- Table structure for table `cases`
--

CREATE TABLE `cases` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `offense` varchar(255) DEFAULT NULL,
  `offense_date` date DEFAULT NULL,
  `offense_location` varchar(255) DEFAULT NULL,
  `primary_guardian` varchar(255) DEFAULT NULL,
  `social_worker_id` int(11) DEFAULT NULL,
  `is_archived` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `alias` varchar(100) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `place_of_birth` varchar(255) DEFAULT NULL,
  `highest_education` varchar(100) DEFAULT NULL,
  `birth_status` varchar(50) DEFAULT NULL,
  `disability` varchar(255) DEFAULT NULL,
  `present_address` text DEFAULT NULL,
  `permanent_address` text DEFAULT NULL,
  `age_at_offense` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cases`
--

INSERT INTO `cases` (`id`, `first_name`, `last_name`, `age`, `gender`, `address`, `contact_number`, `offense`, `offense_date`, `offense_location`, `primary_guardian`, `social_worker_id`, `is_archived`, `created_at`, `alias`, `date_of_birth`, `place_of_birth`, `highest_education`, `birth_status`, `disability`, `present_address`, `permanent_address`, `age_at_offense`) VALUES
(1, 'Maria', 'Navarro', 15, 'Female', '321 Bonifacio St., Brgy. San Jose, Caloocan City', '09346353453', 'Simple Assault', '2026-05-04', 'Public Market, Makati City', 'Joshua Navarro (Grandfather)', NULL, 0, '2026-06-27 17:40:50', 'Nene', '2010-12-17', 'Bulacan', 'High School Graduate', 'Legitimate', 'None', '321 Bonifacio St., Brgy. San Jose, Caloocan City', '321 Bonifacio St., Brgy. San Jose, Caloocan City', 15),
(2, 'Cecilia', 'Perez', 12, 'Female', '852 Marcos Highway, Brgy. Mayamot, Antipolo City', '09349932850', 'Shoplifting', '2025-12-14', 'Public Market, Pasig City', 'Ricardo Perez (Grandfather)', NULL, 0, '2025-12-20 13:10:52', 'Boy', '2013-06-13', 'Davao City', 'Out of School Youth', 'Legitimate', 'ADHD', '852 Marcos Highway, Brgy. Mayamot, Antipolo City', '159 Roxas Blvd., Brgy. Malate, Manila', 12),
(3, 'Ramon', 'Cruz', 16, 'Male', '321 Bonifacio St., Brgy. San Jose, Caloocan City', '09968531925', 'Vandalism', '2026-02-13', 'Public Market, Quezon City', 'Angela Cruz (Mother)', NULL, 0, '2026-02-18 20:58:51', 'Boy', '2009-06-13', 'Quezon City', 'Elementary Level', 'Illegitimate', 'Asthma', '321 Bonifacio St., Brgy. San Jose, Caloocan City', '321 Bonifacio St., Brgy. San Jose, Caloocan City', 16),
(4, 'Ramon', 'Lopez', 14, 'Male', '654 Luna St., Brgy. San Isidro, Paranaque City', '09725634609', 'Malicious Mischief', '2026-04-22', 'Public Market, Quezon City', 'Luis Lopez (Older brother)', NULL, 0, '2026-04-23 02:21:33', 'Dodong', '2012-04-11', 'Cebu City', 'Out of School Youth', 'Legitimate', 'ADHD', '654 Luna St., Brgy. San Isidro, Paranaque City', '654 Luna St., Brgy. San Isidro, Paranaque City', 14),
(5, 'Emilio', 'Lopez', 14, 'Male', '852 Marcos Highway, Brgy. Mayamot, Antipolo City', '09361579233', 'Shoplifting', '2025-09-30', 'Public Market, Manila', 'Jose Lopez (Uncle)', NULL, 0, '2025-11-22 14:27:15', '', '2011-04-05', 'Quezon City', 'Elementary Graduate', 'Legitimate', 'ADHD', '852 Marcos Highway, Brgy. Mayamot, Antipolo City', '852 Marcos Highway, Brgy. Mayamot, Antipolo City', 14),
(6, 'Maria', 'Garcia', 16, 'Female', '987 Taft Ave., Brgy. Ermita, Manila', '09323232273', 'Simple Assault', '2026-06-28', 'Public Market, Pasig City', 'Angelica Garcia (Mother)', NULL, 0, '2026-08-13 05:38:56', 'Boy', '2010-02-03', 'Makati City', 'Out of School Youth', 'Illegitimate', 'None', '987 Taft Ave., Brgy. Ermita, Manila', '654 Luna St., Brgy. San Isidro, Paranaque City', 16),
(7, 'Josefina', 'Gomez', 15, 'Female', '654 Luna St., Brgy. San Isidro, Paranaque City', '09528715607', 'Simple Assault', '2025-12-04', 'Public Market, Quezon City', 'Rafael Gomez (Grandfather)', NULL, 0, '2026-01-20 17:01:11', 'Bong', '2010-11-03', 'Laguna', 'Elementary Graduate', 'Illegitimate', 'ADHD', '654 Luna St., Brgy. San Isidro, Paranaque City', '147 Ortigas Ave., Brgy. Wack-Wack, Mandaluyong City', 15),
(8, 'Maria', 'Aquino', 13, 'Female', '147 Ortigas Ave., Brgy. Wack-Wack, Mandaluyong City', '09911293966', 'Physical Injuries', '2026-02-24', 'Public Market, Quezon City', 'Maria Aquino (Mother)', NULL, 0, '2026-03-22 18:06:41', 'Nene', '2012-05-11', 'Davao City', 'High School Level', 'Illegitimate', 'None', '147 Ortigas Ave., Brgy. Wack-Wack, Mandaluyong City', '147 Ortigas Ave., Brgy. Wack-Wack, Mandaluyong City', 13),
(9, 'Cecilia', 'Perez', 17, 'Female', '987 Taft Ave., Brgy. Ermita, Manila', '09614403593', 'Trespassing', '2026-04-09', 'Public Market, Quezon City', 'Carmen Perez (Aunt)', NULL, 0, '2026-05-21 22:25:35', 'Bebang', '2009-02-24', 'Bulacan', 'High School Graduate', 'Illegitimate', 'None', '987 Taft Ave., Brgy. Ermita, Manila', '987 Taft Ave., Brgy. Ermita, Manila', 17),
(10, 'Carmela', 'Lopez', 15, 'Female', '321 Bonifacio St., Brgy. San Jose, Caloocan City', '09666586988', 'Curfew Violation', '2025-12-22', 'Public Market, Makati City', 'Angela Lopez (Older sister)', NULL, 0, '2026-01-23 10:49:51', 'Ken', '2010-11-16', 'Makati City', 'High School Level', 'Illegitimate', 'None', '321 Bonifacio St., Brgy. San Jose, Caloocan City', '753 EDSA, Brgy. Guadalupe, Makati City', 15),
(11, 'Sarah', 'Fernandez', 13, 'Female', '456 Mabini Ave., Brgy. Poblacion, Makati City', '09961862449', 'Theft', '2025-11-08', 'Public Market, Manila', 'Rosario Fernandez (Mother)', NULL, 0, '2025-12-01 12:14:40', 'Bong', '2012-03-17', 'Quezon City', 'High School Graduate', 'Illegitimate', 'None', '456 Mabini Ave., Brgy. Poblacion, Makati City', '456 Mabini Ave., Brgy. Poblacion, Makati City', 13),
(12, 'Clara', 'Garcia', 13, 'Female', '159 Roxas Blvd., Brgy. Malate, Manila', '09787026900', 'Malicious Mischief', '2026-01-11', 'Public Market, Manila', 'Maria Garcia (Grandmother)', NULL, 0, '2026-01-29 06:07:17', 'Toto', '2012-05-28', 'Quezon City', 'Out of School Youth', 'Illegitimate', 'None', '159 Roxas Blvd., Brgy. Malate, Manila', '159 Roxas Blvd., Brgy. Malate, Manila', 13),
(13, 'Rafael', 'Tolentino', 12, 'Male', '753 EDSA, Brgy. Guadalupe, Makati City', '09738559256', 'Vandalism', '2025-11-14', 'Public Market, Makati City', 'Rosa Tolentino (Aunt)', NULL, 0, '2025-12-26 02:14:46', 'Boy', '2013-07-12', 'Davao City', 'High School Level', 'Illegitimate', 'None', '753 EDSA, Brgy. Guadalupe, Makati City', '123 Rizal St., Brgy. San Antonio, Pasig City', 12),
(14, 'Michelle', 'Gomez', 13, 'Female', '852 Marcos Highway, Brgy. Mayamot, Antipolo City', '09763898484', 'Physical Injuries', '2026-07-22', 'Public Market, Pasig City', 'Elena Gomez (Older sister)', NULL, 0, '2026-08-30 03:58:21', 'Toto', '2012-11-30', 'Pasig City', 'Out of School Youth', 'Legitimate', 'None', '852 Marcos Highway, Brgy. Mayamot, Antipolo City', '753 EDSA, Brgy. Guadalupe, Makati City', 13),
(15, 'Michael', 'Torres', 15, 'Male', '147 Ortigas Ave., Brgy. Wack-Wack, Mandaluyong City', '09729976505', 'Vandalism', '2026-06-23', 'Public Market, Quezon City', 'Clara Torres (Aunt)', NULL, 0, '2026-08-07 20:06:21', '', '2010-12-04', 'Davao City', 'High School Level', 'Illegitimate', 'Mild Autism', '147 Ortigas Ave., Brgy. Wack-Wack, Mandaluyong City', '753 EDSA, Brgy. Guadalupe, Makati City', 15),
(16, 'Ana', 'Perez', 14, 'Female', '987 Taft Ave., Brgy. Ermita, Manila', '09529482361', 'Theft', '2025-12-12', 'Public Market, Pasig City', 'Clara Perez (Grandmother)', NULL, 0, '2026-01-18 23:35:36', 'Boy', '2011-05-14', 'Manila', 'Out of School Youth', 'Illegitimate', 'ADHD', '987 Taft Ave., Brgy. Ermita, Manila', '987 Taft Ave., Brgy. Ermita, Manila', 14),
(17, 'Angelica', 'Fernandez', 15, 'Female', '159 Roxas Blvd., Brgy. Malate, Manila', '09229353386', 'Bullying / Cyberbullying', '2026-08-01', 'Public Market, Pasig City', 'Ana Fernandez (Grandmother)', NULL, 0, '2026-08-03 11:31:00', 'Ken', '2011-05-01', 'Manila', 'Elementary Level', 'Legitimate', 'None', '159 Roxas Blvd., Brgy. Malate, Manila', '159 Roxas Blvd., Brgy. Malate, Manila', 15),
(18, 'Ricardo', 'Fernandez', 13, 'Male', '987 Taft Ave., Brgy. Ermita, Manila', '09637005557', 'Vandalism', '2025-11-21', 'Public Market, Manila', 'Gabriel Fernandez (Grandfather)', NULL, 0, '2025-12-25 16:53:28', '', '2012-06-02', 'Davao City', 'Out of School Youth', 'Illegitimate', 'None', '987 Taft Ave., Brgy. Ermita, Manila', '987 Taft Ave., Brgy. Ermita, Manila', 13),
(19, 'Carmen', 'Torres', 12, 'Female', '654 Luna St., Brgy. San Isidro, Paranaque City', '09581856573', 'Petty Theft', '2026-01-29', 'Public Market, Quezon City', 'Rafael Torres (Older brother)', NULL, 0, '2026-02-26 06:00:56', 'Boy', '2013-09-21', 'Manila', 'High School Graduate', 'Legitimate', 'None', '654 Luna St., Brgy. San Isidro, Paranaque City', '789 Quezon Blvd., Brgy. Commonwealth, Quezon City', 12),
(20, 'Clara', 'Fernandez', 15, 'Female', '159 Roxas Blvd., Brgy. Malate, Manila', '09332376857', 'Trespassing', '2025-11-12', 'Public Market, Makati City', 'Fernando Fernandez (Older brother)', NULL, 0, '2025-12-01 14:56:23', '', '2010-02-05', 'Makati City', 'Out of School Youth', 'Illegitimate', 'None', '159 Roxas Blvd., Brgy. Malate, Manila', '159 Roxas Blvd., Brgy. Malate, Manila', 15),
(21, 'Ramon', 'Navarro', 12, 'Male', '321 Bonifacio St., Brgy. San Jose, Caloocan City', '09443806907', 'Curfew Violation', '2026-07-01', 'Public Market, Makati City', 'Antonio Navarro (Uncle)', NULL, 0, '2026-08-13 00:37:57', 'Bong', '2014-03-06', 'Manila', 'High School Graduate', 'Illegitimate', 'None', '321 Bonifacio St., Brgy. San Jose, Caloocan City', '321 Bonifacio St., Brgy. San Jose, Caloocan City', 12),
(22, 'Angelica', 'Ramos', 16, 'Female', '753 EDSA, Brgy. Guadalupe, Makati City', '09201256144', 'Petty Theft', '2026-07-25', 'Public Market, Quezon City', 'Rosario Ramos (Grandmother)', NULL, 0, '2026-09-02 16:35:55', 'Dodong', '2009-11-09', 'Davao City', 'High School Graduate', 'Legitimate', 'None', '753 EDSA, Brgy. Guadalupe, Makati City', '753 EDSA, Brgy. Guadalupe, Makati City', 16),
(23, 'Clara', 'Reyes', 17, 'Female', '852 Marcos Highway, Brgy. Mayamot, Antipolo City', '09264161882', 'Theft', '2026-06-02', 'Public Market, Makati City', 'Ana Reyes (Mother)', NULL, 0, '2026-07-29 06:35:53', '', '2008-12-22', 'Cebu City', 'Out of School Youth', 'Legitimate', 'None', '852 Marcos Highway, Brgy. Mayamot, Antipolo City', '123 Rizal St., Brgy. San Antonio, Pasig City', 17),
(24, 'Ricardo', 'Gonzales', 14, 'Male', '852 Marcos Highway, Brgy. Mayamot, Antipolo City', '09865605174', 'Theft', '2026-07-27', 'Public Market, Manila', 'Miguel Gonzales (Father)', NULL, 0, '2026-09-07 22:51:50', 'Bebang', '2012-03-30', 'Cebu City', 'None', 'Legitimate', 'None', '852 Marcos Highway, Brgy. Mayamot, Antipolo City', '852 Marcos Highway, Brgy. Mayamot, Antipolo City', 14),
(25, 'Miguel', 'Tolentino', 15, 'Male', '789 Quezon Blvd., Brgy. Commonwealth, Quezon City', '09146117648', 'Malicious Mischief', '2026-06-29', 'Public Market, Pasig City', 'Michelle Tolentino (Aunt)', NULL, 0, '2026-07-11 11:21:39', 'Dodong', '2010-11-22', 'Davao City', 'Out of School Youth', 'Legitimate', 'Mild Autism', '789 Quezon Blvd., Brgy. Commonwealth, Quezon City', '789 Quezon Blvd., Brgy. Commonwealth, Quezon City', 15),
(26, 'Fernando', 'Perez', 12, 'Male', '456 Mabini Ave., Brgy. Poblacion, Makati City', '09234145945', 'Simple Assault', '2026-07-13', 'Public Market, Pasig City', 'Rafael Perez (Grandfather)', NULL, 0, '2026-08-17 12:37:39', 'Bong', '2013-10-03', 'Makati City', 'Elementary Graduate', 'Legitimate', 'Mild Autism', '456 Mabini Ave., Brgy. Poblacion, Makati City', '456 Mabini Ave., Brgy. Poblacion, Makati City', 12),
(27, 'Elena', 'Tolentino', 14, 'Female', '123 Rizal St., Brgy. San Antonio, Pasig City', '09831492517', 'Bullying / Cyberbullying', '2026-05-20', 'Public Market, Pasig City', 'Pedro Tolentino (Uncle)', NULL, 0, '2026-05-25 12:13:28', 'Inday', '2011-12-03', 'Pasig City', 'None', 'Illegitimate', 'Mild Autism', '123 Rizal St., Brgy. San Antonio, Pasig City', '123 Rizal St., Brgy. San Antonio, Pasig City', 14),
(28, 'Pedro', 'Bautista', 13, 'Male', '789 Quezon Blvd., Brgy. Commonwealth, Quezon City', '09552772678', 'Curfew Violation', '2026-01-10', 'Public Market, Manila', 'Jessica Bautista (Older sister)', NULL, 0, '2026-01-28 10:49:44', 'Bebang', '2012-02-18', 'Davao City', 'High School Level', 'Illegitimate', 'None', '789 Quezon Blvd., Brgy. Commonwealth, Quezon City', '789 Quezon Blvd., Brgy. Commonwealth, Quezon City', 13),
(29, 'Andres', 'Bautista', 14, 'Male', '852 Marcos Highway, Brgy. Mayamot, Antipolo City', '09504273319', 'Shoplifting', '2025-12-30', 'Public Market, Quezon City', 'Angelica Bautista (Grandmother)', NULL, 0, '2026-02-23 22:45:12', 'Dodong', '2011-03-13', 'Cebu City', 'Elementary Graduate', 'Illegitimate', 'None', '852 Marcos Highway, Brgy. Mayamot, Antipolo City', '852 Marcos Highway, Brgy. Mayamot, Antipolo City', 14),
(30, 'Jomar', 'Reyes', 14, 'Male', '159 Roxas Blvd., Brgy. Malate, Manila', '09273225697', 'Theft', '2025-08-21', 'Public Market, Quezon City', 'Cecilia Reyes (Older sister)', NULL, 0, '2025-10-08 17:53:05', 'Dodong', '2011-01-05', 'Manila', 'Elementary Graduate', 'Legitimate', 'None', '159 Roxas Blvd., Brgy. Malate, Manila', '159 Roxas Blvd., Brgy. Malate, Manila', 14);

-- --------------------------------------------------------

--
-- Table structure for table `case_files`
--

CREATE TABLE `case_files` (
  `id` int(11) NOT NULL,
  `case_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `uploaded_by` varchar(100) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `case_notes`
--

CREATE TABLE `case_notes` (
  `id` int(11) NOT NULL,
  `case_id` int(11) NOT NULL,
  `social_worker_id` int(11) NOT NULL,
  `note_date` date NOT NULL,
  `note_category` varchar(50) DEFAULT 'General Note',
  `note_content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `disposition_plans`
--

CREATE TABLE `disposition_plans` (
  `id` int(11) NOT NULL,
  `case_id` int(11) NOT NULL,
  `disposition_type` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Active',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `disposition_updates`
--

CREATE TABLE `disposition_updates` (
  `id` int(11) NOT NULL,
  `disposition_plan_id` int(11) NOT NULL,
  `update_date` date NOT NULL,
  `update_type` varchar(100) NOT NULL,
  `notes` text NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `family_members`
--

CREATE TABLE `family_members` (
  `id` int(11) NOT NULL,
  `case_id` int(11) NOT NULL,
  `name` varchar(150) DEFAULT NULL,
  `relationship` varchar(50) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `family_members`
--

INSERT INTO `family_members` (`id`, `case_id`, `name`, `relationship`, `age`, `occupation`) VALUES
(4, 4, 'Arnel Tiozon', 'father', 57, 'none'),
(5, 6, 'Juan Reyes', 'Father', 56, 'CEO');

-- --------------------------------------------------------

--
-- Table structure for table `lmd_question_bank`
--

CREATE TABLE `lmd_question_bank` (
  `id` int(11) NOT NULL,
  `dilemma` text NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`options`)),
  `scores` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`scores`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lmd_question_bank`
--

INSERT INTO `lmd_question_bank` (`id`, `dilemma`, `options`, `scores`, `created_at`) VALUES
(1, 'Natapunan ng softdrinks ang damit mo ng isang pasahero sa jeep. Ano ang gagawin mo? Bakit?', '[\"Magagalit ako kasi hindi siya maingat.\",\"Pagpasensiyahan na lang baka mangyari din sa akin yong ganoon.\",\"Hindi na lang ako kikibo kasi baka isipin nila na maliit lang naman na isyu pinalalaki ko pa.\",\"Pagpasensiyahan ko na lang kasi hindi naman ipinagbabawal ang inumin sa jeep.\",\"Pagsasabihan ko na sa susunod ubusin muna niya ang kanyang softdrink bago sumakay para hindi siya makapinsala ng iba.\",\"Pagsasabihan ko siya sa paraan na hindi naman siya mapapahiya kasi alam ko ang damdamin ng napagsasabihan sa harap ng maraming tao.\"]', '[1,2,3,4,5,6]', '2026-09-22 12:26:32'),
(2, 'Nilason ng inyong kapitbahay ang inyong alagang aso. Ano ang gagawin mo? Bakit?', '[\"Aawayin ko siya at pababayaran ko ang aso.\",\"Alamin ko ang dahilan kasi baka may napinsala rin ang aso ko.\",\"Alamin ko ang dahilan para manatili ang aming pagkakaibigan.\",\"Alamin ko ang dahilan, kasi may nilabag siyang batas.\",\"Alamin ko ang dahilan kasi baka ako rin ang may pagkukulang.\",\"Ipapaliwanag ko sa kanya na mali ang ginawa niya, kasi kahit buhay ng hayop ay dapat na igalang.\"]', '[1,2,3,4,5,6]', '2026-09-22 12:26:32'),
(3, 'Napatid mo ang alambre ng kuryente sa kalye habang nanunungkit ka ng mangga. Ano ang gagawin mo? Bakit?', '[\"Aayusin ko ang alamre baka mapagalitan ako.\",\"Aayusin ko ang alamre upang hindi ako pagbawalan na kumuha uli ng magga.\",\"Aayusin ko ang alambre kasi kung may nakakita sa akin at pabayaan ko lang, sasabihin nila na napakasama kong bata.\",\"Sasabihin ko sa kinauukulan, kasi kailangan maibalik nang tama ang alamre.\",\"Sasabihin ko sa kinauukulan upang hindi makapinsala.\",\"Sasabihin ko sa kinauukulan upang humingi ng tulong. Hindi dapat takasan ang problema na nagawa ko.\"]', '[1,2,3,4,5,6]', '2026-09-22 12:26:32'),
(4, 'Nakita mo ang grupo ng mga kabataan na sinisira ang bintana sa eskuwelahan ng inyong lugar. Ano ang gagawin mo? Bakit?', '[\"Hindi ko na lang papansinin, kasi baka magalit sila sa akin.\",\"Hindi ko na lang papansinin, para walang gulong mangyari.\",\"Isusumbong ko sa guwardiya o sa opisyal ng barangay upang matuwa naman sila sa akin.\",\"Isusumbong ko sa kinauukulan ang ginawa ng mga bata kasi masama iyon.\",\"Isusumbong ko sa kinauukulan upang madisiplina ang mga naturang bata para makatulong ako at panatilihing maayos ang aming komunidad.\",\"Isusumbong ko sa kinauukulan upang malaman nila na may malasakit ako bilang isang mamamayan.\"]', '[1,2,3,4,5,6]', '2026-09-22 12:26:32'),
(5, 'Napagtripan ng iyong barkada ang isang bagong salta sa barangay. Ano ang gagawin mo? Bakit?', '[\"Pabayaan ko lang sila, kasi baka madamay ako.\",\"Pagsasabihan ko sila na tumigil, para hindi naman gawin sa amin ng iba.\",\"Pagsasabihan ko sila dahil hindi tama ang ginagawa nila.\",\"Pagsasabihan ko sila kasi labag sa batas ang basta na lang manakit ng iba.\",\"Pagsasabihan ko sila at kung ayaw nilang magpaawat, tatawag ako ng barangay tanod para awatin sila, kasi kailangan maging tahimik ang lugar.\",\"Isusumbong ko sila sa barangay para maawat sila at hindi dapat manakit ng kapwa, lalo pa’t wala namang ginagawang masama.\"]', '[1,2,3,4,5,6]', '2026-09-22 12:26:32'),
(6, 'Hinuli ka ng pulis sa kasalanang hindi mo alam. Para pakawalan ka, humihingi siya ng suhol na pera. Ano ang gagawin mo? Bakit?', '[\"Magbibigay na lang ako kung kaya ko, para makawala ako.\",\"Hindi ako basta magbibigay, kasi wala naman akong pera.\",\"Kailangan ko munang malaman sa kanya kung bakit ako hinuhuli, kasi wala naman akong ginagawang masama.\",\"Hindi ako magbibigay kasi labag sa batas ang ginagawa niya.\",\"Hindi ako magbibigay kasi kailangang matigil ang panunuhol.\",\"Hindi ako magbibigay, kasi gusto kong manatili ang maganda kong pagtitiwala sa mga pulis.\"]', '[1,2,3,4,5,6]', '2026-09-22 12:26:32'),
(7, 'Pinahiya ng inyong kapitbahay ang iyong nanay. Ano ang gagawin mo? Bakit?', '[\"Pabayaan na lang, para hindi na humaba ang problema.\",\"Pabayaan na lang, kasi baka may nagawang di-tama ang nanay ko.\",\"Hihingi ako ng paliwanag, kasi hindi dapat mabahiran ng masama ang aming magandang pangalan.\",\"Hihingi ako ng paliwanag, kasi karapatan naming malaman ang dahilan.\",\"Hihingi ako ng paliwanag para manatili ang aming magandang samahan.\",\"Hayaan ko na lang, kasi kaya namang ayusin yon ng nanay ko. May tiwala ako sa kanya.\"]', '[1,2,3,4,5,6]', '2026-09-22 12:26:32'),
(8, 'Pinilit ka ng iyong barakada na gumamit ng ipinagbabawal na gamot? Ano ang gagawin mo? Bakit?', '[\"Susubukan kong gumamit kasi ayaw kong magalit sila sa akin.\",\"Hindi ako gagamit, kasi gusto ko nga na itigil nila ang ipinagbabawal na gamot.\",\"Hindi ako gagamit para hindi ako magkaroon ng masamang record.\",\"Hindi ako gagamit kasi labag sa batas ang ipinagbabawal na gamot.\",\"Hindi ako gagamit, kasi alam ko na marami ng tao ang nasira sa ipinagbabawal na gamot.\",\"Hindi ako gagamit, kasi nagkakampanya nga ako laban sa ipinagbabawal na gamot.\"]', '[1,2,3,4,5,6]', '2026-09-22 12:26:32'),
(9, 'Siniraan ka ng iyong kasamahan sa barangay. Ano ang gagawin mo? Bakit?', '[\"Susugurin ko siya, kasi mali ang kanyang ginagawa.\",\"Gagantihan ko siya para maintindihan niya ang kanyang ginagawa. Susugurin ko siya, kasi mali ang kanyang ginagawa.\",\"Pabayaan na lang, kasi malinis naman ang pangalan ko sa barangay.\",\"Pabayaan na lang, kasi may mga kaukulang batas na magbibigay liwanag sa anumang issue o paratang.\",\"Pabayaan na lang, kasi bahala ng manghusga ang sambayanan.\",\"Pabayaan na lang, kasi matatag ang aking paninindigan para sa kabutihan at ikauunlad ng aming barangay.\"]', '[1,2,3,4,5,6]', '2026-09-22 12:26:32'),
(10, 'Naiinis ka sa mga kapatid mo dahil lagi nilang pinakikialaman ang mga gamit mo. Ano ang gagawin mo? Bakit?', '[\"Tatakutin at pagagalitan ko sila, para matigil ang kanilang pakikialam.\",\"Itatago ko na lang ang mga gamit ko, para di nila mapakialaman.\",\"Ipaliliwanag ko sa kanila na gusto kong maging maingat sa aking mga gamit para tumagal ang pakinabang nito.\",\"Ipaliliwanag ko sa kanila na hindi tama ang nakikialam sa gamit ng iba.\",\"Ipaliliwanag ko sa kanila na puwede ko namang ibahagi sa kanila ang mga gamit ko, basta magpaalam sila.\",\"Ipaliliwanag ko sa kanila na kahit sa magkakapatid, kailangan ang respeto sa isa\'t isa.\"]', '[1,2,3,4,5,6]', '2026-09-22 12:26:32'),
(11, 'Pinagagalitan ka ng iyong mga magulang dahil nakikipagbarkada ka sa mga kabataan na gumagawa ng hindi maganda. Ano ang gagawin mo? Bakit?', '[\"Makikinig ako sa aking mga magulang para di ako mapagalitan.\",\"Ipagtatanggol ko ang aking mga barkada, kasi wala naman kaming masamang ginagawa.\",\"Makikinig ako sa aking mga magulang para masabi nila na masunurin ako.\",\"Itatanong ko sa aking mga magulang kung bakit nasabi nilang masama ang aking mga kaibigan. Kasi kung masama nga, ayaw ko ring makagawa ng labag sa batas.\",\"Itatanong ko sa aking mga magulang kung anong masama ang alam nila sa aking mga kaibigan, kasi gusto ko ring makaiwas sa anumang gulo.\",\"Ipaliliwanag ko sa aking mga magulang na gusto kong maging kasangkapan sa pagbabago ng aking mga kaibigan.\"]', '[1,2,3,4,5,6]', '2026-09-22 12:26:32'),
(12, 'Nagastos mo ang perang pambayad ng iyong nanay sa tindahan. Ano ang gagawin mo? Bakit?', '[\"Hindi ko aaminin na nagastos ko, kasi wala namang nakakaalam na akong kumuha at ayaw kong mapagalitan.\",\"Sasabihin ko ang totoo para wala ng madamay na iba.\",\"Sasabihin ko ang totoo para hindi ako masira sa nanay ko.\",\"Sasabihin ko ang totoo, kasi ang pagiging tapat ay pagsasama ng maluwat.\",\"Sasabihin ko ang totoo kasi kailangan magawan ng paraan na mabayaran ang tindahan. Para ito sa kabutihan ng lahat.\",\"Sasabihin ko ang totoo kasi hindi ako matatahimik na madagdagan ang aking kasalanan.\"]', '[1,2,3,4,5,6]', '2026-09-22 12:26:32'),
(13, 'Nasuklian ka ng sobra sa tindahan. Ano ang gagawin mo? Bakit?', '[\"Hindi ko na ibabalik ang sobra, kasi kailangan ko yong pera.\",\"Ibabalik ko yong sobra, kasi baka mas malaki ang mawala sa akin.\",\"Ibabalik ko yong sobra para lalo akong pagkatiwalaan ng iba.\",\"Ibabalik ko yong sobra kasi yon ang naaayon sa batas.\",\"Ibabalik ko yong sobra kasi yon ay isang magandang kaugalian.\",\"Ibabalik ko yong sobra, kasi hindi ko dapat pakinabangan ang hindi ko pinaghirapan.\"]', '[1,2,3,4,5,6]', '2026-09-22 12:26:32'),
(14, 'Saksi ka sa pagnanakaw ng iyong kaibigan. Ano ang gagawin mo? Bakit?', '[\"Pababayan ko sila, kasi baka magalit sila sa akin.\",\"Ipagtatanggol ko ang sarili ko kapag ako ay idinamay nila.\",\"Pagsasabihan ko sila na ang ganoon ay hindi gawain ng mga mabuting bata.\",\"Pagsasabihan ko sila na may batas na nagpaparusa sa masamang gawain.\",\"Pagsasabihan ko sila na nakakasira sa pangalan ang masamang gawain.\",\"Pagsasabihan ko sila na labag sa mata ng Diyos at ng tao ang masamang gawain.\"]', '[1,2,3,4,5,6]', '2026-09-22 12:26:32');

-- --------------------------------------------------------

--
-- Table structure for table `observational_indicators`
--

CREATE TABLE `observational_indicators` (
  `id` int(11) NOT NULL,
  `type` varchar(10) NOT NULL,
  `category` varchar(100) NOT NULL,
  `statement` text NOT NULL,
  `risk_weight` int(11) NOT NULL,
  `recommended_intervention` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `observational_indicators`
--

INSERT INTO `observational_indicators` (`id`, `type`, `category`, `statement`, `risk_weight`, `recommended_intervention`, `created_at`) VALUES
(1, 'CFC', 'Cognitive/Intellectual', 'Difficulty understanding consequences of actions', 2, 'Cognitive Behavioral Therapy (CBT)', '2026-09-22 13:26:38'),
(2, 'CFC', 'Cognitive/Intellectual', 'Lacks basic literacy or numeracy for their age', 1, 'Alternative Learning System (ALS) or Educational Support', '2026-09-22 13:26:38'),
(3, 'CFC', 'Cognitive/Intellectual', 'Displays distorted reasoning regarding the offense', 3, 'Values Formation & Cognitive Restructuring Program', '2026-09-22 13:26:38'),
(4, 'CFC', 'Psychological/Emotional', 'Shows no remorse or empathy for the victim', 3, 'Empathy Training & Victim Offender Mediation', '2026-09-22 13:26:38'),
(5, 'CFC', 'Psychological/Emotional', 'Exhibits highly impulsive or erratic behavior', 2, 'Self-Regulation and Anger Management Program', '2026-09-22 13:26:38'),
(6, 'CFC', 'Psychological/Emotional', 'Displays signs of severe trauma or untreated depression', 3, 'Trauma-Informed Therapy & Psychiatric Evaluation', '2026-09-22 13:26:38'),
(7, 'CFC', 'Psychological/Emotional', 'Inability to handle frustration without aggression', 2, 'Anger Management Program', '2026-09-22 13:26:38'),
(8, 'CFC', 'Social/Behavioral', 'Easily influenced by negative peer pressure', 2, 'Peer Mentorship & Positive Youth Development Program', '2026-09-22 13:26:38'),
(9, 'CFC', 'Social/Behavioral', 'History of aggressive behavior towards others or animals', 3, 'Intensive Behavioral Intervention', '2026-09-22 13:26:38'),
(10, 'CFC', 'Social/Behavioral', 'Shows blatant disrespect for authority figures', 2, 'Life Skills Training & Authority Respect Module', '2026-09-22 13:26:38'),
(11, 'CFC', 'Social/Behavioral', 'Substance abuse indicators present', 3, 'Rehabilitation & Substance Abuse Counseling', '2026-09-22 13:26:38'),
(12, 'FFC', 'Parenting & Discipline', 'Parents/guardians employ harsh or physical discipline', 3, 'Parenting Effectiveness Seminar (PES)', '2026-09-22 13:26:38'),
(13, 'FFC', 'Parenting & Discipline', 'Lack of supervision or parental guidance', 3, 'Family Counseling & Supervision Plan Formulation', '2026-09-22 13:26:38'),
(14, 'FFC', 'Parenting & Discipline', 'Inconsistent rules and boundary setting', 2, 'Family Therapy on Boundary Setting', '2026-09-22 13:26:38'),
(15, 'FFC', 'Parenting & Discipline', 'Parents tolerate or encourage delinquent behavior', 4, 'Intensive Family Intervention & Protective Custody Review', '2026-09-22 13:26:38'),
(16, 'FFC', 'Family Dynamics', 'High level of conflict or domestic violence in the home', 4, 'Domestic Violence Intervention & Safe House Placement', '2026-09-22 13:26:38'),
(17, 'FFC', 'Family Dynamics', 'History of criminal behavior among family members', 3, 'Multi-Systemic Therapy (MST)', '2026-09-22 13:26:38'),
(18, 'FFC', 'Family Dynamics', 'Substance abuse present within the household', 3, 'Family Rehabilitation Support Program', '2026-09-22 13:26:38'),
(19, 'FFC', 'Family Dynamics', 'Child has poor relationship/attachment with primary caregivers', 2, 'Attachment-Based Family Therapy', '2026-09-22 13:26:38'),
(20, 'FFC', 'Socio-Economic Stressors', 'Family experiences severe financial instability', 2, 'Livelihood Assistance & Cash Transfer Program Referral', '2026-09-22 13:26:38'),
(21, 'FFC', 'Socio-Economic Stressors', 'Child is forced to work or provide for the family', 3, 'Educational Assistance & Child Labor Intervention', '2026-09-22 13:26:38'),
(22, 'FFC', 'Socio-Economic Stressors', 'Living environment is unsafe or highly criminogenic', 2, 'Relocation Assessment & Community Support', '2026-09-22 13:26:38');

-- --------------------------------------------------------

--
-- Table structure for table `question_bank`
--

CREATE TABLE `question_bank` (
  `id` int(11) NOT NULL,
  `assessment_type` varchar(50) NOT NULL,
  `statement` text NOT NULL,
  `is_reverse_scored` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `question_bank`
--

INSERT INTO `question_bank` (`id`, `assessment_type`, `statement`, `is_reverse_scored`, `created_at`) VALUES
(4, 'IVJ', 'Reading a good book. (Pagbasa ng magandang libro)', 0, '2026-09-22 11:08:51'),
(5, 'IVJ', 'Respecting one’s parents (Paggalang sa magulang)', 0, '2026-09-22 11:08:51'),
(6, 'IVJ', 'Running away from home and being astray (Paglayas ng bahay at magpalaboy-laboy)', 1, '2026-09-22 11:08:51'),
(7, 'IVJ', 'Smoking cigarettes (Paninigarilyo)', 1, '2026-09-22 11:08:51'),
(8, 'IVJ', 'Cutting classes (Di pagpasok sa klase)', 1, '2026-09-22 11:08:51'),
(9, 'IVJ', 'Believing in God (Paniniwala sa Diyos)', 0, '2026-09-22 11:08:51'),
(10, 'IVJ', 'Destroying the properties of others (Pagsira sa gamit ng ibang tao)', 1, '2026-09-22 11:08:51'),
(11, 'IVJ', 'Cheating during examinations (Pandaraya sa eksam)', 1, '2026-09-22 11:08:51'),
(12, 'IVJ', 'Quarreling with brothers and sisters. (Pakikipag-away sa mga kapatid)', 1, '2026-09-22 11:08:51'),
(13, 'IVJ', 'Keeping the house clean. (Pagpapanatiling malinis ang bahay.)', 0, '2026-09-22 11:08:51'),
(14, 'IVJ', 'Shoplifting. (Pagnanakaw sa tindahan/grocery/department store)', 1, '2026-09-22 11:08:51'),
(15, 'IVJ', 'Eating with dirty hands. (Pagkain na marumi ang kamay)', 1, '2026-09-22 11:08:51'),
(16, 'IVJ', 'Treating someone cruelly. (Pang-aapi sa kapwa)', 1, '2026-09-22 11:08:51'),
(17, 'IVJ', 'Cruelty to animals. (Pagmamalupit sa hayop)', 1, '2026-09-22 11:08:51'),
(18, 'IVJ', 'Studying lessons well. (Pag-aaral nang mabuti)', 0, '2026-09-22 11:08:51'),
(19, 'IVJ', 'Coming home late at night. (Pag-uwi nang gabing-gabi.)', 1, '2026-09-22 11:08:51'),
(20, 'IVJ', 'Playing very loud and disturbing music. (Pagpapatugtog ng malakas at nakakaistorbong musika)', 1, '2026-09-22 11:08:51'),
(21, 'IVJ', 'Creating trouble in school. (Pangugulo sa eskewlahan)', 1, '2026-09-22 11:08:51'),
(22, 'IVJ', 'Taking care of personal belongings. (Pag-aalaga sa sariling gamit)', 0, '2026-09-22 11:08:51'),
(23, 'IVJ', 'Going to church/place of worship and praying. (Pagsimba at pagdarasal)', 0, '2026-09-22 11:08:51'),
(24, 'IVJ', 'Coming to school always late. (Palaging huli sa klase)', 1, '2026-09-22 11:08:51'),
(25, 'IVJ', 'Stealing (Pagnanakaw)', 1, '2026-09-22 11:08:51'),
(26, 'IVJ', 'Discussing about bad and malicious things. (Pag-uusap tungkol sa mga bagay na masasama at mapanira sa kapwa)', 1, '2026-09-22 11:08:51'),
(27, 'IVJ', 'Keeping good friends. (Pagpapanatili sa mabubuting kaibigan.)', 0, '2026-09-22 11:08:51'),
(28, 'IVJ', 'Arguing and fighting with parents and elders. (Pakikipag-away sa mga mgaulang at nakatatanda)', 1, '2026-09-22 11:08:51'),
(29, 'IVJ', 'Spending tuition fee. (Pagwaldas ng perang pambayad sa iskul.)', 1, '2026-09-22 11:08:51'),
(30, 'IVJ', 'Keeping oneself healthy. (Pagiging malusog).', 0, '2026-09-22 11:08:51'),
(31, 'IVJ', 'Dropping out of school. (Pagtigil sa pag-aaral.)', 1, '2026-09-22 11:08:51'),
(32, 'IVJ', 'Attempting to commit suicide. (Tangkang magpakamatay.)', 1, '2026-09-22 11:08:51'),
(33, 'IVJ', 'Obeying traffic rules. (Pagsunod sa trapiko)', 0, '2026-09-22 11:08:51'),
(34, 'IVJ', 'Getting high grades in school. (Pagkakaroon ng matataas na marka)', 0, '2026-09-22 11:08:51'),
(35, 'IVJ', 'Doing responsible household chores. (Paggawa ng gawaing bahay)', 0, '2026-09-22 11:08:51'),
(36, 'IVJ', 'Killing the neighbor’s pet. (Pagpatay sa alagang hayop ng kapitbahay)', 1, '2026-09-22 11:08:51'),
(37, 'IVJ', 'Driving while drunk. (Pagmamaneho ng lasing.)', 1, '2026-09-22 11:08:51'),
(38, 'IVJ', 'Doing a job well. (Paggawa nang maayos ng trabaho.)', 0, '2026-09-22 11:08:51'),
(39, 'IVJ', 'Disobeying parents. (Pagsiway sa utos ng magulang.)', 1, '2026-09-22 11:08:51'),
(40, 'IVJ', 'Taking prohibited drugs. (Paggamit ng droga o bawal na gamot)', 1, '2026-09-22 11:08:51'),
(41, 'IVJ', 'Coming home straight from school. (Pag-uwi ng deretso sa bahay.)', 0, '2026-09-22 11:08:51'),
(42, 'IVJ', 'Mother neglecting her family. (Pagpapabaya ni nanay sa pamilya)', 1, '2026-09-22 11:08:51'),
(43, 'IVJ', 'Being dishonest. (Pandaraya.)', 1, '2026-09-22 11:08:51'),
(44, 'IVJ', 'Having regular exercise for good health. (Pag-eehersisyo para sa kalusugan)', 0, '2026-09-22 11:08:51'),
(45, 'IVJ', 'Avoiding trouble. (Pag-iwas sa gulo)', 0, '2026-09-22 11:08:51'),
(46, 'IVJ', 'Beating someone. (Pananakit sa kapwa)', 1, '2026-09-22 11:08:51'),
(47, 'IVJ', 'Helping to benefit a younger sibling. (Pagtulong sa ikabubuti ng nakababatang kapatid)', 0, '2026-09-22 11:08:51'),
(48, 'IVJ', 'Volunteering in community work. (Pagtulong ng kusa o boluntaryong paggawa)', 0, '2026-09-22 11:08:51'),
(49, 'IVJ', 'Staging a hold up (Panghohold-up)', 1, '2026-09-22 11:08:51'),
(50, 'IVJ', 'Giving donations to charity. (Pagtulong sa nangangailangan)', 0, '2026-09-22 11:08:51'),
(51, 'IVJ', 'Keeping the environment clean. (Pagpapanatiling malinis sa kapaligiran)', 0, '2026-09-22 11:08:51'),
(52, 'IVJ', 'Disobeying traffic rules. (Paglabag sa batas trapiko.)', 1, '2026-09-22 11:08:51'),
(53, 'IVJ', 'Having bad work habits. (Hindi maayos na pagtatrabaho)', 1, '2026-09-22 11:08:51'),
(54, 'IVJ', 'Staying away from bad influence. (Pag-iwas sa masasamang barkada)', 0, '2026-09-22 11:08:51'),
(55, 'IVJ', 'Doing something good for somebody. (Paggawa ng mabuti sa iba.)', 0, '2026-09-22 11:08:51'),
(56, 'IVJ', 'Does not want to work. (Ayaw magtrabaho/tamad.)', 1, '2026-09-22 11:08:51'),
(57, 'IVJ', 'Attending to the needs of the family. (Pagtugon sa pangangailangan ng pamilya.)', 0, '2026-09-22 11:08:51');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'social_worker',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `avatar_url` varchar(255) DEFAULT NULL,
  `session_token` varchar(128) DEFAULT NULL,
  `session_last_active` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password_hash`, `full_name`, `email`, `role`, `created_at`, `avatar_url`) VALUES
(2, 'admin', '$2y$10$C.flxGd5W3CJ5Oq3X2rvsugHY8iYD3Kou1am/bI4TuxzFXtmieV9G', 'Juan Delos Reyes', '', 'admin', '2026-09-22 12:57:15', '/uploads/avatars/avatar_2_1790442780.jpg'),
(3, 'stephen', '$2y$10$fMbY2Gd1yRhIdFzGWW0Pm.JPCzEgrVng/4U75tUEAXs9gilhD6jLG', 'Stephen L. Tiozon', '', 'social_worker', '2026-09-25 08:27:07', '/uploads/avatars/avatar_3_1790442870.jpg');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assessments`
--
ALTER TABLE `assessments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `case_id` (`case_id`);

--
-- Indexes for table `assessment_answers`
--
ALTER TABLE `assessment_answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `case_id` (`case_id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cases`
--
ALTER TABLE `cases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_social_worker` (`social_worker_id`);

--
-- Indexes for table `case_files`
--
ALTER TABLE `case_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `case_id` (`case_id`);

--
-- Indexes for table `case_notes`
--
ALTER TABLE `case_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `case_id` (`case_id`),
  ADD KEY `social_worker_id` (`social_worker_id`);

--
-- Indexes for table `disposition_plans`
--
ALTER TABLE `disposition_plans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `case_id` (`case_id`),
  ADD KEY `fk_disposition_creator` (`created_by`);

--
-- Indexes for table `disposition_updates`
--
ALTER TABLE `disposition_updates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `disposition_plan_id` (`disposition_plan_id`);

--
-- Indexes for table `family_members`
--
ALTER TABLE `family_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `case_id` (`case_id`);

--
-- Indexes for table `lmd_question_bank`
--
ALTER TABLE `lmd_question_bank`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `observational_indicators`
--
ALTER TABLE `observational_indicators`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `question_bank`
--
ALTER TABLE `question_bank`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `assessments`
--
ALTER TABLE `assessments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `assessment_answers`
--
ALTER TABLE `assessment_answers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=110;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `cases`
--
ALTER TABLE `cases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `case_files`
--
ALTER TABLE `case_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `case_notes`
--
ALTER TABLE `case_notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `disposition_plans`
--
ALTER TABLE `disposition_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `disposition_updates`
--
ALTER TABLE `disposition_updates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `family_members`
--
ALTER TABLE `family_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `lmd_question_bank`
--
ALTER TABLE `lmd_question_bank`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `observational_indicators`
--
ALTER TABLE `observational_indicators`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `question_bank`
--
ALTER TABLE `question_bank`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assessments`
--
ALTER TABLE `assessments`
  ADD CONSTRAINT `assessments_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `assessment_answers`
--
ALTER TABLE `assessment_answers`
  ADD CONSTRAINT `assessment_answers_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cases`
--
ALTER TABLE `cases`
  ADD CONSTRAINT `fk_social_worker` FOREIGN KEY (`social_worker_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `case_files`
--
ALTER TABLE `case_files`
  ADD CONSTRAINT `case_files_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `case_notes`
--
ALTER TABLE `case_notes`
  ADD CONSTRAINT `case_notes_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `case_notes_ibfk_2` FOREIGN KEY (`social_worker_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `disposition_plans`
--
ALTER TABLE `disposition_plans`
  ADD CONSTRAINT `disposition_plans_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_disposition_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `disposition_updates`
--
ALTER TABLE `disposition_updates`
  ADD CONSTRAINT `disposition_updates_ibfk_1` FOREIGN KEY (`disposition_plan_id`) REFERENCES `disposition_plans` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `family_members`
--
ALTER TABLE `family_members`
  ADD CONSTRAINT `family_members_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
