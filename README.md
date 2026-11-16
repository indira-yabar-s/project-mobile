# Gamarrito – Aplicación móvil

Aplicación móvil (React Native + Expo) de Gamarrito, el ERP/SaaS para MYPES textiles de Gamarra. Permite vender, comprar, administrar el catálogo y el stock, escanear productos con la cámara, ver el clima de tu zona y consultar el negocio en lenguaje natural con un asistente de IA.

**Curso:** CS 2031 Desarrollo Basado en Plataforma · Proyecto 2

## Integrantes y participación

| Integrante | Aportes | Participación (%) |
|---|---|---|
| Javier Alonso Bravo Chávez | _por completar_ | _por completar_ |
| Gabriel Murillo Machicao | _por completar_ | _por completar_ |
| Indira Shian Yabar Ramos | _por completar_ | _por completar_ |
| Rafael Antonio Vargas Portocarrero | _por completar_ | _por completar_ |

## Enlaces

| Componente | URL |
|---|---|
| Aplicación móvil (build de prueba, APK) | <enlace de la build en expo.dev> |
| Actualizaciones OTA (canal `preview`) | <enlace o QR de la actualización en expo.dev> |
| Backend (API) | <https://gamarrito-backend.up.railway.app/api/v1> |
| Web | <URL del despliegue web> |
| Repositorio móvil | <https://github.com/rafavp03/project-mobile> |
| Repositorio backend | <https://github.com/rafavp03/dbp-project-backend> |
| Repositorio web | <URL del repositorio web> |

## Funcionalidades

- **Autenticación:** inicio de sesión, registro de empresa y administrador, renovación automática del token y cierre de sesión. El refresh token se guarda en `expo-secure-store`.
- **Dashboard:** saludo, checklist de primeros pasos, tarjeta de clima, alertas de stock bajo y, para `ADMIN`, indicadores de ventas con variación frente al periodo anterior, gráfico de 7 días, ventas agrupadas y top de productos.
- **Productos:** listado con búsqueda, orden y filtro por estado; alta, edición, cambio rápido de precio y desactivación (`ADMIN`); variantes (talla y color) con ingreso y corrección de stock.
- **Ventas y compras:** historial con rango de fechas y orden, detalle y registro en tres pasos con múltiples líneas. En ventas se valida el stock; en compras se registra el costo.
- **Clientes, proveedores, categorías:** listados con búsqueda y orden, altas y ediciones; eliminación o desactivación solo para `ADMIN` donde corresponde.
- **Equipo (`ADMIN`):** alta de empleados y retiro de acceso.
- **Asistente IA:** chat con historial, sugerencias, límite de 500 caracteres y contador de consultas diarias.
- **Roles:** `ADMIN` accede a reportes, equipo y operaciones sensibles; `EMPLEADO` tiene acceso operativo.

### Sensores y API externa

