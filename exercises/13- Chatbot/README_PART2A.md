# Ejercicio 13 - Parte 2A: AI Book Advisor

## Descripción del Proyecto:

Desarrollar un asistente inteligente de recomendación de libros que utiliza Next.js, el AI SDK de Vercel, y la API de Google Books. Los estudiantes aprenderán a implementar un sistema de tool calling avanzado donde el LLM puede ejecutar múltiples herramientas para buscar libros, gestionar listas de lectura personalizadas, y generar estadísticas de lectura.

## ⚠️ Advertencia de Seguridad Importante

**NUNCA** exponer API keys en el frontend. Las requests a OpenRouter y Google Books deben ser realizadas exclusivamente desde el backend. Las API keys son información sensible y deben ser tratadas como contraseñas.

### Reglas de Oro de Seguridad:

1. **API Keys solo en backend**: Nunca en código del cliente
2. **Variables de entorno**: Usar `.env.local` para keys sensibles, sin NEXT*PUBLIC* prefix
3. **Nunca commitear keys**: Agregar `.env.local` a `.gitignore`
4. **Validación de inputs**: Sanitizar todos los inputs del usuario
5. **Rate limiting**: Implementar límites para prevenir abuso de APIs

## Características Principales:

**Requisitos Obligatorios:**

1. **Interfaz de Chat Conversacional**: UI moderna donde los usuarios pueden pedir recomendaciones naturalmente
2. **Sistema de Tool Calling**: El LLM debe poder ejecutar las 6 herramientas definidas
3. **Integración con Google Books API**: Búsqueda y obtención de información de libros reales
4. **Gestión de Listas de Lectura**: Persistencia de libros que el usuario quiere leer o ya leyó
5. **Sistema de Estadísticas**: Analytics de hábitos de lectura del usuario
6. **Manejo de Estado**: Persistencia de conversación y datos de usuario
7. **Validación Robusta**: Sanitización de inputs y manejo de errores de API

## Arquitectura de la Solución:

### Frontend (Next.js Client Components):

- Interfaz de usuario del chat conversacional
- Manejo de estado local de conversación
- Streaming de respuestas del LLM en tiempo real
- Visualización de información de libros (portadas, detalles, listas)
- Indicadores de loading cuando se ejecutan tools

### Backend (Next.js API Routes):

- Comunicación segura con OpenRouter (LLM)
- Integración con Google Books API
- Implementación de las 6 herramientas (tools)
- Gestión de base de datos para listas de lectura y estadísticas
- Validación y sanitización de requests
- Rate limiting de API calls

### Base de Datos:

- Almacenamiento de listas de lectura por usuario
- Historial de libros leídos con ratings/reviews
- Estadísticas de lectura
- **Tecnología a elección del estudiante**: PostgreSQL, SQLite, MongoDB, Prisma, etc.

## Sistema de Tool Calling:

El LLM debe tener acceso a las siguientes 6 herramientas que puede ejecutar automáticamente según el contexto de la conversación:

### 1. searchBooks

**Descripción**: Buscar libros en Google Books API por título, autor, tema, o palabras clave.

**Cuándo se usa**:

- Usuario: "Recomiéndame libros sobre inteligencia artificial"
- Usuario: "Busca novelas de Gabriel García Márquez"
- Usuario: "Quiero leer sobre historia romana"

**Parámetros**:

- `query`: String de búsqueda
- `maxResults`: Número de resultados a retornar (opcional, default: 10)
- `orderBy`: Criterio de ordenamiento (relevance, newest, etc.)

**Respuesta**: Lista de libros con información básica (título, autor, thumbnail, ID)

### 2. getBookDetails

**Descripción**: Obtener información detallada de un libro específico usando su Google Books ID.

**Cuándo se usa**:

- Después de una búsqueda, cuando el usuario pregunta por un libro específico
- Para mostrar descripción completa, número de páginas, categorías, ratings

**Parámetros**:

- `bookId`: ID único de Google Books

**Respuesta**: Objeto completo con toda la información del libro (descripción, páginas, ISBN, publisher, ratings, categorías, imágenes, etc.)

### 3. addToReadingList

**Descripción**: Agregar un libro a la lista "Quiero Leer" del usuario.

**Cuándo se usa**:

- Usuario: "Agrega ese libro a mi lista"
- Usuario: "Quiero leer ese después"
- Usuario: "Guárdalo para más tarde"

**Parámetros**:

- `bookId`: ID único de Google Books
- `priority`: Nivel de prioridad (opcional: high, medium, low)
- `notes`: Notas personales del usuario (opcional)

**Respuesta**: Confirmación de que el libro fue agregado exitosamente

