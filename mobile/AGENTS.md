# AGENTS.md — Plann-It

Estás trabajando en **Plann-It**, un proyecto universitario de Ingeniería de Software.

Plann-It es una aplicación móvil colaborativa de gestión de proyectos, conceptualmente similar a Trello, pero orientada a una experiencia móvil más guiada y accesible.

Este archivo entrega contexto técnico, decisiones de arquitectura, convenciones y estado funcional conocido.

**El repositorio actual siempre tiene prioridad sobre este documento.**

---

# 1. Regla principal

Antes de modificar cualquier archivo:

1. Ejecuta:
   ```bash
   git status
   git branch --show-current
   ```

2. Inspecciona la estructura real del repositorio.

3. Revisa específicamente cuando corresponda:
   ```text
   mobile/app/
   mobile/features/
   mobile/lib/
   supabase/migrations/
   ```

4. Inspecciona los archivos relacionados con la funcionalidad solicitada antes de proponer cambios.

5. Si la tarea afecta Supabase, revisa también:
   - migraciones existentes;
   - tablas actuales;
   - constraints;
   - foreign keys;
   - funciones RPC;
   - RLS;
   - policies;
   - tipos generados.

6. No asumas que este documento reemplaza al código.

7. No recrees entidades, funciones o componentes sin verificar primero si ya existen.

8. Haz cambios pequeños, modulares y fáciles de revisar.

9. Antes de un cambio amplio, explica brevemente:
   - qué archivos intervienen;
   - qué problema se resolverá;
   - qué arquitectura se seguirá.

10. No hagas commits, merges, pushes de Git ni `supabase db push` salvo que el usuario lo solicite explícitamente.

11. Si necesitas ejecutar un comando de terminal (npm, git, expo, supabase CLI, etc.), no lo ejecutes directamente: explica qué comando es, qué hace y por qué es necesario, y pídele al usuario que lo ejecute él mismo en su Git Bash. El usuario prefiere mantener el control de su propia terminal mientras trabaja.

---

# 2. Arquitectura actual

Se abandonó definitivamente el backend anterior basado en:

```text
NestJS
TypeORM
REST server propio
```

No reintroducir estas tecnologías salvo solicitud explícita.

La arquitectura actual es:

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
        ├── PostgreSQL Functions / RPC
        ├── Storage
        └── Realtime
```

Supabase es el backend principal.

Las Edge Functions pueden utilizarse en funcionalidades futuras que realmente necesiten ejecución del lado servidor fuera de PostgreSQL, por ejemplo integración con servicios externos o IA.

No introducir una capa backend adicional sin una necesidad concreta.

---

# 3. Frontend

La aplicación está en:

```text
mobile/
```

Tecnologías principales:

- React Native
- Expo
- TypeScript
- Expo Router
- `@supabase/supabase-js`
- `react-native-safe-area-context`
- componentes nativos de Expo/React Native

La aplicación se prueba principalmente mediante Expo Go en iPhone, pero debe mantenerse compatible con:

```text
iOS
Android
web cuando sea razonable
```

Comandos habituales:

```bash
cd mobile
npx expo start
```

Si Metro tiene problemas:

```bash
npx expo start --clear
```

Para usar túnel:

```bash
npx expo start --tunnel
```

No añadir dependencias nuevas si la funcionalidad puede resolverse razonablemente con las ya existentes.

---

# 4. Variables de entorno y Supabase Client

El cliente Supabase se encuentra en:

```text
mobile/lib/supabase.ts
```

Las variables utilizadas son:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_KEY=
```

El archivo:

```text
mobile/.env
```

no debe versionarse.

Nunca colocar en React Native:

- `service_role`;
- secret key;
- contraseña PostgreSQL;
- `DATABASE_URL`;
- secretos de servicios externos.

Las variables `EXPO_PUBLIC_*` forman parte del cliente y no deben contener secretos.

---

# 5. Tipos de Supabase

Los tipos de la base se mantienen en:

```text
mobile/lib/database.types.ts
```

Este archivo se genera desde Supabase.

No editarlo manualmente salvo una razón excepcional.

