USE punto_venta_rd;
SET FOREIGN_KEY_CHECKS=0;

-- =====================================================
-- EMPRESAS
-- =====================================================
INSERT INTO empresas (nombre_empresa,rnc,razon_social,nombre_comercial,actividad_economica,direccion,sector,municipio,provincia,telefono,email,moneda,simbolo_moneda,impuesto_nombre,impuesto_porcentaje,logo_url,color_fondo,mensaje_factura,activo,fecha_creacion,fecha_actualizacion) VALUES 
('Empresa SuperAdmin','999-99999-9','SUPERADMIN EMPRESA SRL','SuperAdmin Store','Administración del sistema','Calle Principal #123','Sector Central','Santo Domingo','Distrito Nacional',NULL,NULL,'DOP','RD$','ITBIS',18.00,NULL,'#FFFFFF',NULL,1,'2025-12-09 22:53:25','2025-12-11 16:21:31'),
('Barra 4 vientos','738-29292-9','Barra 4 vientos','Barra 4 vientos','Comercio al por menor','Direccion pendiente','Sector pendiente','Municipio pendiente','Provincia pendiente','8295844245','lasmellasserver@gmail.com','DOP','RD$','ITBIS',18.00,NULL,'#FFFFFF',NULL,1,'2025-12-10 00:22:34','2025-12-15 13:05:18'),
('Cheesepizza','511-06689-0','Cheesepizza','Cheesepizza','Comercio al por menor','Calle progreso frente a servicentro','La progreso','Nagua','Maria Trinidad Sanchez','8495025126','bmbrayanmartinez@icloun.com','DOP','RD$','ITBIS',18.00,NULL,'#FFFFFF',NULL,1,'2025-12-10 01:18:31','2025-12-15 17:31:04'),
('Exclusive Drips','PEND151318','Exclusive Drips','Exclusive Drips','Comercio al por menor','Direccion pendiente','Sector pendiente','Municipio pendiente','Provincia pendiente','8292876233','ainhoahernandez04@icloud.com','DOP','RD$','ITBIS',18.00,NULL,'#FFFFFF',NULL,1,'2025-12-10 02:02:31','2025-12-10 02:02:31'),
('SentryTech Multiservices','087-00189-5','SentryTech Multiservices','SentryTech Multiservices','Comercio al por menor','Calle Hnas. Mirabal, Esq. Sanchez, Frente  a la Farmacia Abreu','Centro Pueblo','Fantino','Sanchez Ramirez','8096177188','juanrenandelacruz87@gmail.com','DOP','RD$','ITBIS',18.00,NULL,'#FFFFFF','Gracias por Elegirnos',1,'2025-12-10 17:34:04','2025-12-11 07:01:09'),
('Tupapa','PEND083317','Tupapa','Tupapa','Comercio al por menor','Direccion pendiente','Sector pendiente','Municipio pendiente','Provincia pendiente','8295543767','prueba2@gmail.com','DOP','RD$','ITBIS',18.00,NULL,'#FFFFFF',NULL,1,'2025-12-10 23:58:03','2025-12-10 23:58:03'),
('D\'Vicell','PEND179796','D\'Vicell','D\'Vicell','Comercio al por menor','Direccion pendiente','Sector pendiente','Municipio pendiente','Provincia pendiente','8293086775','frankelis071@gmail.com','DOP','RD$','ITBIS',18.00,NULL,'#FFFFFF',NULL,1,'2025-12-11 12:29:39','2025-12-11 12:29:39'),
('Pruebal','PEND707852','Pruebal','Pruebal','Comercio al por menor','Direccion pendiente','Sector pendiente','Municipio pendiente','Provincia pendiente','8292191548','elpruebal@gmail.com','DOP','RD$','ITBIS',18.00,NULL,'#FFFFFF',NULL,1,'2025-12-11 16:31:47','2025-12-11 16:31:47'),
('Empresa Corina amparo','PEND620852','Empresa Corina amparo','Empresa Corina amparo','Comercio','Pendiente','Pendiente','Pendiente','Pendiente',NULL,NULL,'DOP','RD$','ITBIS',18.00,NULL,'#FFFFFF',NULL,1,'2025-12-12 00:50:20','2025-12-12 00:50:20'),
('Klk','PEND712155','Klk','Klk','Comercio al por menor','Direccion pendiente','Sector pendiente','Municipio pendiente','Provincia pendiente','8295844245','mendoza@gmail.com','DOP','RD$','ITBIS',18.00,NULL,'#FFFFFF',NULL,1,'2025-12-12 00:51:52','2025-12-12 00:51:52'),
('Universidad Nacional San Luis Gonzaga','PEND800956','Universidad Nacional San Luis Gonzaga','Universidad Nacional San Luis Gonzaga','Comercio al por menor','Direccion pendiente','Sector pendiente','Municipio pendiente','Provincia pendiente','957786282','giancarlos@gmail.com','DOP','RD$','ITBIS',18.00,NULL,'#FFFFFF',NULL,1,'2025-12-12 02:33:20','2025-12-12 02:33:20'),
('SmartCities','PEND082838','SmartCities','SmartCities','Comercio al por menor','Direccion pendiente','Sector pendiente','Municipio pendiente','Provincia pendiente','916367507','infoeliasar12@gmail.com','DOP','RD$','ITBIS',18.00,NULL,'#FFFFFF',NULL,1,'2025-12-12 04:18:02','2025-12-12 04:18:02'),
('Comedor maria','PEND051444','Comedor maria','Comedor maria','Comercio al por menor','Direccion pendiente','Sector pendiente','Municipio pendiente','Provincia pendiente','8295844245','manuel@gmail.com','DOP','RD$','ITBIS',18.00,NULL,'#FFFFFF',NULL,1,'2025-12-13 18:04:11','2025-12-13 18:04:11'),
('Comedor maria','PEND273060','Comedor maria','Comedor maria','Comercio al por menor','Direccion pendiente','Sector pendiente','Municipio pendiente','Provincia pendiente','84597643484','manuel2@gmail.com','DOP','RD$','ITBIS',18.00,NULL,'#FFFFFF',NULL,1,'2025-12-13 18:07:53','2025-12-13 18:07:53'),
('Empresa prueba','PEND381786','Empresa prueba','Empresa prueba','Comercio','Pendiente','Pendiente','Pendiente','Pendiente',NULL,NULL,'DOP','RD$','ITBIS',18.00,NULL,'#FFFFFF',NULL,1,'2025-12-14 16:56:21','2025-12-14 16:56:21'),
('conuco ramona','PEND534841','conuco ramona','conuco ramona','Comercio al por menor','Direccion pendiente','Sector pendiente','Municipio pendiente','Provincia pendiente','829 8172975','ramonaescolasticoortega@gmail.com','DOP','RD$','ITBIS',18.00,NULL,'#FFFFFF',NULL,1,'2025-12-15 20:12:14','2025-12-15 20:12:14'),
('VENDEDOR DE AGUAS DE PATA','PEND279566','VENDEDOR DE AGUAS DE PATA','VENDEDOR DE AGUAS DE PATA','Comercio al por menor','Direccion pendiente','Sector pendiente','Municipio pendiente','Provincia pendiente','829312018','leonkaurhot23@gmail.com','DOP','RD$','ITBIS',18.00,NULL,'#FFFFFF',NULL,1,'2025-12-16 00:34:39','2025-12-16 00:34:39'),
('D\' paca magica','PEND589076','D\' paca magica','D\' paca magica','Comercio al por menor','Direccion pendiente','Sector pendiente','Municipio pendiente','Provincia pendiente','8496395590','anabelfelixgalan@gmail.com','DOP','RD$','ITBIS',18.00,NULL,'#FFFFFF',NULL,1,'2025-12-17 18:53:09','2025-12-17 18:53:09'),
('Locación de junior','PEND340442','Locación de junior','Locación de junior','Comercio al por menor','Direccion pendiente','Sector pendiente','Municipio pendiente','Provincia pendiente','8494783337','junior07@gmail.com','DOP','RD$','ITBIS',18.00,NULL,'#FFFFFF',NULL,1,'2025-12-18 17:02:20','2025-12-18 17:02:20');

