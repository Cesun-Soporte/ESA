# 🚀 Comandos para Subir a GitHub y Desplegar en Vercel

## ✅ Git ya está configurado

Repositorio: https://github.com/Cesun-Soporte/ESA.git

## 📤 Subir a GitHub

### Opción 1: Si ya tienes acceso al repositorio
```bash
git branch -M main
git push -u origin main
```

### Opción 2: Si te pide autenticación
```bash
git branch -M main
git push -u origin main
```
Cuando te pida credenciales, usa:
- **Username:** Tu usuario de GitHub
- **Password:** Usa un Personal Access Token (no tu password normal)

**Para crear un Personal Access Token:**
1. Ve a: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Selecciona: `repo` (full control)
4. Copia el token y úsalo como password

## 🌐 Desplegar en Vercel

### Método 1: Desde la Web (MÁS FÁCIL)

1. **Ve a Vercel:**
   https://vercel.com

2. **Conecta con GitHub:**
   - Click "Add New Project"
   - Click "Import Git Repository"
   - Busca: `Cesun-Soporte/ESA`
   - Click "Import"

3. **Configuración Automática:**
   Vercel detectará automáticamente que es Next.js

4. **Variables de Entorno (IMPORTANTE):**
   Click "Environment Variables" y agrega:
   
   ```
   DB_HOST = 119.8.8.223
   DB_USER = cesun_ro
   DB_PASSWORD = mrK2ObaGAP7VIAuLtdeP
   DB_NAME = mx-emprove-cesun01
   ```

5. **Deploy:**
   - Click "Deploy"
   - Espera 2-3 minutos
   - ✅ Tu app estará en: `https://esa-xxx.vercel.app`

### Método 2: Desde CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Cuando pregunte por variables de entorno:
# DB_HOST: 119.8.8.223
# DB_USER: cesun_ro
# DB_PASSWORD: mrK2ObaGAP7VIAuLtdeP
# DB_NAME: mx-emprove-cesun01

# Para producción
vercel --prod
```

## 🔄 Actualizaciones Futuras

Una vez desplegado, cada push a GitHub desplegará automáticamente:

```bash
# Hacer cambios
git add .
git commit -m "Descripción del cambio"
git push
```

Vercel detectará el push y re-desplegará automáticamente.

## ✅ Verificar Despliegue

1. Abre la URL de Vercel
2. Selecciona fechas
3. Click "Exportar a Excel"
4. Verifica descarga

## 🆘 Si hay problemas

### Error al hacer push
```bash
git pull origin main --rebase
git push -u origin main
```

### Error de build en Vercel
- Ve al dashboard de Vercel
- Click en tu proyecto
- Ve a "Deployments"
- Click en el deployment fallido
- Revisa los logs

### Variables de entorno no funcionan
- Ve a tu proyecto en Vercel
- Settings > Environment Variables
- Verifica que estén todas correctas
- Re-deploy desde el dashboard
