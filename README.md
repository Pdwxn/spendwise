# SpendWise

SpendWise es una aplicación web de finanzas personales diseñada para registrar, organizar y analizar ingresos, gastos, presupuestos y ahorros desde una interfaz clara y móvil primero.

## Motivo

El proyecto nace para reemplazar hojas de cálculo y herramientas dispersas por una experiencia centralizada que ayude a visualizar el estado financiero personal con rapidez, contexto y menos fricción.

## Tecnologias

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Django, Django REST Framework, SimpleJWT
- Base de datos: PostgreSQL con Supabase
- Autenticacion: email/password y Google OAuth
- Deploy: Vercel para frontend y Render para backend

## Features

- Registro e inicio de sesion con JWT
- Login con Google
- Dashboard financiero con resumen de balance, ingresos, gastos y ahorro
- Gestion de cuentas, categorias, movimientos, presupuestos y metas de ahorro
- Preferencias de usuario persistidas por cuenta
- Modo claro y oscuro
- Navegacion mobile optimizada con menu inferior y drawer de usuario
- Formularios, modales y feedback visual consistentes

## Arquitectura

- Backend separado del frontend mediante API REST
- Estado financiero centralizado por usuario
- Persistencia de preferencias y datos privados por cuenta
- Disenado para escalar hacia mas locales, idiomas y capacidades de analisis

## Estado actual

El proyecto se encuentra funcional y desplegado con una base solida para seguir iterando en analitica, internacionalizacion y mejoras de experiencia de usuario.
