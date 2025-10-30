# Ejercicio 13 - Parte 2B: AI Todo Manager

## Descripción del Proyecto:

Desarrollar un gestor de tareas inteligente con interfaz conversacional utilizando Next.js, el AI SDK de Vercel, y una API local personalizada. Los estudiantes aprenderán a implementar un sistema completo de tool calling donde el LLM puede ejecutar operaciones CRUD sobre tareas, realizar búsquedas avanzadas, y generar estadísticas de productividad, todo a través de una conversación natural.

## ⚠️ Advertencia de Seguridad Importante

**NUNCA** exponer API keys en el frontend. Las requests a OpenRouter deben ser realizadas exclusivamente desde el backend. Las API keys son información sensible y deben ser tratadas como contraseñas.

### Reglas de Oro de Seguridad:

1. **API Keys solo en backend**: Nunca en código del cliente
2. **Variables de entorno**: Usar `.env.local` para keys sensibles, sin NEXT*PUBLIC* prefix
3. **Nunca commitear keys**: Agregar `.env.local` a `.gitignore`
4. **Validación de inputs**: Sanitizar todos los inputs del usuario
5. **SQL Injection Protection**: Usar ORMs y prepared statements
6. **Rate limiting**: Implementar límites para prevenir abuso

## Características Principales:

**Requisitos Obligatorios:**

1. **Interfaz de Chat Conversacional**: UI moderna donde los usuarios gestionan tareas naturalmente
2. **Sistema de Tool Calling**: El LLM debe poder ejecutar las 5 herramientas definidas
3. **API Local de Tareas**: Backend propio para gestionar CRUD de tareas
4. **Base de Datos Persistente**: Almacenamiento de tareas con su estado
5. **Búsqueda y Filtros Avanzados**: Capacidad de buscar y filtrar tareas
6. **Sistema de Estadísticas**: Analytics de productividad del usuario
7. **Manejo de Estado**: Persistencia de conversación y sincronización de datos

## Arquitectura de la Solución:

### Frontend (Next.js Client Components):

- Interfaz de usuario del chat conversacional
- Manejo de estado local de conversación
- Streaming de respuestas del LLM en tiempo real
- Visualización de listas de tareas y estadísticas
- Indicadores de loading cuando se ejecutan tools
- Actualización en tiempo real del estado de tareas

### Backend (Next.js API Routes):

- Comunicación segura con OpenRouter (LLM)
- API REST/GraphQL para gestión de tareas (CRUD)
- Implementación de las 5 herramientas (tools)
- Gestión de base de datos
- Validación y sanitización de requests
- Rate limiting de API calls
- Lógica de búsqueda y filtrado

### Base de Datos:

- Almacenamiento de tareas por usuario
- Estados de tareas (pendiente/completada)
- Timestamps de creación y actualización
- **Tecnología a elección del estudiante**: PostgreSQL, SQLite, MongoDB, Prisma, etc.

## Sistema de Tool Calling:

El LLM debe tener acceso a las siguientes 5 herramientas que puede ejecutar automáticamente según el contexto de la conversación:

### 1. createTask

**Descripción**: Crear una nueva tarea en el sistema.

**Cuándo se usa**:

- Usuario: "Agregar tarea: comprar leche"
- Usuario: "Necesito recordar llamar al doctor mañana"
- Usuario: "Crea una tarea para terminar el informe"
- Usuario: "Anota que debo hacer ejercicio"

**Parámetros**:

- `title`: Título/descripción de la tarea (requerido)
- `priority`: Nivel de prioridad (opcional: "low" | "medium" | "high")
- `dueDate`: Fecha límite (opcional, formato ISO)
- `category`: Categoría de la tarea (opcional: "work" | "personal" | "shopping" | "health" | "other")

**Respuesta**:

- Objeto de la tarea creada con su ID único
- Confirmación de éxito
- Timestamp de creación

**Validaciones**:

- El título no puede estar vacío
- La fecha límite debe ser futura
- Prioridad debe ser uno de los valores permitidos

