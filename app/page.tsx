"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import Image from "next/image"

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
      const startDateStr = format(startDate, "yyyy-MM-dd")
      const endDateStr = format(endDate, "yyyy-MM-dd")
      const timestamp = format(new Date(), "yyyyMMdd_HHmmss")

      setProgress(30)
      setStatus("Generando archivo Excel...")

      const responseExcel = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: startDateStr,
          endDate: endDateStr,
          format: 'xlsx',
        }),
      })

      if (!responseExcel.ok) {
        const errorData = await responseExcel.json()
        throw new Error(errorData.error || "Error al generar el archivo Excel")
      }

      const blobExcel = await responseExcel.blob()
      const urlExcel = window.URL.createObjectURL(blobExcel)
      const aExcel = document.createElement("a")
      aExcel.href = urlExcel
      aExcel.download = `encuesta_satisfaccion_academica_${timestamp}.xlsx`
      document.body.appendChild(aExcel)
      aExcel.click()
      window.URL.revokeObjectURL(urlExcel)
      document.body.removeChild(aExcel)

      setProgress(60)
      setStatus("Generando archivo CSV...")

      const responseCSV = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: startDateStr,
          endDate: endDateStr,
          format: 'csv',
        }),
      })

      if (!responseCSV.ok) {
        const errorData = await responseCSV.json()
        throw new Error(errorData.error || "Error al generar el archivo CSV")
      }

      const blobCSV = await responseCSV.blob()
      const urlCSV = window.URL.createObjectURL(blobCSV)
      const aCSV = document.createElement("a")
      aCSV.href = urlCSV
      aCSV.download = `encuesta_satisfaccion_academica_${timestamp}.csv`
      document.body.appendChild(aCSV)
      aCSV.click()
      window.URL.revokeObjectURL(urlCSV)
      document.body.removeChild(aCSV)

      const contentDisposition = responseExcel.headers.get("X-Total-Records")
      const records = contentDisposition ? parseInt(contentDisposition) : 0
      setTotalRecords(records)

      setProgress(100)
      setStatus(`¡Exportación completada! ${records} registros exportados en Excel y CSV`)
      
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
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 space-y-4">
          <div className="flex justify-center mb-6">
            <Image
              src="/cesun-logo.png"
              alt="CESUN Universidad"
              width={280}
              height={120}
              priority
              className="object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Sistema de Exportación de Encuestas
          </h1>
          <p className="text-xl text-blue-100">
            Encuesta de Satisfacción Académica
          </p>
          <p className="text-lg text-blue-200">
            CESUN Universidad - Creatividad e Innovación
          </p>
        </div>

        <Card className="shadow-2xl border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileSpreadsheet className="h-7 w-7 text-blue-600" />
              Exportar Encuestas
            </CardTitle>
            <CardDescription className="text-base">
              Selecciona el rango de fechas y exporta en Excel y CSV simultáneamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
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

            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-base text-blue-900">Archivos a Exportar</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Excel (.xlsx)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <FileText className="h-4 w-4" />
                  <span>CSV (.csv)</span>
                </div>
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
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
                  Exportar Excel y CSV
                </>
              )}
            </Button>

            <div className="border-t pt-4 mt-4 bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-base text-blue-900 mb-3 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Información de Exportación
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span><strong>Descarga automática de 2 archivos:</strong> Excel (.xlsx) y CSV (.csv)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Ambos archivos tienen el mismo nombre con timestamp único</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Excel: Formato profesional con colores y encabezados fijos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>CSV: Compatible con Excel, Google Sheets y otros programas</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <footer className="text-center mt-8 text-sm text-white">
          <p className="font-medium">© 2026 CESUN Universidad</p>
          <p className="text-blue-200">Sistema de Exportación de Encuestas de Satisfacción Académica</p>
        </footer>
      </div>
    </main>
  )
}