-- =====================================================
-- USUARIOS
-- =====================================================

-- =====================================================
-- USUARIOS
-- =====================================================
SET SESSION sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

INSERT INTO usuarios (id,empresa_id,rol_id,nombre,cedula,email,avatar_url,password,tipo,activo,fecha_creacion,fecha_actualizacion) VALUES
(1,1,NULL,'ANGEL LUIS BATISTA MENDOZA','40215504214','angelluisbm9@gmail.com','https://api.dicebear.com/7.x/bottts/svg?seed=Bear','$2b$12$Wo5n9e6tsiiYOUI0yCBYJ.aCiKQvZrn5JfSM/DWZYw8EPoTrG3u.y','superadmin',1,'2025-12-08 10:38:52','2025-12-13 02:54:04'),
(3,1,NULL,'CTMP','PEND93804511','emilioperezjavier@live.com','https://api.dicebear.com/7.x/bottts/svg?seed=Sophie','$2b$10$BG0tXb4JxHyrkmq0nUe.her8g3OU80b6r4rTwrtuGIcyoP7AIxejW','admin',1,'2025-12-09 23:01:45','2025-12-09 23:01:45'),
(4,1,NULL,'Stop liquors','PEND95912795','alfredjuniorguzmancabada@gmai.com',NULL,'$2b$10$tGYYWzGtqksmuUsdVL5sduUlXcNwXDX80/Pa8OKIFk2QbvOI4BBsS','admin',1,'2025-12-09 23:01:45','2025-12-09 23:01:45'),
(5,1,NULL,'CENTRO FERRETERO KAYLER','PEND05035479','elvishidalgo1971@gmail.com',NULL,'$2b$10$L4rBwCaOFQYHMEYR5x5U/.z48IDCx0L4GTlsrGVAu5p1cQjc5VcYq','admin',1,'2025-12-09 23:01:45','2025-12-09 23:01:45'),
(7,1,1,'prueba','402-1550421-4','negrolazo28@gmail.com',NULL,'$2b$10$ZZp8YMgU43SMENgy8sqKNOEa92pyQDolr9nfV/XDRE0y/7ZJcDLkO','vendedor',1,'2025-12-09 23:01:45','2025-12-09 23:01:45'),
(8,1,1,'Vendedor mayoreo','123-4567890-1','zevem17@gmail.com',NULL,'$2b$10$r6xYuqqZucISbmnudgVu5e0gUanLRWXSXXeWtutno6EcH4doOG9S.','vendedor',1,'2025-12-09 23:01:45','2025-12-09 23:01:45'),
(9,1,NULL,'La frescona','PEND90214289','abreusosajeydi@gmail.com',NULL,'$2b$10$1vpswNNpnl/AhTQNgBUq..F0qhbBZeHC64OzdjXXMO7uzyBlgSnGi','admin',1,'2025-12-09 23:01:45','2025-12-09 23:01:45'),
(10,2,NULL,'Barra 4 vientos','40271719929','lasmellasserver@gmail.com','https://api.dicebear.com/7.x/bottts/svg?seed=Charlie','$2b$10$xAz6b3IC.1uQeppF.sJmtuiH3a50QJYAfMiRarqFpCAlATydZfsBi','admin',1,'2025-12-10 00:22:34','2025-12-15 13:05:47'),
(11,3,NULL,'Cheesepizza','40212381335','bmbrayanmartinez@icloud.com','https://api.dicebear.com/7.x/bottts/svg?seed=Aneka','$2b$10$mX0OYQ5pURF6j6wlgP.fiezzd7ac8s37OI1uxNid8SwlDCQtNhFCq','admin',1,'2025-12-10 01:18:31','2025-12-15 17:28:05'),
(12,4,NULL,'Exclusive Drips','PEND32151318','ainhoahernandez04@icloud.com',NULL,'$2b$10$Sq7g7WAxh3e34n7AbIoyP.OCNJZpGSUck5Yo1y1ZpUy.d9zjyETFC','admin',1,'2025-12-10 02:02:31','2025-12-10 02:04:02'),
(13,5,NULL,'SentryTech Multiservices','08700189569','juanrenandelacruz87@gmail.com','https://api.dicebear.com/7.x/bottts/svg?seed=SentryTech%20Multiservices','$2b$10$9ygReirC07OTlZzzgp2Zzu7k8zQ84GxahyIoxukCA9GB274T4fVWC','admin',1,'2025-12-10 17:34:04','2025-12-11 07:04:43'),
(17,9,NULL,'Corina amparo','000-0000000-0','corinaamparo1@gmail.com',NULL,'$2b$10$Sj/AqL4Plg8O1lEP9TBRU.MDfuO7tIyWriRZXeWt8h1sR1g2IyktK','admin',1,'2025-12-12 00:50:20','2025-12-12 00:50:20'),
(21,2,1,'Vendedor','402-1550421-4','somos@gmail.com',NULL,'$2b$10$v8lVsrJEQjp2i0PrE.TRau.S2xkCJ99ui9ewugwJ3mxwuBXootBv2','vendedor',1,'2025-12-13 01:45:36','2025-12-15 05:21:31'),
(22,13,NULL,'Comedor maria','PEND49051444','manuel@gmail.com',NULL,'$2b$10$YJSjCYer6IegOi6YOn018uqta4RKK6aRT8cO532MZB0pq4sDqTr5.','admin',1,'2025-12-13 18:04:11','2025-12-16 00:48:30'),
(24,1,NULL,'Super Admin Pruebas','000-0000000-0','root2@admin.com',NULL,'$2b$12$k6K/3sxl/6A1s4wBR7iJnulKFCsLe7GqIFBwEhwx8NpgaL8cCbAta','superadmin',1,'2025-12-14 16:55:02','2025-12-14 16:55:02'),
(25,15,NULL,'prueba','123-1231231-2','prueba@gmail.com',NULL,'$2b$10$Wm7v6zL1SsQ9bN0/z74Zvei1AhNuuO2yMLXZv3UtyWyZWZIfXItmC','admin',1,'2025-12-14 16:56:21','2025-12-14 19:02:43'),
(26,16,NULL,'conuco ramona','PEND29534841','ramonaescolasticoortega@gmail.com',NULL,'$2b$10$46Y2SazV1Ch7LpBz9ETXyOh50iylQ8puc15U9GrMIlE8Afn94xvCy','admin',1,'2025-12-15 20:12:14','2025-12-15 20:12:20'),
(27,17,NULL,'VENDEDOR DE AGUAS DE PATA','402-1901351-9','leonkaurhot23@gmail.com',NULL,'$2b$10$Eko7iuRPtepydwDWqh11hudkFxJp3/gytoQmtNhmeX0basAq85cPy','superadmin',1,'2025-12-16 00:34:39','2025-12-16 00:44:15'),
(28,18,NULL,'D\' paca magica','PEND97589076','anabelfelixgalan@gmail.com',NULL,'$2b$10$Z.WbPpSiI3.GvNH77XZKSO4kfmHFo1FzE0FQ5q2E50iFvmnZCCla.','admin',1,'2025-12-17 18:53:09','2025-12-17 18:53:39'),
(29,19,NULL,'Locación de junior','PEND77340442','junior07@gmail.com',NULL,'$2b$10$P27mrvISODZc9hnJskg0OeVaysQJkRWwDhDV9lSHHV7Q1wzLkCQku','admin',0,'2025-12-18 17:02:20','2025-12-18 17:05:07');
-- =====================================================
-- CAJAS (con numero_caja y fecha_caja calculados)
-- =====================================================
INSERT INTO cajas (empresa_id,usuario_id,numero_caja,fecha_caja,monto_inicial,monto_final,total_ventas,total_efectivo,total_tarjeta_debito,total_tarjeta_credito,total_transferencia,total_cheque,total_gastos,diferencia,estado,notas,fecha_apertura,fecha_cierre) VALUES
(1,9,1,DATE('2025-12-11 04:17:33'),500.00,NULL,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,'abierta',NULL,'2025-12-11 04:17:33',NULL),
(5,13,2,DATE('2025-12-11 07:05:24'),4000.00,4000.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,'cerrada',NULL,'2025-12-11 07:05:24','2025-12-11 07:05:50'),
(3,11,4,DATE('2025-12-13 01:36:07'),500.00,NULL,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,'abierta',NULL,'2025-12-13 01:36:07',NULL),
(2,10,5,DATE('2025-12-13 01:43:46'),200.00,500.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,300.00,'cerrada',NULL,'2025-12-13 01:43:46','2025-12-13 02:56:01'),
(2,21,6,DATE('2025-12-13 01:45:59'),110.00,NULL,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,'abierta',NULL,'2025-12-13 01:45:59',NULL),
(2,10,8,DATE('2025-12-13 02:56:20'),0.00,200.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,200.00,'cerrada',NULL,'2025-12-13 02:56:20','2025-12-14 19:06:01'),
(5,13,9,DATE('2025-12-13 06:24:38'),5000.00,5000.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,'cerrada',NULL,'2025-12-13 06:24:38','2025-12-14 22:55:07'),
(13,22,10,DATE('2025-12-13 18:17:05'),1.00,NULL,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,'abierta',NULL,'2025-12-13 18:17:05',NULL),
(1,5,11,DATE('2025-12-14 01:10:48'),10000.00,NULL,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,'abierta',NULL,'2025-12-14 01:10:48',NULL),
(1,4,12,DATE('2025-12-14 04:20:01'),5000.00,5000.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,'cerrada',NULL,'2025-12-14 04:20:01','2025-12-14 04:25:04'),
(1,4,13,DATE('2025-12-14 04:25:31'),5000.00,NULL,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,'abierta',NULL,'2025-12-14 04:25:31',NULL),
(15,25,14,DATE('2025-12-14 17:04:59'),23.00,NULL,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,'abierta',NULL,'2025-12-14 17:04:59',NULL),
(1,7,15,DATE('2025-12-14 17:36:02'),1.00,NULL,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,'abierta',NULL,'2025-12-14 17:36:02',NULL),
(2,10,16,DATE('2025-12-14 19:07:22'),0.00,20000.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,20000.00,'cerrada',NULL,'2025-12-14 19:07:22','2025-12-14 23:24:20'),
(5,13,17,DATE('2025-12-15 01:23:59'),5000.00,5000.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,'cerrada',NULL,'2025-12-15 01:23:59','2025-12-16 08:53:58'),
(2,10,18,DATE('2025-12-15 02:03:30'),123456.00,123423.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,-33.00,'cerrada',NULL,'2025-12-15 02:03:30','2025-12-15 02:04:28'),
(2,10,19,DATE('2025-12-15 02:04:33'),12.00,1.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,-11.00,'cerrada',NULL,'2025-12-15 02:04:33','2025-12-15 02:04:44'),
(2,10,20,DATE('2025-12-15 02:05:13'),0.00,NULL,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,'abierta',NULL,'2025-12-15 02:05:13',NULL),
(16,26,21,DATE('2025-12-15 20:12:48'),200.00,NULL,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,'abierta',NULL,'2025-12-15 20:12:48',NULL),
(17,27,22,DATE('2025-12-16 00:35:29'),1000000.00,NULL,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,'abierta',NULL,'2025-12-16 00:35:29',NULL),
(5,13,23,DATE('2025-12-16 08:54:12'),5000.00,NULL,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,'abierta',NULL,'2025-12-16 08:54:12',NULL),
(1,3,24,DATE('2025-12-17 18:33:14'),0.00,NULL,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,'abierta',NULL,'2025-12-17 18:33:14',NULL),
(18,28,25,DATE('2025-12-17 18:57:00'),700.00,NULL,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,'abierta',NULL,'2025-12-17 18:57:00',NULL),
(19,29,26,DATE('2025-12-18 17:04:40'),1.00,NULL,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,'abierta',NULL,'2025-12-18 17:04:40',NULL);