### 2. updateTask

**Descripción**: Modificar una tarea existente (título, estado, prioridad, etc).

**Cuándo se usa**:

- Usuario: "Marca como completada la tarea de comprar leche"
- Usuario: "Cambia la prioridad de 'hacer ejercicio' a alta"
- Usuario: "Renombra la tarea 'informe' a 'informe trimestral Q1'"
- Usuario: "Mueve la fecha límite del doctor a pasado mañana"

**Parámetros**:

- `taskId`: ID único de la tarea (requerido)
- `title`: Nuevo título (opcional)
- `completed`: Estado de completitud (opcional, boolean)
- `priority`: Nueva prioridad (opcional)
- `dueDate`: Nueva fecha límite (opcional)
- `category`: Nueva categoría (opcional)

**Respuesta**:

- Objeto de la tarea actualizada
- Confirmación de cambios realizados
- Timestamp de última modificación

**Validaciones**:

- La tarea debe existir
- Al menos un campo debe ser modificado
- Los nuevos valores deben ser válidos

**Casos especiales**:

- Si el usuario menciona una tarea por título pero no ID, el LLM debe primero buscarla con searchTasks

### 3. deleteTask

**Descripción**: Eliminar permanentemente una tarea del sistema.

**Cuándo se usa**:

- Usuario: "Elimina la tarea de comprar leche"
- Usuario: "Borra todas las tareas completadas"
- Usuario: "Quita esa tarea de mi lista"
- Usuario: "Ya no necesito la tarea del doctor"

**Parámetros**:

- `taskId`: ID único de la tarea (requerido)
- `confirm`: Flag de confirmación (opcional, para acciones masivas)

**Respuesta**:

- Confirmación de eliminación exitosa
- Título de la tarea eliminada (para confirmación al usuario)
- Contador de tareas eliminadas (si es acción masiva)

**Validaciones**:

- La tarea debe existir
- Para acciones masivas, requiere confirmación explícita

**Consideraciones**:

- Implementar soft delete (marcar como deleted) o hard delete (eliminar permanentemente)
- Si elimina múltiples tareas, debe confirmar con el usuario primero

### 4. searchTasks

**Descripción**: Buscar, filtrar y listar tareas según diversos criterios.

**Cuándo se usa**:

- Usuario: "Muéstrame todas mis tareas"
- Usuario: "¿Qué tareas tengo pendientes?"
- Usuario: "Lista las tareas de alta prioridad"
- Usuario: "Busca tareas que contengan 'informe'"
- Usuario: "Muestra tareas completadas esta semana"
- Usuario: "¿Qué tengo para hoy?"

**Parámetros**:

- `query`: Texto de búsqueda en título/descripción (opcional)
- `completed`: Filtrar por estado (opcional, boolean o null para todas)
- `priority`: Filtrar por prioridad (opcional)
- `category`: Filtrar por categoría (opcional)
- `dueDateFrom`: Rango de fecha inicio (opcional)
- `dueDateTo`: Rango de fecha fin (opcional)
- `sortBy`: Campo de ordenamiento (opcional: "createdAt" | "dueDate" | "priority" | "title")
- `sortOrder`: Orden (opcional: "asc" | "desc")
- `limit`: Número máximo de resultados (opcional, default: 50)

**Respuesta**:

- Array de tareas que coinciden con los criterios
- Total de resultados encontrados
- Indicador si hay más resultados (paginación)

**Casos de uso avanzados**:

```
"Tareas urgentes" → priority="high" + dueDate próxima
"Tareas atrasadas" → dueDate < hoy + completed=false
"Tareas de esta semana" → dueDateFrom=inicio_semana + dueDateTo=fin_semana
"Buscar 'reunión'" → query="reunión"
```

**Validaciones**:

- Si no hay criterios, retornar todas las tareas (con límite)
- Manejar correctamente filtros combinados (AND logic)

### 5. getTaskStats

**Descripción**: Generar estadísticas y analytics de productividad del usuario.

**Cuándo se usa**:

