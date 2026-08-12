# Configuración del entorno de desarrollo

Esta sección explica cómo preparar **Plann-It** desde cero en un nuevo computador.

## 1. Tecnologías principales

Plann-It utiliza actualmente:

* React Native
* Expo
* TypeScript
* Expo Router
* Supabase

  * PostgreSQL
  * Authentication
  * Row Level Security
  * Database Functions / RPC
* Git y GitHub

La aplicación móvil se comunica directamente con Supabase utilizando `@supabase/supabase-js`.

---

## 2. Requisitos previos

Antes de clonar el proyecto se recomienda tener instalado:

### Node.js

Se recomienda Node.js 20 o superior.

Comprobar instalación:

```bash
node --version
npm --version
```

### Git

Comprobar instalación:

```bash
git --version
```

### Expo Go

Para probar la aplicación en un dispositivo físico:

* iOS: instalar **Expo Go** desde App Store.
* Android: instalar **Expo Go** desde Google Play.

### Docker Desktop

Docker no es necesario para ejecutar la aplicación móvil.

Sí es necesario para algunas operaciones de desarrollo de Supabase, por ejemplo:

```bash
npx supabase db pull
```

que permite sincronizar el esquema remoto de la base de datos con las migraciones almacenadas en Git.

---

# 3. Clonar el repositorio

```bash
git clone https://github.com/OsvSoto/plann-it.git
```

Entrar al proyecto:

```bash
cd plann-it
```

---

# 4. Cambiar a la rama de desarrollo

La rama utilizada para integrar el trabajo en desarrollo es:

```text
dev
```

Por lo tanto:

```bash
git switch dev
```

Actualizarla:

```bash
git pull origin dev
```

No se recomienda desarrollar directamente sobre `main`.

---

# 5. Instalar las dependencias de la aplicación móvil

Entrar a:

```bash
cd mobile
```

Instalar las dependencias:

```bash
npm install
```

Esto instalará Expo, React Native, Expo Router, Supabase y las demás dependencias definidas en `mobile/package.json`.

---

# 6. Configurar las variables de entorno

El archivo:

```text
mobile/.env
```

no se almacena en Git por motivos de seguridad.

Cada desarrollador debe crear su propio:

```text
mobile/.env
```

basándose en:

```text
mobile/.env.example
```

El archivo debe contener:

```env
EXPO_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=sb_publishable_XXXXXXXXXXXX
```

Los valores correspondientes al proyecto de desarrollo deben solicitarse a un integrante del equipo.

No incluir nunca en la aplicación móvil:

```text
service_role
secret key
database password
DATABASE_URL
```

La aplicación móvil utiliza únicamente la **Publishable Key** de Supabase.

---

# 7. Ejecutar la aplicación

Desde:

```bash
cd mobile
```

ejecutar:

```bash
npx expo start
```

Expo levantará Metro Bundler.

---

## Ejecutar en iPhone

Instalar Expo Go en el dispositivo.

Si el computador y el teléfono tienen problemas para conectarse por la red local, ejecutar:

```bash
npx expo start --tunnel
```

Luego escanear el código QR utilizando la cámara del iPhone y abrirlo con Expo Go.

Si existen problemas de caché:

```bash
npx expo start --clear --tunnel
```

---

## Ejecutar en Android

Instalar Expo Go.

Ejecutar:

```bash
npx expo start --tunnel
```

Escanear el mismo código QR desde Expo Go.

La misma aplicación React Native puede ejecutarse tanto en Android como en iOS.

---

## Ejecutar en navegador

La aplicación también puede ejecutarse en modo web.

Ejecutar:

```bash
npx expo start
```

y presionar:

```text
w
```

También puede ejecutarse directamente con:

```bash
npx expo start --web
```

La versión web es útil para desarrollo rápido, pero las funcionalidades deben probarse también en dispositivos Android/iOS.

---

# 8. Estructura principal del proyecto

La estructura actual sigue una organización modular por funcionalidades:

```text
plann-it/
│
├── mobile/
│   │
│   ├── app/
│   │   ├── _layout.tsx
│   │   │
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   │
│   │   └── (tabs)/
│   │       ├── _layout.tsx
│   │       ├── index.tsx
│   │       └── proyectos.tsx
│   │
│   ├── features/
│   │   └── proyectos/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       └── types.ts
│   │
│   └── lib/
│       └── supabase.ts
│
└── supabase/
    ├── config.toml
    ├── migrations/
    └── functions/
```

