# Sistema de Exportación de Encuestas ESA

Sistema automatizado para exportar encuestas estudiantiles desde la base de datos Moodle.

## 📋 Descripción

Este sistema conecta directamente a la base de datos de Moodle y exporta encuestas de satisfacción estudiantil (ESA) en formato Excel o CSV, con procesamiento optimizado de datos.

## ✨ Características

- ✅ Conexión directa a base de datos MySQL (Moodle)
- ✅ Selección de rango de fechas
- ✅ Exportación a Excel (.xlsx) y CSV
- ✅ Procesamiento vectorizado ultra-rápido con Pandas y NumPy
- ✅ Conversión automática de respuestas numéricas a texto
- ✅ Interfaz gráfica con tkinter (versión consola)
- ✅ Interfaz web moderna (versión web en Sistema Web/)

## 🚀 Uso - Versión Consola

### Instalación

```bash
pip install pandas numpy mysql-connector-python openpyxl xlsxwriter tkcalendar
```

### Ejecución

```bash
python ESA-Auto.py
```

### Flujo de trabajo

1. Se abre ventana de selección de fechas
2. Selecciona fecha de inicio y fin
3. El sistema:
   - Conecta a la base de datos
   - Ejecuta la consulta
   - Procesa los datos
   - Muestra progreso
   - Genera archivos Excel y CSV
4. Selecciona carpeta donde guardar
5. ✓ Archivos descargados

## 📊 Base de Datos

**Servidor:** 119.8.8.223  
**Base de datos:** mx-emprove-cesun01  
**Usuario:** cesun_ro (solo lectura)

## 📝 Formato de Exportación

### Columnas exportadas

- student_id
- student_name
- email
- course_code
- course_name
- teacher_name
- feedback_name
- question
- response (valor numérico original)
- **respuesta_texto** (texto descriptivo)
- estado_respuesta
- fecha_respuesta

### Conversión de respuestas

**Escala Likert (1-5):**
- 1 → "Completamente de acuerdo"
- 2 → "De acuerdo"
- 3 → "Neutral"
- 4 → "En desacuerdo"
- 5 → "Completamente en desacuerdo"

**Pregunta especial (¿Te gustaría tomar clases de nuevo?):**
- 1 → "Sí"
- 2 → "No"

**Sin respuesta:**
- vacío → "NO RESPONDIÓ"

## ⚡ Optimizaciones

El sistema utiliza:

- **Pandas** para manipulación de datos
- **NumPy** para operaciones vectorizadas
- **XlsxWriter** para generación rápida de Excel
- Procesamiento sin loops (100% vectorizado)
- Limpieza automática de caracteres problemáticos

## 🔐 Seguridad

- Usuario de base de datos con permisos de **solo lectura**
- No modifica datos en Moodle
- Timeout de conexión de 30 segundos

## 📦 Archivos Generados

Los archivos se nombran automáticamente:

```
encuestas_estudiantes_YYYYMMDD_HHMMSS.xlsx
encuestas_estudiantes_YYYYMMDD_HHMMSS.csv
```

## 🛠️ Solución de Problemas

### Error de conexión

**Problema:** "Can't connect to MySQL server"  
**Solución:** Verifica conectividad al servidor 119.8.8.223

### Error "No module named 'pandas'"

**Solución:**
```bash
pip install pandas numpy mysql-connector-python openpyxl xlsxwriter
```

### Archivos Excel corruptos

**Solución:** El sistema genera tanto Excel como CSV. Si Excel falla, usa el CSV.

## 🌐 Versión Web

Este módulo también está disponible en la versión web del sistema.

**Ubicación:** `Sistema Web/`

**Ventajas de la versión web:**
- Interfaz moderna
- Vista previa de datos
- Descarga directa desde el navegador
- No requiere Python instalado

## 📞 Soporte

Para soporte técnico, contacta al departamento de TI de CESUN Universidad.

---

**© 2026 CESUN Universidad - Sistema de Exportación ESA**
