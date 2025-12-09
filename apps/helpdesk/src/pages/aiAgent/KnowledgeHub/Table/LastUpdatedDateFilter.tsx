import { useMemo, useState } from 'react'

import type { ZonedDateTime } from '@internationalized/date'
import moment from 'moment-timezone'
import type { Moment } from 'moment-timezone'

import { DateRangePicker, FilterButton, FilterValue } from '@gorgias/axiom'

import {
    createRangeValueFromMoments,
    extractMomentsFromRange,
    getKnowledgeHubDatePresets,
} from './dateConversion'

export type LastUpdatedDateFilterProps = {
    startDate: string | null
    endDate: string | null
    onChange: (startDate: string | null, endDate: string | null) => void
    onClear: () => void
}

function getFilterValue(
    startDate: Moment | null,
    endDate: Moment | null,
    selectedPresetLabel: string | null,
): string {
    if (!startDate || !endDate) {
        return 'Select date'
    }

    if (selectedPresetLabel) {
        return selectedPresetLabel
    }

    const format = 'MMM D, YYYY'
    return `${startDate.format(format)} - ${endDate.format(format)}`
}

function detectSelectedPreset(
    startDate: Moment | null,
    endDate: Moment | null,
): string | null {
    if (!startDate || !endDate) return null

    const presets = getKnowledgeHubDatePresets()
    const now = moment().startOf('day')

    for (const preset of presets) {
        const presetEnd = now.clone()
        const presetStart = now.clone().add(preset.duration.days, 'days')

        if (
            startDate.isSame(presetStart, 'day') &&
            endDate.isSame(presetEnd, 'day')
        ) {
            return preset.label
        }
    }

    return null
}

export const LastUpdatedDateFilter = ({
    startDate,
    endDate,
    onChange,
    onClear,
}: LastUpdatedDateFilterProps) => {
    const [isPickerOpen, setIsPickerOpen] = useState(!startDate && !endDate)

    const startMoment = startDate ? moment(startDate) : null
    const endMoment = endDate ? moment(endDate) : null

    const datePickerValue = useMemo(
        () => createRangeValueFromMoments(startMoment, endMoment),
        [startMoment, endMoment],
    )

    const selectedPresetLabel = useMemo(
        () => detectSelectedPreset(startMoment, endMoment),
        [startMoment, endMoment],
    )

    const filterValue = useMemo(
        () => getFilterValue(startMoment, endMoment, selectedPresetLabel),
        [startMoment, endMoment, selectedPresetLabel],
    )

    const presets = useMemo(() => getKnowledgeHubDatePresets(), [])

    const handleDateRangeChange = (
        newValue: { start: ZonedDateTime; end: ZonedDateTime } | null,
    ) => {
        if (newValue) {
            const { start, end } = extractMomentsFromRange(newValue)
            onChange(
                start ? start.toISOString() : null,
                end ? end.toISOString() : null,
            )
            setIsPickerOpen(false)
        } else {
            onChange(null, null)
        }
    }

    const handleClear = () => {
        onClear()
    }

    return (
        <div>
            <DateRangePicker
                value={datePickerValue}
                onChange={handleDateRangeChange}
                isOpen={isPickerOpen}
                onOpenChange={setIsPickerOpen}
                presets={presets}
                aria-label="Last updated date range picker"
                trigger={(renderProps) => (
                    <FilterButton
                        label="Last updated date"
                        {...renderProps}
                        onClear={startDate || endDate ? handleClear : undefined}
                    >
                        <FilterValue value={filterValue} />
                    </FilterButton>
                )}
            />
        </div>
    )
}
