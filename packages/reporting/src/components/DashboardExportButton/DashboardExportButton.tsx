import type { RefObject } from 'react'
import { useEffect, useRef, useState } from 'react'

import { reportError } from '@repo/logging'
import cn from 'classnames'

import { Box, Button, ButtonSize, Icon, Menu, MenuItem } from '@gorgias/axiom'

import { useExportDashboardToPDF } from './useExportDashboardToPDF'

import css from './DashboardExportButton.less'

export type DashboardExportFormat = 'csv' | 'pdf'

type CsvExportHook = {
    triggerDownload: () => Promise<void>
    isLoading: boolean
}

type DashboardExportButtonProps = {
    contentRef: RefObject<HTMLElement>
    useCsvExport: () => CsvExportHook
    pdfFileName?: string
    onExport?: (format: DashboardExportFormat) => void
    /**
     * Trigger button size. Matches Axiom Button's `sm` / `md`. Defaults to
     * `md` for the original dashboard call sites; modal toolbars can opt
     * into `sm` to align with the surrounding controls.
     */
    size?: typeof ButtonSize.Sm | typeof ButtonSize.Md
}

type LazyCsvExporterProps = {
    useCsvExport: () => CsvExportHook
    onDone: () => void
}

function LazyCsvExporter({ useCsvExport, onDone }: LazyCsvExporterProps) {
    const { triggerDownload, isLoading } = useCsvExport()
    const onDoneRef = useRef(onDone)
    const hasTriggered = useRef(false)

    useEffect(() => {
        onDoneRef.current = onDone
    })

    useEffect(() => {
        if (isLoading || hasTriggered.current) return
        hasTriggered.current = true
        triggerDownload()
            .catch(reportError)
            .finally(() => onDoneRef.current())
    }, [isLoading, triggerDownload])

    return null
}

export function DashboardExportButton({
    contentRef,
    useCsvExport,
    pdfFileName,
    onExport,
    size = ButtonSize.Md,
}: DashboardExportButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isCsvExporting, setIsCsvExporting] = useState(false)

    const { exportToPDF, isLoading: isPdfLoading } = useExportDashboardToPDF()

    const isExportInProgress = isPdfLoading || isCsvExporting

    const handleExportCSV = () => {
        onExport?.('csv')
        setIsCsvExporting(true)
    }

    const handleExportPDF = async () => {
        onExport?.('pdf')
        const filename = pdfFileName
            ? `${pdfFileName}-${new Date().toISOString().slice(0, 10)}.pdf`
            : undefined
        try {
            await exportToPDF(contentRef, filename)
        } catch (error) {
            reportError(error)
        }
    }

    const getButtonContent = () =>
        isExportInProgress ? 'Exporting...' : 'Export'

    return (
        <div data-pdf-exclude>
            {isCsvExporting && (
                <LazyCsvExporter
                    useCsvExport={useCsvExport}
                    onDone={() => setIsCsvExporting(false)}
                />
            )}
            <Box className={css.buttonWrapper}>
                <Menu
                    isOpen={isOpen}
                    onOpenChange={setIsOpen}
                    trigger={
                        <Button
                            variant="primary"
                            size={size}
                            isDisabled={isExportInProgress}
                            leadingSlot="download"
                        >
                            <Box display="flex" alignItems="center">
                                {getButtonContent()}
                                <span
                                    className={cn(css.chevronSeparator, {
                                        [css.chevronRotated]: isOpen,
                                    })}
                                >
                                    <Icon name="arrow-chevron-down" size="sm" />
                                </span>
                            </Box>
                        </Button>
                    }
                >
                    <MenuItem
                        id="csv"
                        label="Export as CSV"
                        onAction={handleExportCSV}
                    />
                    <MenuItem
                        id="pdf"
                        label="Export as PDF"
                        onAction={handleExportPDF}
                    />
                </Menu>
            </Box>
        </div>
    )
}
