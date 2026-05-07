# 📝 Instrucciones Rápidas - ESA Encuestas Web

## 🎯 Para Empezar AHORA

### 1. Instalar dependencias (PRIMERO)
```bash
cd "c:\Users\asis.ti\Documents\Menu de programas\ESA Encuestas"
npm install
```

### 2. Probar localmente
```bash
npm run dev
```
Abre: http://localhost:3000

### 3. Crear repositorio Git
```bash
git init
git add .
git commit -m "Initial commit: ESA Web App"
```

### 4. Subir a GitHub
1. Crea repo en https://github.com/new
2. Ejecuta:
```bash
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git branch -M main
git push -u origin main
```

### 5. Desplegar en Vercel
1. Ve a https://vercel.com
2. Import tu repositorio de GitHub
3. Agrega variables de entorno:
   - `DB_HOST`: 119.8.8.223
   - `DB_USER`: cesun_ro
   - `DB_PASSWORD`: mrK2ObaGAP7VIAuLtdeP
   - `DB_NAME`: mx-emprove-cesun01
4. Click "Deploy"
5. ✅ ¡Listo!

## 📚 Archivos Importantes

- `README-WEB.md` - Documentación completa
- `DEPLOYMENT.md` - Guía detallada de despliegue
- `.env.example` - Ejemplo de variables de entorno
- `package.json` - Dependencias del proyecto

## 🔧 Comandos Útiles

```bash
npm run dev      # Desarrollo local
npm run build    # Construir para producción
npm start        # Iniciar en producción
npm run lint     # Verificar código
```

## 🌐 Estructura

```
app/
  ├── page.tsx           # Interfaz principal
  ├── api/export/        # API para exportar
  └── globals.css        # Estilos
components/ui/           # Componentes UI
lib/                     # Lógica de negocio
  ├── db.ts             # Base de datos
  └── processData.ts    # Procesamiento
```

## ✅ Checklist

- [ ] Instalé dependencias con `npm install`
- [ ] Probé localmente con `npm run dev`
- [ ] Inicialicé Git
- [ ] Subí a GitHub
- [ ] Desplegué en Vercel
- [ ] Configuré variables de entorno en Vercel
- [ ] Probé la aplicación en producción
