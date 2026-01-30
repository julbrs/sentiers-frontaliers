-- ============================================
-- Import des dons 2025 depuis le CSV
-- ============================================
-- Instructions:
-- 1. Créez d'abord une saison 2025 si elle n'existe pas
-- 2. Remplacez season_id=1 par l'ID correct de la saison 2025
-- 3. Les montants ont été fusionnés pour les dons du même donateur à la même date
-- 4. Seuls les dons >= 20$ sont inclus
-- ============================================

-- ============================================
-- STEP 1: Insert contacts
-- ============================================

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Julien', 'Bras', '5146239769', 'julienbras@sidoine.org', '1355 rue Bowen S, Sherbrooke, Québec J1G2H3, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Charles', 'Poulin', '8198490044', 'cpphysiotech@gmail.com', '536 Rue Main Ouest, Coaticook, Québec J1A 1R1, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Mahsa', 'Abbas Zadeh', '5147462109', 'm.abbaszadeh84@gmail.com', '121 Rue Des Chênes, Orford, Québec J1X7A6, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Nadia', 'Fredette', '8193425029', 'nadiafredette@icloud.com', '3358 rue des Arbrisseaux, SHERBROOKE, Québec J1R0B4, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Jérôme', 'Gagné', '8193453615', 'gagnejerome22@hotmail.com', '335, rue Warner, East Angus, Québec J0B1R0, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Marissa', 'Saltzman', '5085618693', 'marissa.saltzman@gmail.com', 'PO Box 463, Jeffersonville, Vermont 05464, United States of America');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Jean-François', 'Binette', '4182256423', 'jfbine157@gmail.com', '15715 12e Ave., Saint-Georges, Québec G5Z 7W8, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Danielle', 'Landry', '5142714231', 'dlandry1960@gmail.com', '5489, rue St-Dominique, Montréal, Québec H2T 1V5, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Andre', 'Blais', '4182834770', 'blais.andre@gmail.com', '3918 Baie-Des-Sables, Lac-Megantic, Québec G6B 1R6, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Xavier', 'Berruel', '5142297980', 'xberruel@gmail.com', '5271 5e Avenue, Montreal, Québec H1Y2S6, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Nicole', 'Boissinot', '4187220998', 'nicole_boissinot@hotmail.com', '682 rue des Prés-Verts, Rimouski, Québec G5M 1H3, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Michel', 'Comtois', '5149263497', 'mcomtois3497@gmail.com', '6283 Rue De Bordeaux, Montréal, Québec H2G 2R9, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Caroline', 'Chenail', '5148658800', 'carochenail@hotmail.com', '4677 rue Chambord, montreal, Québec h2j 3m8, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Stella', 'Drury', '5145313036', 'stellad9@hotmail.com', '1881 Rue du Centre, B301,, Montreal, Québec H3K 1J1, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Mireille', 'Pilotto', '8193786503', 'mpilotto@cgocable.ca', '14-3710, boul. Nérée-Beauchemin, Trois-Rivières, Québec G8Y 1C1, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Donald', 'Muir', '4168595972', 'dfmuir@yahoo.com', '281 Kennedy Ave, Toronto, Toronto, Ontario M6P3C4, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Georges-André', 'Tessier', '4506492164', 'gat.kraepelin@gmail.com', '2500 rue De Rome, Sainte-Julie, Québec J3E 2K3, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('michel', 'corriveau', '8195311722', 'm.corriveau02@outlook.com', '3865 papineau, trois-rivieres, Québec g8y1n7, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Rob', 'Ricard', '6034988302', 'theprofessional03901@yahoo.com', '54 Silvertail Road, Berwick, Maine 03901, United States of America');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('christian', 'godin', '5149743100', 'christiangodin@outlook.com', '344 Avenue Curzon, Saint-Lambert, Québec J4P2V5, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Christian', 'Charbonneau', '15142105208', 'adouaime@gmail.com', '160 rue de l''Ontario, Sherbrooke, Québec J1J 3P9, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('André', 'Blais', '4182834770', 'blais.andre@gmail.com', '3918 Baie-Des-Sables, Lac-Megantic, Québec G6B 1R6, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Pascale', 'Grand', '5148671208', 'simi67@duck.com', '14, rue d''Asbestos, Blainville, Québec J7B 1W5, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Florent', 'Gasset', '8195809014', 'flogasset@yahoo.fr', '69, rue brooks, Sherbrooke, Québec J1h4x7, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Jean-Thierry', 'Popieul', '5142469860', 'jtpopieul@gmail.com', '6935 Jogues, Montréal, Québec H4E 2W9, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('John', 'Westerlund', '5142411682', 'johnwesterlund330@gmail.com', '12 rue Atto, Sherbrooke, Québec J1M2A2, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Gilles', 'Bournival', '4182834770', 'gilles.bournival@yahoo.ca', 'Sentiers Frontaliers, Sentiers Frontaliers, Québec Sentiers Frontaliers, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Jacinthe', 'Garand', '4182834770', 'jacinthe.garand@gmail.com', 'Sentiers Frontaliers, Sentiers Frontaliers, Québec Sentiers Frontaliers, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Patricia', 'Ferron', '5145164739', 'patriciapfferron@icloud.com', '173 rue des Sittelles, Austin, Québec J0B 1B0, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Jean-François', 'Martin', '5143770849', 'jf1martin@bell.net', '3-5805 Boul. Pierre-Bernard, Montreal, Québec H1K 2S1, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Christian', 'Dunn', '5148985843', 'mistrianf1@gmail.com', '180 Rue Pierre-Mercure, Montréal, Québec H1A 5A9, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('Linda', 'Piché', '8199793107', 'linda.piche1@gmail.com', '630 Vincent, Saint-Celestin, Québec J0C 1G0, Canada');

INSERT INTO contact (first_name, last_name, phone, email, address)
VALUES ('BG', 'BG', '4182834770', 'BG', 'BG');

-- ============================================
-- STEP 2: Insert donations
-- Note: Remplacez season_id par l'ID de votre saison 2025
-- ============================================

-- Charles Poulin - 2 dons fusionnés de 20$ le 2025-01-02
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 20.00, 'other', '2025-01-02', 'Importé depuis CSV - 1 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'cpphysiotech@gmail.com' AND first_name = 'Charles' AND last_name = 'Poulin';

-- Charles Poulin - Don du 2025-01-12
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 20.00, 'other', '2025-01-12', 'Importé depuis CSV - 1 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'cpphysiotech@gmail.com' AND first_name = 'Charles' AND last_name = 'Poulin';

-- Mahsa Abbas Zadeh - Don du 2025-02-09
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 20.00, 'other', '2025-02-09', 'Importé depuis CSV - 1 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'm.abbaszadeh84@gmail.com' AND first_name = 'Mahsa' AND last_name = 'Abbas Zadeh';

-- Nadia Fredette - Don du 2025-02-22
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 50.00, 'other', '2025-02-22', 'Importé depuis CSV - 1 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'nadiafredette@icloud.com' AND first_name = 'Nadia' AND last_name = 'Fredette';

-- Jérôme Gagné - Don du 2025-02-22
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 50.00, 'other', '2025-02-22', 'Importé depuis CSV - 1 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'gagnejerome22@hotmail.com' AND first_name = 'Jérôme' AND last_name = 'Gagné';

-- Marissa Saltzman - Don du 2025-03-11
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 20.00, 'other', '2025-03-11', 'Importé depuis CSV - 1 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'marissa.saltzman@gmail.com' AND first_name = 'Marissa' AND last_name = 'Saltzman';

-- Jean-François Binette - Don du 2025-03-15
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 20.00, 'other', '2025-03-15', 'Importé depuis CSV - 1 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'jfbine157@gmail.com' AND first_name = 'Jean-François' AND last_name = 'Binette';

-- Danielle Landry - Don du 2025-05-07
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 20.00, 'other', '2025-05-07', 'Importé depuis CSV - 1 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'dlandry1960@gmail.com' AND first_name = 'Danielle' AND last_name = 'Landry';

-- Andre Blais - 6 dons fusionnés de 50$ le 2025-05-20 = 300$
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 300.00, 'other', '2025-05-20', 'Importé depuis CSV - 6 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'blais.andre@gmail.com' AND first_name = 'Andre' AND last_name = 'Blais';

-- Xavier Berruel - Don du 2025-05-20
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 20.00, 'other', '2025-05-20', 'Importé depuis CSV - 1 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'xberruel@gmail.com' AND first_name = 'Xavier' AND last_name = 'Berruel';

-- Nicole Boissinot - 2 dons fusionnés de 50$ le 2025-06-01 = 100$
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 100.00, 'other', '2025-06-01', 'Importé depuis CSV - 2 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'nicole_boissinot@hotmail.com' AND first_name = 'Nicole' AND last_name = 'Boissinot';

-- Michel Comtois - Don du 2025-06-03 (5$ + 20$ = 25$)
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 25.00, 'other', '2025-06-03', 'Importé depuis CSV - 2 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'mcomtois3497@gmail.com' AND first_name = 'Michel' AND last_name = 'Comtois';

-- Caroline Chenail - Don du 2025-07-08
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 20.00, 'other', '2025-07-08', 'Importé depuis CSV - 1 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'carochenail@hotmail.com' AND first_name = 'Caroline' AND last_name = 'Chenail';

-- Stella Drury - Don du 2025-07-10
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 20.00, 'other', '2025-07-10', 'Importé depuis CSV - 1 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'stellad9@hotmail.com' AND first_name = 'Stella' AND last_name = 'Drury';

-- Mireille Pilotto - 4 dons fusionnés de 5$ le 2025-07-12 = 20$
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 20.00, 'other', '2025-07-12', 'Importé depuis CSV - 4 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'mpilotto@cgocable.ca' AND first_name = 'Mireille' AND last_name = 'Pilotto';

-- Julien Bras - 2 dons fusionnés de 20$ le 2025-07-13 = 40$
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 40.00, 'other', '2025-07-13', 'Importé depuis CSV - 2 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'julienbras@sidoine.org' AND first_name = 'Julien' AND last_name = 'Bras';

-- Mireille Pilotto - Don du 2025-07-15
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 20.00, 'other', '2025-07-15', 'Importé depuis CSV - 1 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'mpilotto@cgocable.ca' AND first_name = 'Mireille' AND last_name = 'Pilotto';

-- Donald Muir - 2 dons fusionnés de 50$ le 2025-07-22 = 100$
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 100.00, 'other', '2025-07-22', 'Importé depuis CSV - 2 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'dfmuir@yahoo.com' AND first_name = 'Donald' AND last_name = 'Muir';

-- Georges-André Tessier - Don du 2025-07-25
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 20.00, 'other', '2025-07-25', 'Importé depuis CSV - 1 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'gat.kraepelin@gmail.com' AND first_name = 'Georges-André' AND last_name = 'Tessier';

-- michel corriveau - Don du 2025-08-01
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 50.00, 'other', '2025-08-01', 'Importé depuis CSV - 1 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'm.corriveau02@outlook.com' AND first_name = 'michel' AND last_name = 'corriveau';

-- Rob Ricard - Don du 2025-08-07
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 20.00, 'other', '2025-08-07', 'Importé depuis CSV - 1 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'theprofessional03901@yahoo.com' AND first_name = 'Rob' AND last_name = 'Ricard';

-- christian godin - Don du 2025-08-11
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 20.00, 'other', '2025-08-11', 'Importé depuis CSV - 1 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'christiangodin@outlook.com' AND first_name = 'christian' AND last_name = 'godin';

-- Christian Charbonneau - Don du 2025-08-14
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 20.00, 'other', '2025-08-14', 'Importé depuis CSV - 1 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'adouaime@gmail.com' AND first_name = 'Christian' AND last_name = 'Charbonneau';

-- André Blais - 6 dons fusionnés de 50$ le 2025-08-19 = 300$
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 300.00, 'other', '2025-08-19', 'Importé depuis CSV - 6 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'blais.andre@gmail.com' AND first_name = 'André' AND last_name = 'Blais';

-- Pascale Grand - Don du 2025-08-21
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 20.00, 'other', '2025-08-21', 'Importé depuis CSV - 1 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'simi67@duck.com' AND first_name = 'Pascale' AND last_name = 'Grand';

-- Florent Gasset - Don du 2025-08-29
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 50.00, 'other', '2025-08-29', 'Importé depuis CSV - 1 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'flogasset@yahoo.fr' AND first_name = 'Florent' AND last_name = 'Gasset';

-- Jean-Thierry Popieul - Don du 2025-09-03
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 20.00, 'other', '2025-09-03', 'Importé depuis CSV - 1 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'jtpopieul@gmail.com' AND first_name = 'Jean-Thierry' AND last_name = 'Popieul';

-- John Westerlund - Don du 2025-10-18
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 50.00, 'other', '2025-10-18', 'Importé depuis CSV - 1 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'johnwesterlund330@gmail.com' AND first_name = 'John' AND last_name = 'Westerlund';

-- Gilles Bournival - 2 dons fusionnés de 50$ le 2025-12-08 = 100$
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 100.00, 'other', '2025-12-08', 'Importé depuis CSV - 2 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'gilles.bournival@yahoo.ca' AND first_name = 'Gilles' AND last_name = 'Bournival';

-- Jacinthe Garand - 10 dons fusionnés de 50$ le 2025-12-17 = 500$
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 500.00, 'other', '2025-12-17', 'Importé depuis CSV - 10 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'jacinthe.garand@gmail.com' AND first_name = 'Jacinthe' AND last_name = 'Garand';

-- Patricia Ferron - Don du 2025-12-17 (5$ + 20$ = 25$)
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 25.00, 'other', '2025-12-17', 'Importé depuis CSV - 2 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'patriciapfferron@icloud.com' AND first_name = 'Patricia' AND last_name = 'Ferron';

-- Jean-François Martin - Don du 2025-12-17
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 50.00, 'other', '2025-12-17', 'Importé depuis CSV - 1 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'jf1martin@bell.net' AND first_name = 'Jean-François' AND last_name = 'Martin';

-- Christian Dunn - Don du 2025-12-17
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 50.00, 'other', '2025-12-17', 'Importé depuis CSV - 1 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'mistrianf1@gmail.com' AND first_name = 'Christian' AND last_name = 'Dunn';

-- Linda Piché - 4 dons fusionnés le 2025-12-17 (2x5$ + 2x50$ = 110$)
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 110.00, 'other', '2025-12-17', 'Importé depuis CSV - 4 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'linda.piche1@gmail.com' AND first_name = 'Linda' AND last_name = 'Piché';

-- Linda Piché - 3 dons fusionnés de 50$ le 2025-12-22 = 150$
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 150.00, 'other', '2025-12-22', 'Importé depuis CSV - 3 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'linda.piche1@gmail.com' AND first_name = 'Linda' AND last_name = 'Piché';

-- Sentiers Frontaliers - 10 dons fusionnés de 50$ le 2025-12-23 = 500$
INSERT INTO donation (amount, "paymentType", date, notes, donator_id, season_id)
SELECT 500.00, 'other', '2025-12-23', 'Importé depuis CSV - 10 don(s) fusionné(s)', id, 1 
FROM contact WHERE email = 'BG' AND first_name = 'BG' AND last_name = 'BG';

-- ============================================
-- RÉSUMÉ
-- ============================================
-- Total contacts: 33
-- Total donations: 39
-- Donations filtrées (< 20$): 8
-- ============================================