- Usuario: "¿Cuántas tareas he completado?"
- Usuario: "Muéstrame mis estadísticas"
- Usuario: "¿Qué tan productivo he sido esta semana?"
- Usuario: "¿En qué categoría tengo más tareas?"
- Usuario: "¿Cuántas tareas me faltan?"

**Parámetros**:

- `period`: Periodo de tiempo (opcional: "today" | "week" | "month" | "year" | "all-time")
- `groupBy`: Agrupación de stats (opcional: "category" | "priority" | "date")

**Respuesta**: Objeto con estadísticas completas:

```
{
  summary: {
    totalTasks: number,              // Total de tareas creadas
    completedTasks: number,          // Tareas completadas
    pendingTasks: number,            // Tareas pendientes
    completionRate: number,          // % de completitud
    overdueTasks: number            // Tareas atrasadas
  },

  byPriority: {
    high: { total, completed, pending },
    medium: { total, completed, pending },
    low: { total, completed, pending }
  },

  byCategory: {
    work: { total, completed, pending },
    personal: { total, completed, pending },
    shopping: { total, completed, pending },
    // ... otras categorías
  },

  timeline: {
    tasksCreatedToday: number,
    tasksCompletedToday: number,
    tasksCreatedThisWeek: number,
    tasksCompletedThisWeek: number,
    // ... más métricas temporales
  },

  productivity: {
    averageCompletionTime: string,   // Tiempo promedio para completar
    mostProductiveDay: string,       // Día con más tareas completadas
    currentStreak: number,           // Días consecutivos con tareas completadas
    longestStreak: number           // Racha más larga
  },

  upcoming: {
    dueTodayCount: number,
    dueThisWeekCount: number,
    nextDueTask: Task               // Próxima tarea con fecha límite
  }
}
```

**Cálculos avanzados**:

- Tasa de completitud por categoría
- Tendencia de productividad (mejorando/empeorando)
- Predicción de cuándo terminará tareas pendientes
- Identificar categorías descuidadas

## Flujo de Ejemplo de Conversación:

```
Usuario: "Hola, necesito organizar mis tareas del día"

AI: "¡Claro! Puedo ayudarte a gestionar tus tareas. ¿Qué necesitas hacer hoy?"

Usuario: "Agregar tres tareas: comprar leche, terminar informe de ventas,
         y llamar al dentista. El informe es urgente."

AI: [Ejecuta createTask 3 veces con diferentes parámetros]
    "Perfecto, agregué estas 3 tareas:

    ✅ Comprar leche (Prioridad: media)
    ⚡ Terminar informe de ventas (Prioridad: alta)
    📞 Llamar al dentista (Prioridad: media)

    ¿Quieres asignarles fechas límite?"

Usuario: "El informe es para hoy, el dentista para mañana"

AI: [Ejecuta updateTask 2 veces]
    "Actualizado:
    - Informe de ventas: vence hoy
    - Llamar al dentista: vence mañana

    Tienes 3 tareas pendientes, 1 urgente. ¿Empezamos?"

Usuario: "Ya compré la leche, márcala como completada"

AI: [Ejecuta searchTasks con query="leche" + updateTask con completed=true]
    "¡Excelente! Marqué 'Comprar leche' como completada ✓

    Te quedan 2 tareas pendientes:
    - ⚡ Terminar informe de ventas (vence hoy)
    - 📞 Llamar al dentista (vence mañana)"

Usuario: "Muéstrame todas mis tareas pendientes de alta prioridad"

AI: [Ejecuta searchTasks con completed=false, priority="high"]
    "Tienes 1 tarea de alta prioridad pendiente:

    ⚡ Terminar informe de ventas
       📅 Vence: Hoy
       🏷️ Categoría: Trabajo
       ⏰ Creada: Hace 15 minutos"

Usuario: "¿Qué tan productivo he sido esta semana?"

AI: [Ejecuta getTaskStats con period="week"]
    "📊 Tu productividad esta semana:

    ✅ Completadas: 8 tareas
    ⏳ Pendientes: 3 tareas
    📈 Tasa de completitud: 73%
    🔥 Racha actual: 4 días consecutivos

    Por categoría:
    - 💼 Trabajo: 5 completadas, 2 pendientes
    - 🏠 Personal: 2 completadas, 1 pendiente
    - 🛒 Compras: 1 completada, 0 pendientes

    ¡Vas muy bien! Estás 20% más productivo que la semana pasada 🎉"

Usuario: "Elimina todas las tareas completadas"

AI: [Primero busca con searchTasks completed=true, luego confirma]
    "Encontré 8 tareas completadas. ¿Estás seguro que quieres eliminarlas
    todas? Esto no se puede deshacer."

Usuario: "Sí, elimínalas"

AI: [Ejecuta deleteTask múltiples veces]
    "Eliminadas 8 tareas completadas:
    - Comprar leche
    - Enviar email a cliente
    - Pagar factura de luz
    - [... 5 más]

    Tu lista está más limpia. Te quedan 3 tareas activas."
```

