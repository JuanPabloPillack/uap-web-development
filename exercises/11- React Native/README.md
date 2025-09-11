# Ejercicio 11: Aplicación React Native con APIs Nativas

## Descripción del Proyecto:

Desarrollar una aplicación móvil utilizando React Native que haga uso de al menos una API nativa del dispositivo. Los estudiantes pueden elegir crear una aplicación con una o múltiples pantallas según su preferencia y nivel de ambición.

## Características Principales:

**Requisito Obligatorio:** La aplicación debe utilizar al menos una de las siguientes APIs nativas:

- **Geolocalización**: Obtener ubicación actual del usuario
- **Cámara**: Capturar fotos o videos
- **Giroscopio/Acelerómetro**: Detectar movimiento y orientación del dispositivo
- **Notificaciones**: Notificaciones push o locales
- **Contactos**: Acceder a la lista de contactos
- **Micrófono**: Grabar audio
- **Bluetooth**: Conectar con dispositivos externos

## Tecnologías Recomendadas:

### Principal: **React Native con Expo**

- **Ventajas de Expo:**
  - Configuración más simple y rápida
  - Herramientas de desarrollo integradas
  - Fácil testing en dispositivos físicos
  - Amplia gama de APIs nativas pre-configuradas

### Alternativa: **React Native CLI**

- Para estudiantes que quieran más control sobre la configuración nativa
- Requiere configuración de Android Studio/Xcode

## APIs y Librerías Sugeridas:

### Con Expo:

- **Ubicación**: `expo-location`
- **Cámara**: `expo-camera`
- **Sensores**: `expo-sensors` (giroscopio, acelerómetro)
- **Almacenamiento**: `@react-native-async-storage/async-storage`
- **Notificaciones**: `expo-notifications`

### Ejemplos de Proyectos:

1. **App de Fotos con Ubicación**

   - Capturar fotos con la cámara
   - Guardar ubicación GPS de cada foto
   - Mostrar galería con mapa de ubicaciones

2. **Detector de Movimiento**

   - Usar giroscopio para detectar movimientos
   - Crear juego simple (ej: equilibrar una pelota)
   - Mostrar datos de sensores en tiempo real

3. **Diario de Ubicaciones**

   - Tracking de ubicaciones visitadas
   - Guardar notas para cada lugar
   - Usar almacenamiento local para persistir datos

4. **App de Recordatorios Contextuales**
   - Notificaciones basadas en ubicación
   - Recordatorios cuando el usuario llega a ciertos lugares

### Testing:

- **Dispositivo Físico**: Usar Expo Go app para testing rápido
- **Emulador**: Android Studio o iOS Simulator para testing más completo
- **Hot Reload**: Aprovechar las capacidades de desarrollo rápido

## Recursos Adicionales:

- **Documentación Oficial**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **Expo APIs**: https://docs.expo.dev/versions/latest/
- **Tutoriales**: https://www.youtube.com/c/expo

## Consejos:

- Comenzar con Expo para simplificar el setup inicial
- Probar en dispositivo físico para mejor experiencia con APIs nativas
- Revisar permisos necesarios para cada API (ubicación, cámara, etc.)
- Manejar estados de carga y errores apropiadamente
- Considerar la experiencia de usuario en dispositivos móviles