-- =====================================================
-- SETTINGS
-- =====================================================
INSERT INTO settings (empresa_id,name,value,updated_by) VALUES
(NULL,'app_logo','https://cdn.isiweek.com/uploads/76832c01-2ff6-44ea-ade5-c7aaec4f52fe.jpg',1);

-- =====================================================
-- SOLICITUDES REGISTRO
-- =====================================================
INSERT INTO solicitudes_registro (nombre,cedula,email,password,telefono,nombre_empresa,rnc,razon_social,estado,fecha_solicitud) VALUES
('Barra 4 vientos','PEND26154347','lasmellasserver@gmail.com','$2b$10$nyS6VQ4igyeha1lzNR02A.kys6Nui2QmMZkT1kflbNVOczCUNewNK','8295844245','Barra 4 vientos','PEND154347','Barra 4 vientos','pendiente','2025-12-10 00:22:34'),
('Cheesepizza','PEND29511066','bmbrayanmartinez@icloun.com','$2b$10$mX0OYQ5pURF6j6wlgP.fiezzd7ac8s37OI1uxNid8SwlDCQtNhFCq','8495025126','Cheesepizza','PEND511066','Cheesepizza','pendiente','2025-12-10 01:18:31'),
('Exclusive Drips','PEND32151318','ainhoahernandez04@icloud.com','$2b$10$Sq7g7WAxh3e34n7AbIoyP.OCNJZpGSUck5Yo1y1ZpUy.d9zjyETFC','8292876233','Exclusive Drips','PEND151318','Exclusive Drips','pendiente','2025-12-10 02:02:31'),
('SentryTech Multiservices ','PEND88044802','juanrenandelacruz87@gmail.com','$2b$10$9ygReirC07OTlZzzgp2Zzu7k8zQ84GxahyIoxukCA9GB274T4fVWC','8096177188','SentryTech Multiservices ','PEND044802','SentryTech Multiservices ','pendiente','2025-12-10 17:34:04'),
('Tupapa','PEND11083317','prueba2@gmail.com','$2b$10$RQaqZXy8lQqZxOpOoN0viewxW75AJ0EWNTP1Ck5jekwOmvVDDlAMe','8295543767','Tupapa','PEND083317','Tupapa','pendiente','2025-12-10 23:58:03'),
('D\'Vicell','PEND56179796','frankelis071@gmail.com','$2b$10$qU.UWnumxm8W6k6WLB9l7eUm2QzuTQQR49g2xh366m1Kwc4ArBYmy','8293086775','D\'Vicell','PEND179796','D\'Vicell','pendiente','2025-12-11 12:29:39'),
('Pruebal','PEND70707852','elpruebal@gmail.com','$2b$10$15ABb/KFwlHkwUf0DDAqV.W.hEHFHodiMLxuPIOnp62XdOdolp6CS','8292191548','Pruebal','PEND707852','Pruebal','pendiente','2025-12-11 16:31:47'),
('Klk','PEND00712155','mendoza@gmail.com','$2b$10$roZHK5kVsDMAo763kmTmtOYoktXLf0T1DjbMKGk4VjhgS13dp50.y','8295844245','Klk','PEND712155','Klk','pendiente','2025-12-12 00:51:52'),
('Universidad Nacional San Luis Gonzaga','PEND06800956','giancarlos@gmail.com','$2b$10$rIShttmaXqIRqgeiEEjQT.M0f0ajWD2IosJn7Sh3G9Rgklu3JFUwm','957786282','Universidad Nacional San Luis Gonzaga','PEND800956','Universidad Nacional San Luis Gonzaga','pendiente','2025-12-12 02:33:20'),
('SmartCities','PEND13082838','infoeliasar12@gmail.com','$2b$10$WDdjYfBL5mL12ZddQylW0OEqmYc8t5a06GfOvc6o6PWcTHLh.O.vy','916367507','SmartCities','PEND082838','SmartCities','pendiente','2025-12-12 04:18:02'),
('Comedor maria','PEND49051444','manuel@gmail.com','$2b$10$SP.UbVjUiyu.l5YukTa7Mun.eaVDP3DRjw.4qMnCLfo.gj3S.D0I.','8295844245','Comedor maria','PEND051444','Comedor maria','pendiente','2025-12-13 18:04:11'),
('Comedor maria','PEND49273060','manuel2@gmail.com','$2b$10$/LzTbcOlQWEvO2koJhGBlesh0x0MFPetHElFrJg4LfeUX7rSaPPQK','84597643484','Comedor maria','PEND273060','Comedor maria','pendiente','2025-12-13 18:07:53'),
('conuco ramona','PEND29534841','ramonaescolasticoortega@gmail.com','$2b$10$46Y2SazV1Ch7LpBz9ETXyOh50iylQ8puc15U9GrMIlE8Afn94xvCy','829 8172975','conuco ramona','PEND534841','conuco ramona','pendiente','2025-12-15 20:12:14'),
('VENDEDOR DE AGUAS DE PATA','PEND45279566','leonkaurhot23@gmail.com','$2b$10$Eko7iuRPtepydwDWqh11hudkFxJp3/gytoQmtNhmeX0basAq85cPy','829312018','VENDEDOR DE AGUAS DE PATA','PEND279566','VENDEDOR DE AGUAS DE PATA','pendiente','2025-12-16 00:34:39'),
('D\' paca magica','PEND97589076','anabelfelixgalan@gmail.com','$2b$10$Z.WbPpSiI3.GvNH77XZKSO4kfmHFo1FzE0FQ5q2E50iFvmnZCCla.','8496395590','D\' paca magica','PEND589076','D\' paca magica','pendiente','2025-12-17 18:53:09'),
('Locación de junior','PEND77340442','junior07@gmail.com','$2b$10$P27mrvISODZc9hnJskg0OeVaysQJkRWwDhDV9lSHHV7Q1wzLkCQku','8494783337','Locación de junior','PEND340442','Locación de junior','pendiente','2025-12-18 17:02:20');