| Recurso | Uso | Permiso y respaldo |
|---|---|---|
| Cámara (`expo-camera`) | Escanear el código de un producto para buscarlo en el catálogo o agregarlo a una venta | Se pide al abrir el escáner. Sin permiso o sin cámara, se puede escribir el código a mano |
| Ubicación (`expo-location`) | Obtener la zona del negocio para mostrar el clima en el Dashboard | Se pide desde la tarjeta de clima. Sin permiso, se muestra el clima de Gamarra (Lima) y se ofrece activar la ubicación o abrir Ajustes |
| API externa [Open-Meteo](https://open-meteo.com/) | Clima actual y pronóstico del día, con un consejo para el negocio | No requiere clave. Las coordenadas se redondean a 2 decimales y no se envía el token de la app |

## Tecnologías

Expo SDK 58 · React Native 0.88 · React 19 · TypeScript · React Navigation 7 (Drawer, Bottom Tabs, Native Stack) · React Native Paper 5 (Material Design 3) · Axios · React Hook Form · react-native-svg · expo-secure-store · expo-camera · expo-location · expo-network · expo-updates

## Requisitos

- Node.js 20 o superior y npm
- Backend en ejecución (local o desplegado)
- App Expo Go, un emulador de Android/iOS o una build de desarrollo, para probar en local

## Instalación y ejecución local

```bash
git clone https://github.com/rafavp03/project-mobile.git
cd project-mobile
npm install
cp .env.example .env
npx expo start
```

Escanea el código QR con Expo Go o presiona `a` para abrir el emulador de Android.

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | URL base de la API del backend, con `/api/v1` | `http://10.0.2.2:8080/api/v1` (emulador Android) |

El archivo `.env` no se versiona; usa `.env.example` como plantilla. Con un dispositivo físico usa la IP de tu red local o la URL del backend desplegado.

## Scripts

| Comando | Descripción |
|---|---|
| `npm start` | Servidor de desarrollo de Expo |
| `npm run android` / `npm run ios` | Abre la app en el emulador |
| `npm run typecheck` | Revisión de tipos con TypeScript |
| `npm run lint` | Análisis estático con ESLint |

## Estructura del proyecto

```text
src/
├── components/   Componentes reutilizables (listas, formularios, diálogos, gráficos)
├── screens/      Una pantalla por vista
├── navigation/   Drawer, tabs y stacks de React Navigation
├── hooks/        Hooks personalizados (useFetch, usePagination, useAuth, useWeather, ...)
├── services/     Capa de acceso a la API (un servicio por recurso) y cliente de Axios
├── contexts/     Estado global: sesión, tema y mensajes
├── theme/        Tema de React Native Paper
├── types/        Tipos de TypeScript de la API y de la navegación
├── config/       Lectura de variables de entorno
└── utils/        Utilidades (errores, formato, fechas, tokens)
```

## Decisiones de diseño

- **Navegación:** `Drawer > Bottom Tabs > Native Stack`. Dashboard, Ventas, Productos, Clientes y Asistente van en tabs; Compras, Categorías, Proveedores, Equipo (solo `ADMIN`) y Perfil, en el menú lateral.
- **Cliente HTTP centralizado:** una instancia de Axios con `baseURL`, interceptor de autorización, reintentos en errores de red o 5xx (solo GET) y renovación del token ante un 401 con una única petición compartida. Si la renovación falla se cierra la sesión.
- **Sesión:** el access token vive en memoria y el refresh token en `expo-secure-store`.
- **Paginación:** scroll infinito de 20 en 20 con `usePagination`; los servicios convierten la página a base 0 que usa el backend.
- **Errores y estados:** mensajes amigables por tipo de error y código HTTP, estados de carga con skeletons, estados vacíos con acción, banner y reintento automático sin conexión.
- **Cancelación de peticiones:** `useFetch` y `usePagination` usan `AbortController`.
- **Servicio externo aislado:** el clima usa su propia instancia de Axios para no enviar credenciales de Gamarrito a un tercero.

## Publicación con EAS

La configuración está en `eas.json` (perfiles `preview` y `production`) y `app.json` (`runtimeVersion` por versión de la app). Los comandos requieren una cuenta de Expo.

```bash
npm install --global eas-cli
eas login
eas init
eas update:configure
```

Variable del backend en cada entorno de EAS (las variables `EXPO_PUBLIC_` se incluyen al compilar, y `.env` no se sube):

```bash
eas env:set --name EXPO_PUBLIC_API_URL --value https://gamarrito-backend.up.railway.app/api/v1 --environment preview --visibility plaintext
eas env:set --name EXPO_PUBLIC_API_URL --value https://gamarrito-backend.up.railway.app/api/v1 --environment production --visibility plaintext
```

Build instalable para pruebas (APK de Android con enlace de descarga):

```bash
eas build --platform android --profile preview
```

Actualización por aire (sin volver a compilar) para los dispositivos con la build `preview`:

```bash
eas update --channel preview --environment preview --message "Descripción del cambio"
```

Una actualización solo llega a builds con la misma `runtimeVersion`. Al cambiar dependencias nativas o la versión de la app, hay que generar una build nueva.

## Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| ADMIN | <prueba@test.com> | <Prueba123> |
| EMPLEADO | <empleado@test.com> | <Empleado123> |

## Notas

- El asistente IA tiene un límite de 30 consultas diarias por usuario y depende de la cuota del proveedor de IA configurado en el backend.
- El asistente responde solo con texto: el backend aún no envía datos para gráficos o tablas.
- Para probar la cámara y la ubicación se recomienda un dispositivo físico; los emuladores necesitan configurarlas aparte.
