import type { Dispatch, SetStateAction } from 'react'
import { useMemo, useState } from 'react'

import { parseAbsolute } from '@internationalized/date'
import type { ZonedDateTime } from '@internationalized/date'
import { DateAndTimeFormatting } from '@repo/utils'
import moment from 'moment'
import type { Moment } from 'moment'

import type { DatePickerPreset } from '@gorgias/axiom'
import {
    Box,
    DateRangePicker,
    Icon,
    OverflowList,
    OverflowListItem,
    OverflowListShowLess,
    OverflowListShowMore,
} from '@gorgias/axiom'

import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import {
    END_OF_TODAY_DATE,
    INTERACTION_FILTER_OPTIONS,
    MIN_RANGE_DATE,
    STATUS_FILTERS,
} from 'timeline/constants'
import { getTypeOptionLabels } from 'timeline/filters/helpers/interactionFilter'
import { getRangeLabel } from 'timeline/filters/helpers/rangeFilter'
import { getOptionLabels } from 'timeline/filters/helpers/statusFilter'
import type { FilterKey, InteractionFilterType, Range } from 'timeline/types'

import type { SortOption } from '../hooks/useTimelineData'
import { FilteringButton } from './FilteringButton'
import { FilterTag } from './FilterTag'
import { SortingButton } from './SortingButton'

type FilterType = 'dateRange' | 'interactionType' | 'ticketStatus'

type Props = {
    setInteractionTypeFilters: Dispatch<
        SetStateAction<Record<InteractionFilterType, boolean>>
    >
    setRangeFilter: (val: Range) => void
    toggleSelectedStatus: (status: FilterKey) => void
    selectedTypeKeys: InteractionFilterType[]
    selectedStatusKeys: FilterKey[]
    rangeFilter: Range
    sortOption: SortOption
    setSortOption: (option: SortOption) => void
}

function momentToZonedDateTime(m: Moment | null): ZonedDateTime | null {
    if (!m) return null
    const isoString = m.toISOString()
    return parseAbsolute(isoString, 'UTC')
}

function zonedDateTimeToMoment(zdt: ZonedDateTime | null): Moment | null {
    if (!zdt) return null
    return moment(zdt.toDate())
}

function createRangeValueFromMoments(
    start: Moment | null,
    end: Moment | null,
): { start: ZonedDateTime; end: ZonedDateTime } | null {
    if (!start || !end) return null

    const startZdt = momentToZonedDateTime(start)
    const endZdt = momentToZonedDateTime(end)

    if (!startZdt || !endZdt) return null

    return {
        start: startZdt,
        end: endZdt,
    }
}

function extractMomentsFromRange(
    value: {
        start: ZonedDateTime
        end: ZonedDateTime
    } | null,
): { start: Moment | null; end: Moment | null } {
    if (!value) return { start: null, end: null }

    return {
        start: zonedDateTimeToMoment(value.start),
        end: zonedDateTimeToMoment(value.end),
    }
}

// Set of preset IDs that represent single days rather than ranges
const SINGLE_DAY_PRESET_IDS = new Set(['today', 'yesterday'])

function getTimelinePresets(): DatePickerPreset[] {
    const daysFromMinDate = moment().diff(moment(MIN_RANGE_DATE), 'days')

    return [
        {
            id: 'all-time',
            label: 'All time',
            duration: { days: -daysFromMinDate },
        },
        {
            id: 'today',
            label: 'Today',
            duration: { days: 0 },
        },
        {
            id: 'yesterday',
            label: 'Yesterday',
            duration: { days: -1 },
        },
        {
            id: 'last-7-days',
            label: 'Last 7 days',
            duration: { days: -7 },
        },
        {
            id: 'last-30-days',
            label: 'Last 30 days',
            duration: { days: -30 },
        },
        {
            id: 'last-60-days',
            label: 'Last 60 days',
            duration: { days: -60 },
        },
        {
            id: 'last-3-months',
            label: 'Last 3 months',
            duration: { days: -90 },
        },
        {
            id: 'last-6-months',
            label: 'Last 6 months',
            duration: { days: -180 },
        },
        {
            id: 'last-365-days',
            label: 'Last Year',
            duration: { days: -365 },
        },
    ]
}