Después de aplicar una migration que cambie:

- tablas;
- columnas;
- funciones RPC;
- enums;
- relaciones relevantes;

regenerar:

```bash
npx supabase gen types typescript --linked > mobile/lib/database.types.ts
```

Si se ejecuta desde `mobile/`, usar:

```bash
npx supabase gen types typescript --linked > lib/database.types.ts
```

Los tipos específicos de cada feature pueden derivarse de `database.types.ts`.

Ejemplo:

```ts
import type { Tables } from '../../lib/database.types'

export type Proyecto = Tables<'proyecto'>
```

Evitar duplicar manualmente tipos de tablas ya generados por Supabase.

---

# 6. Autenticación

Actualmente están implementados y probados:

- registro;
- confirmación por correo;
- inicio de sesión;
- persistencia de sesión;
- cierre de sesión;
- protección de rutas;
- perfil público de usuario;
- fotografía de perfil.

Se utilizan:

```ts
supabase.auth.signUp()
supabase.auth.signInWithPassword()
supabase.auth.signOut()
supabase.auth.getSession()
supabase.auth.onAuthStateChange()
```

La metadata estándar elegida es:

```text
usuario_nombre
```

No sustituirla por `full_name`.

Ejemplo:

```ts
options: {
  data: {
    usuario_nombre: nombre.trim(),
  },
}
```

Supabase Auth mantiene:

```text
auth.users
```

y la aplicación mantiene:

```text
public.usuario
```

Conceptualmente:

```text
auth.users.id
      |
      | 1:1
      v
public.usuario.usuario_id
```

Antes de modificar triggers asociados a creación de usuarios, inspeccionar las migraciones y la implementación actual.

---

# 7. Navegación actual

Se utiliza Expo Router.

La estructura conocida actualmente es aproximadamente:

```text
mobile/app/
├── _layout.tsx
├── modal.tsx
│
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   └── register.tsx
│
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── invitaciones.tsx
│   └── proyectos.tsx
│
└── proyectos/
    ├── crear.tsx
    ├── [proyectoId].tsx
    │
    └── [proyectoId]/
        └── tableros/
            └── [tableroId].tsx
```

Verificar siempre la estructura real antes de agregar rutas nuevas.

`mobile/app/_layout.tsx` controla la sesión y las rutas protegidas.

No permitir que rutas privadas sean accesibles sin sesión.

---

# 8. Modularización

La aplicación utiliza organización por funcionalidad.

No concentrar lógica de negocio ni consultas Supabase grandes dentro de pantallas de Expo Router.

Patrón esperado:

```text
Pantalla
   |
   v
Componente
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

Estructura aproximada:

```text
mobile/features/
├── proyectos/
├── invitaciones/
├── miembros/
├── tareas/
├── chat/
├── gantt/
└── ...
```

Una feature puede contener:

```text
components/
hooks/
services/
utils/
types.ts
```

Reutilizar módulos existentes antes de crear otros nuevos.

---

# 9. Módulo de proyectos

El módulo de proyectos ya tiene una estructura modular.

Actualmente existen componentes/hooks relacionados con:

```text
ProyectoCard
CrearTableroModal
EditarProyectoModal
TableroCard
ListaProyecto
TableroProyecto
CampoFecha
useProyectos
useCrearProyecto
useEditarProyecto
useDetalleProyecto
useCrearTablero
...
```

Inspeccionar los nombres y rutas reales antes de importar.

---

# 10. Creación de proyectos

La creación de proyectos está implementada y probada.

Se utiliza una RPC:

```text
crear_proyecto
```

Conceptualmente:

```ts
supabase.rpc('crear_proyecto', {
  p_nombre,
  p_descripcion,
  p_fecha_fin,
})
```

La RPC:

1. obtiene al usuario mediante `auth.uid()`;
2. crea el proyecto;
3. crea la membresía correspondiente;
4. asigna al creador como `LIDER`;
5. devuelve el ID del proyecto.

Nunca enviar desde React Native un `usuario_id` para decidir quién está creando el proyecto.

La identidad debe derivarse de:

```sql
auth.uid()
```

---

# 11. Edición de proyectos

La edición de proyectos se implementó recientemente y fue probada funcionalmente.

Permite modificar:

- nombre;
- descripción;
- fecha de término;
- estado.

Existe una RPC:

```text
editar_proyecto
```

La edición debe estar restringida según los permisos definidos para el proyecto.

La UI utiliza:

```text
EditarProyectoModal
        |
        v
