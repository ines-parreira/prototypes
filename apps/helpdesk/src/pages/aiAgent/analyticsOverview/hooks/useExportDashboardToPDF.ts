import type { RefObject } from 'react'
import { useState } from 'react'

import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import moment from 'moment'

type ExportStatus = 'idle' | 'loading' | 'success' | 'error'

const fetchSvgSprite = async (url: string): Promise<Document | null> => {
    try {
        const baseUrl = url.split('#')[0]
        const response = await fetch(baseUrl)
        const svgText = await response.text()
        const parser = new DOMParser()
        return parser.parseFromString(svgText, 'image/svg+xml')
    } catch {
        return null
    }
}

const forceLightTheme = (doc: Document): void => {
    const themeClasses = ['dark', 'light', 'classic']
    themeClasses.forEach((cls) => doc.body.classList.remove(cls))
    doc.body.classList.add('light')
}

const hideInteractiveElements = (element: HTMLElement): (() => void) => {
    const restorationCallbacks: Array<() => void> = []

    const elementsToHide = element.querySelectorAll<HTMLElement>(
        '[class*="buttongroup-group"], [data-pdf-exclude]',
    )

    elementsToHide.forEach((el) => {
        const originalDisplay = el.style.display
        el.style.display = 'none'

        restorationCallbacks.push(() => {
            el.style.display = originalDisplay
        })
    })

    return () => {
        restorationCallbacks.forEach((restore) => restore())
    }
}

const inlineSvgUseElements = async (
    element: HTMLElement,
): Promise<() => void> => {
    const svgUseElements = element.querySelectorAll('svg use')
    const restorationCallbacks: Array<() => void> = []
    const spriteCache = new Map<string, Document | null>()

    for (const useElement of svgUseElements) {
        const href =
            useElement.getAttribute('href') ||
            useElement.getAttribute('xlink:href')
        if (!href) continue

        const svgParent = useElement.closest('svg')
        if (!svgParent) continue

        const originalContent = svgParent.innerHTML
        const originalViewBox = svgParent.getAttribute('viewBox')

        let symbolElement: Element | null = null

        if (href.startsWith('#')) {
            symbolElement = document.getElementById(href.slice(1))
        } else if (href.includes('#')) {
            const [baseUrl, symbolId] = href.split('#')

            if (!spriteCache.has(baseUrl)) {
                spriteCache.set(baseUrl, await fetchSvgSprite(href))
            }

            const spriteDoc = spriteCache.get(baseUrl)
            if (spriteDoc) {
                symbolElement = spriteDoc.getElementById(symbolId)
            }
        }

        if (symbolElement) {
            const symbolViewBox = symbolElement.getAttribute('viewBox')
            if (symbolViewBox && !originalViewBox) {
                svgParent.setAttribute('viewBox', symbolViewBox)
            }

            const childNodes = Array.from(symbolElement.childNodes)
            svgParent.innerHTML = ''
            childNodes.forEach((node) => {
                svgParent.appendChild(node.cloneNode(true))
            })

            restorationCallbacks.push(() => {
                svgParent.innerHTML = originalContent
                if (symbolViewBox && !originalViewBox) {
                    svgParent.removeAttribute('viewBox')
                }
            })
        }
    }

    return () => {
        restorationCallbacks.forEach((restore) => restore())
    }
}

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
                onclone: async (clonedDoc) => {
                    // there were multiple issues with the dark theme, were different colors for backgrounds, text, borders, etc.
                    // did not pick the correct color based on theme so the better way instead of patching a lot of components is to
                    // force the light theme in the PDF export
                    forceLightTheme(clonedDoc)
                    hideInteractiveElements(clonedDoc.body)
                    await inlineSvgUseElements(clonedDoc.body)
                },
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