La carpeta `app/` contiene principalmente las rutas y pantallas de Expo Router.

La lógica específica de cada funcionalidad debe mantenerse dentro de:

```text
features/
```

Por ejemplo:

```text
features/proyectos/
features/tareas/
features/chat/
features/notificaciones/
```

La configuración general de Supabase se encuentra en:

```text
mobile/lib/supabase.ts
```

---

# 9. Configurar Supabase CLI en un nuevo computador

Esta parte solo es necesaria si se modificará el esquema PostgreSQL, RLS, Functions, RPC o migraciones.

Desde la raíz del repositorio:

```bash
cd plann-it
```

Iniciar sesión:

```bash
npx supabase login
```

Vincular el repositorio con el proyecto remoto:

```bash
npx supabase link --project-ref lmjcctnnnbjfsczasqci
```

El proyecto debería quedar vinculado con:

```text
plann-it-dev
```

---

# 10. Sincronizar cambios hechos directamente en Supabase

Si alguien realizó modificaciones directamente desde:

```text
Supabase Dashboard
→ SQL Editor
```

estas modificaciones deben posteriormente almacenarse en Git como migraciones.

Con Docker Desktop ejecutándose:

```bash
npx supabase db pull
```

Esto genera o actualiza archivos dentro de:

```text
supabase/migrations/
```

Los archivos de migración sí deben almacenarse en Git.

---

# 11. Flujo de trabajo con Git

La estructura general de ramas es:

```text
main
  ↑
dev
  ↑
feature/*
```

`main` contiene la versión estable.

`dev` contiene la versión integrada de desarrollo.

Cada funcionalidad debe desarrollarse en una rama independiente.

Por ejemplo:

```bash
git switch dev
git pull origin dev
git switch -c feature/tareas
```

Después de implementar y probar:

```bash
git add -A
git commit -m "feat: implement task management"
git push -u origin feature/tareas
```

Luego se integra:

```text
feature/tareas
      ↓
     dev
```

y posteriormente:

```text
dev
 ↓
main
```

cuando la versión esté estable.

---

# 12. Antes de comenzar a trabajar cada día

Actualizar `dev`:

```bash
git switch dev
git pull origin dev
```

Crear una rama para la funcionalidad:

```bash
git switch -c feature/nombre-funcionalidad
```

Ejemplo:

```bash
git switch -c feature/tablero
```

---

# 13. Antes de subir cambios

Ejecutar:

```bash
git status
```

Verificar especialmente que nunca aparezca:

```text
mobile/.env
```

El `.env` contiene la configuración local de Supabase y no debe almacenarse en Git.

Luego:

```bash
git add -A
git commit -m "tipo: descripcion del cambio"
git push
```

Ejemplos:

```text
feat: add project creation
feat: implement authentication flow
fix: correct project loading
refactor: modularize project components
chore: add Supabase migrations
```

---

# 14. Estado actual del proyecto

Actualmente se encuentran implementadas las siguientes funcionalidades base:

* Aplicación React Native funcionando con Expo.
* Compatibilidad con iOS, Android y web.
* Conexión con Supabase.
* Registro mediante Supabase Auth.
* Confirmación de correo.
* Inicio de sesión.
* Persistencia de sesión.
* Cierre de sesión.
* Protección de rutas autenticadas.
* Perfil de usuario asociado a `auth.users`.
* Creación de proyectos mediante función PostgreSQL/RPC.
* Creación automática del creador como líder del proyecto.
* Listado de proyectos del usuario.
* RLS para controlar el acceso a información.
* Arquitectura modular para funcionalidades de proyectos.

---

# 15. Puesta en marcha rápida

En un computador nuevo, el flujo resumido es:

```bash
git clone https://github.com/OsvSoto/plann-it.git

cd plann-it

git switch dev
git pull origin dev

cd mobile

npm install
```

Crear:

```text
mobile/.env
```

con las credenciales de desarrollo de Supabase.

Luego:

```bash
npx expo start --tunnel
```

Escanear el QR desde Expo Go.

Con esto debería ser posible comenzar a desarrollar Plann-It desde una nueva máquina.