-- =====================================================
-- CATEGORIAS
-- =====================================================
INSERT INTO categorias (id,empresa_id,nombre,descripcion,activo,fecha_creacion) VALUES
(1,1,'asdasd',NULL,1,'2025-12-09 23:07:26'),
(2,2,'Sodas','Kola real',1,'2025-12-10 00:37:47'),
(3,3,'Refrescos','Pequeño 30 grande 75',1,'2025-12-10 01:23:14'),
(4,3,'Pizza suprema','Completa',1,'2025-12-10 01:26:54'),
(5,5,'Cámaras',NULL,1,'2025-12-11 00:19:54'),
(6,5,'DVR',NULL,1,'2025-12-11 00:20:20'),
(8,4,'Perfumería',NULL,1,'2025-12-11 03:28:40'),
(9,4,'Polos de hombre',NULL,1,'2025-12-11 03:28:50'),
(10,15,'asdasd',NULL,1,'2025-12-14 17:30:34'),
(11,16,'vivere',NULL,1,'2025-12-15 20:14:26'),
(12,2,'Viveres',NULL,1,'2025-12-16 12:03:10');
-- =====================================================
-- MARCAS
-- =====================================================
INSERT INTO marcas (empresa_id,nombre,pais_origen,descripcion,logo_url,activo,fecha_creacion) VALUES
(1,'asdasd',NULL,NULL,NULL,1,'2025-12-09 23:07:33'),
(5,'UNV','China',NULL,NULL,1,'2025-12-11 00:19:33'),
(4,'Náutica',NULL,NULL,NULL,1,'2025-12-11 03:29:09'),
(4,'Calvin Klein',NULL,NULL,NULL,1,'2025-12-11 03:29:23'),
(4,'American eagle',NULL,NULL,NULL,1,'2025-12-11 03:29:32'),
(15,'asdasd',NULL,NULL,NULL,1,'2025-12-14 17:30:45');

-- =====================================================
-- CLIENTES
-- =====================================================
INSERT INTO clientes (empresa_id,tipo_documento_id,numero_documento,nombre,apellidos,telefono,email,direccion,sector,municipio,provincia,fecha_nacimiento,genero,total_compras,puntos_fidelidad,activo,fecha_creacion,fecha_actualizacion) VALUES
(5,1,'087-0018956-9','Juan','De la cruz','8096177488','juanrenandelacruz87@gmail.com','Fantino','Malecon','Fantino','Sánchez Ramírez',NULL,'masculino',0.00,0,1,'2025-12-11 00:18:27','2025-12-11 00:18:27'),
(5,1,'439-9652827-7','Eulises','Consumidor','829-581-8272','eulises8046@hotmail.com','Av. Abraham Lincoln No. 562','El Millon','Santo Domingo','Distrito Nacional',NULL,NULL,2950.00,0,1,'2025-12-11 00:21:29','2025-12-11 00:21:30'),
(4,1,'302-3765438-9','Juan','Perez','809555555','cliente@ejemplo.com',NULL,'Naco','Santo Domingo','Distrito nacional','1994-10-10','masculino',13388.00,0,1,'2025-12-11 03:31:56','2025-12-11 04:34:32'),
(1,1,'696-5852846-1','Elvis','Consumidor','849-429-1624','elvis6602@gmail.com','Calle Las Mercedes No. 528','Piantini','Santo Domingo','Distrito Nacional',NULL,NULL,1175.00,0,1,'2025-12-14 01:12:36','2025-12-14 01:12:37'),
(15,1,'267-8129761-1','brayan','Consumidor','809-875-7857','brayan1209@outlook.com','Av. Abraham Lincoln No. 572','Naco','Santo Domingo','Distrito Nacional',NULL,NULL,145.14,0,1,'2025-12-14 17:45:16','2025-12-14 17:45:21'),
(15,1,'247-7773595-5','brayan','Consumidor','849-428-9955','brayan7466@outlook.com','Calle Las Mercedes No. 362','Naco','Santo Domingo','Distrito Nacional',NULL,NULL,145.14,0,1,'2025-12-14 19:18:10','2025-12-14 19:18:10');

-- =====================================================
-- PROVEEDORES
-- =====================================================
INSERT INTO proveedores (empresa_id,rnc,razon_social,nombre_comercial,actividad_economica,contacto,telefono,email,direccion,sector,municipio,provincia,sitio_web,condiciones_pago,activo,fecha_creacion) VALUES
(5,'111-11111-1','DANIEL TECNOLOGY','DANIEL TECNOLOGY','COMERCIO AL POR MAYOR Y DETALLE','JOSE MANUEL ROMERO','8296592806',NULL,'COTUI',NULL,NULL,NULL,NULL,NULL,1,'2025-12-11 07:03:08');