## Tecnologías Requeridas:

### Core Framework: **Next.js 15+**

- App Router para routing moderno
- Server Components para backend
- Client Components para interactividad
- API Routes para backend endpoints

### AI Integration: **Vercel AI SDK**

- Streaming de respuestas LLM
- Tool calling / Function calling
- Manejo de conversaciones
- Hooks de React optimizados

### LLM Provider: **OpenRouter**

- Acceso a múltiples modelos LLM
- Usar modelos gratuitos o de bajo costo
- API compatible con OpenAI
- Soporte para tool calling

### Base de Datos (A elección del estudiante):

- PostgreSQL + Prisma
- SQLite
- MongoDB + Mongoose
- Supabase
- Cualquier otra solución que permita persistencia

## Configuración del Proyecto:

### Variables de Entorno (`.env.local`):

```env
# OpenRouter API Key - NUNCA commitear este archivo
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here

# OpenRouter Base URL
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Modelo LLM a utilizar
OPENROUTER_MODEL=anthropic/claude-3-haiku

# Database connection string (ejemplo con PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/todomanager

# Opcional: configuración de rate limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Opcional: tiempo de sesión
SESSION_SECRET=your-session-secret-here
```

### Configuración de `.gitignore`:

```gitignore
# Variables de entorno
.env.local
.env.development.local
.env.test.local
.env.production.local

# Dependencias
node_modules/
.next/

# Base de datos (si usan SQLite)
*.db
*.sqlite

# Logs
*.log
```

### Consideraciones de Base de Datos:

- Implementar soft deletes para permitir "deshacer" eliminaciones
- Usar timestamps automáticos para createdAt/updatedAt
- Validar que dueDate sea futura al crear tarea
- Implementar constraint para que title no sea vacío
- Considerar almacenar historial de cambios (audit log)

## Desafíos Técnicos a Resolver:

### 1. Tool Calling Implementation

- Definir correctamente el schema de cada tool para el LLM
- Manejar la ejecución asíncrona de tools
- Validar parámetros antes de ejecutar tools
- Manejar errores cuando las tools fallan
- El LLM debe encadenar tools (buscar antes de actualizar)

### 2. Natural Language Understanding

- El LLM debe interpretar referencias ambiguas ("esa tarea", "la primera")
- Entender comandos complejos ("todas las tareas urgentes de trabajo")
- Manejar múltiples acciones en un mensaje
- Confirmar acciones destructivas

### 3. Database Operations

- Queries eficientes para búsquedas con múltiples filtros
- Cálculo optimizado de estadísticas
- Manejo de concurrencia (múltiples updates simultáneos)
- Soft deletes vs hard deletes

### 4. Search & Filter Logic

- Implementar búsqueda full-text en títulos
- Combinar múltiples filtros (AND/OR logic)
- Ordenamiento flexible por diferentes campos
- Paginación para listas grandes

### 5. Statistics Calculation

- Cálculos eficientes de métricas agregadas
- Detectar tendencias y patrones
- Calcular streaks y rachas
- Generar insights útiles para el usuario

