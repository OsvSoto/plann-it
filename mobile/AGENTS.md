Estás trabajando en **Plann-It**, un proyecto universitario de Ingeniería de Software que actualmente se está implementando como una aplicación móvil colaborativa para gestión de proyectos, similar conceptualmente a Trello pero enfocada en una experiencia móvil más guiada y accesible.

## Regla principal

Antes de modificar cualquier archivo:

1. Inspecciona el repositorio actual.
2. Revisa la rama Git activa.
3. Revisa la estructura real de `mobile/`, `features/` y `supabase/`.
4. No asumas que este resumen reemplaza al código actual.
5. No reintroduzcas tecnologías que ya fueron descartadas.
6. Haz cambios pequeños, modulares y fáciles de revisar.
7. Explica brevemente qué archivos vas a modificar antes de hacer cambios grandes.

---

# Arquitectura actual

Se abandonó el backend anterior basado en:

- NestJS
- TypeORM
- servidor REST propio

No volver a introducirlos salvo que se solicite explícitamente.

Actualmente la arquitectura es:

```text
React Native + Expo + TypeScript
            |
            v
       supabase-js
            |
            v
        Supabase
        ├── Auth
        ├── PostgreSQL
        ├── Row Level Security
        ├── RPC / PostgreSQL Functions
        ├── Storage         [futuro]
        ├── Realtime        [futuro]
        └── Edge Functions  [futuro]
```

Supabase es el backend principal.

---

# Frontend

La aplicación móvil está en:

```text
mobile/
```

Tecnologías:

- React Native
- Expo
- TypeScript
- Expo Router
- `react-native-safe-area-context`
- `@supabase/supabase-js`

Se prueba actualmente principalmente con Expo Go en iPhone, pero el proyecto debe mantenerse compatible con:

- iOS
- Android
- web cuando sea posible

Para iniciar:

```bash
cd mobile
npx expo start
```

Si Metro tiene problemas de caché:

```bash
npx expo start --clear
```

Para túnel:

```bash
npx expo start --tunnel
```

---

# Supabase client

El cliente está aproximadamente en:

```text
mobile/lib/supabase.ts
```

Usa variables de entorno:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_KEY=
```

Nunca colocar en el código:

- service role key
- secret key
- database password
- DATABASE_URL

El `.env` no debe subirse a Git.

---

# Autenticación

Ya está implementado y funcionando:

- registro
- confirmación por correo
- login
- persistencia de sesión
- logout
- rutas protegidas

Se usa:

```ts
supabase.auth.signUp()
supabase.auth.signInWithPassword()
supabase.auth.signOut()
supabase.auth.getSession()
supabase.auth.onAuthStateChange()
```

La metadata estándar que se decidió utilizar es:

```text
usuario_nombre
```

No reemplazarla por `full_name`.

Ejemplo conceptual:

```ts
options: {
  data: {
    usuario_nombre: nombre.trim()
  }
}
```

Supabase Auth mantiene:

```text
auth.users
```

y existe una tabla pública:

```text
public.usuario
```

relacionada mediante el mismo UUID.

Conceptualmente:

```text
auth.users.id
      |
      | 1:1
      v
public.usuario.usuario_id
```

La tabla pública contiene información de aplicación como:

- usuario_id
- usuario_nombre
- usuario_correo
- usuario_fecharegistro

Existe o se ha trabajado en un trigger PostgreSQL para crear automáticamente `public.usuario` cuando se crea un usuario en `auth.users`.

Antes de modificar este trigger, inspecciona su definición real en Supabase/migraciones.

---

# Navegación

Se usa Expo Router.

Estructura aproximada:

```text
mobile/app/
├── _layout.tsx
│
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   └── register.tsx
│
└── (tabs)/
    ├── _layout.tsx
    ├── index.tsx
    └── proyectos.tsx
```

`app/_layout.tsx` controla la sesión global.

Comportamiento esperado:

```text
Sin sesión
    |
    v
(auth)
├── login
└── register


Con sesión
    |
    v
(tabs)
├── Inicio
└── Proyectos
```

Las rutas privadas no deben ser accesibles sin sesión.

---

# Modularización

No colocar toda la lógica en `index.tsx`.

La estrategia elegida es modularización por funcionalidad.

Ejemplo existente:

```text
mobile/features/
└── proyectos/
    ├── components/
    │   └── ProyectoCard.tsx
    ├── hooks/
    │   └── useProyectos.ts
    ├── services/
    │   └── proyecto.service.ts
    └── types.ts
