CREATE DATABASE `agendapro`;
USE `agendapro`;

CREATE TABLE `rol` (
  `idRol` int(11) NOT NULL AUTO_INCREMENT,
  `descripcionRol` varchar(50) NOT NULL,
  PRIMARY KEY (`idRol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `usuario` (
  `idUsuario` int(11) NOT NULL AUTO_INCREMENT,
  `idRol` int(11) DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `segundoApellido` varchar(20) NOT NULL,
  `rfc` varchar(13) NOT NULL,
  `curp` varchar(18) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `telefono` varchar(100) NOT NULL,
  `img` varchar(1000) DEFAULT NULL,
  `imagenPublicId` varchar(1000) DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'activo',
  PRIMARY KEY (`idUsuario`),
  UNIQUE KEY `correo` (`correo`),
  KEY `idRol` (`idRol`),
  CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`idRol`) REFERENCES `rol` (`idRol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `servicio` (
  `idServicio` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  PRIMARY KEY (`idServicio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `estado_cita` (
  `idEstado` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(50) NOT NULL,
  PRIMARY KEY (`idEstado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `modalidad` (
  `idModalidad` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(50) NOT NULL,
  PRIMARY KEY (`idModalidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `cita` (
  `idCita` int(11) NOT NULL AUTO_INCREMENT,
  `idCliente` int(11) NOT NULL,
  `idAsesor` int(11) DEFAULT NULL,
  `idServicio` int(11) NOT NULL,
  `idEstado` int(11) NOT NULL DEFAULT 1,
  `idModalidad` int(11) NOT NULL,
  `fechaCita` date NOT NULL,
  `horaCita` time NOT NULL,
  `pagado` tinyint(1) DEFAULT 0,
  `notas` text DEFAULT NULL,
  PRIMARY KEY (`idCita`),
  KEY `fk_cita_cliente` (`idCliente`),
  KEY `fk_cita_asesor` (`idAsesor`),
  KEY `fk_cita_servicio` (`idServicio`),
  KEY `fk_cita_estado` (`idEstado`),
  KEY `fk_cita_modalidad` (`idModalidad`),
  CONSTRAINT `fk_cita_asesor` FOREIGN KEY (`idAsesor`) REFERENCES `usuario` (`idUsuario`),
  CONSTRAINT `fk_cita_cliente` FOREIGN KEY (`idCliente`) REFERENCES `usuario` (`idUsuario`),
  CONSTRAINT `fk_cita_estado` FOREIGN KEY (`idEstado`) REFERENCES `estado_cita` (`idEstado`),
  CONSTRAINT `fk_cita_modalidad` FOREIGN KEY (`idModalidad`) REFERENCES `modalidad` (`idModalidad`),
  CONSTRAINT `fk_cita_servicio` FOREIGN KEY (`idServicio`) REFERENCES `servicio` (`idServicio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `pago` (
  `idPago` int(11) NOT NULL AUTO_INCREMENT,
  `idUsuario` int(11) NOT NULL,
  `idCita` int(11) NOT NULL,
  `paypal_order_id` varchar(50) NOT NULL,
  `paypal_transaction_id` varchar(50) NOT NULL,
  `status` varchar(20) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `moneda` varchar(3) DEFAULT 'MXN',
  `fecha_pago` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`idPago`),
  KEY `fk_pago_usuario` (`idUsuario`),
  KEY `fk_pago_cita` (`idCita`),
  CONSTRAINT `fk_pago_cita` FOREIGN KEY (`idCita`) REFERENCES `cita` (`idCita`),
  CONSTRAINT `fk_pago_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `estado_blog` (
    `idEstado` INT PRIMARY KEY,
    `descripcion` VARCHAR(50) NOT NULL
);

CREATE TABLE `blog` (
  `idBlog` int(11) NOT NULL AUTO_INCREMENT,
  `idUsuario` int(11) NOT NULL,
  `idEstado` int(11) DEFAULT NULL,      
  `titulo` varchar(255) NOT NULL,
  `contenido` longtext DEFAULT NULL,
  `img` varchar(255) DEFAULT NULL,
  `fechaPublicacion` date DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `destacado` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`idBlog`),
  KEY `fk_blog_usuario` (`idUsuario`),
  KEY `fk_estado_blog_idx` (`idEstado`),
  CONSTRAINT `fk_blog_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_estado_blog` FOREIGN KEY (`idEstado`) REFERENCES `estado_blog` (`idEstado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