useEditarProyecto
        |
        v
proyecto.service
        |
        v
editar_proyecto RPC
```

Después de editar, la pantalla de detalle debe recargar la información del proyecto.

La fecha utiliza el componente reutilizable:

```text
CampoFecha
```

y utilidades de:

```text
features/proyectos/utils/fecha.ts
```

Formato visual:

```text
DD-MM-AAAA
```

Formato PostgreSQL:

```text
AAAA-MM-DD
```

No duplicar conversiones de fecha dentro de hooks o componentes si ya existen en `utils/fecha.ts`.

La edición se integró en:

```text
mobile/app/proyectos/[proyectoId].tsx
```

mediante un modal accesible desde la vista de detalle.

---

# 12. Formularios y teclado

Los formularios móviles deben evitar quedar tapados por el teclado.

Se utiliza el patrón:

```text
SafeAreaView
└── KeyboardAvoidingView
    └── ScrollView
```

Cuando corresponda, utilizar:

```tsx
keyboardShouldPersistTaps="handled"
```

y comportamiento específico de plataforma.

No solucionar problemas de teclado simplemente moviendo permanentemente la interfaz hacia arriba.

Mantener una experiencia razonable tanto en iOS como Android.

---

# 13. Selector de fecha

Existe:

```text
features/proyectos/components/CampoFecha
```

Reutilizarlo en formularios que requieran selección de fechas antes de crear otra implementación.

No introducir otro DatePicker para la misma función salvo una razón clara.

Utilidades existentes aproximadamente:

```ts
fechaVisualAIso()
fechaIsoAVisual()
fechaVisualADate()
fechaDateAVisual()
formatearEntradaFecha()
```

Inspeccionar `utils/fecha.ts` antes de implementar nuevas conversiones.

---

# 14. Estado funcional actual

## Implementado

Actualmente se considera implementado:

- registro;
- login/logout;
- persistencia de sesión;
- rutas protegidas;
- perfil de usuario;
- fotografía de usuario;

### Proyectos
- crear proyectos;
- listar proyectos;
- visualizar detalle;
- editar nombre;
- editar descripción;
- editar fecha de término;
- editar estado;
- eliminar proyectos;

### Miembros e invitaciones
- invitar miembros;
- aceptar invitaciones;
- rechazar invitaciones;
- cambiar roles;
- retirar integrantes;

### Tableros y listas
- crear tableros;
- visualizar tableros;
- editar nombre de tablero;
- eliminar tablero (`TableroProyecto.tsx`, dentro de la pantalla de detalle de tablero);
- crear listas;
- editar nombre de lista;
- eliminar listas;
- reordenar listas y tareas mediante drag-and-drop (`react-native-draggable-flatlist`, orden persistido en `lista_orden`/`tarea_orden`);

### Tareas
- crear tareas;
- editar tareas;
- eliminar tareas;
- asignar responsables;
- restricción real (RLS, no solo UI): un miembro no puede editar/eliminar tareas ajenas salvo que sea líder, esté asignado, o (para editar) la tarea no tenga responsable asignado — ver `supabase/migrations/20260816103000_restricciones_tareas.sql`;

### Fechas
- selector de fecha mediante calendario;

### Seguridad
- RLS y RPC para varias operaciones ya implementadas;

### Gantt
- integrado en `dev` en `features/carta-gantt/` y `app/carta-gantt/[id].tsx`;

### Chat
- chat grupal por proyecto, integrado en `dev` y montado globalmente en `app/_layout.tsx` (`<ChatGlobal />`);
- adjuntar archivos a mensajes;
- realtime para mensajes;

### Análisis con IA
- generación y visualización de análisis de proyecto vía Groq (`features/ia/`, pantalla `app/proyectos/[proyectoId]/analisis.tsx`);
- requiere `EXPO_PUBLIC_GROQ_API_KEY` en `.env` (ver sección 38 para setup local) y modelo válido en Groq — los modelos se deprecan con el tiempo (ej. `llama-3.1-8b-instant` fue reemplazado por `openai/gpt-oss-20b` el 16-08-2026), si el análisis empieza a fallar con `model_not_found` revisar `https://console.groq.com/docs/deprecations`;
- **riesgo de seguridad conocido, no resuelto:** la key de Groq viaja en el bundle del cliente (prefijo `EXPO_PUBLIC_`) y es extraíble. Migrar esta llamada a una Supabase Edge Function con la key como secreto de servidor sigue pendiente.

