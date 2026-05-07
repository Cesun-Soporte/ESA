import mysql.connector
import csv
from datetime import datetime
import pandas as pd
import numpy as np
import tkinter as tk
from tkinter import ttk
from tkcalendar import DateEntry
from tkinter import messagebox, filedialog
import threading
import time
import os
import shutil
from io import StringIO

# Configuración de la base de datos
config = {
    'host': '119.8.8.223',
    'user': 'cesun_ro',
    'password': 'mrK2ObaGAP7VIAuLtdeP',
    'database': 'mx-emprove-cesun01',
    'connection_timeout': 30,
    'autocommit': True
}

query_template = """
SELECT 
    u.id AS 'student_id',
    CONCAT(u.firstname, ' ', u.lastname) AS 'student_name',
    u.email AS 'email',
    c.shortname AS 'course_code',
    c.fullname AS 'course_name',
    COALESCE(CONCAT(teacher.firstname, ' ', teacher.lastname), 'No asignado') AS 'teacher_name',
    f.name AS 'feedback_name',
    fi.name AS 'question',
    COALESCE(fv.value, '') AS 'response',
    CASE
        WHEN fc.id IS NOT NULL THEN 'RESPONDIÓ'
        ELSE 'NO RESPONDIÓ'
    END AS 'estado_respuesta',
    DATE_FORMAT(FROM_UNIXTIME(fc.timemodified), '%Y-%m-%d %H:%i') AS 'fecha_respuesta'
FROM mdl_user u
JOIN mdl_role_assignments ra ON ra.userid = u.id
JOIN mdl_role r ON r.id = ra.roleid
JOIN mdl_context ctx ON ctx.id = ra.contextid AND ctx.contextlevel = 50
JOIN mdl_course c ON c.id = ctx.instanceid
JOIN mdl_user_enrolments ue ON ue.userid = u.id
JOIN mdl_enrol e ON e.id = ue.enrolid AND e.courseid = c.id
JOIN mdl_feedback f ON f.course = c.id
JOIN mdl_feedback_item fi ON fi.feedback = f.id
LEFT JOIN mdl_feedback_completed fc ON fc.feedback = f.id AND fc.userid = u.id
LEFT JOIN mdl_feedback_value fv ON fv.completed = fc.id AND fv.item = fi.id
LEFT JOIN mdl_user teacher ON teacher.id = (
    SELECT ra2.userid
    FROM mdl_role_assignments ra2
    JOIN mdl_role r2 ON r2.id = ra2.roleid
    JOIN mdl_context ctx2 ON ctx2.id = ra2.contextid AND ctx2.contextlevel = 50
    WHERE ctx2.instanceid = c.id
    AND r2.shortname IN ('teacher', 'editingteacher', 'coursecreator')
    LIMIT 1
)
WHERE u.deleted = 0
    AND u.suspended = 0
    AND u.id > 1
    AND r.shortname = 'student'
    AND ue.status = 0
    AND (ue.timeend = 0 OR ue.timeend > UNIX_TIMESTAMP())
    AND e.status = 0
    AND c.visible = 1
    AND (
        (fc.timemodified BETWEEN UNIX_TIMESTAMP('{fecha_inicio} 00:00:00') AND UNIX_TIMESTAMP('{fecha_fin} 23:59:59'))
        OR fc.id IS NULL
    )
    AND fi.name IN (
        'La enseñanza recibida estimuló mi conocimiento y me dejó aprendizaje',
        'La clase se llevó a cabo de forma ordenada y estructurada',
        'Se atendieron mis dudas y recibí retroalimentación de forma oportuna',
        'El docente mostró dominio en su área de conocimiento',
        'El docente fomenta el desarrollo de mis competencias profesionales para el campo laboral',
        'Aprendí teorías y conocimientos actuales que puedo aplicar en diferentes ámbitos de mi vida',
        'Mejoré mis habilidades de pensamiento crítico y reflexivo',
        'En general considero que adquirí habilidades y destrezas',
        'El ambiente de clase promueve los valores de Integridad, Responsabilidad, Compromiso y Solidaridad',
        'En este curso se promovió el uso ético y responsable de los medios digitales evitando el plagio',
        'La plataforma educativa es de fácil acceso y navegación',
        '¿Me resultó fácil subir mis trabajos a la plataforma y acceder a los materiales de estudio?',
        'El curso Modelo en la Plataforma me ayudó a lograr los aprendizajes esperados',
        'Los materiales, recursos audiovisuales, lecturas y actividades realizadas que se encuentran en la plataforma son pertinentes al programa de unidad de aprendizaje(Carta descriptiva, PUA)',
        '-Si tuvieras oportunidad ¿Te gustaría tomar clases de nuevo con este docente?',
        'QUEREMOS ESCUCHARTE: Comentarios acerca del curso y/o docente:',
        'La enseñanza recibida estimuló mi conocimiento y me dejó aprendizajes significativos',
        'El docente asistió puntualmente a clase',
        'El docente relaciona los contenidos vistos en clase con el campo laboral',
        'La clase se llevo a cabo de forma ordenada y estructurada',
        'Aprendi teorias y conocimientos actuales que puedo aplicar en diferentes ambitos de mi vida',
        'En este curso se promovio el uso etico y responsable de los medios digitales evitando el plagio',
        'Se atendieron mis dudas y recibi retroalimentacion de forma oportuna',
        'Mejore mis habilidades de pensamiento critico y reflexivo',
        'La plataforma educativa es de facil acceso y navegacion',
        '-Si tuvieras oportunidad ¿Te gustaria tomar clases de nuevo con este docente?',
        'El docente mostro dominio en su area de conocimiento',
        'En general considero que adquiri habilidades y destrezas',
        '¿Me resulto facil subir mis trabajos a la plataforma y acceder a los materiales de estudio?',
        'La enseñanza recibida estimulo mi conocimiento y me dejo aprendizajes significativos',
        'El docente asistio puntualmente a clase',
        'El curso Modelo en la Plataforma me ayudo a lograr los aprendizajes esperados',
        'La enseñanza recibida estimulo mi conocimiento y me dejo aprendizaje'
    )
ORDER BY u.lastname, u.firstname, c.shortname, f.name, fi.position
"""

