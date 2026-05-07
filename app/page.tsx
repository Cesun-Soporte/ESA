"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Download, FileSpreadsheet, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export default function Home() {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("")
  const [error, setError] = useState("")
  const [totalRecords, setTotalRecords] = useState(0)

  const handleExport = async () => {
    if (!startDate || !endDate) {
      setError("Por favor selecciona ambas fechas")
      return
    }

    setLoading(true)
    setError("")
    setProgress(10)
    setStatus("Conectando a la base de datos...")

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: format(startDate, "yyyy-MM-dd"),
          endDate: format(endDate, "yyyy-MM-dd"),
        }),
      })

      setProgress(90)
      setStatus("Descargando archivo...")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al generar el archivo")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `encuestas_estudiantes_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      const contentDisposition = response.headers.get("X-Total-Records")
      const records = contentDisposition ? parseInt(contentDisposition) : 0
      setTotalRecords(records)

      setProgress(100)
      setStatus(`¡Exportación completada! ${records} registros exportados`)
      
      setTimeout(() => {
        setLoading(false)
        setProgress(0)
        setStatus("")
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Error al exportar datos")
      setLoading(false)
      setProgress(0)
      setStatus("")
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sistema de Exportación ESA
          </h1>
          <p className="text-lg text-gray-600">
            Encuestas de Satisfacción Estudiantil - CESUN Universidad
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6" />
              Exportar Encuestas
            </CardTitle>
            <CardDescription>
              Selecciona el rango de fechas para exportar las encuestas a Excel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start-date">Fecha de Inicio</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="start-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP", { locale: es }) : "Selecciona fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">Fecha de Fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="end-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP", { locale: es }) : "Selecciona fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {loading && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{status}</span>
                  <span className="font-semibold">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              onClick={handleExport}
              disabled={loading || !startDate || !endDate}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Exportar a Excel
                </>
              )}
            </Button>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Información:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• El archivo incluye todas las respuestas en el rango de fechas seleccionado</li>
                <li>• Las respuestas se convierten automáticamente a texto descriptivo</li>
                <li>• El archivo se descarga en formato Excel (.xlsx)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <footer className="text-center mt-8 text-sm text-gray-600">
          <p>© 2026 CESUN Universidad - Sistema de Exportación ESA</p>
        </footer>
      </div>
    </main>
  )
}
