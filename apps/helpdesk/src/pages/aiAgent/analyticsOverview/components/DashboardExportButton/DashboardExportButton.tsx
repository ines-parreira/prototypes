import type { RefObject } from 'react'
import { useEffect, useRef, useState } from 'react'

import cn from 'classnames'

import { Box, Button, ButtonSize, Icon, IconName } from '@gorgias/axiom'

import { useExportDashboardToPDF } from 'pages/aiAgent/analyticsOverview/hooks/useExportDashboardToPDF'
import {
    ExportFormat,
    useAiAgentAnalyticsDashboardTracking,
} from 'pages/aiAgent/hooks/useAiAgentAnalyticsDashboardTracking'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import { reportError } from 'utils/errors'

import css from './DashboardExportButton.less'

type CsvExportHook = {
    triggerDownload: () => Promise<void>
    isLoading: boolean
}

type DashboardExportButtonProps = {
    contentRef: RefObject<HTMLElement>
    useCsvExport: () => CsvExportHook
    pdfFileName?: string
}

type LazyCsvExporterProps = {
    useCsvExport: () => CsvExportHook
    onDone: () => void
}

const LazyCsvExporter = ({ useCsvExport, onDone }: LazyCsvExporterProps) => {
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

export const DashboardExportButton = ({
    contentRef,
    useCsvExport,
    pdfFileName,
}: DashboardExportButtonProps) => {
    const { onExport } = useAiAgentAnalyticsDashboardTracking()

    const buttonRef = useRef<HTMLButtonElement>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [isCsvExporting, setIsCsvExporting] = useState(false)

    const { exportToPDF, isLoading: isPdfLoading } = useExportDashboardToPDF()

    const isExportInProgress = isPdfLoading || isCsvExporting

    const handleExportCSV = () => {
        onExport({ format: ExportFormat.CSV })
        setIsCsvExporting(true)
    }

    const handleExportPDF = async () => {
        onExport({ format: ExportFormat.PDF })
        const filename = pdfFileName
            ? `${pdfFileName}-${new Date().toISOString().slice(0, 10)}.pdf`
            : undefined
        try {
            await exportToPDF(contentRef, filename)
        } catch (error) {
            reportError(error)
        }
    }

    const getButtonContent = () => {
        if (isExportInProgress) {
            return 'Exporting...'
        }
        return 'Export'
    }

    return (
        <div data-pdf-exclude>
            {isCsvExporting && (
                <LazyCsvExporter
                    useCsvExport={useCsvExport}
                    onDone={() => setIsCsvExporting(false)}
                />
            )}
            <Box className={css.buttonWrapper}>
                <Button
                    ref={buttonRef}
                    variant="primary"
                    size={ButtonSize.Md}
                    onClick={() => setIsOpen(!isOpen)}
                    isDisabled={isExportInProgress}
                    leadingSlot={IconName.Download}
                >
                    <Box display="flex" alignItems="center">
                        {getButtonContent()}
                        <span
                            className={cn(css.chevronSeparator, {
                                [css.chevronRotated]: isOpen,
                            })}
                        >
                            <Icon name={IconName.ArrowChevronDown} size="sm" />
                        </span>
                    </Box>
                </Button>
                <Dropdown
                    isOpen={isOpen}
                    target={buttonRef}
                    onToggle={setIsOpen}
                    placement="bottom-end"
                    offset={4}
                >
                    <DropdownBody>
                        <DropdownItem
                            option={{ label: 'Export as CSV', value: 'csv' }}
                            onClick={handleExportCSV}
                            shouldCloseOnSelect
                        />
                        <DropdownItem
                            option={{ label: 'Export as PDF', value: 'pdf' }}
                            onClick={handleExportPDF}
                            shouldCloseOnSelect
                        />
                    </DropdownBody>
                </Dropdown>
            </Box>
        </div>
    )
}
