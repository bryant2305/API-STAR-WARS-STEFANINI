# API STAR WARS - STEFANINI

Este proyecto es una API RESTful serverless desarrollada con Node.js 20, TypeScript y Serverless Framework, como solución al Reto Técnico Backend de Stefanini. Integra datos de Star Wars y de un servicio meteorológico, fusionando y normalizando la información, y cumple con todos los requerimientos técnicos solicitados.

## Tabla de Contenidos
- [Características](#características)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Variables de Entorno](#variables-de-entorno)
- [Ejecución Local](#ejecución-local)
- [Scripts Disponibles](#scripts-disponibles)
- [Endpoints Principales](#endpoints-principales)
- [Pruebas](#pruebas)
- [Despliegue en AWS](#despliegue-en-aws)
- [Licencia](#licencia)

## Características
- Arquitectura serverless lista para AWS Lambda y API Gateway.
- CRUD de entidades personalizadas y usuarios.
- Integración y fusión de datos de la API de Star Wars (SWAPI) y una API meteorológica.
- Normalización y procesamiento de datos (tipos, unidades, formatos).
- Endpoints requeridos por el reto:
  - `GET /fusionados`: Fusiona y almacena datos de ambas APIs externas.
  - `POST /almacenar`: Almacena información personalizada en DynamoDB.
  - `GET /historial`: Devuelve el historial de respuestas fusionadas, paginado y ordenado.
- Sistema de caché (DynamoDB) para evitar llamadas repetidas a las APIs externas en un intervalo de 30 minutos.
- Autenticación JWT para proteger endpoints sensibles.
- Pruebas unitarias y de integración con Jest.
- Optimización de costos en AWS Lambda (timeout, memoria).
- Listo para despliegue en AWS con Serverless Framework.
- Bonus: Logging avanzado, rate-limiting, y monitoreo (CloudWatch, X-Ray).

## Tecnologías
- Node.js 20
- NestJS
- Serverless Framework
- TypeScript
- DynamoDB Local
- Jest
- Yarn

## Estructura del Proyecto
```
api-serverless-data-fusion/
├── src/
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── main.ts
│   ├── lambda.ts
│   ├── auth/
│   ├── database/
│   ├── enums/
│   └── modules/
│       ├── custom/
│       ├── dynamo/
│       ├── fusion/
│       ├── shared/
│       └── users/
├── test/
├── .env.example
├── package.json
├── serverless.yml
├── tsconfig.json
└── README.md
```

## Instalación
1. Clona el repositorio:
   ```bash
   git clone <REPO_URL>
   cd api-serverless-data-fusion
   ```
2. Instala las dependencias:
   ```bash
   yarn install
   ```

## Variables de Entorno
Copia el archivo `.env.example` a `.env` y completa los valores necesarios:
```bash
cp .env.example .env
```
Variables principales:
- `JWT_SECRET_KEY`: Clave secreta para JWT
- `AWS_REGION`: Región AWS
- `IS_OFFLINE`: Ejecutar en modo local
- `ADMIN_EMAIL` y `ADMIN_PASSWORD`: Credenciales admin
- `USERS_TABLE`: Nombre de la tabla DynamoDB
- `SWAPI_BASE_URL`: URL de la API de Star Wars
- `WEATHER_API_URL`: URL del servicio de clima
- `PORT`: Puerto local

## Ejecución Local
 Ejecuta el proyecto en modo offline:
   ```bash
   yarn start:offline
   ```

## Scripts Disponibles
- `start`: Inicia la API en modo desarrollo
- `start:offline`: Inicia la API en modo serverless offline
- `test`: Ejecuta pruebas
- `lint`: Linting del código

## Endpoints Principales

### 1. Autenticación

#### Login (obtener JWT)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

### 2. Fusionar datos de Star Wars y clima

#### GET /fusionados
```bash
curl -X GET http://localhost:3000/api/fusion/fusionados/1 \
  -H "Authorization: Bearer <TOKEN>"
```

### 3. Almacenar información personalizada

#### POST /almacenar
```bash
curl -X POST http://localhost:3000/api/almacenar \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"tipo": "vehiculo", "datos": {"nombre": "X-Wing", "modelo": "T-65B"}}'
```

### 4. Consultar historial de respuestas fusionadas

#### GET /historial
```bash
curl -X GET "http://localhost:3000/api/fusion/historial?&limit=10" \
  -H "Authorization: Bearer <TOKEN>"
```


> Reemplaza `<TOKEN>` por el JWT obtenido en el login.


## Pruebas
Ejecuta las pruebas
```bash
yarn test
```

## Despliegue en AWS

Asegúrate de tener configuradas tus credenciales de AWS
```bash
aws configure
```

y el Serverless Framework instalado globalmente:
```bash
yarn global add serverless
```

Despliega la API en AWS Lambda usando Serverless Framework:
```bash
yarn deploy
```

Esto empaquetará y subirá tu aplicación a AWS Lambda y creará los recursos necesarios (API Gateway, DynamoDB, etc.) según lo definido en `serverless.yml`.

Para eliminar los recursos creados en AWS:
```bash
sls remove
```

## Licencia
Este proyecto es solo para fines de evaluación técnica