-- =====================================================
-- VENTAS (27 registros)
-- =====================================================
INSERT INTO ventas (empresa_id,tipo_comprobante_id,ncf,numero_interno,usuario_id,cliente_id,subtotal,descuento,monto_gravado,itbis,total,metodo_pago,tipo_entrega,despacho_completo,efectivo_recibido,cambio,estado,razon_anulacion,ncf_modificado,tipo_ingreso,tipo_operacion,fecha_envio_dgii,estado_dgii,notas,fecha_venta) VALUES
(3,2,'B0200000000001','V-00000001',11,NULL,1000.00,0.00,1000.00,0.00,1000.00,'efectivo','completa',1,1050.00,50.00,'anulada','No se hizo ',NULL,'01','1',NULL,'no_enviado','jamón y peperonni','2025-12-10 23:04:30'),
(5,2,'B0200000000002','V-00000001',13,2,2500.00,0.00,2500.00,450.00,2950.00,'efectivo','completa',1,3000.00,50.00,'emitida',NULL,NULL,'01','1',NULL,'no_enviado',NULL,'2025-12-11 00:21:30'),
(4,2,'B0200000000003','V-00000001',12,NULL,1200.00,0.00,1200.00,216.00,1416.00,'efectivo','completa',1,2000.00,584.00,'emitida',NULL,NULL,'01','1',NULL,'no_enviado',NULL,'2025-12-11 03:48:42'),
(4,2,'B0200000000004','V-00000002',12,NULL,2200.00,0.00,2200.00,396.00,2596.00,'efectivo','completa',1,3000.00,404.00,'emitida',NULL,NULL,'01','1',NULL,'no_enviado',NULL,'2025-12-11 03:49:19'),
(4,2,'B0200000000005','V-00000003',12,3,6600.00,0.00,6600.00,1188.00,7788.00,'tarjeta_credito','completa',1,NULL,NULL,'emitida',NULL,NULL,'01','1',NULL,'no_enviado',NULL,'2025-12-11 03:50:05'),
(4,2,'B0200000000006','V-00000004',12,NULL,3000.00,0.00,3000.00,540.00,3540.00,'transferencia','completa',1,NULL,NULL,'emitida',NULL,NULL,'01','1',NULL,'no_enviado','Reserva','2025-12-11 03:50:44'),
(4,2,'B0200000000007','V-00000005',12,NULL,8300.00,0.00,8300.00,0.00,8300.00,'efectivo','completa',1,8500.00,200.00,'emitida',NULL,NULL,'01','1',NULL,'no_enviado',NULL,'2025-12-11 03:56:03'),
(4,2,'B0200000000008','V-00000006',12,NULL,3600.00,17.28,3582.72,0.00,3582.72,'efectivo','completa',1,4000.00,417.28,'emitida',NULL,NULL,'01','1',NULL,'no_enviado',NULL,'2025-12-11 04:22:34'),
(4,2,'B0200000000009','V-00000007',12,3,5600.00,0.00,5600.00,0.00,5600.00,'transferencia','completa',1,NULL,NULL,'emitida',NULL,NULL,'01','1',NULL,'no_enviado','cuenta de reservas.','2025-12-11 04:34:32'),
(4,2,'B0200000000010','V-00000008',12,NULL,2800.00,0.00,2800.00,0.00,2800.00,'efectivo','completa',1,3000.00,200.00,'emitida',NULL,NULL,'01','1',NULL,'no_enviado',NULL,'2025-12-11 04:35:23'),
(4,2,'B0200000000011','V-00000009',12,NULL,5300.00,0.00,5300.00,0.00,5300.00,'efectivo','completa',1,6000.00,700.00,'emitida',NULL,NULL,'01','1',NULL,'no_enviado',NULL,'2025-12-11 04:36:23'),
(1,2,'B0200000000012','V-00000001',9,NULL,1280.00,0.00,1280.00,0.00,1280.00,'efectivo','completa',1,1280.00,NULL,'emitida',NULL,NULL,'01','1',NULL,'no_enviado',NULL,'2025-12-11 22:54:37'),
(1,2,'B0200000000013','V-00000002',9,NULL,700.00,0.00,700.00,0.00,700.00,'efectivo','completa',1,700.00,NULL,'emitida',NULL,NULL,'01','1',NULL,'no_enviado',NULL,'2025-12-11 22:56:10'),
(1,2,'B0200000000014','V-00000003',9,NULL,100.00,0.00,100.00,0.00,100.00,'efectivo','completa',1,100.00,NULL,'emitida',NULL,NULL,'01','1',NULL,'no_enviado',NULL,'2025-12-11 22:56:51'),
(1,2,'B0200000000015','V-00000004',9,NULL,220.00,0.00,220.00,0.00,220.00,'efectivo','completa',1,220.00,NULL,'emitida',NULL,NULL,'01','1',NULL,'no_enviado',NULL,'2025-12-11 23:12:45'),
(1,2,'B0200000000016','V-00000005',9,NULL,350.00,0.00,350.00,0.00,350.00,'efectivo','completa',1,350.00,NULL,'emitida',NULL,NULL,'01','1',NULL,'no_enviado',NULL,'2025-12-11 23:13:39'),
(1,2,'B0200000000017','V-00000006',9,NULL,75.00,0.00,75.00,0.00,75.00,'efectivo','completa',1,75.00,NULL,'emitida',NULL,NULL,'01','1',NULL,'no_enviado',NULL,'2025-12-11 23:15:47'),
(1,2,'B0200000000018','V-00000007',9,NULL,30.00,0.00,30.00,0.00,30.00,'efectivo','completa',1,30.00,NULL,'emitida',NULL,NULL,'01','1',NULL,'no_enviado',NULL,'2025-12-11 23:18:58'),
(3,2,'B0200000000019','V-00000002',11,NULL,750.00,0.00,900.00,0.00,900.00,'efectivo','completa',1,1000.00,100.00,'anulada','No se realizó ',NULL,'01','1',NULL,'no_enviado',NULL,'2025-12-13 15:38:18'),
(3,2,'B0200000000020','V-00000003',11,NULL,250.00,0.00,250.00,0.00,250.00,'efectivo','completa',1,1000.00,750.00,'anulada','No',NULL,'01','1',NULL,'no_enviado',NULL,'2025-12-13 16:43:49'),
(1,2,'B0200000000021','V-00000008',5,4,1175.00,0.00,1175.00,0.00,1175.00,'efectivo','completa',1,2000.00,825.00,'emitida',NULL,NULL,'01','1',NULL,'no_enviado',NULL,'2025-12-14 01:12:36'),
(15,2,'B0200000000022','V-00000001',25,5,123.00,0.00,123.00,22.14,145.14,'efectivo','completa',1,2333.00,2187.86,'anulada','asd',NULL,'01','1',NULL,'no_enviado',NULL,'2025-12-14 17:45:18'),
(2,2,'B0200000000023','V-00000001',10,NULL,90.00,0.00,90.00,16.20,106.20,'efectivo','completa',1,2500.00,2393.80,'emitida',NULL,NULL,'01','1',NULL,'no_enviado',NULL,'2025-12-14 19:08:07'),
(1,2,'B0200000000024','V-00000009',5,NULL,570.00,0.00,570.00,0.00,570.00,'transferencia','completa',1,NULL,NULL,'emitida',NULL,NULL,'01','1',NULL,'no_enviado',NULL,'2025-12-14 19:11:50'),
(15,2,'B0200000000025','V-00000002',25,6,123.00,0.00,123.00,22.14,145.14,'efectivo','completa',1,2322.97,2177.83,'emitida',NULL,NULL,'01','1',NULL,'no_enviado',NULL,'2025-12-14 19:18:10'),
(2,2,'B0200000000026','V-00000002',10,NULL,30.00,0.00,30.00,5.40,35.40,'efectivo','completa',1,500.00,464.60,'emitida',NULL,NULL,'01','1',NULL,'no_enviado',NULL,'2025-12-15 19:09:54'),
(16,2,'B0200000000027','V-00000001',26,NULL,69.96,0.00,69.96,12.59,82.55,'efectivo','completa',1,500.00,417.45,'emitida',NULL,NULL,'01','1',NULL,'no_enviado',NULL,'2025-12-15 20:27:27');

