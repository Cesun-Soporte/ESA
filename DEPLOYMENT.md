# 🚀 Guía de Despliegue - ESA Encuestas

## Paso 1: Instalar Dependencias

```bash
npm install
```

## Paso 2: Probar Localmente

```bash
npm run dev
```

Abre http://localhost:3000 para verificar que funciona correctamente.

## Paso 3: Inicializar Git

```bash
git init
git add .
git commit -m "Initial commit: ESA Web Application"
```

## Paso 4: Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. Crea un nuevo repositorio (ejemplo: `esa-encuestas-web`)
3. NO inicialices con README, .gitignore o licencia

## Paso 5: Subir a GitHub

```bash
git branch -M main
git remote add origin https://github.com/TU-USUARIO/esa-encuestas-web.git
git push -u origin main
```

## Paso 6: Desplegar en Vercel

### Opción A: Desde la interfaz web de Vercel

1. Ve a https://vercel.com
2. Regístrate o inicia sesión
3. Click en "Add New Project"
4. Click en "Import Git Repository"
5. Selecciona tu repositorio de GitHub
6. Vercel detectará automáticamente Next.js
7. Configura las variables de entorno:
   - Click en "Environment Variables"
   - Agrega:
     ```
     DB_HOST = 119.8.8.223
     DB_USER = cesun_ro
     DB_PASSWORD = mrK2ObaGAP7VIAuLtdeP
     DB_NAME = mx-emprove-cesun01
     ```
8. Click en "Deploy"
9. Espera 2-3 minutos
10. ¡Tu app estará en línea en `https://tu-proyecto.vercel.app`!

### Opción B: Desde CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Desplegar
vercel

# Configurar variables de entorno cuando se solicite:
# DB_HOST: 119.8.8.223
# DB_USER: cesun_ro
# DB_PASSWORD: mrK2ObaGAP7VIAuLtdeP
# DB_NAME: mx-emprove-cesun01

# Para producción
vercel --prod
```

## Paso 7: Verificar Despliegue

1. Abre la URL proporcionada por Vercel
2. Selecciona fechas de inicio y fin
3. Click en "Exportar a Excel"
4. Verifica que descarga correctamente

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Descripción del cambio"
git push
```

Vercel detectará automáticamente los cambios y re-desplegará.

## ⚠️ Notas Importantes

- Las variables de entorno DEBEN configurarse en Vercel
- El usuario de base de datos es de **solo lectura**
- Vercel tiene límite de 100GB de ancho de banda en plan gratuito
- Los despliegues son automáticos en cada push a main

## 🆘 Problemas Comunes

### Error: "Module not found"
```bash
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Error de conexión a base de datos
- Verifica que las variables de entorno estén correctamente configuradas en Vercel
- Verifica conectividad desde Vercel a 119.8.8.223

### Build falla en Vercel
- Revisa los logs en el dashboard de Vercel
- Verifica que `npm run build` funcione localmente
