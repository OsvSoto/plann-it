## Configuración del backend

### Requisitos

- Node.js
- npm
- Git

### Instalación

Clonar el repositorio:

git clone URL_DEL_REPOSITORIO
cd plann-it/backend

Instalar dependencias:

npm install

Crear el archivo `.env` a partir de `.env.example`:

PORT=3000
DATABASE_URL=...
TYPEORM_SYNC=true

Solicitar al equipo las credenciales de desarrollo de Supabase.

Iniciar el backend:

npm run start:dev

El backend estará disponible en:

http://localhost:3000