-- =====================================================
-- DESPACHOS
-- =====================================================
INSERT INTO despachos (venta_id,numero_despacho,usuario_id,fecha_despacho,observaciones,estado) VALUES
(1,1,11,'2025-12-10 23:04:30','Despacho completo','cerrado'),
(2,1,13,'2025-12-11 00:21:30','Despacho completo','cerrado'),
(3,1,12,'2025-12-11 03:48:42','Despacho completo','cerrado'),
(4,1,12,'2025-12-11 03:49:19','Despacho completo','cerrado'),
(5,1,12,'2025-12-11 03:50:05','Despacho completo','cerrado'),
(6,1,12,'2025-12-11 03:50:44','Despacho completo','cerrado'),
(7,1,12,'2025-12-11 03:56:03','Despacho completo','cerrado'),
(8,1,12,'2025-12-11 04:22:34','Despacho completo','cerrado'),
(9,1,12,'2025-12-11 04:34:32','Despacho completo','cerrado'),
(10,1,12,'2025-12-11 04:35:23','Despacho completo','cerrado'),
(11,1,12,'2025-12-11 04:36:23','Despacho completo','cerrado'),
(12,1,9,'2025-12-11 22:54:37','Despacho completo','cerrado'),
(13,1,9,'2025-12-11 22:56:10','Despacho completo','cerrado'),
(14,1,9,'2025-12-11 22:56:51','Despacho completo','cerrado'),
(15,1,9,'2025-12-11 23:12:45','Despacho completo','cerrado'),
(16,1,9,'2025-12-11 23:13:39','Despacho completo','cerrado'),
(17,1,9,'2025-12-11 23:15:47','Despacho completo','cerrado'),
(18,1,9,'2025-12-11 23:18:58','Despacho completo','cerrado'),
(19,1,11,'2025-12-13 15:38:18','Despacho completo','cerrado'),
(20,1,11,'2025-12-13 16:43:49','Despacho completo','cerrado'),
(21,1,5,'2025-12-14 01:12:37','Despacho completo','cerrado'),
(22,1,25,'2025-12-14 17:45:20','Despacho completo','cerrado'),
(23,1,10,'2025-12-14 19:08:07','Despacho completo','cerrado'),
(24,1,5,'2025-12-14 19:11:50','Despacho completo','cerrado'),
(25,1,25,'2025-12-14 19:18:10','Despacho completo','cerrado'),
(26,1,10,'2025-12-15 19:09:54','Despacho completo','cerrado'),
(27,1,26,'2025-12-15 20:27:27','Despacho completo','cerrado');

SET FOREIGN_KEY_CHECKS=1;


-- AGREGAR ESTOS PRODUCTOS QUE FALTAN (antes de detalle_ventas):


INSERT INTO productos (id,empresa_id,codigo_barras,sku,nombre,descripcion,categoria_id,marca_id,unidad_medida_id,precio_compra,precio_venta,precio_oferta,precio_mayorista,cantidad_mayorista,stock,stock_minimo,stock_maximo,aplica_itbis,activo,lote,fecha_creacion) VALUES
(2,2,'7330042999392','REFR-30042998-4803','Refresco','Coca-Cola',2,NULL,2,20.00,30.00,25.00,25.00,6,96,5,100,1,1,'LT-20251210-033793955','2025-12-10 01:28:43'),
(3,3,'7330128282910','SUPR-30128282-0808','Pizza Suprema de 12 pedazo',NULL,4,NULL,1,950.00,950.00,950.00,950.00,950,1,950,950,0,1,'LT-20251210-041644493','2025-12-10 01:29:52'),
(4,2,'7331753556554','CON-31753556-0647','Refresco','Uva Kola Real',2,NULL,2,20.00,30.00,25.00,25.00,6,100,5,100,1,1,'LT-20251210-751200751','2025-12-10 02:01:12'),
(6,1,'7396572258717','BHA-96572258-9583','Bhama','Mediana',NULL,NULL,NULL,134.00,160.00,NULL,NULL,6,15,5,100,0,1,'LT-20251210-569084376','2025-12-10 19:56:39'),
(7,1,'7396606712064','BHAM-96606711-7959','Bhama','Pequeña',NULL,NULL,NULL,89.00,110.00,NULL,NULL,6,13,5,100,0,1,'LT-20251210-604304028','2025-12-10 19:57:05'),
(9,1,'7396729572935','AGU-96729571-1223','Agua planeta azul',NULL,NULL,NULL,NULL,10.00,15.00,NULL,NULL,6,1,5,100,0,1,'LT-20251210-714116134','2025-12-10 19:59:12'),
(11,3,'7403286415101','PIZZ-03286414-8700','Pizza suprema de 8 pedazo','Suprema',4,NULL,NULL,650.00,650.00,650.00,650.00,650,1,5,100,0,1,'LT-20251210-272931876','2025-12-10 21:49:18'),
(12,3,'7404416261200','PIZZ-04416261-5081','Pizza suprema de 4 pedazo',NULL,NULL,NULL,NULL,350.00,350.00,350.00,350.00,350,1,350,350,0,1,'LT-20251210-411350650','2025-12-10 22:08:57'),
(13,3,'7404645907125','CARZ-04645907-3764','Calzón supremo',NULL,NULL,NULL,NULL,350.00,350.00,350.00,350.00,350,1,350,350,0,1,'LT-20251210-572173528','2025-12-10 22:14:02'),
(17,3,'7404926033004','MET-04926033-3357','Metro pizza suprema 16 pedazos',NULL,NULL,NULL,NULL,1200.00,1200.00,1200.00,1200.00,1200,1200,1200,1200,0,1,'LT-20251210-922287877','2025-12-10 22:16:37'),
(22,3,'7405054697384','PIZZ-05054697-8882','Pizza de 12 pedazos de jamón',NULL,NULL,NULL,1,750.00,750.00,750.00,750.00,750,750,750,750,0,1,'LT-20251210-041069694','2025-12-10 22:21:02'),
(25,3,'7405273104812','PD1-05273103-6492','Pizza de 12 pedazos de maíz',NULL,NULL,NULL,1,750.00,750.00,750.00,750.00,750,750,750,750,0,1,'LT-20251210-269092455','2025-12-10 22:22:20'),
(59,3,'7407281755441','BRE-07281755-4399','Breadstiks',NULL,NULL,NULL,NULL,250.00,250.00,250.00,250.00,250,250,5,100,0,1,'LT-20251210-278493111','2025-12-10 22:55:50'),
(81,1,'7409635524048','MAC-09635524-6104','Mack Albert 350 ml',NULL,NULL,NULL,NULL,290.00,350.00,NULL,NULL,6,7,1,100,0,1,'LT-20251210-628713087','2025-12-10 23:35:00'),
(114,5,'7412027296234','DVR-12027295-3003','XVR UNV 4 Canales','DVR Marca UNV',NULL,NULL,1,1980.00,2500.00,2360.00,2200.00,2,9,2,100,1,1,'LT-20251211-022318830','2025-12-11 00:16:05'),
(119,1,'7413086715567','ENE-13086715-7388','Energy 911',NULL,NULL,NULL,NULL,39.00,50.00,NULL,NULL,6,54,1,100,0,1,'LT-20251211-078519658','2025-12-11 00:32:00'),
(123,1,'7413541985915','BRU-13541983-8105','Brugal añejo 700ml',NULL,NULL,NULL,NULL,575.00,700.00,NULL,NULL,6,2,1,100,0,1,'LT-20251211-491451076','2025-12-11 00:39:35'),
(127,1,'7413801757692','BAR-13801757-8709','Barceló imperial 700ml',NULL,NULL,NULL,NULL,800.00,1175.00,NULL,NULL,6,1,1,100,0,1,'LT-20251211-793939557','2025-12-11 00:44:03'),
(139,4,'7424528078377','LAP-24528077-0946','Lapto Dell',NULL,8,5,1,300.00,600.00,500.00,450.00,6,46,5,100,0,1,'LT-20251211-523748221','2025-12-11 03:43:02'),
(141,4,'7424589959193','CAM-24589958-5084','Camisa',NULL,9,3,1,1650.00,3000.00,2500.00,2200.00,6,12,5,100,0,1,'LT-20251211-587216294','2025-12-11 03:43:53'),
(143,4,'7424640125953','POL-24640124-6114','Polo natica',NULL,9,3,1,1650.00,2500.00,2200.00,1.00,6,48,5,100,0,1,'LT-20251211-638419560','2025-12-11 03:44:34'),
(148,4,'7424714572689','T-SH-24714571-3673','T-shirt',NULL,9,5,1,1250.00,2200.00,1650.00,1500.00,6,10,5,100,0,1,'LT-20251211-699246857','2025-12-11 03:47:04'),
(173,1,'7425969448435','KOLA-25969447-0840','Kola real 400 ml',NULL,NULL,NULL,NULL,16.00,25.00,NULL,NULL,6,14,5,100,0,1,'LT-20251211-962923627','2025-12-11 04:06:33'),
(174,1,'7426010269903','MIN-26010268-3470','Minute maid 355',NULL,NULL,NULL,NULL,11.00,15.00,NULL,NULL,6,6,2,100,0,1,'LT-20251211-997251424','2025-12-11 04:07:21'),
(178,4,'7427440147063','JEA-27440147-1251','jeans de hombre',NULL,NULL,NULL,NULL,1650.00,2800.00,2500.00,2400.00,6,36,5,100,0,1,'LT-20251211-435603396','2025-12-11 04:32:14'),
(179,1,'Cem','CEM-74844322-3529','Cemento gris fda',NULL,1,1,1,510.00,570.00,560.00,540.00,50,499,5,1000,0,1,'LT-20251214-840148605','2025-12-14 01:15:57'),
(196,15,'7734281999396','ASDA-34281838-2083','asdasdsad','asdasdsad',10,6,7,123.00,123.00,NULL,NULL,6,123,5,100,1,0,'LT-20251214-279791270','2025-12-14 17:44:49'),
(197,15,'7736996341442','ASD-36996339-7157','asdasdsad',NULL,NULL,NULL,NULL,122.96,123.00,NULL,NULL,6,122,5,100,1,1,'LT-20251214-972511540','2025-12-14 18:30:14'),
(198,16,'7829695594272','PLA-29695593-5486','platano','verde',11,NULL,NULL,24.99,34.98,NULL,NULL,6,198,19,100,1,1,'LT-20251215-689446658','2025-12-15 20:19:17'),
(199,2,'7886624654899','GUIN-86624653-6555','Guineo','Verde',12,NULL,1,200.00,250.00,NULL,NULL,6,25,5,100,1,1,'LT-20251216-615776752','2025-12-16 12:05:17');
-- =====================================================
INSERT INTO productos (empresa_id,codigo_barras,sku,nombre,precio_compra,precio_venta,stock,activo) VALUES
(3,'','','Pizza 12 pedazos jamón',750.00,750.00,749,1),
(3,'','','Breadstiks',250.00,250.00,250,1),
(5,'','','DVR 4 canales',1980.00,2500.00,9,1),
(4,'','','Laptop',300.00,600.00,46,1),
(4,'','','Camisa',1650.00,3000.00,12,1),
(4,'','','Polo',1650.00,2500.00,48,1),
(4,'','','Jeans',1650.00,2800.00,36,1),
(1,'','','Bhama pequeña',89.00,110.00,13,1),
(1,'','','Mack Albert',290.00,350.00,7,1),
(1,'','','Brugal añejo',575.00,700.00,2,1),
(1,'','','Barceló Imperial',800.00,1175.00,1,1),
(1,'','','Energy 911',39.00,50.00,54,1),
(1,'','','Kola Real 400ml',16.00,25.00,14,1),
(1,'','','Minute Maid',11.00,15.00,6,1),
(1,'','','Cemento',510.00,570.00,499,1),
(15,'','','Producto prueba',123.00,123.00,122,1),
(16,'','','Platano',24.99,34.98,198,1);