```

Seguir este patrón para funcionalidades futuras:

```text
features/
├── proyectos/
├── miembros/
├── tableros/
├── listas/
├── tareas/
├── gantt/
├── chat/
├── notificaciones/
└── invitaciones/
```

Separación deseada:

```text
Pantalla
   |
   v
Hook
   |
   v
Service
   |
   v
Supabase
```

Una pantalla no debería contener directamente grandes bloques de consultas a Supabase.

---

# Proyectos

Ya está implementada y probada la creación de proyectos.

Existe una función PostgreSQL/RPC aproximadamente llamada:

```text
crear_proyecto
```

Desde React Native se utiliza conceptualmente:

```ts
supabase.rpc('crear_proyecto', {
  p_nombre: ...,
  p_descripcion: ...,
  p_fecha_fin: ...
})
```

La función debe:

1. Obtener el usuario autenticado mediante `auth.uid()`.
2. Crear `public.proyecto`.
3. Crear automáticamente una fila en `public.miembroproyecto`.
4. Asignar al creador:
   - rol `LIDER`
   - permisos correspondientes.
5. Devolver el ID del proyecto.

No mandar desde React Native un `usuario_id` para decidir quién es el creador.

La identidad debe salir de:

```sql
auth.uid()
```

---

# Listado de proyectos

Ya está funcionando el listado de proyectos del usuario.

La seguridad no debe depender de algo como:

```ts
.eq('usuario_id', usuarioActual)
```

en el frontend como mecanismo principal.

La seguridad debe realizarse en PostgreSQL mediante RLS.

El frontend consulta `proyecto`, y RLS determina qué filas puede recibir el usuario.

---

# MiembroProyecto

La tabla actual utiliza un identificador propio:

```text
miembro_proyecto_id UUID
```

También debe existir una restricción de unicidad equivalente a:

```text
UNIQUE (
  miembro_proyecto_usuario_id,
  miembro_proyecto_proyecto_id
)
```

Un usuario puede estar en muchos proyectos, pero no puede aparecer dos veces como miembro del mismo proyecto.

`miembroproyecto` será una tabla central para la autorización del resto de la aplicación.

Conceptualmente:

```text
Usuario
   |
MiembroProyecto
   |
Proyecto
```

y desde Proyecto se derivará el acceso a:

```text
Tablero
Lista
Tarea
Chat
Gantt
Análisis IA
etc.
```

---

# Base de datos existente

Un integrante del equipo ya creó gran parte del esquema en Supabase.

Existen o se proyectan tablas similares a:

```text
usuario
proyecto
miembroproyecto
invitacionproyecto
tablero
lista
tarea
asignaciontarea
etiqueta
etiquetatarea
archivo
tareaarchivo
chat
mensaje
mensajearchivo
cartagantt
itemgantt
actividad
notificacion
analisis_ia
```

No recrear estas tablas a ciegas.

Antes de modificar base de datos:

- inspeccionar esquema actual;
- revisar constraints;
- revisar foreign keys;
- revisar RLS;
- revisar policies;
- revisar funciones PostgreSQL existentes.

---

# Modelo conceptual importante

Algunas relaciones relevantes:

```text
Usuario
   |
   v
MiembroProyecto
   |
   v
Proyecto
   |
   ├── Tablero
   |     |
   |     v
   |    Lista
   |     |
   |     v
   |    Tarea
   |
   ├── Chat
   |     |
   |     v
   |   Mensaje
   |
   ├── CartaGantt
   |     |
   |     v
   |   ItemGantt
   |
   └── AnalisisIA
```

También existen:

```text
Tarea <-> AsignacionTarea <-> MiembroProyecto
Tarea <-> Etiqueta
Tarea <-> Archivo
Mensaje <-> Archivo
Usuario -> Notificacion
Usuario -> InvitacionProyecto -> Proyecto
Usuario -> Actividad -> Tarea
```

---

# AsignacionTarea

Se decidió conservar un identificador propio:

```text
asignacion_tarea_id
```

porque interesa mantener historial de asignaciones.

Una misma persona puede recibir la misma tarea nuevamente más adelante.

Por lo tanto NO convertir esta tabla simplemente en una PK compuesta usuario/tarea.

---

# InvitacionProyecto

También posee identificador propio:

```text
invitacion_id
```

porque pueden existir varias invitaciones históricas entre un usuario y un proyecto.

Estados esperados:

```text
PENDIENTE
ACEPTADA
RECHAZADA
```

Aceptar una invitación debe generar una membresía en `miembroproyecto`.

---

# RLS y seguridad

Supabase será utilizado directamente desde la aplicación móvil, por lo que RLS es obligatorio para datos privados.

No asumir que todas las policies están completas.

Actualmente se ha trabajado al menos en seguridad para:

- usuario
- proyecto
- miembroproyecto

Antes de agregar nuevas operaciones, revisar las policies existentes.

Objetivo general:

```text
Usuario autenticado
        |
        v