**Nota:** este documento se desactualiza rápido. Antes de asumir que algo falta, verifica el código (regla #1) — varias veces este archivo listó como "pendiente" o "en otra rama" cosas que ya estaban en `dev`.

---

# 15. Parcialmente implementado

Actualmente quedan incompletas o pendientes de revisión:

### Invitaciones
Ya funciona con búsqueda de usuario por nombre o correo (`buscar_usuarios_para_invitacion` RPC) y una vista previa básica (avatar, nombre, correo) al seleccionar el resultado antes de confirmar el envío — ver `InvitarMiembroModal.tsx`.

Lo que sigue sin existir es un perfil expandido (más allá de avatar/nombre/correo) antes de invitar, si se considera necesario.

### Notificaciones
Las invitaciones tienen interfaz propia.

Sin embargo, la tabla general:

```text
notificacion
```

todavía no cuenta con un flujo completo de UI y lógica.

---

# 16. Funcionalidades pendientes

Todavía quedan pendientes, entre otras:

- reportar avances;
- adjuntar archivos a tareas (solo existen adjuntos en mensajes de chat, no en tareas);
- historial de actividades (tabla `actividad` sin UI);
- rol `CO_LIDER` (ver comentarios del PO más abajo);
- orden automático de tareas por fecha de entrega ascendente — hoy el orden es manual vía drag-and-drop (`tarea_orden`), no por `tarea_fecha_entrega`;
- realtime para asignaciones;
- realtime para otros cambios colaborativos (fuera del chat, que ya tiene realtime);
- panel/inicio con tareas pendientes (`app/(tabs)/index.tsx` es hoy una pantalla de bienvenida estática, sin lógica).

El análisis de avances con IA **ya no está pendiente** — ver sección 14.

---

# 17. Comentarios actuales del Product Owner

Estas observaciones tienen prioridad funcional.

## Tareas y permisos

Un miembro:

- no debe poder editar tareas asignadas a otros;
- no debe poder eliminar tareas asignadas a otros.

Antes de resolverlo únicamente en UI, revisar:

- RPC;
- RLS;
- policies;
- asignaciones;
- roles.

La seguridad real debe estar en Supabase, no solo ocultando botones.

---

## Orden de tareas

Las tareas deben mostrarse ordenadas por:

```text
fecha de entrega ascendente
```

Las más próximas a la fecha actual deben aparecer primero.

Definir claramente el tratamiento de:

- tareas vencidas;
- tareas finalizadas;
- tareas sin fecha, si llegaran a existir.

---

## Nuevo rol CO_LIDER

Debe existir un rol equivalente a:

```text
CO_LIDER
```

El co-líder debe poder realizar acciones administrativas similares al líder.

Restricción importante:

```text
CO_LIDER no puede eliminar al LIDER original
```

Antes de implementar este cambio:

1. revisar cómo se almacenan actualmente roles y permisos;
2. revisar todas las RPC que comprueban `LIDER`;
3. evitar replicar condiciones distintas en múltiples funciones si puede centralizarse;
4. revisar UI y RLS.

No asumir que comparar:

```sql
rol = 'LIDER'
```

seguirá siendo suficiente después de introducir `CO_LIDER`.

---

## Reordenamiento de listas

El PO quiere que las listas puedan:

```text
agarrarse
→ arrastrarse
→ cambiar de posición
```

Ya existe o se espera un campo equivalente a:

```text
lista_orden
```

La persistencia del nuevo orden debe reflejarse en PostgreSQL.

No implementar solo el orden visual sin persistencia.

---

## Administración de tableros

Agregar:

- editar tablero;
- eliminar tablero.

Reutilizar el patrón ya utilizado en otras operaciones:

```text
Componente
→ Hook
→ Service
→ RPC/RLS
```

---

## Inicio

La pestaña de inicio debe mostrar las tareas pendientes relevantes para el usuario autenticado.

Antes de implementarlo, revisar:

- `asignaciontarea`;
- estado de tarea;
- fecha de entrega;
- RLS;
- posibles consultas/RPC existentes.

---

# 18. MiembroProyecto

La tabla utiliza:

```text
miembro_proyecto_id UUID
```

Debe mantenerse unicidad equivalente a:

```text
UNIQUE (
  miembro_proyecto_usuario_id,
  miembro_proyecto_proyecto_id
)
```

Un usuario:

- puede pertenecer a muchos proyectos;
- no puede aparecer dos veces como miembro del mismo proyecto.

`miembroproyecto` es central para autorización.

Conceptualmente:

```text
Usuario
   |
   v
MiembroProyecto
   |
   v
Proyecto
```

Desde la membresía se deriva acceso a información asociada al proyecto.

---

# 19. AsignacionTarea

Se conserva un identificador propio:

```text
asignacion_tarea_id
```

porque interesa mantener historial de asignaciones.

Una misma persona puede recibir la misma tarea nuevamente en otro momento.

No convertir esta tabla simplemente en una PK compuesta usuario/tarea.

Antes de cambiar permisos de edición/eliminación de tareas, revisar esta entidad.

---

# 20. InvitacionProyecto

Posee un identificador propio:

```text
invitacion_id
```

porque pueden existir invitaciones históricas.

Estados conceptuales:

```text
PENDIENTE
ACEPTADA
RECHAZADA
```

Aceptar una invitación debe generar una membresía en:

```text
miembroproyecto
```

Verificar los valores reales almacenados antes de agregar validaciones nuevas.

---

# 21. Gantt

La arquitectura de Gantt cambió respecto del diseño original.

En una etapa anterior existían las entidades:

```text
CartaGantt
ItemGantt
```

pero se determinó que podían ser redundantes si el Gantt solamente representa datos que ya pertenecen a las tareas.

Existe una migration relacionada con eliminación de entidades Gantt:

```text
eliminar_entidades_gantt
```

y existe una función conocida aproximadamente como:

```text
obtener_datos_gantt
```

Por lo tanto:

**NO recrear `cartagantt` ni `itemgantt` basándose únicamente en documentación antigua.**

Antes de modificar Gantt:

1. inspeccionar schema actual;
2. inspeccionar migraciones;
3. revisar implementación de la rama Gantt;
4. comprobar de dónde obtiene fechas y responsables;
5. confirmar que se derive de tareas si ese es el diseño actual.

---

# 22. Chat

Ya está integrado en `dev` (`features/chat/`, montado globalmente vía `<ChatGlobal />` en `app/_layout.tsx`).

Incluye al menos:

- mensajes;
- usuarios;
- proyecto;
- adjuntos;
- realtime.

Antes de confiar en que está sólido, comprobar (esta lista sigue siendo una buena checklist de regresión, aunque ya no sea "antes de integrar" sino "antes de tocarlo"):

```text
usuario miembro → puede acceder
usuario externo → no puede acceder

usuario A envía
→ usuario B recibe mediante Realtime

mensaje enviado
→ persiste después de recargar

archivo adjunto
→ se almacena y mantiene su asociación
```

Revisar RLS y Storage policies correspondientes.

No considerar una prueba de UI suficiente para validar seguridad.

---

# 23. Integración de ramas grandes

Chat y Gantt ya fueron integrados a `dev` (ver secciones 14, 21 y 22) — las menciones de `feature/chat` y `feature/gantt` como ramas pendientes de alinear quedaron obsoletas.

El flujo descrito abajo sigue siendo la forma correcta de probar cualquier rama grande futura antes de mezclarla con `dev`.

No mezclar ramas grandes directamente sin inspección.

Para probar una rama contra el estado actual se recomienda crear una rama temporal:

```bash
git switch dev
git pull origin dev
git switch -c test/integracion-chat
git merge --no-ff <rama-chat>
```

Probar y luego eliminar la rama temporal si corresponde.

Hacer lo mismo con Gantt.

Para probar ambas juntas, utilizar otra rama temporal de integración.

No usar estas ramas temporales como sustituto de `dev`.

---

# 24. RLS y seguridad

La aplicación utiliza Supabase directamente desde el cliente.

Por eso RLS es obligatorio para información privada.

Nunca resolver permisos mediante:

```text
desactivar RLS
```

Nunca utilizar `service_role` desde React Native.

La autorización debe seguir conceptualmente:

```text
auth.uid()
    |
    v
MiembroProyecto
    |
    v
Proyecto
    |
    v
recursos del proyecto
```

El frontend puede ocultar acciones para mejorar UX, pero eso **no es una barrera de seguridad**.

Las restricciones importantes también deben verificarse en PostgreSQL mediante:

- RLS;
- RPC;
- policies;
- constraints cuando corresponda.

---

# 25. Funciones PostgreSQL / RPC

La base utiliza varias funciones RPC.

Entre las conocidas actualmente pueden encontrarse:

```text
crear_proyecto
editar_proyecto
actualizar_miembro_proyecto
asignar_miembro_tarea
desasignar_miembro_tarea
eliminar_miembro_proyecto
es_lider_proyecto
es_miembro_proyecto
invitar_usuario_proyecto
obtener_asignaciones_proyecto
obtener_datos_gantt
obtener_invitaciones_pendientes
obtener_miembros_proyecto
puede_eliminar_proyecto
responder_invitacion
```

Esta lista puede quedar desactualizada.

Siempre confirmar contra:

```text
mobile/lib/database.types.ts
supabase/migrations/
```

antes de crear otra RPC que pueda duplicar comportamiento.

---

# 26. Migraciones Supabase

Las migraciones se encuentran en:

```text
supabase/migrations/
```

El proyecto está enlazado a:

```text
plann-it-dev
```

Project ref:

```text
lmjcctnnnbjfsczasqci
```

Existe:

```text
supabase/config.toml
```

No ejecutar nuevamente `supabase init --force` sin una razón específica.

---

# 27. Flujo correcto para cambios de base de datos

Cuando una funcionalidad requiere cambios en PostgreSQL:

```text
crear feature branch
        |
        v
crear migration
        |
        v
escribir SQL
        |
        v
GUARDAR archivo
        |
        v
revisar migration
        |
        v
supabase db push
        |
        v
regenerar database.types.ts
        |
        v
implementar/ajustar frontend
        |
        v
probar funcionalmente
        |
        v
commit + Git push
        |
        v
merge a dev
```

Crear una migration:

```bash
npx supabase migration new nombre_migration
```

Aplicar migrations pendientes al remoto:

```bash
npx supabase db push
```

`supabase db push` y `git push` son operaciones distintas:

```text
supabase db push
→ ejecuta migrations en PostgreSQL remoto

git push
→ envía commits al repositorio Git remoto
```

---

# 28. Migraciones ya aplicadas

Una migration que ya fue aplicada al remoto debe tratarse como historial.

No editar una migration ya aplicada esperando que:

```bash
npx supabase db push
```

la vuelva a ejecutar.

Supabase identifica migrations por su timestamp.

Si una migration aplicada necesita corrección:

```text
NO modificar la aplicada
        |
        v
crear nueva migration correctiva
```

Ejemplo reciente:

```text
20260816042743_editar_proyecto.sql
20260816055225_crear_funcion_editar_proyecto.sql
```

La segunda se creó porque la primera había sido aplicada antes de guardar correctamente su contenido.

Mantener ambas si ambas forman parte del historial remoto.

---

# 29. Verificar estado de migrations

Usar:

```bash
npx supabase migration list
```

Una migration pendiente debería aparecer local pero no remotamente.

Antes de hacer `db push`, revisar qué migrations se aplicarán.

---

# 30. Esquema actual

Existen actualmente tablas similares a:

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
mensaje
mensajearchivo
actividad
notificacion
analisis_ia
```

La lista exacta debe obtenerse del esquema actual.

No recrear tablas basándose en modelos antiguos.

En particular, comprobar el estado actual de entidades Gantt antes de asumir que:

```text
cartagantt
itemgantt
```

siguen existiendo.

---

# 31. Modelo conceptual vigente aproximado

El núcleo actualmente puede entenderse como:

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
   ├── Mensajes / Chat
   |
   └── Análisis IA
```

Además:

```text
Tarea
  |
  v
AsignacionTarea
  |
  v
MiembroProyecto
```

y existen relaciones para:

```text
Tarea <-> Etiqueta
Tarea <-> Archivo
Mensaje <-> Archivo
Usuario -> Notificacion
Usuario -> InvitacionProyecto -> Proyecto
Usuario -> Actividad -> Tarea
```

El Gantt debe comprobarse contra su implementación actual y no contra modelos antiguos.

---

# 32. Git workflow

Se utiliza:

```text
main
  ↑
dev
  ↑
feature/*
```

`main`:

```text
versión estable
```

`dev`:

```text
integración del desarrollo
```

Nueva funcionalidad:

```bash
git switch dev
git pull origin dev
git switch -c feature/nombre
```

Después:

```text
feature/*
   ↓
dev
   ↓
main
```

No trabajar directamente sobre `main`.

---

# 33. Staging y commits

No utilizar automáticamente:

```bash
git add -A
```

si existen cambios no relacionados en el working tree.

Preferir staging explícito cuando una feature modifica archivos concretos:

```bash
git add archivo1
git add archivo2
git add archivo3
```

Después revisar:

```bash
git status
git diff --cached
```

Solo cuando el staged diff sea correcto, hacer commit.

No incluir cambios accidentales en:

```text
package.json
package-lock.json
app.json
```

sin revisar primero su origen.

---

# 34. Conventional Commits

Formato:

```text
<tipo>: <descripción en español>
```

Tipos habituales:

```text
feat
fix
refactor
docs
test
chore
merge
```

Ejemplos:

```text
feat: agregar edición de proyectos
feat: implementar administración de tableros
fix: restringir edición de tareas ajenas
refactor: reutilizar selector de fechas
chore: versionar cambios de Supabase
```

---

# 35. Forma de trabajo esperada

Cuando se solicite implementar algo:

1. inspeccionar código actual;
2. revisar rama;
3. localizar feature existente;
4. explicar brevemente qué se modificará;
5. reutilizar componentes/hooks/services existentes;
6. mantener consultas Supabase en services;
7. mantener lógica de presentación en hooks cuando corresponda;
8. mantener pantallas ligeras;
9. mantener TypeScript tipado;
10. evitar `any`;
11. revisar RLS/RPC antes de operaciones sensibles;
12. evitar duplicar utilidades;
13. mantener compatibilidad iOS/Android;
14. no agregar dependencias innecesarias;
15. probar errores además del camino exitoso;
16. si cambia Supabase, utilizar migrations;
17. regenerar tipos después de cambios de esquema/RPC;
18. revisar `git diff` antes de commit;
19. no hacer commit/push sin autorización;
20. preferir soluciones simples y defendibles para un proyecto universitario.

---

# 36. Prioridades actuales recomendadas

Ya completado (ver sección 14 para detalle): edición de proyectos, restricciones de permisos sobre tareas, editar/eliminar tableros, editar/reordenar listas, Chat integrado, Gantt integrado, Análisis de avances con IA.

Salvo que el usuario indique otro orden, la prioridad funcional actual sobre lo que queda pendiente (sección 16) es aproximadamente:

```text
1. Introducir CO_LIDER correctamente
2. Ordenar tareas por fecha de entrega
3. Mostrar tareas pendientes en Inicio
4. Adjuntar archivos a tareas
5. Historial de actividades
6. Notificaciones generales
7. Realtime adicional (asignaciones y otros cambios colaborativos)
8. Reportar avances
```

Antes de ejecutar esta priorización, comprobar si alguna de estas funcionalidades ya fue implementada (regla #1) — este documento se ha quedado atrás de lo que hay en `dev` más de una vez.

---

# 37. Criterio de finalización de una feature

Una funcionalidad no se considera terminada únicamente porque la UI funciona.

Revisar según corresponda:

```text
UI
✓

validaciones
✓

service
✓

RPC / query
✓

RLS / autorización
✓

migrations
✓

database.types.ts
✓

iOS
✓

Android cuando sea posible
✓

flujo exitoso
✓

errores
✓

usuario sin permisos
✓

persistencia después de recargar
✓
```

Si utiliza Realtime:

```text
dos sesiones/usuarios
✓
```

Si utiliza archivos:

```text
Storage + policies
✓
```

---

# 38. Configuración en un dispositivo nuevo

Este flujo ya fue probado exitosamente para levantar el proyecto en una máquina recién clonada.

## Requisitos

```text
Node.js (probado con v26)
npm
Git
App "Expo Go" instalada en el celular de prueba
```

## Pasos

1. Clonar el repo y pararse en `dev` (ahí está el trabajo más reciente, no en `main`):

   ```bash
   git clone https://github.com/OsvSoto/plann-it.git
   cd plann-it
   git checkout -b dev origin/dev
   ```

2. Instalar dependencias del frontend:

   ```bash
   cd mobile
   npm install
   ```

3. Crear `mobile/.env` (no está versionado, ni siquiera como plantilla `.env.example` en este punto del repo) con:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://lmjcctnnnbjfsczasqci.supabase.co
   EXPO_PUBLIC_SUPABASE_KEY=<publishable/anon key desde Project Settings → API del proyecto Supabase plann-it-dev>
   EXPO_PUBLIC_GROQ_API_KEY=<API key desde console.groq.com/keys, tier gratuito alcanza>
   ```

   Nunca usar la `service_role key` de Supabase acá. La key de Groq es necesaria solo para probar "Análisis de IA" (sección 14); sin ella el resto de la app funciona igual.

   Después de crear o modificar `.env` hay que **reiniciar** `npx expo start` (no basta con Fast Refresh, las env vars solo se leen al arrancar).

4. Levantar el servidor de desarrollo:

   ```bash
   npx expo start
   ```

   Esto asume que el celular y la notebook están en la **misma red WiFi** (modo LAN). La primera vez puede aparecer un popup del Firewall de Windows pidiendo permitir acceso a redes privadas para Node/Metro — debe aceptarse o el celular no podrá conectar. Se escanea el QR con la app Expo Go.

## Cuando no hay red compartida (ej. red universitaria con aislamiento de clientes)

Alternativas, de más simple a más robusta:

- **Hotspot del celular**: conectar la notebook al hotspot WiFi del propio celular y usar `npx expo start` normal (modo LAN dentro de esa red compartida). No requiere configuración adicional.
- **`--tunnel`**: usa `@expo/ngrok` + `@expo/ngrok-bin` por debajo (se instalan como devDependency del proyecto: `npm install --save-dev @expo/ngrok`). El túnel legacy de ngrok requiere un authtoken propio (ngrok ya no permite túneles anónimos); si falta, falla con errores como `CommandError: failed to start tunnel` / `remote gone away`. Se soluciona creando una cuenta gratis en ngrok.com y guardando el token en `C:\Users\<usuario>\.ngrok2\ngrok.yml`:

  ```yaml
  authtoken: TU_TOKEN
  ```

  Luego `npx expo start --clear --tunnel`.

---

# 39. Regla final

No optimices prematuramente ni introduzcas arquitectura innecesaria.

Plann-It es un proyecto universitario que debe priorizar:

```text
corrección
claridad
modularidad
seguridad
trazabilidad
facilidad de explicación
```

Cuando existan varias soluciones posibles, elegir la más sencilla que mantenga una arquitectura razonable y sea fácil de justificar técnicamente.
