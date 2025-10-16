# Ejercicio 13: Chatbot con Next.js y AI SDK

## Descripción del Proyecto:

Desarrollar una aplicación de chatbot utilizando Next.js y el AI SDK de Vercel, integrando OpenRouter como proveedor de LLM. Aprenderán a construir una interfaz de chat completa con manejo de estado, streaming de respuestas, y seguridad robusta para el manejo de API keys.

## ⚠️ Advertencia de Seguridad Importante

**NUNCA** exponer API keys en el frontend. Las requests a OpenRouter deben ser realizadas exclusivamente desde el backend. Las API keys son información sensible y deben ser tratadas como contraseñas.

### Reglas de Oro de Seguridad:

1. **API Keys solo en backend**: Nunca en código del cliente
2. **Variables de entorno**: Usar `.env.local` para keys sensibles, sin NEXT*PUBLIC* prefix
3. **Nunca commitear keys**: Agregar `.env.local` a `.gitignore`
4. **Validación de inputs**: Sanitizar todos los inputs del usuario

## Características Principales:

**Requisitos Obligatorios:**

1. **Interfaz de Chat**: UI moderna y responsiva para conversaciones
2. **Streaming de Respuestas**: Mostrar respuestas del LLM en tiempo real (pueden usar polling si quieren)
3. **Manejo de Estado**: Persistencia de conversación en sesión
4. **Validación de Inputs**: Sanitización y validación de mensajes
5. **Indicadores de Carga**: Estados de loading y typing indicators
6. **Manejo de Errores**: Gestión robusta de errores de API

## Arquitectura de la Solución:

### Frontend (Next.js Client Components):

- Interfaz de usuario del chat
- Manejo de estado local de conversación
- Streaming de respuestas en tiempo real
- Validación de inputs del usuario

### Backend (Next.js API Routes):

- Comunicación segura con OpenRouter
- Manejo de API keys en variables de entorno
- Validación y sanitización de requests

## Tecnologías Requeridas:

### Core Framework: **Next.js 15+**

- App Router para routing moderno
- Server Components para backend
- Client Components para interactividad
- API Routes para backend endpoints

### AI Integration: **Vercel AI SDK**

- Streaming de respuestas LLM
- Manejo de conversaciones
- Soporte para múltiples proveedores
- Hooks de React optimizados

### LLM Provider: **OpenRouter**

- Acceso a múltiples modelos LLM
- Usar solo modelos gratuitos
- API compatible con OpenAI
- Sin lock-in de proveedor

## Configuración del Proyecto:

### Variables de Entorno (`.env.local`):

```env
# OpenRouter API Key - NUNCA commitear este archivo
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here

# OpenRouter Base URL
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Modelo LLM a utilizar (opcional)
OPENROUTER_MODEL=anthropic/claude-3-haiku
```

### 3. Configuración de `.gitignore`:

```gitignore
# Variables de entorno
.env.local
.env.development.local
.env.test.local
.env.production.local

# Dependencias
node_modules/
.next/
```

## Recursos Adicionales:

- **Vercel AI SDK Docs**: https://sdk.vercel.ai/
- **OpenRouter Docs**: https://openrouter.ai/docs
- **Next.js Docs**: https://nextjs.org/docs
- **React Hooks**: https://react.dev/reference/react

## Consejos de Seguridad:

1. **Validar siempre inputs del usuario**
2. **Implementar rate limiting**
3. **Usar HTTPS en producción**
4. **Rotar API keys regularmente**
5. **Monitorear uso y costos**
6. **Implementar logging seguro**
7. **Sanitizar todas las respuestas del LLM**

### Variables de Entorno en Producción:

- Configurar en dashboard de Vercel
- Nunca exponer en código del cliente
- Usar secrets management del proveedor
