import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { getConnection, QUERY_TEMPLATE } from '@/lib/db'
import { processRows } from '@/lib/processData'

export async function POST(request: NextRequest) {
  let connection

  try {
    const body = await request.json()
    const { startDate, endDate } = body

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

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Encuestas')

    worksheet.columns = [
      { header: 'student_id', key: 'student_id', width: 12 },
      { header: 'student_name', key: 'student_name', width: 30 },
      { header: 'email', key: 'email', width: 30 },
      { header: 'course_code', key: 'course_code', width: 15 },
      { header: 'course_name', key: 'course_name', width: 40 },
      { header: 'teacher_name', key: 'teacher_name', width: 30 },
      { header: 'feedback_name', key: 'feedback_name', width: 40 },
      { header: 'question', key: 'question', width: 60 },
      { header: 'response', key: 'response', width: 12 },
      { header: 'respuesta_texto', key: 'respuesta_texto', width: 30 },
      { header: 'estado_respuesta', key: 'estado_respuesta', width: 18 },
      { header: 'fecha_respuesta', key: 'fecha_respuesta', width: 20 },
    ]

    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD7E4BC' },
    }
    worksheet.getRow(1).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    }

    processedData.forEach((row) => {
      worksheet.addRow(row)
    })

    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="encuestas_estudiantes_${Date.now()}.xlsx"`,
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
