import { NextRequest, NextResponse } from 'next/server'

const VALID_EMAIL = 'soportetecnico@cesun.edu.mx'
const VALID_PASSWORD = 'Cesun164020!@'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      return NextResponse.json(
        { success: true, message: 'Autenticación exitosa' },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: 'Credenciales inválidas' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    )
  }
}