### 4. getReadingList

**Descripción**: Recuperar la lista de libros pendientes por leer del usuario.

**Cuándo se usa**:

- Usuario: "¿Qué libros tengo en mi lista?"
- Usuario: "Muéstrame mi reading list"
- Usuario: "¿Qué me falta leer?"

**Parámetros**:

- `filter`: Filtro opcional (por prioridad, fecha agregada, etc.)
- `limit`: Número máximo de resultados

**Respuesta**: Array de libros en la lista con metadata (fecha agregada, prioridad, notas)

### 5. markAsRead

**Descripción**: Marcar un libro como leído y opcionalmente agregar rating/review.

**Cuándo se usa**:

- Usuario: "Ya terminé de leer 1984"
- Usuario: "Marco como leído el libro de Asimov, me gustó mucho, 5 estrellas"
- Usuario: "Terminé ese libro, no me convenció"

**Parámetros**:

- `bookId`: ID único de Google Books
- `rating`: Calificación de 1-5 estrellas (opcional)
- `review`: Review personal del usuario (opcional)
- `dateFinished`: Fecha de finalización (opcional, default: hoy)

**Respuesta**: Confirmación + actualización de estadísticas

### 6. getReadingStats

**Descripción**: Generar estadísticas y analytics de los hábitos de lectura del usuario.

**Cuándo se usa**:

- Usuario: "¿Cuántos libros he leído este año?"
- Usuario: "Muéstrame mis estadísticas de lectura"
- Usuario: "¿Cuál es mi género favorito?"

**Parámetros**:

- `period`: Periodo de tiempo (all-time, year, month, week)
- `groupBy`: Agrupación de stats (genre, author, year)

**Respuesta**: Objeto con estadísticas:

- Total de libros leídos
- Páginas totales leídas
- Géneros más leídos
- Autores favoritos
- Rating promedio
- Libros por mes/año
- Racha de lectura actual

## Flujo de Ejemplo de Conversación:

```
Usuario: "Hola, quiero empezar a leer ciencia ficción"

AI: [Ejecuta searchBooks con query="ciencia ficción"]
    "¡Perfecto! Te recomiendo estos clásicos de ciencia ficción:

    1. 'Dune' de Frank Herbert - Una épica espacial sobre política y ecología
    2. 'Neuromante' de William Gibson - Pionero del cyberpunk
    3. 'Fundación' de Isaac Asimov - Serie sobre el futuro de la humanidad

    ¿Te gustaría saber más sobre alguno?"

Usuario: "Cuéntame más sobre Dune"

AI: [Ejecuta getBookDetails con bookId del libro Dune]
    "'Dune' es una novela de 688 páginas publicada en 1965. Está ambientada
    en un futuro lejano donde Paul Atreides debe sobrevivir en el planeta
    desértico Arrakis... [descripción completa]. Tiene un rating de 4.5⭐
    con más de 15,000 reviews. ¿Te gustaría agregarlo a tu lista?"

Usuario: "Sí, agrégalo a mi lista"

AI: [Ejecuta addToReadingList]
    "¡Listo! Agregué 'Dune' a tu lista de lectura. ¿Quieres que te recomiende
    algo similar o prefieres explorar otro género?"

Usuario: "¿Cuántos libros tengo en mi lista ahora?"

AI: [Ejecuta getReadingList]
    "Actualmente tienes 3 libros en tu lista:
    1. Dune - Frank Herbert (agregado hoy)
    2. El Hobbit - J.R.R. Tolkien (agregado hace 2 días)
    3. 1984 - George Orwell (agregado hace 1 semana)"

Usuario: "Ya terminé de leer 1984, me pareció increíble, 5 estrellas"

AI: [Ejecuta markAsRead con rating=5]
    "¡Felicitaciones por terminar '1984'! Marqué el libro como leído con
    5 estrellas. ¿Te gustaría que te recomiende libros similares de distopías?"

Usuario: "Muéstrame mis estadísticas"

AI: [Ejecuta getReadingStats]
    "📊 Tus estadísticas de lectura:

    📚 Libros leídos: 12
    📖 Páginas totales: 4,250
    ⭐ Rating promedio: 4.3
    🎯 Género favorito: Ciencia Ficción (5 libros)
    ✍️ Autor favorito: Isaac Asimov (3 libros)
    📅 Este mes: 2 libros
    🔥 Racha actual: 3 semanas consecutivas

    ¡Vas muy bien! ¿Quieres desafíos de lectura?"
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

### External API: **Google Books API**

- Búsqueda de libros
- Metadata completa de libros
- Portadas e imágenes
- **API Key gratuita**: https://developers.google.com/books/docs/v1/getting_started

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

# Google Books API Key
GOOGLE_BOOKS_API_KEY=your-google-books-api-key

# Database connection string (ejemplo con PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/bookadvisor

# Opcional: configuración de rate limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
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
```

