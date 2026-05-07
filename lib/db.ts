import mysql from 'mysql2/promise'

const config = {
  host: process.env.DB_HOST || '119.8.8.223',
  user: process.env.DB_USER || 'cesun_ro',
  password: process.env.DB_PASSWORD || 'mrK2ObaGAP7VIAuLtdeP',
  database: process.env.DB_NAME || 'mx-emprove-cesun01',
  connectTimeout: 30000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

export async function getConnection() {
  try {
    const connection = await mysql.createConnection(config)
    await connection.ping()
    return connection
  } catch (error: any) {
    console.error('Error conectando a la base de datos:', error)
    throw new Error(`Error de conexión a la base de datos: ${error.message}`)
  }
}

export const QUERY_TEMPLATE = `
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
        (fc.timemodified BETWEEN UNIX_TIMESTAMP(?) AND UNIX_TIMESTAMP(?))
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
`