## Features Opcionales (Bonus):

### Funcionalidades Avanzadas:

**Subtareas**:

- Dividir tareas complejas en pasos más pequeños
- Progreso basado en subtareas completadas

**Etiquetas/Tags**:

- Sistema flexible de etiquetado
- Búsqueda por múltiples tags

**Recurrencia**:

- Tareas que se repiten (diario, semanal, mensual)
- Auto-creación de instancias futuras

**Recordatorios**:

- Notificaciones antes de fecha límite
- Emails o push notifications

**Adjuntos**:

- Subir archivos relacionados a tareas
- Links y referencias

**Colaboración**:

- Compartir tareas con otros usuarios
- Asignar tareas a miembros del equipo
- Comentarios en tareas

**Visualización**:

- Vista de calendario
- Vista Kanban (Todo/In Progress/Done)
- Gráficos de productividad

**Integrations**:

- Sincronización con Google Calendar
- Import/Export desde otras apps (Todoist, Trello)
- Webhooks para automatizaciones

**AI Enhancements**:

- Sugerencias inteligentes de prioridades
- Estimación automática de duración
- Agrupación inteligente de tareas similares
- Detección de tareas duplicadas

## Recursos Adicionales:

- **Vercel AI SDK Docs**: https://sdk.vercel.ai/
- **Vercel AI SDK - Tool Calling**: https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling
- **OpenRouter Docs**: https://openrouter.ai/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs (si usan Prisma)
- **Tool Calling Best Practices**: https://platform.openai.com/docs/guides/function-calling

## Consejos de Implementación:

### 1. Empezar con lo Básico

- Implementar primero CRUD simple (createTask, searchTasks)
- Validar que el tool calling funciona correctamente
- Agregar updateTask y deleteTask
- Finalmente implementar getTaskStats

### 2. Testing de Tools

- Probar cada tool independientemente con Postman/Insomnia
- Crear casos de prueba con diferentes parámetros
- Validar el formato de respuesta de cada tool
- Probar casos edge (búsquedas vacías, updates inválidos)

### 3. Prompt Engineering

- Instruir al LLM sobre cuándo usar cada tool
- Enseñarle a encadenar tools (buscar → actualizar)
- Manejar confirmaciones para acciones destructivas
- Proporcionar contexto de tareas previas

### 4. Database Design

- Empezar con schema simple, iterar después
- Usar migrations para cambios de schema
- Implementar seeds para datos de prueba
- Considerar performance desde el inicio

### 5. UX Considerations

- Mostrar loading states cuando se ejecutan tools
- Feedback inmediato de acciones (crear, actualizar, eliminar)
- Visualizar claramente el estado de cada tarea
- Permitir deshacer acciones importantes

### 6. Error Handling

- Validar inputs antes de ejecutar tools
- Manejar gracefully errores de DB
- Informar claramente al usuario cuando algo falla
- Implementar retry logic para operaciones importantes

### 7. Performance

- Índices en columnas de búsqueda frecuente
- Cachear estadísticas si son costosas
- Pagination para listas largas
- Optimistic UI updates

### 8. Security Checklist

- ✅ API keys solo en backend
- ✅ Validar todos los inputs del usuario
- ✅ Sanitizar responses del LLM antes de renderizar
- ✅ SQL injection protection (usar ORMs)
- ✅ Rate limiting por usuario
- ✅ Verificar ownership de tareas (user puede solo ver/modificar sus tareas)
- ✅ CORS configurado correctamente

## Criterios de Éxito:

- ✅ Usuario puede gestionar tareas conversacionalmente
- ✅ Las 5 tools funcionan correctamente
- ✅ CRUD completo de tareas implementado
- ✅ Búsqueda y filtros funcionan correctamente
- ✅ Estadísticas se calculan con precisión
- ✅ Los datos persisten en base de datos
- ✅ Manejo robusto de errores
- ✅ UI/UX intuitiva y responsiva
- ✅ Código limpio y bien documentado
- ✅ Seguridad implementada correctamente