-- =====================================================
-- DETALLE_VENTAS (33 registros)
-- =====================================================
INSERT INTO detalle_ventas (venta_id,producto_id,cantidad,cantidad_despachada,cantidad_pendiente,precio_unitario,subtotal,descuento,monto_gravado,itbis,total) VALUES
(1,22,1,1,0,750.00,750.00,0.00,750.00,0.00,750.00),
(1,59,1,1,0,250.00,250.00,0.00,250.00,0.00,250.00),
(2,114,1,1,0,2500.00,2500.00,0.00,2500.00,450.00,2950.00),
(3,139,2,2,0,600.00,1200.00,0.00,1200.00,216.00,1416.00),
(4,148,1,1,0,2200.00,2200.00,0.00,2200.00,396.00,2596.00),
(5,148,3,3,0,2200.00,6600.00,0.00,6600.00,1188.00,7788.00),
(6,141,1,1,0,3000.00,3000.00,0.00,3000.00,540.00,3540.00),
(7,141,1,1,0,3000.00,3000.00,0.00,3000.00,0.00,3000.00),
(7,139,1,1,0,600.00,600.00,0.00,600.00,0.00,600.00),
(7,143,1,1,0,2500.00,2500.00,0.00,2500.00,0.00,2500.00),
(7,148,1,1,0,2200.00,2200.00,0.00,2200.00,0.00,2200.00),
(8,141,1,1,0,3000.00,3000.00,0.00,3000.00,0.00,3000.00),
(8,139,1,1,0,600.00,600.00,0.00,600.00,0.00,600.00),
(9,178,2,2,0,2800.00,5600.00,0.00,5600.00,0.00,5600.00),
(10,178,1,1,0,2800.00,2800.00,0.00,2800.00,0.00,2800.00),
(11,178,1,1,0,2800.00,2800.00,0.00,2800.00,0.00,2800.00),
(11,143,1,1,0,2500.00,2500.00,0.00,2500.00,0.00,2500.00),
(12,6,8,8,0,160.00,1280.00,0.00,1280.00,0.00,1280.00),
(13,123,1,1,0,700.00,700.00,0.00,700.00,0.00,700.00),
(14,119,2,2,0,50.00,100.00,0.00,100.00,0.00,100.00),
(15,7,2,2,0,110.00,220.00,0.00,220.00,0.00,220.00),
(16,81,1,1,0,350.00,350.00,0.00,350.00,0.00,350.00),
(17,173,3,3,0,25.00,75.00,0.00,75.00,0.00,75.00),
(18,174,2,2,0,15.00,30.00,0.00,30.00,0.00,30.00),
(19,22,1,1,0,750.00,750.00,0.00,750.00,0.00,750.00),
(20,59,1,1,0,250.00,250.00,0.00,250.00,0.00,250.00),
(21,127,1,1,0,1175.00,1175.00,0.00,1175.00,0.00,1175.00),
(22,196,1,1,0,123.00,123.00,0.00,123.00,22.14,145.14),
(23,2,3,3,0,30.00,90.00,0.00,90.00,16.20,106.20),
(24,179,1,1,0,570.00,570.00,0.00,570.00,0.00,570.00),
(25,197,1,1,0,123.00,123.00,0.00,123.00,22.14,145.14),
(26,2,1,1,0,30.00,30.00,0.00,30.00,5.40,35.40),
(27,198,2,2,0,34.98,69.96,0.00,69.96,12.59,82.55);