### Consideraciones de Base de Datos:

- Implementar índices en `userId` y `bookId` para búsquedas rápidas
- Considerar almacenar caché de información de libros para reducir calls a Google Books API
- Implementar soft deletes si es necesario
- Validar que un usuario no pueda agregar el mismo libro múltiples veces

## Desafíos Técnicos a Resolver:

### 1. Tool Calling Implementation

- Definir correctamente el schema de cada tool para el LLM
- Manejar la ejecución asíncrona de tools
- Validar parámetros antes de ejecutar tools
- Manejar errores cuando las tools fallan

### 2. Google Books API Integration

- Entender la estructura de respuestas de la API
- Manejar casos donde no hay resultados
- Cachear resultados para optimizar requests
- Parsear correctamente ISBNs, categorías, y otros campos

### 3. Database Design

- Diseñar schema eficiente para listas de lectura
- Implementar queries optimizadas para estadísticas
- Manejar relaciones entre usuarios y libros
- Considerar escalabilidad

### 4. UX Conversacional

- El LLM debe entender contexto de conversaciones previas
- Manejar referencias ambiguas ("ese libro", "el primero")
- Confirmar acciones destructivas (eliminar de lista)
- Sugerir acciones proactivamente

### 5. Error Handling

- API de Google Books puede fallar o dar rate limits
- LLM puede intentar usar tools incorrectamente
- Usuario puede pedir libros que no existen
- Manejar gracefully todos estos casos

## Features Opcionales (Bonus):

### Búsqueda Avanzada:

- Filtros por género, año de publicación, idioma
- Búsqueda por ISBN directo
- "Find me books similar to X"

### Social Features:

- Compartir listas de lectura
- Recomendaciones basadas en amigos
- Clubs de lectura

### Analytics Avanzados:

- Gráficos de lectura por mes
- Predicción de cuándo terminarás tu lista
- Comparación con promedios globales

### Integrations:

- Export de listas a Goodreads
- Import desde otras plataformas
- Recordatorios de lectura

### AI Enhancements:

- Generación de preguntas de comprensión
- Resúmenes personalizados
- Sugerencias basadas en mood/estado de ánimo

## Recursos Adicionales:

- **Vercel AI SDK Docs**: https://sdk.vercel.ai/
- **Vercel AI SDK - Tool Calling**: https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling
- **OpenRouter Docs**: https://openrouter.ai/docs
- **Google Books API**: https://developers.google.com/books/docs/v1/using
- **Next.js Docs**: https://nextjs.org/docs
- **Tool Calling Best Practices**: https://platform.openai.com/docs/guides/function-calling

## Consejos de Implementación:

### 1. Empezar Simple

- Implementar primero 1-2 tools básicas (searchBooks, getBookDetails)
- Validar que el tool calling funciona correctamente
- Gradualmente agregar las demás tools

### 2. Testing de Tools

- Probar cada tool independientemente antes de integrar con LLM
- Crear casos de prueba con diferentes parámetros
- Validar el formato de respuesta de cada tool

### 3. Prompt Engineering

- Instruir claramente al LLM sobre cuándo usar cada tool
- Proporcionar ejemplos de uso correcto en el system prompt
- Manejar casos donde el LLM intenta hacer algo sin usar tools

### 4. UX Considerations

- Mostrar loading states cuando se ejecutan tools
- Visualizar qué tool se está ejecutando (opcional pero ayuda a debug)
- Permitir al usuario cancelar operaciones largas

### 5. Performance

- Implementar caching de búsquedas frecuentes
- Optimizar queries de base de datos
- Considerar pagination para listas largas

### 6. Security Checklist

- ✅ API keys solo en backend
- ✅ Validar todos los inputs del usuario
- ✅ Sanitizar responses del LLM antes de renderizar
- ✅ Implementar rate limiting por usuario
- ✅ SQL injection protection (usar ORMs)
- ✅ CORS configurado correctamente

## Criterios de Éxito:

- ✅ Usuario puede buscar libros conversacionalmente
- ✅ Las 6 tools funcionan correctamente
- ✅ Los datos persisten en base de datos
- ✅ Estadísticas se calculan correctamente
- ✅ Manejo robusto de errores
- ✅ UI/UX intuitiva y responsiva
- ✅ Código limpio y bien documentado
- ✅ Seguridad implementada correctamente

¡Buena suerte con la implementación! 📚✨
