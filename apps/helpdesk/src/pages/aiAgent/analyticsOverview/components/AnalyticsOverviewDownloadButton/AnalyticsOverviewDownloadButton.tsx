import type { RefObject } from 'react'
import { useRef, useState } from 'react'

import cn from 'classnames'
import moment from 'moment'

import { Box, Button, ButtonSize, Icon, IconName } from '@gorgias/axiom'

import { useExportDashboardToPDF } from 'pages/aiAgent/analyticsOverview/hooks/useExportDashboardToPDF'
import {
    ExportFormat,
    useAiAgentAnalyticsDashboardTracking,
} from 'pages/aiAgent/hooks/useAiAgentAnalyticsDashboardTracking'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

import css from './AnalyticsOverviewDownloadButton.less'

type CsvExportHook = {
    triggerDownload: () => Promise<void>
    isLoading: boolean
}

type AnalyticsOverviewDownloadButtonProps = {
    contentRef: RefObject<HTMLElement>
    useCsvExport: () => CsvExportHook
    pdfFileName?: string
}

export const AnalyticsOverviewDownloadButton = ({
    contentRef,
    useCsvExport,
    pdfFileName,
}: AnalyticsOverviewDownloadButtonProps) => {
    const { onExport } = useAiAgentAnalyticsDashboardTracking()

    const buttonRef = useRef<HTMLButtonElement>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [isExporting, setIsExporting] = useState(false)

    const { exportToPDF, isLoading: isPdfLoading } = useExportDashboardToPDF()
    const { triggerDownload: exportToCSV, isLoading: isCsvLoading } =
        useCsvExport()

    const isDataLoading = isCsvLoading
    const isExportInProgress = isPdfLoading || isExporting

    const handleExportCSV = async () => {
        onExport({ format: ExportFormat.PDF })
        setIsExporting(true)
        try {
            await exportToCSV()
        } finally {
            setIsExporting(false)
        }
    }

    const handleExportPDF = async () => {
        const filename = pdfFileName
            ? `${pdfFileName}-${moment().format('YYYY-MM-DD')}.pdf`
            : undefined
        await exportToPDF(contentRef, filename)
    }

    const getButtonContent = () => {
        if (isExportInProgress) {
            return 'Exporting...'
        }
        return 'Export'
    }

    return (
        <div data-pdf-exclude>
            <Box className={css.buttonWrapper}>
                <Button
                    ref={buttonRef}
                    variant="primary"
                    size={ButtonSize.Md}
                    onClick={() => setIsOpen(!isOpen)}
                    isDisabled={isDataLoading || isExportInProgress}
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