def convertir_respuesta(valor, pregunta):
    """
    Convierte los valores numéricos de respuesta a texto descriptivo.
    Maneja especialmente la pregunta sobre tomar clases nuevamente.
    """
    if valor is None or valor == '' or str(valor).strip() == '':
        return 'NO RESPONDIO'
    
    valor_str = str(valor).strip()
    
    # Preguntas especiales sobre tomar clases nuevamente (con y sin acentos)
    preguntas_tomar_clases = [
        '-Si tuvieras oportunidad ¿Te gustaría tomar clases de nuevo con este docente?',
        '-Si tuvieras oportunidad ¿Te gustaria tomar clases de nuevo con este docente?'
    ]
    
    # Verificar si es la pregunta especial sobre tomar clases nuevamente
    if pregunta in preguntas_tomar_clases:
        if valor_str == '1':
            return 'Si'
        elif valor_str == '2':
            return 'No'
        else:
            return 'NO RESPONDIO'
    
    # Para las demás preguntas, usar la conversión original
    if valor_str == '1':
        return 'Completamente de acuerdo'
    elif valor_str == '2':
        return 'De acuerdo'
    elif valor_str == '3':
        return 'Neutral'
    elif valor_str == '4':
        return 'En desacuerdo'
    elif valor_str == '5':
        return 'Completamente en desacuerdo'
    else:
        return valor_str

def limpiar_dato(dato):
    """
    Limpia los datos para evitar problemas en Excel
    """
    if dato is None:
        return ''
    # Remover caracteres problemáticos
    dato_limpio = str(dato).replace('\x00', '').replace('\r', ' ').replace('\n', ' ')
    return dato_limpio