MiembroProyecto
        |
        v
solo proyectos donde pertenece
        |
        v
solo información asociada a esos proyectos
```

Nunca solucionar un problema de permisos desactivando RLS.

Nunca usar una `service_role` key desde React Native.

---

# Supabase CLI y migraciones

El repositorio ya está vinculado al proyecto Supabase:

```text
plann-it-dev
```

Project ref actual:

```text
lmjcctnnnbjfsczasqci
```

Existe:

```text
supabase/config.toml
```

Se intentó ejecutar:

```bash
npx supabase db pull
```

pero quedó pendiente porque el computador necesitaba Docker Desktop para crear la shadow database.

Por lo tanto, IMPORTANTE:

El esquema remoto de Supabase puede contener cambios que todavía NO estén completamente versionados en:

```text
supabase/migrations/
```

Antes de hacer cambios importantes de base de datos, revisar este estado.

Cuando Docker esté disponible:

```bash
npx supabase db pull
```

y revisar cuidadosamente la migración antes de subirla a Git.

---

# Git workflow

Se utiliza:

```text
main
  ↑
dev
  ↑
feature/*
```

`main`:
versión estable.

`dev`:
integración del desarrollo.

Para una nueva funcionalidad:

```bash
git switch dev
git pull origin dev
git switch -c feature/nombre
```

Ejemplos:

```text
feature/proyectos
feature/tareas
feature/chat
feature/invitaciones
```

Después:

```text
feature/*
   ↓
dev
   ↓
main
```

No trabajar directamente en `main`.

Antes de modificar código, ejecuta:

```bash
git status
git branch --show-current
```

No hagas commits ni pushes automáticamente salvo que se solicite explícitamente.

---

# Convenciones de commits

Usar el formato de Conventional Commits:

```text
<tipo>: <descripción en español>
```

Mantener el tipo convencional en inglés, por ejemplo `feat`, `fix`, `docs`,
`refactor`, `test`, `chore` o `merge`, pero redactar siempre la descripción
del cambio en español.

Ejemplos:

```text
feat: implementar gestión de tareas
feat: agregar creación de proyectos
fix: corregir redirección de autenticación
refactor: modularizar componentes de proyectos
chore: versionar esquema de base de datos de Supabase
```

---

# Forma de trabajo esperada

Cuando te pida implementar algo:

1. Inspecciona primero el código relacionado.
2. Explica brevemente qué arquitectura propones.
3. Reutiliza los módulos existentes.
4. No concentres la lógica en pantallas.
5. Mantén TypeScript correctamente tipado.
6. Evita `any` salvo que sea estrictamente necesario.
7. Mantén consultas Supabase en services cuando corresponda.
8. Usa hooks para estado/lógica de presentación cuando tenga sentido.
9. Mantén componentes pequeños y reutilizables.
10. Antes de cambiar tablas o policies, revisa el esquema actual.
11. No desactives RLS para hacer funcionar una operación.
12. No expongas secretos.
13. Mantén compatibilidad con iOS y Android.
14. Si una dependencia nueva no es necesaria, no la agregues.
15. Prefiere implementaciones simples y comprensibles para un proyecto universitario.

---

# Estado funcional actual

Se ha probado correctamente:

```text
Expo / React Native
        ↓
Supabase
```

y funcionan:

- conexión desde la app;
- registro;
- confirmación de correo;
- login;
- sesión persistente;
- logout;
- rutas protegidas;
- creación de perfil público;
- creación de proyectos;
- creación automática del creador como líder;
- listado de proyectos;
- separación modular del módulo proyectos.

El próximo desarrollo debe construirse encima de esta base, sin romper estos flujos existentes.

Antes de empezar cualquier nueva tarea, inspecciona el repositorio y dime brevemente qué archivos actuales intervienen y qué cambios propones.
