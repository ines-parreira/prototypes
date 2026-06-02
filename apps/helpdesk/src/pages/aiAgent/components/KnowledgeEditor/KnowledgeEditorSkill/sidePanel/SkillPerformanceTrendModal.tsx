import { useMemo, useRef, useState } from 'react'

import type { ZonedDateTime } from '@internationalized/date'
import { DashboardExportButton } from '@repo/reporting'
import {
    DateTimeFormatMapper,
    DateTimeFormatType,
    formatDatetime,
} from '@repo/utils'
import moment from 'moment-timezone'
import type { Moment } from 'moment-timezone'

import type { DatePickerPreset } from '@gorgias/axiom'
import {
    Box,
    Button,
    DateRangePicker,
    Modal,
    OverlayContent,
    OverlayHeader,
} from '@gorgias/axiom'

import {
    SkillPerformanceDataProvider,
    useSkillPerformanceFromContext,
} from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillPerformanceFromContext'
import { useSkillPerformanceTrendExport } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillPerformanceTrendExport'
import {
    createRangeValueFromMoments,
    extractMomentsFromRange,
} from 'pages/aiAgent/KnowledgeHub/Table/dateConversion'

import { SkillPerformanceChart } from './SkillPerformanceChart'
import { SkillPerformanceKpiCards } from './SkillPerformanceKpiCards'

type Props = {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
}

const TREND_MODAL_DATE_PRESETS: DatePickerPreset[] = [
    { id: 'last-7-days', label: 'Last 7 days', duration: { days: -7 } },
    { id: 'last-28-days', label: 'Last 28 days', duration: { days: -28 } },
    { id: 'last-90-days', label: 'Last 90 days', duration: { days: -90 } },
]

const SHORT_DATE_FORMAT =
    DateTimeFormatMapper[DateTimeFormatType.SHORT_DATE_EN_US]

const getDefaultDateRange = (): {
    start: ZonedDateTime
    end: ZonedDateTime
} | null =>
    createRangeValueFromMoments(
        moment().subtract(28, 'days').startOf('day'),
        moment().startOf('day'),
    )

const findMatchingPreset = (
    start: Moment | null,
    end: Moment | null,
): DatePickerPreset | null => {
    if (!start || !end) return null
    const today = moment().startOf('day')
    return (
        TREND_MODAL_DATE_PRESETS.find((preset) => {
            const presetStart = today
                .clone()
                .add(preset.duration.days ?? 0, 'days')
            return start.isSame(presetStart, 'day') && end.isSame(today, 'day')
        }) ?? null
    )
}

const getDateRangeLabel = (
    range: { start: ZonedDateTime; end: ZonedDateTime } | null,
): string => {
    if (!range) return 'Select date range'
    const { start, end } = extractMomentsFromRange(range)
    if (!start || !end) return 'Select date range'

    const preset = findMatchingPreset(start, end)
    if (preset) return preset.label

    return `${formatDatetime(start, SHORT_DATE_FORMAT)} – ${formatDatetime(end, SHORT_DATE_FORMAT)}`
}

const PDF_EXPORT_FILE_NAME = 'skill-performance-trend'

export const SkillPerformanceTrendModal = ({ isOpen, onOpenChange }: Props) => {
    const [dateRange, setDateRange] = useState(getDefaultDateRange)
    const contentRef = useRef<HTMLDivElement>(null)

    const dateRangeLabel = useMemo(
        () => getDateRangeLabel(dateRange),
        [dateRange],
    )

    const dateRangeOverride = useMemo<
        { start_datetime: string; end_datetime: string } | undefined
    >(() => {
        if (!dateRange) return undefined
        const { start, end } = extractMomentsFromRange(dateRange)
        if (!start || !end) return undefined
        return {
            start_datetime: start.startOf('day').format(),
            end_datetime: end.endOf('day').format(),
        }
    }, [dateRange])

    const performanceData = useSkillPerformanceFromContext({
        dateRangeOverride,
    })

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
            <OverlayHeader title="Skill performance" />
            <OverlayContent>
                <SkillPerformanceDataProvider value={performanceData}>
                    <Box flexDirection="column" gap="md" width="100%">
                        <Box
                            justifyContent="flex-end"
                            alignItems="center"
                            gap="xs"
                            mt="xs"
                            width="fit-content"
                            alignSelf="flex-end"
                        >
                            <DateRangePicker
                                value={dateRange}
                                onChange={setDateRange}
                                presets={TREND_MODAL_DATE_PRESETS}
                                aria-label="Skill performance date range"
                                trigger={
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        trailingSlot="arrow-chevron-down"
                                    >
                                        {dateRangeLabel}
                                    </Button>
                                }
                            />
                            <DashboardExportButton
                                contentRef={contentRef}
                                useCsvExport={useSkillPerformanceTrendExport}
                                pdfFileName={PDF_EXPORT_FILE_NAME}
                                size="sm"
                            />
                        </Box>
                        {/* The ref-bound region is what gets snapshotted to PDF. */}
                        <Box ref={contentRef} flexDirection="column" gap="md">
                            <SkillPerformanceKpiCards />
                            <SkillPerformanceChart />
                        </Box>
                    </Box>
                </SkillPerformanceDataProvider>
            </OverlayContent>
        </Modal>
    )
}