def formatear_pregunta(pregunta):
    """
    Agrega espacio antes de preguntas que comienzan con guión para Excel
    """
    if pregunta and str(pregunta).startswith('-'):
        return ' ' + str(pregunta)
    return pregunta

def seleccionar_rango_fechas():
    """
    Crea una ventana para seleccionar el rango de fechas
    """
    root = tk.Tk()
    root.title("Seleccionar Rango de Fechas")
    root.geometry("400x250")
    root.resizable(False, False)
    
    fechas_seleccionadas = {'inicio': None, 'fin': None}
    
    # Frame principal
    main_frame = ttk.Frame(root, padding="20")
    main_frame.pack(fill=tk.BOTH, expand=True)
    
    # Etiqueta de fecha inicio
    ttk.Label(main_frame, text="Fecha de Inicio:", font=("Arial", 10)).pack(anchor=tk.W, pady=(0, 5))
    
    # DateEntry para fecha inicio
    fecha_inicio = DateEntry(main_frame, width=30, background='darkblue',
                            foreground='white', borderwidth=2, year=2026, month=2, day=2)
    fecha_inicio.pack(anchor=tk.W, pady=(0, 15))
    
    # Etiqueta de fecha fin
    ttk.Label(main_frame, text="Fecha de Fin:", font=("Arial", 10)).pack(anchor=tk.W, pady=(0, 5))
    
    # DateEntry para fecha fin
    fecha_fin = DateEntry(main_frame, width=30, background='darkblue',
                         foreground='white', borderwidth=2, year=2026, month=2, day=22)
    fecha_fin.pack(anchor=tk.W, pady=(0, 20))
    
    def confirmar():
        fechas_seleccionadas['inicio'] = fecha_inicio.get_date()
        fechas_seleccionadas['fin'] = fecha_fin.get_date()
        root.destroy()
    
    def cancelar():
        root.destroy()
    
    # Frame de botones
    button_frame = ttk.Frame(main_frame)
    button_frame.pack(fill=tk.X, pady=(20, 0))
    
    ttk.Button(button_frame, text="Confirmar", command=confirmar).pack(side=tk.LEFT, padx=(0, 10))
    ttk.Button(button_frame, text="Cancelar", command=cancelar).pack(side=tk.LEFT)
    
    root.mainloop()
    
    return fechas_seleccionadas['inicio'], fechas_seleccionadas['fin']

