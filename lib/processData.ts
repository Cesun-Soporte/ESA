interface SurveyRow {
  student_id: number
  student_name: string
  email: string
  course_code: string
  course_name: string
  teacher_name: string
  feedback_name: string
  question: string
  response: string
  estado_respuesta: string
  fecha_respuesta: string
}

const RESPONSE_MAP: { [key: string]: string } = {
  '1': 'Completamente de acuerdo',
  '2': 'De acuerdo',
  '3': 'Neutral',
  '4': 'En desacuerdo',
  '5': 'Completamente en desacuerdo',
}

const SPECIAL_QUESTIONS = new Set([
  '-Si tuvieras oportunidad ¿Te gustaría tomar clases de nuevo con este docente?',
  '-Si tuvieras oportunidad ¿Te gustaria tomar clases de nuevo con este docente?',
])

export function convertResponse(value: string, question: string): string {
  if (!value || value.trim() === '') {
    return 'NO RESPONDIO'
  }

  const trimmedValue = value.trim()

  if (SPECIAL_QUESTIONS.has(question)) {
    if (trimmedValue === '1') return 'Si'
    if (trimmedValue === '2') return 'No'
    return 'NO RESPONDIO'
  }

  return RESPONSE_MAP[trimmedValue] || trimmedValue
}

export function cleanData(data: string): string {
  if (!data) return ''
  return String(data)
    .replace(/\x00/g, '')
    .replace(/\r/g, ' ')
    .replace(/\n/g, ' ')
}

export function formatQuestion(question: string): string {
  if (question && question.startsWith('-')) {
    return ' ' + question
  }
  return question
}

export function processRows(rows: any[]): SurveyRow[] {
  return rows.map((row) => {
    const response = cleanData(row.response)
    const question = cleanData(row.question)
    const formattedQuestion = formatQuestion(question)
    const respuestaTexto = convertResponse(response, question)

    return {
      student_id: row.student_id,
      student_name: cleanData(row.student_name),
      email: cleanData(row.email),
      course_code: cleanData(row.course_code),
      course_name: cleanData(row.course_name),
      teacher_name: cleanData(row.teacher_name),
      feedback_name: cleanData(row.feedback_name),
      question: formattedQuestion,
      response: response,
      respuesta_texto: respuestaTexto,
      estado_respuesta: row.estado_respuesta,
      fecha_respuesta: row.fecha_respuesta,
    }
  })
}
