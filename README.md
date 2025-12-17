# MotoTaxis San Juan - ERP & POS

Sistema integral de gestión para venta de mototaxis, refacciones, servicios y facturación electrónica (CFDI 4.0 / Carta Porte 3.1).

---

## 📋 Descripción del Proyecto
Este sistema está diseñado para administrar la operación completa de una agencia de mototaxis. Incluye control de inventarios, punto de venta (POS) con emisión de tickets, gestión de clientes y un módulo fiscal robusto para cumplir con los requisitos del SAT en México.

### Módulos Principales:
- **Facturación 4.0:** Emisión de facturas de Ingreso, Egreso y Pago. Validación de reglas fiscales.
- **Carta Porte 3.1:** Gestión logística para traslados, choferes y vehículos.
- **Punto de Venta (POS):** Generación rápida de tickets para venta de mostrador (Refacciones y Servicios).
- **Inventarios:** Control de stock real para Mototaxis (Activos fijos) y Refacciones.
- **Facturación Híbrida:** Capacidad de facturar ventas directas o importar tickets de venta para generar el CFDI.

---

## 🔖 Control de Versiones
El proyecto utiliza una estrategia de versionado semántico personalizado para facilitar el seguimiento de cambios:

- **+0.01 (Parches):** Correcciones mínimas, cambios de color, typos o ajustes visuales ligeros.
- **+0.10 (Mejoras):** Nuevas funcionalidades, refactorización de lógica o cambios medios (Ej. Nuevo módulo).
- **+1.00 (Mayores):** Reestructuración completa, cambios críticos de arquitectura o versiones mayores.

---

## 📅 Historial de Versiones (Changelog)

### v1.00 - Release de Producción (Actual)
*Fecha: 16 de Diciembre, 2025*

**Lanzamiento oficial del sistema listo para producción.**

**Características incluidas:**
- **Core:**
  - Autenticación segura con Laravel Sanctum.
  - Gestión de Roles y Permisos (Administrador, Vendedor, Facturista).
  - Diseño Responsivo *Mobile-First* con menú lateral adaptable (Sheet).
- **Módulo POS (Punto de Venta):**
  - Carrito de compras para Refacciones y Servicios.
  - Validación de stock en tiempo real.
  - Generación e impresión de Ticket térmico.
- **Módulo de Facturación:**
  - **Nueva Funcionalidad:** Importación de Tickets por folio para facturación automática.
  - **Nueva Funcionalidad:** Facturación directa de Mototaxis (sin pasar por POS).
  - Soporte completo para CFDI 4.0 (PUE/PPD, Uso CFDI, Regímenes).
- **Módulo Carta Porte:**
  - Implementación de estándar 3.1.
  - Catálogos de Figuras de Transporte y Autotransporte.
- **Inventarios:**
  - CRUD completo de Mototaxis con carga de imágenes.
  - CRUD de Refacciones y Servicios.
  - Catálogo de Clientes con datos fiscales.

---

### Instalación y Despliegue

1. **Backend (Laravel):**
   ```bash
   composer install
   php artisan migrate --seed
   php artisan storage:link
Frontend (React + Vite):

Bash

npm install
npm run build
Nota: Este repositorio es privado. Prohibida su distribución sin autorización.