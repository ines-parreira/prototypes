import type { RefObject } from 'react'
import { useState } from 'react'

import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import moment from 'moment'

type ExportStatus = 'idle' | 'loading' | 'success' | 'error'

export const useExportDashboardToPDF = () => {
    const [status, setStatus] = useState<ExportStatus>('idle')
    const [error, setError] = useState<Error | null>(null)

    const exportToPDF = async (
        elementRef: RefObject<HTMLElement>,
        filename?: string,
    ) => {
        if (!elementRef.current) {
            setError(new Error('Element reference is not available'))
            setStatus('error')
            return
        }

        setStatus('loading')
        setError(null)

        try {
            const element = elementRef.current

            const originalScrollPosition = window.scrollY
            element.scrollIntoView({ behavior: 'instant', block: 'start' })

            await new Promise((resolve) => setTimeout(resolve, 100))

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                allowTaint: false,
                foreignObjectRendering: false,
                imageTimeout: 0,
            })

            window.scrollTo({
                top: originalScrollPosition,
                behavior: 'instant',
            })

            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4',
                compress: true,
            })

            const pdfWidth = 297
            const pdfHeight = 210
            const margin = 10

            const availableWidth = pdfWidth - margin * 2
            const availableHeight = pdfHeight - margin * 2

            const canvasAspectRatio = canvas.width / canvas.height

            let imgWidth = availableWidth
            let imgHeight = availableWidth / canvasAspectRatio

            if (imgHeight > availableHeight) {
                imgHeight = availableHeight
                imgWidth = availableHeight * canvasAspectRatio
            }

            const xOffset = margin + (availableWidth - imgWidth) / 2
            const yOffset = margin + (availableHeight - imgHeight) / 2

            const imgData = canvas.toDataURL('image/png', 1.0)

            pdf.addImage(
                imgData,
                'PNG',
                xOffset,
                yOffset,
                imgWidth,
                imgHeight,
                undefined,
                'FAST',
            )

            const defaultFilename = `analytics-overview-${moment().format('YYYY-MM-DD')}.pdf`
            pdf.save(filename || defaultFilename)

            setStatus('success')
            setTimeout(() => setStatus('idle'), 3000)
        } catch (err) {
            const errorObj =
                err instanceof Error ? err : new Error('Failed to export PDF')
            setError(errorObj)
            setStatus('error')
            setTimeout(() => setStatus('idle'), 3000)
        }
    }

    return {
        exportToPDF,
        isLoading: status === 'loading',
        isSuccess: status === 'success',
        isError: status === 'error',
        error,
    }
}
