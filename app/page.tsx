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

      const excelResponse = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: startDateStr,
          endDate: endDateStr,
          format: 'xlsx',
        }),
      })

      if (!excelResponse.ok) {
        let errorMsg = "Error al exportar Excel"
        try {
          const errorData = await excelResponse.json()
          errorMsg = errorData.error || errorMsg
        } catch (e) {
          errorMsg = `Error del servidor (${excelResponse.status})`
        }
        throw new Error(errorMsg)
      }

      const blobExcel = await excelResponse.blob()
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

      const csvResponse = await fetch("/api/export", {
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
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      
      <div className="flex-grow flex flex-col justify-center p-4 sm:p-6 md:p-8 lg:p-10 relative z-10">
        <div className="max-w-5xl mx-auto w-full">
          {/* Header with Logo */}
          <div className="text-center mb-4 md:mb-5 space-y-2 md:space-y-3">
            <div className="flex justify-center mb-3 md:mb-4 animate-fade-in">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-2xl border border-white/20">
                <Image
                  src="/cesun-logo.png"
                  alt="CESUN Universidad"
                  width={220}
                  height={95}
                  priority
                  className="object-contain w-40 sm:w-48 md:w-52 h-auto drop-shadow-2xl"
                />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 md:mb-2 px-4 drop-shadow-lg">
              Sistema de Exportación de Encuestas
            </h1>
            <p className="text-base sm:text-lg text-blue-100 px-4 font-medium">
              Encuesta de Satisfacción Académica
            </p>
            <p className="text-sm sm:text-base text-blue-200 px-4">
              CESUN Universidad - Creatividad e Innovación
            </p>
          </div>

          <Card className="shadow-2xl border-2 border-white/30 mx-2 sm:mx-4 md:mx-0 bg-white/95 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 p-4 sm:p-5 text-white">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl font-bold">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <FileSpreadsheet className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                Exportar Encuestas
              </CardTitle>
              <CardDescription className="text-sm text-blue-100 mt-1">
                Selecciona el rango de fechas y exporta en Excel y CSV simultáneamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5 p-4 sm:p-6 pt-4 sm:pt-5">
            <div className="grid gap-5 sm:gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="start-date" className="text-sm sm:text-base font-semibold text-gray-700 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-blue-600" />
                  Fecha de Inicio
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="start-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-12 border-2 hover:border-blue-500 hover:bg-blue-50 transition-all",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-5 w-5" />
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

              <div className="space-y-3">
                <Label htmlFor="end-date" className="text-sm sm:text-base font-semibold text-gray-700 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-blue-600" />
                  Fecha de Fin
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="end-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-12 border-2 hover:border-blue-500 hover:bg-blue-50 transition-all",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-5 w-5" />
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
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none h-12"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <span className="hidden xs:inline">Exportando...</span>
                  <span className="xs:hidden">Exportando</span>
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  <span className="hidden xs:inline">Exportar Excel y CSV</span>
                  <span className="xs:hidden">Exportar</span>
                </>
              )}
            </Button>

            <div className="border-t-2 border-gray-200 pt-3 sm:pt-4 mt-3 sm:mt-4 bg-gradient-to-r from-gray-50 to-blue-50 p-3 sm:p-4 rounded-xl shadow-sm">
              <h3 className="font-bold text-sm sm:text-base text-gray-800 mb-2 sm:mb-3 flex items-center gap-2">
                <div className="bg-blue-600 p-1 rounded-md">
                  <FileSpreadsheet className="h-4 w-4 text-white flex-shrink-0" />
                </div>
                Información de Exportación
              </h3>
              <ul className="text-xs sm:text-sm text-gray-700 space-y-1.5 sm:space-y-2">
                <li className="flex items-start gap-2 bg-white p-2 rounded-lg shadow-sm">
                  <div className="bg-blue-100 p-0.5 rounded-full mt-0.5 flex-shrink-0">
                    <Download className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-xs sm:text-sm"><strong className="font-semibold text-gray-900">Descarga automática de 2 archivos:</strong> Excel (.xlsx) y CSV (.csv)</span>
                </li>
                <li className="flex items-start gap-2 bg-white p-2 rounded-lg shadow-sm">
                  <div className="bg-green-100 p-0.5 rounded-full mt-0.5 flex-shrink-0">
                    <FileSpreadsheet className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-xs sm:text-sm">Ambos archivos tienen el mismo nombre con timestamp único</span>
                </li>
                <li className="flex items-start gap-2 bg-white p-2 rounded-lg shadow-sm">
                  <div className="bg-purple-100 p-0.5 rounded-full mt-0.5 flex-shrink-0">
                    <FileSpreadsheet className="h-3 w-3 text-purple-600" />
                  </div>
                  <span className="text-xs sm:text-sm">Excel: Formato profesional con colores y encabezados fijos</span>
                </li>
                <li className="flex items-start gap-2 bg-white p-2 rounded-lg shadow-sm">
                  <div className="bg-orange-100 p-0.5 rounded-full mt-0.5 flex-shrink-0">
                    <FileText className="h-3 w-3 text-orange-600" />
                  </div>
                  <span className="text-xs sm:text-sm">CSV: Compatible con Excel, Google Sheets y otros programas</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

          <footer className="text-center mt-4 sm:mt-5 text-xs text-white px-4 pb-4">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
              <p className="font-bold mb-1 text-sm">© 2026 CESUN Universidad</p>
              <p className="text-blue-100 mb-1 text-xs font-medium">Sistema de Exportación de Encuestas de Satisfacción Académica</p>
              <p className="text-blue-200 text-xs">
                Desarrollado por el Departamento de Infraestructura y Tecnologías de la Información
              </p>
            </div>
          </footer>
        </div>
      </div>
    </main>
  )
}
