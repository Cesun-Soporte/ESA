import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { getConnection, QUERY_TEMPLATE } from '@/lib/db'
import { processRows } from '@/lib/processData'

export async function POST(request: NextRequest) {
  let connection

  try {
    const body = await request.json()
    const { startDate, endDate, format = 'xlsx' } = body

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Fechas requeridas' },
        { status: 400 }
      )
    }

    connection = await getConnection()

    const startDateTime = `${startDate} 00:00:00`
    const endDateTime = `${endDate} 23:59:59`

    const [rows] = await connection.execute(QUERY_TEMPLATE, [
      startDateTime,
      endDateTime,
    ])

    const processedData = processRows(rows as any[])

    if (format === 'csv') {
      const headers = [
        'student_id',
        'student_name',
        'email',
        'course_code',
        'course_name',
        'teacher_name',
        'feedback_name',
        'question',
        'response',
        'respuesta_texto',
        'estado_respuesta',
        'fecha_respuesta',
      ]

      const csvRows = []
      csvRows.push(headers.join(','))

      processedData.forEach((row: any) => {
        const values = headers.map((header) => {
          const value = row[header] || ''
          return `"${String(value).replace(/"/g, '""')}"`
        })
        csvRows.push(values.join(','))
      })

      const csvContent = csvRows.join('\n')
      const buffer = Buffer.from('\uFEFF' + csvContent, 'utf-8')

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="encuestas_satisfaccion_academica_${Date.now()}.csv"`,
          'X-Total-Records': processedData.length.toString(),
        },
      })
    }

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Encuestas')

    const columns = [
      { header: 'ID Estudiante', key: 'student_id', width: 12 },
      { header: 'Nombre Estudiante', key: 'student_name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Código Curso', key: 'course_code', width: 15 },
      { header: 'Nombre Curso', key: 'course_name', width: 40 },
      { header: 'Nombre Docente', key: 'teacher_name', width: 30 },
      { header: 'Nombre Encuesta', key: 'feedback_name', width: 40 },
      { header: 'Pregunta', key: 'question', width: 60 },
      { header: 'Respuesta', key: 'response', width: 12 },
      { header: 'Respuesta Texto', key: 'respuesta_texto', width: 30 },
      { header: 'Estado', key: 'estado_respuesta', width: 18 },
      { header: 'Fecha Respuesta', key: 'fecha_respuesta', width: 20 },
    ]

    worksheet.columns = columns

    worksheet.getRow(1).font = { bold: true, size: 11 }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    }
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }
    worksheet.getRow(1).height = 25

    columns.forEach((col, index) => {
      const cell = worksheet.getRow(1).getCell(index + 1)
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
      }
    })

    processedData.forEach((row) => {
      const excelRow = worksheet.addRow(row)
      excelRow.alignment = { vertical: 'middle', wrapText: true }
    })

    worksheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: 1 }
    ]

    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="encuesta_satisfaccion_academica_${Date.now()}.xlsx"`,
        'X-Total-Records': processedData.length.toString(),
      },
    })
  } catch (error: any) {
    console.error('Error en exportación:', error)
    return NextResponse.json(
      { error: error.message || 'Error al procesar la solicitud' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}