function detectSelectedPreset(
    startMoment: Moment,
    endMoment: Moment,
): string | null {
    const presets = getTimelinePresets()
    const now = moment()

    for (const preset of presets) {
        // For single-day presets (today, yesterday), both start and end should be on the same day
        const isSingleDay = SINGLE_DAY_PRESET_IDS.has(preset.id)
        const targetDay = now.clone().add(preset.duration.days, 'days')

        if (isSingleDay) {
            const presetStart = targetDay.clone().startOf('day')
            const presetEnd = targetDay.clone().endOf('day')

            if (
                startMoment.isSame(presetStart, 'day') &&
                endMoment.isSame(presetEnd, 'day')
            ) {
                return preset.label
            }
        } else {
            // For multi-day presets, start from the target day and end today
            const presetEnd = now.clone().endOf('day')
            const presetStart = targetDay.startOf('day')

            if (
                startMoment.isSame(presetStart, 'day') &&
                endMoment.isSame(presetEnd, 'day')
            ) {
                return preset.label
            }
        }
    }

    return null
}

export function TimelineFilters({
    setInteractionTypeFilters,
    setRangeFilter,
    toggleSelectedStatus,
    selectedTypeKeys,
    selectedStatusKeys,
    rangeFilter,
    sortOption,
    setSortOption,
}: Props) {
    const [activeFilters, setActiveFilters] = useState<Set<FilterType>>(
        new Set(['interactionType']),
    )
    const [openDropdown, setOpenDropdown] = useState<
        'filteringButton' | FilterType | null
    >(null)

    const dateFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.ShortDateWithYear,
    )

    const startMoment = rangeFilter.start
        ? moment(rangeFilter.start)
        : moment(MIN_RANGE_DATE)
    const endMoment = rangeFilter.end
        ? moment(rangeFilter.end)
        : moment(END_OF_TODAY_DATE)

    const presetLabel = useMemo(
        () => detectSelectedPreset(startMoment, endMoment),
        [startMoment, endMoment],
    )

    const rangeLabel = presetLabel || getRangeLabel(rangeFilter, dateFormat)

    const datePickerValue = useMemo(
        () => createRangeValueFromMoments(startMoment, endMoment),
        [startMoment, endMoment],
    )

    const presets = useMemo(() => getTimelinePresets(), [])

    // Handle date range change from DateRangePicker
    const handleDateRangeChange = (
        newValue: { start: ZonedDateTime; end: ZonedDateTime } | null,
    ) => {
        if (newValue) {
            const { start, end } = extractMomentsFromRange(newValue)
            let startDate = start?.startOf('day').toDate()
            let endDate = end?.endOf('day').toDate()

            // Handle single-day presets: if the range spans from a day's start to today's end,
            // and matches a single-day preset pattern, adjust to only that day
            if (start && end) {
                const now = moment()
                const isEndToday = end.isSame(now, 'day')

                // Check if this is "yesterday" preset: starts yesterday, ends today
                if (
                    isEndToday &&
                    start.isSame(now.clone().subtract(1, 'day'), 'day')
                ) {
                    // Adjust to only show yesterday
                    endDate = start.clone().endOf('day').toDate()
                }
                // Check if this is "today" preset: starts today, ends today
                else if (isEndToday && start.isSame(now, 'day')) {
                    // Already correct for today
                }
            }

            if (
                startDate?.valueOf() === MIN_RANGE_DATE.valueOf() &&
                endDate?.valueOf() === END_OF_TODAY_DATE.valueOf()
            ) {
                setRangeFilter({ start: null, end: null })
            } else if (startDate && endDate) {
                setRangeFilter({
                    start: startDate.valueOf(),
                    end: endDate.valueOf(),
                })
            }
        } else {
            setRangeFilter({ start: null, end: null })
        }
    }

    // Handle filter selection from the main Filter button
    const handleFilterSelect = (filterType: FilterType) => {
        setActiveFilters((prev) => new Set(prev).add(filterType))
        // Close the FilteringButton dropdown and open the selected filter's dropdown
        setOpenDropdown(filterType)
    }

    // Handle filter removal
    const handleRemoveFilter = (filterType: FilterType) => {
        setActiveFilters((prev) => {
            const newSet = new Set(prev)
            newSet.delete(filterType)
            return newSet
        })

        // Reset filter values when removed
        if (filterType === 'dateRange') {
            setRangeFilter({ start: null, end: null })
        } else if (filterType === 'interactionType') {
            // Reset to show both tickets and orders
            setInteractionTypeFilters({ ticket: true, order: true })
        } else if (filterType === 'ticketStatus') {
            // Reset to show all statuses - toggle any that are not currently selected
            STATUS_FILTERS.forEach((filter) => {
                if (!selectedStatusKeys.includes(filter.value)) {
                    toggleSelectedStatus(filter.value)
                }
            })
        }
    }

    // Get label for interaction type filter tag
    const getInteractionTypeLabel = () => {
        const labels = getTypeOptionLabels(selectedTypeKeys)
        // Show "All interactions" only when both Tickets and Orders are selected
        if (
            selectedTypeKeys.length === INTERACTION_FILTER_OPTIONS.length ||
            (labels.length === 1 && labels[0] === 'All')
        ) {
            return 'All interactions'
        }
        return labels.join(', ')
    }

    // Get label for ticket status filter tag
    const getTicketStatusLabel = () => {
        const labels = getOptionLabels(selectedStatusKeys)
        // Show "All statuses" only when all status options are selected
        if (
            selectedStatusKeys.length === STATUS_FILTERS.length ||
            (labels.length === 1 && labels[0] === 'All')
        ) {
            return 'All statuses'
        }
        return labels.join(', ')
    }

    return (
        <Box alignItems="center" gap="xxs" flexDirection="row">
            <OverflowList nonExpandedLineCount={1}>
                <OverflowListItem>
                    <Box>
                        <SortingButton
                            sortOption={sortOption}
                            onSortChange={setSortOption}
                        />
                        <FilteringButton
                            onFilterSelect={handleFilterSelect}
                            activeFilters={activeFilters}
                            isOpen={openDropdown === 'filteringButton'}
                            onOpenChange={(isOpen) =>
                                setOpenDropdown(
                                    isOpen ? 'filteringButton' : null,
                                )
                            }
                        />
                    </Box>
                </OverflowListItem>
                {activeFilters.has('dateRange') && (
                    <OverflowListItem>
                        <div>
                            <DateRangePicker
                                value={datePickerValue}
                                onChange={handleDateRangeChange}
                                presets={presets}
                                aria-label="Timeline date range picker"
                                isOpen={openDropdown === 'dateRange'}
                                onOpenChange={(isOpen) =>
                                    setOpenDropdown(isOpen ? 'dateRange' : null)
                                }
                                trigger={(renderProps) => {
                                    // Filter out React-specific props that shouldn't go to DOM
                                    const {
                                        state,
                                        isOpen: __isOpen,
                                        isFocusWithin: __isFocusWithin,
                                        isFocusVisible: __isFocusVisible,
                                        isDisabled: __isDisabled,
                                        isReadOnly: __isReadOnly,
                                        isInvalid: __isInvalid,
                                        placeholder: __placeholder,
                                        timeZone: __timeZone,
                                        ...domProps
                                    } = renderProps as any

                                    return (
                                        <div
                                            style={{
                                                cursor: 'pointer',
                                            }}
                                            {...domProps}
                                            onClick={() => {
                                                // Trigger the DateRangePicker to open
                                                if (
                                                    state &&
                                                    typeof (state as any)
                                                        .open === 'function'
                                                ) {
                                                    ;(state as any).open()
                                                }
                                            }}
                                        >
                                            <FilterTag
                                                label={rangeLabel}
                                                onRemove={() =>
                                                    handleRemoveFilter(
                                                        'dateRange',
                                                    )
                                                }
                                            />
                                        </div>
                                    )
                                }}
                            />
                        </div>
                    </OverflowListItem>
                )}

                {/* Interaction Type Tag */}
                {activeFilters.has('interactionType') && (
                    <OverflowListItem>
                        <FilterTag
                            label={getInteractionTypeLabel()}
                            onRemove={() =>
                                handleRemoveFilter('interactionType')
                            }
                            isOpen={openDropdown === 'interactionType'}
                            onOpenChange={(isOpen) =>
                                setOpenDropdown(
                                    isOpen ? 'interactionType' : null,
                                )
                            }
                            sections={[
                                {
                                    id: 'interaction-type',
                                    name: 'Interaction type',
                                    items: INTERACTION_FILTER_OPTIONS.map(
                                        (opt) => ({
                                            id: opt.value,
                                            label: opt.label,
                                        }),
                                    ),
                                },
                            ]}
                            selectedItems={INTERACTION_FILTER_OPTIONS.filter(
                                (opt) => selectedTypeKeys.includes(opt.value),
                            ).map((opt) => ({
                                id: opt.value,
                                label: opt.label,
                            }))}
                            onSelect={(selected) => {
                                const newFilters = selected.reduce(
                                    (acc, item) => ({
                                        ...acc,
                                        [item.id]: true,
                                    }),
                                    { ticket: false, order: false },
                                )
                                setInteractionTypeFilters(newFilters)
                            }}
                        />
                    </OverflowListItem>
                )}

                {/* Ticket Status Tag */}
                {activeFilters.has('ticketStatus') && (
                    <OverflowListItem>
                        <FilterTag
                            label={getTicketStatusLabel()}
                            onRemove={() => handleRemoveFilter('ticketStatus')}
                            isOpen={openDropdown === 'ticketStatus'}
                            onOpenChange={(isOpen) =>
                                setOpenDropdown(isOpen ? 'ticketStatus' : null)
                            }
                            sections={[
                                {
                                    id: 'ticket-status',
                                    name: 'Ticket status',
                                    items: STATUS_FILTERS.map((opt) => ({
                                        id: opt.value,
                                        label: opt.label,
                                    })),
                                },
                            ]}
                            selectedItems={STATUS_FILTERS.filter((opt) =>
                                selectedStatusKeys.includes(opt.value),
                            ).map((opt) => ({
                                id: opt.value,
                                label: opt.label,
                            }))}
                            onSelect={(selected) => {
                                const newSelection = selected.map(
                                    (item) => item.id,
                                )
                                // Toggle each status that changed
                                STATUS_FILTERS.forEach((filter) => {
                                    const wasSelected =
                                        selectedStatusKeys.includes(
                                            filter.value,
                                        )
                                    const isSelected = newSelection.includes(
                                        filter.value,
                                    )
                                    if (wasSelected !== isSelected) {
                                        toggleSelectedStatus(filter.value)
                                    }
                                })
                            }}
                        />
                    </OverflowListItem>
                )}

                <OverflowListShowMore>
                    {({ hiddenCount }) => (
                        <Box>
                            <span>+{hiddenCount}</span>
                            <Icon name="arrow-chevron-down" size="sm" />
                        </Box>
                    )}
                </OverflowListShowMore>

                <OverflowListShowLess>
                    <Box>
                        <span>Show less</span>
                        <Icon name="arrow-chevron-up" size="sm" />
                    </Box>
                </OverflowListShowLess>
            </OverflowList>
        </Box>
    )
}
