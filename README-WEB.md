# 🌐 ESA Encuestas - Interfaz Web

Sistema web moderno para exportación de encuestas estudiantiles ESA (Encuestas de Satisfacción Estudiantil) de CESUN Universidad.

## 🚀 Características

- ✅ Interfaz web moderna con React y Next.js 14
- ✅ Diseño responsive con TailwindCSS
- ✅ Componentes UI con shadcn/ui
- ✅ Selección de fechas con calendario interactivo
- ✅ Exportación directa a Excel (.xlsx)
- ✅ Procesamiento optimizado de datos
- ✅ Conexión directa a base de datos MySQL
- ✅ Barra de progreso en tiempo real
- ✅ Manejo de errores robusto

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Acceso a la base de datos MySQL de Moodle

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd "ESA Encuestas"
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
DB_HOST=119.8.8.223
DB_USER=cesun_ro
DB_PASSWORD=mrK2ObaGAP7VIAuLtdeP
DB_NAME=mx-emprove-cesun01
```

### 4. Ejecutar en modo desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📦 Construir para Producción

```bash
npm run build
npm start
```

## 🚀 Despliegue en Vercel

### Opción 1: Despliegue automático desde GitHub

1. **Sube tu código a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - ESA Web App"
   git branch -M main
   git remote add origin <tu-repositorio-github>
   git push -u origin main
   ```

2. **Conecta con Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Crea una cuenta o inicia sesión
   - Click en "Add New Project"
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente que es Next.js

3. **Configura las variables de entorno en Vercel:**
   - En la configuración del proyecto, ve a "Environment Variables"
   - Agrega las siguientes variables:
     - `DB_HOST`: `119.8.8.223`
     - `DB_USER`: `cesun_ro`
     - `DB_PASSWORD`: `mrK2ObaGAP7VIAuLtdeP`
     - `DB_NAME`: `mx-emprove-cesun01`

4. **Despliega:**
   - Click en "Deploy"
   - Espera a que termine el despliegue
   - Tu aplicación estará disponible en `https://tu-proyecto.vercel.app`

### Opción 2: Despliegue desde CLI

```bash
npm install -g vercel
vercel login
vercel
```

Sigue las instrucciones y configura las variables de entorno cuando se te solicite.

## 📱 Uso

1. **Selecciona el rango de fechas:**
   - Click en "Fecha de Inicio" para seleccionar la fecha inicial
   - Click en "Fecha de Fin" para seleccionar la fecha final

2. **Exporta los datos:**
   - Click en "Exportar a Excel"
   - Espera a que se procesen los datos
   - El archivo se descargará automáticamente

3. **Archivo generado:**
   - Formato: `encuestas_estudiantes_YYYYMMDD_HHMMSS.xlsx`
   - Incluye todas las columnas con respuestas convertidas a texto

## 🏗️ Estructura del Proyecto

```
ESA Encuestas/
├── app/
│   ├── api/
│   │   └── export/
│   │       └── route.ts          # API endpoint para exportar
│   ├── globals.css               # Estilos globales
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Página principal
├── components/
│   └── ui/                       # Componentes UI (shadcn)
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── label.tsx
│       └── popover.tsx
├── lib/
│   ├── db.ts                     # Conexión a base de datos
│   ├── processData.ts            # Procesamiento de datos
│   └── utils.ts                  # Utilidades
├── package.json                  # Dependencias
├── tsconfig.json                 # Configuración TypeScript
├── tailwind.config.ts            # Configuración TailwindCSS
├── next.config.js                # Configuración Next.js
└── vercel.json                   # Configuración Vercel
```

## 🎨 Tecnologías Utilizadas

- **Frontend:**
  - Next.js 14 (App Router)
  - React 18
  - TypeScript
  - TailwindCSS
  - shadcn/ui
  - Lucide Icons
  - React Day Picker

- **Backend:**
  - Next.js API Routes
  - MySQL2
  - ExcelJS
  - date-fns

## 🔒 Seguridad

- Usuario de base de datos con permisos de **solo lectura**
- No modifica datos en Moodle
- Variables de entorno para credenciales
- Validación de fechas en frontend y backend

## 📊 Datos Exportados

### Columnas incluidas:

- `student_id`: ID del estudiante
- `student_name`: Nombre del estudiante
- `email`: Correo electrónico
- `course_code`: Código del curso
- `course_name`: Nombre del curso
- `teacher_name`: Nombre del docente
- `feedback_name`: Nombre de la encuesta
- `question`: Pregunta
- `response`: Respuesta numérica original
- `respuesta_texto`: **Respuesta convertida a texto**
- `estado_respuesta`: RESPONDIÓ / NO RESPONDIÓ
- `fecha_respuesta`: Fecha de respuesta

### Conversión de respuestas:

**Escala Likert (1-5):**
- 1 → "Completamente de acuerdo"
- 2 → "De acuerdo"
- 3 → "Neutral"
- 4 → "En desacuerdo"
- 5 → "Completamente en desacuerdo"

**Pregunta especial (¿Te gustaría tomar clases de nuevo?):**
- 1 → "Sí"
- 2 → "No"

## 🐛 Solución de Problemas

### Error de conexión a base de datos

**Problema:** No se puede conectar a la base de datos

**Solución:**
1. Verifica las variables de entorno
2. Verifica conectividad al servidor `119.8.8.223`
3. Revisa los logs en Vercel (si está desplegado)

### Error al instalar dependencias

**Problema:** `npm install` falla

**Solución:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Errores de TypeScript

**Solución:**
```bash
npm run build
```

## 🤝 Contribuir

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -am 'Agregar nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## 📞 Soporte

Para soporte técnico, contacta al departamento de TI de CESUN Universidad.

## 📝 Licencia

© 2026 CESUN Universidad - Sistema de Exportación ESA

---

**Desarrollado con ❤️ para CESUN Universidad**