class VentanaProgreso:
    """
    Ventana para mostrar el progreso de la exportación
    """
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Exportando Encuestas")
        self.root.geometry("500x150")
        self.root.resizable(False, False)
        
        # Frame principal
        main_frame = ttk.Frame(self.root, padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Etiqueta de estado
        self.label_estado = ttk.Label(main_frame, text="Conectando a la base de datos...", font=("Arial", 10))
        self.label_estado.pack(anchor=tk.W, pady=(0, 10))
        
        # Barra de progreso
        self.progress = ttk.Progressbar(main_frame, length=450, mode='determinate', maximum=100)
        self.progress.pack(fill=tk.X, pady=(0, 10))
        
        # Etiqueta de porcentaje
        self.label_porcentaje = ttk.Label(main_frame, text="0%", font=("Arial", 12, "bold"))
        self.label_porcentaje.pack(anchor=tk.CENTER)
        
        self.root.update()
    
    def actualizar(self, porcentaje, mensaje):
        """Actualiza la barra de progreso y el mensaje"""
        self.progress['value'] = porcentaje
        self.label_estado.config(text=mensaje)
        self.label_porcentaje.config(text=f"{int(porcentaje)}%")
        self.root.update()
    
    def cerrar(self):
        """Cierra la ventana de progreso"""
        self.root.destroy()

try:
    # Obtener rango de fechas del usuario
    fecha_inicio, fecha_fin = seleccionar_rango_fechas()
    
    if fecha_inicio is None or fecha_fin is None:
        print("Operación cancelada por el usuario")
        exit()

    # Crear ventana de progreso
    progreso = VentanaProgreso()
    
    try:
        progreso.actualizar(5, "Conectando a la base de datos...")
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        
        progreso.actualizar(10, "Ejecutando consulta...")
        query = query_template.format(fecha_inicio=fecha_inicio, fecha_fin=fecha_fin)
        cursor.execute(query)
        
        progreso.actualizar(20, "Obteniendo resultados...")
        results = cursor.fetchall()
        column_names = [i[0] for i in cursor.description]
        
        # Encontrar índices una sola vez
        response_index = column_names.index('response')
        question_index = column_names.index('question')
        
        # Crear nueva lista de columnas sin insertar (más rápido)
        new_column_names = column_names[:response_index + 1] + ['respuesta_texto'] + column_names[response_index + 1:]
        
        # Procesar y limpiar los resultados - ULTRA OPTIMIZADO
        total_rows = len(results)
        progreso.actualizar(20, f"Procesando {total_rows} registros...")
        
        # Convertir directamente a DataFrame
        df = pd.DataFrame(results, columns=column_names)
        
        # Mapeos para búsqueda O(1)
        respuesta_map = {'1': 'Completamente de acuerdo', '2': 'De acuerdo', '3': 'Neutral', '4': 'En desacuerdo', '5': 'Completamente en desacuerdo'}
        preguntas_tomar_clases = frozenset(['-Si tuvieras oportunidad ¿Te gustaría tomar clases de nuevo con este docente?', '-Si tuvieras oportunidad ¿Te gustaria tomar clases de nuevo con este docente?'])
        
        # Limpiar SOLO lo necesario - operaciones mínimas
        # Convertir a string una sola vez
        df['response'] = df['response'].fillna('').astype(str).str.strip()
        df['question'] = df['question'].fillna('').astype(str)
        
        # Reemplazar caracteres problemáticos (sin regex - más rápido)
        df['question'] = df['question'].str.replace('\x00', '', regex=False).str.replace('\r', ' ', regex=False).str.replace('\n', ' ', regex=False).str.replace('-', ' -', regex=False)
        df['response'] = df['response'].str.replace('\x00', '', regex=False).str.replace('\r', ' ', regex=False).str.replace('\n', ' ', regex=False)
        
        # Crear columna respuesta_texto con vectorización pura (SIN LOOPS)
        response_vals = df['response'].values
        question_vals = df['question'].values
        
        # Crear máscara para respuestas vacías
        empty_mask = (response_vals == '') | (response_vals == 'nan')
        
        # Crear máscara para preguntas especiales
        is_special_question = np.array([q in preguntas_tomar_clases for q in question_vals])
        
        # Inicializar array de respuestas
        respuesta_texto = np.empty(len(df), dtype=object)
        
        # Aplicar lógica vectorizada
        respuesta_texto[empty_mask] = 'NO RESPONDIO'
        
        # Para preguntas especiales
        special_mask = is_special_question & ~empty_mask
        respuesta_texto[special_mask] = np.where(
            response_vals[special_mask] == '1',
            'Si',
            np.where(response_vals[special_mask] == '2', 'No', 'NO RESPONDIO')
        )
        
        # Para preguntas normales
        normal_mask = ~is_special_question & ~empty_mask
        respuesta_texto[normal_mask] = np.array([respuesta_map.get(r, r) for r in response_vals[normal_mask]])
        
        df['respuesta_texto'] = respuesta_texto
        
        # Reordenar columnas
        cols = list(df.columns)
        cols.insert(response_index + 1, cols.pop(cols.index('respuesta_texto')))
        df = df[cols]
        
        progreso.actualizar(50, f"Procesados {total_rows} registros")
        
        progreso.actualizar(50, "Generando archivos...")
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        temp_csv = f"temp_encuestas_{timestamp}.csv"
        temp_excel = f"temp_encuestas_{timestamp}.xlsx"
        
        # Usar el DataFrame ya procesado (df) en lugar de crear uno nuevo
        progreso.actualizar(55, "Generando archivo CSV...")
        df.to_csv(temp_csv, index=False, encoding='utf-8-sig')
        
        print(f"Archivo temporal CSV generado: {temp_csv}")
        print(f"Total de registros exportados: {len(df)}")
        
        # Convertir a Excel - OPTIMIZADO SIN FORMATO LENTO
        try:
            progreso.actualizar(70, "Generando archivo Excel...")
            
            # Escribir Excel sin aplicar formato a cada celda (mucho más rápido)
            with pd.ExcelWriter(temp_excel, engine='xlsxwriter') as writer:
                df.to_excel(writer, index=False, sheet_name='Encuestas')
                
                workbook = writer.book
                worksheet = writer.sheets['Encuestas']
                
                # Formato SOLO para el encabezado (sin aplicar a cada fila)
                header_format = workbook.add_format({
                    'bold': True,
                    'bg_color': '#D7E4BC',
                    'border': 1
                })
                
                # Aplicar formato solo al encabezado
                for col_num, value in enumerate(df.columns.values):
                    worksheet.write(0, col_num, value, header_format)
                
                # Ajustar ancho de columnas sin calcular longitud máxima (más rápido)
                for col_num in range(len(df.columns)):
                    worksheet.set_column(col_num, col_num, 25)
            
            progreso.actualizar(90, "Seleccionando carpeta de destino...")
            time.sleep(0.5)
            progreso.cerrar()
            
            # Seleccionar carpeta de destino
            root_dialog = tk.Tk()
            root_dialog.withdraw()
            save_dir = filedialog.askdirectory(title="Selecciona carpeta para guardar los archivos")
            root_dialog.destroy()
            
            if save_dir:
                # Mover archivos a la carpeta seleccionada
                csv_filename = f"encuestas_estudiantes_{timestamp}.csv"
                excel_filename = f"encuestas_estudiantes_{timestamp}.xlsx"
                
                final_csv = os.path.join(save_dir, csv_filename)
                final_excel = os.path.join(save_dir, excel_filename)
                
                shutil.move(temp_csv, final_csv)
                shutil.move(temp_excel, final_excel)
                
                print(f"Archivo Excel generado exitosamente: {final_excel}")
                print(f"Archivo CSV generado exitosamente: {final_csv}")
                
                # Mostrar mensaje de confirmación
                messagebox.showinfo(
                    "Exportación Completada",
                    f"¡Reporte generado exitosamente!\n\n"
                    f"Registros exportados: {len(df)}\n\n"
                    f"Archivos guardados en:\n{save_dir}\n\n"
                    f"- {csv_filename}\n"
                    f"- {excel_filename}"
                )
            else:
                # Si el usuario cancela, guardar en la carpeta actual
                shutil.move(temp_csv, f"encuestas_estudiantes_{timestamp}.csv")
                shutil.move(temp_excel, f"encuestas_estudiantes_{timestamp}.xlsx")
                messagebox.showinfo(
                    "Exportación Completada",
                    f"¡Reporte generado exitosamente!\n\n"
                    f"Registros exportados: {len(df)}\n\n"
                    f"Archivos guardados en la carpeta actual."
                )
            
        except Exception as excel_error:
            print(f"Error al generar Excel: {excel_error}")
            print("Pero el archivo CSV fue generado correctamente")
            messagebox.showerror("Error", f"Error al generar Excel:\n{str(excel_error)}")
        
    except Exception as e:
        progreso.actualizar(0, f"Error: {str(e)}")
        time.sleep(3)
        progreso.cerrar()
        raise
    
except mysql.connector.Error as err:
    print(f"Error de MySQL: {err}")
    
except Exception as e:
    print(f"Error general: {e}")
    
finally:
    if 'connection' in locals() and connection.is_connected():
        cursor.close()
        connection.close()
        print("Conexión cerrada")

        