-- =====================================================
-- DETALLE_DESPACHOS (33 registros)
-- =====================================================
INSERT INTO detalle_despachos (despacho_id,detalle_venta_id,cantidad_despachada) VALUES
(1,1,1),(1,2,1),(2,3,1),(3,4,2),(4,5,1),(5,6,3),(6,7,1),
(7,8,1),(7,9,1),(7,10,1),(7,11,1),(8,12,1),(8,13,1),
(9,14,2),(10,15,1),(11,16,1),(11,17,1),(12,18,8),(13,19,1),
(14,20,2),(15,21,2),(16,22,1),(17,23,3),(18,24,2),(19,25,1),
(20,26,1),(21,27,1),(22,28,1),(23,29,3),(24,30,1),(25,31,1),
(26,32,1),(27,33,2);

-- =====================================================
-- VENTA_EXTRAS (1 registro)
-- =====================================================
INSERT INTO venta_extras (venta_id,empresa_id,usuario_id,tipo,nombre,cantidad,precio_unitario,aplica_itbis,impuesto_porcentaje,monto_base,monto_impuesto,monto_total,notas,fecha_creacion) VALUES
(19,3,11,'ingrediente','Pepperoni',1.00,150.00,0,18.00,150.00,0.00,150.00,NULL,'2025-12-13 15:38:18');
-- =====================================================
-- MOVIMIENTOS_INVENTARIO (primeros 100 de 306)
-- =====================================================
INSERT INTO movimientos_inventario (empresa_id,producto_id,tipo,cantidad,stock_anterior,stock_nuevo,referencia,usuario_id,notas,fecha_movimiento) VALUES
(2,2,'entrada',100,0,100,'Stock inicial',10,'Creacion de producto','2025-12-10 01:28:43'),
(2,4,'entrada',100,0,100,'Stock inicial',10,'Creacion de producto','2025-12-10 02:01:12'),
(1,9,'entrada',1,0,1,NULL,9,NULL,'2025-12-10 20:00:33'),
(3,11,'entrada',950,0,950,'Ajuste manual',11,'Actualizacion de producto','2025-12-10 21:52:47'),
(3,11,'salida',300,950,650,'Ajuste manual',11,'Actualizacion de producto','2025-12-10 21:56:37'),
(3,3,'entrada',950,0,950,'Ajuste manual',11,'Actualizacion de producto','2025-12-10 22:06:05'),
(3,12,'entrada',350,0,350,'Stock inicial',11,'Creacion de producto','2025-12-10 22:08:57'),
(3,13,'entrada',350,0,350,'Stock inicial',11,'Creacion de producto','2025-12-10 22:14:02'),
(3,17,'entrada',1200,0,1200,'Stock inicial',11,'Creacion de producto','2025-12-10 22:16:37'),
(3,22,'entrada',750,0,750,'Stock inicial',11,'Creacion de producto','2025-12-10 22:21:02'),
(3,25,'entrada',750,0,750,'Stock inicial',11,'Creacion de producto','2025-12-10 22:22:20'),
(3,22,'salida',1,750,749,'Venta B0200000000001',11,'Venta registrada - Comprobante Consumidor Final','2025-12-10 23:04:30'),
(3,59,'salida',1,250,249,'Venta B0200000000001',11,'Venta registrada - Comprobante Consumidor Final','2025-12-10 23:04:30'),
(5,114,'entrada',10,0,10,'Stock inicial',13,'Creacion de producto','2025-12-11 00:16:05'),
(5,114,'salida',1,10,9,'Venta B0200000000002',13,'Venta registrada - Comprobante Consumidor Final','2025-12-11 00:21:30'),
(4,139,'entrada',50,0,50,'Stock inicial',12,'Creacion de producto','2025-12-11 03:43:02'),
(4,141,'entrada',15,0,15,'Stock inicial',12,'Creacion de producto','2025-12-11 03:43:53'),
(4,148,'entrada',15,0,15,'Stock inicial',12,'Creacion de producto','2025-12-11 03:47:04'),
(4,139,'salida',2,50,48,'Venta B0200000000003',12,'Venta registrada - Comprobante Consumidor Final','2025-12-11 03:48:42'),
(4,148,'salida',1,15,14,'Venta B0200000000004',12,'Venta registrada - Comprobante Consumidor Final','2025-12-11 03:49:19'),
(4,148,'salida',3,14,11,'Venta B0200000000005',12,'Venta registrada - Comprobante Consumidor Final','2025-12-11 03:50:05'),
(4,141,'salida',1,15,14,'Venta B0200000000006',12,'Venta registrada - Comprobante Consumidor Final','2025-12-11 03:50:44'),
(4,143,'entrada',50,0,50,'Ajuste manual',12,'Ajuste de stock desde panel de productos','2025-12-11 03:52:47'),
(4,178,'entrada',40,0,40,'Stock inicial',12,'Creacion de producto','2025-12-11 04:32:14'),
(4,178,'salida',2,40,38,'Venta B0200000000009',12,'Venta registrada - Comprobante Consumidor Final','2025-12-11 04:34:32'),
(3,22,'devolucion',1,749,750,'Anulacion venta #1',11,'No se hizo ','2025-12-11 22:04:00'),
(3,59,'devolucion',1,249,250,'Anulacion venta #1',11,'No se hizo ','2025-12-11 22:04:00'),
(1,6,'salida',8,23,15,'Venta B0200000000012',9,'Venta registrada - Comprobante Consumidor Final','2025-12-11 22:54:37'),
(1,123,'salida',1,3,2,'Venta B0200000000013',9,'Venta registrada - Comprobante Consumidor Final','2025-12-11 22:56:10'),
(1,119,'salida',2,56,54,'Venta B0200000000014',9,'Venta registrada - Comprobante Consumidor Final','2025-12-11 22:56:51'),
(1,7,'salida',2,15,13,'Venta B0200000000015',9,'Venta registrada - Comprobante Consumidor Final','2025-12-11 23:12:45'),
(1,81,'salida',1,8,7,'Venta B0200000000016',9,'Venta registrada - Comprobante Consumidor Final','2025-12-11 23:13:39'),
(1,173,'salida',3,17,14,'Venta B0200000000017',9,'Venta registrada - Comprobante Consumidor Final','2025-12-11 23:15:47'),
(1,174,'salida',2,8,6,'Venta B0200000000018',9,'Venta registrada - Comprobante Consumidor Final','2025-12-11 23:18:58'),
(2,2,'salida',3,100,97,'Venta B0200000000023',10,'Venta registrada - Comprobante Consumidor Final','2025-12-14 19:08:07'),
(1,179,'salida',1,500,499,'Venta B0200000000024',5,'Venta registrada - Comprobante Consumidor Final','2025-12-14 19:11:50'),
(15,197,'salida',1,123,122,'Venta B0200000000025',25,'Venta registrada - Comprobante Consumidor Final','2025-12-14 19:18:10'),
(2,2,'salida',1,97,96,'Venta B0200000000026',10,'Venta registrada - Comprobante Consumidor Final','2025-12-15 19:09:54'),
(16,198,'salida',2,200,198,'Venta B0200000000027',26,'Venta registrada - Comprobante Consumidor Final','2025-12-15 20:27:27');


-- =====================================================
-- SETTINGS
-- =====================================================
-- =====================================================
-- PLATAFORMA_CONFIG
-- =====================================================
INSERT INTO plataforma_config  (nombre_plataforma,logo_url,email_contacto,telefono_contacto,telefono_whatsapp,direccion,color_primario,color_secundario,copyright,fecha_creacion,fecha_actualizacion) VALUES
('Punto de Venta RD','https://cdn.isiweek.com/uploads/76832c01-2ff6-44ea-ade5-c7aaec4f52fe.jpg','admin@puntoventa.com',NULL,NULL,NULL,'#3B82F6','#1E40AF','© 2025 IziWeek. Todos los derechos reservados.','2025-12-09 22:53:23','2025-12-09 22:53:23');
SET FOREIGN_KEY_CHECKS=1;