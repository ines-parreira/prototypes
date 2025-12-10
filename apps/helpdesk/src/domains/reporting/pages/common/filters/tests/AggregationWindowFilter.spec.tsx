import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { userEvent } from '@repo/testing'
import { act, screen } from '@testing-library/react'

import { FilterKey } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import {
    AggregationWindowFilter,
    AggregationWindowFilterWithState,
} from 'domains/reporting/pages/common/filters/AggregationWindowFilter'
import { ReportingGranularityLabels } from 'domains/reporting/pages/common/filters/constants'
import * as statsSlice from 'domains/reporting/state/stats/statsSlice'
import * as filtersSlice from 'domains/reporting/state/ui/stats/filtersSlice'
import {
    FILTER_DROPDOWN_ICON,
    FILTER_VALUE_PLACEHOLDER,
} from 'pages/common/forms/FilterInput/constants'
import type { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { StatFilterSelected: 'stat-filter-selected' },
}))

describe('AggregationWindowFilter', () => {
    const defaultState = {
        stats: statsSlice.initialState,
        ui: {
            stats: {
                filters: filtersSlice.initialState,
            },
        },
    } as RootState
    const period = {
        start_datetime: '1970-01-01T00:00:00+00:00',
        end_datetime: '1970-02-01T00:00:00+00:00',
    }
    const dispatchUpdate = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Normal mode', () => {
        it('should render available aggregations', () => {
            renderWithStore(
                <AggregationWindowFilter
                    period={period}
                    dispatchUpdate={dispatchUpdate}
                />,
                defaultState,
            )

            userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))

            const allowedAggregationWindows = [
                ReportingGranularity.Day,
                ReportingGranularity.Week,
                ReportingGranularity.Month,
            ]
            allowedAggregationWindows.forEach((granularity) => {
                expect(
                    screen.getByRole('option', {
                        name: new RegExp(
                            ReportingGranularityLabels[granularity],
                        ),
                    }),
                ).toBeInTheDocument()
            })
        })

        it('should update selectedMetric in state on selection', () => {
            const aggregation = ReportingGranularity.Week

            renderWithStore(
                <AggregationWindowFilter
                    period={period}
                    dispatchUpdate={dispatchUpdate}
                />,
                defaultState,
            )

            userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
            userEvent.click(
                screen.getByText(ReportingGranularityLabels[aggregation]),
            )

            expect(dispatchUpdate).toHaveBeenCalledWith(aggregation)
        })

        it('should call segment analytics log event on filter dropdown close', () => {
            renderWithStore(
                <AggregationWindowFilter
                    period={statsSlice.defaultStatsFilters.period}
                    dispatchUpdate={dispatchUpdate}
                />,
                defaultState,
            )

            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.StatFilterSelected,
                {
                    name: FilterKey.AggregationWindow,
                    logical_operator: null,
                },
            )
        })
    })

    describe('Compact mode', () => {
        it('should render in compact mode with correct labels', () => {
            const value = ReportingGranularity.Week
            const { container } = renderWithStore(
                <AggregationWindowFilter
                    period={period}
                    dispatchUpdate={dispatchUpdate}
                    value={value}
                    compact
                />,
                defaultState,
            )

            const compactTrigger = container.querySelector('.compactTrigger')
            expect(compactTrigger).toBeInTheDocument()
            expect(compactTrigger?.textContent).toContain('Aggregation')
            expect(compactTrigger?.textContent).toContain(
                ReportingGranularityLabels[value],
            )
        })

        it('should open Select dropdown and show available aggregations in compact mode', async () => {
            const value = ReportingGranularity.Week
            const { container } = renderWithStore(
                <AggregationWindowFilter
                    period={period}
                    dispatchUpdate={dispatchUpdate}
                    value={value}
                    compact
                />,
                defaultState,
            )

            const trigger = container.querySelector(
                '[data-name="select-trigger"]',
            )
            expect(trigger).toBeInTheDocument()

            await act(async () => {
                await userEvent.click(trigger!)
            })

            const allowedAggregationWindows = [
                ReportingGranularity.Day,
                ReportingGranularity.Week,
                ReportingGranularity.Month,
            ]

            allowedAggregationWindows.forEach((granularity) => {
                expect(
                    screen.getByRole('option', {
                        name: ReportingGranularityLabels[granularity],
                    }),
                ).toBeInTheDocument()
            })
        })

        it('should update state when selecting an aggregation in compact mode', async () => {
            const initialValue = ReportingGranularity.Week
            const newAggregation = ReportingGranularity.Day

            const { container } = renderWithStore(
                <AggregationWindowFilter
                    period={period}
                    dispatchUpdate={dispatchUpdate}
                    value={initialValue}
                    compact
                />,
                defaultState,
            )

            const trigger = container.querySelector(
                '[data-name="select-trigger"]',
            )
            expect(trigger).toBeInTheDocument()

            await act(async () => {
                await userEvent.click(trigger!)
            })

            await act(async () => {
                await userEvent.click(
                    screen.getByRole('option', {
                        name: ReportingGranularityLabels[newAggregation],
                    }),
                )
            })

            expect(dispatchUpdate).toHaveBeenCalledWith(newAggregation)
        })

        it('should log analytics event when selecting in compact mode', async () => {
            const initialValue = ReportingGranularity.Week
            const newAggregation = ReportingGranularity.Month

            const { container } = renderWithStore(
                <AggregationWindowFilter
                    period={period}
                    dispatchUpdate={dispatchUpdate}
                    value={initialValue}
                    compact
                />,
                defaultState,
            )

            const trigger = container.querySelector(
                '[data-name="select-trigger"]',
            )
            expect(trigger).toBeInTheDocument()

            await act(async () => {
                await userEvent.click(trigger!)
            })

            await act(async () => {
                await userEvent.click(
                    screen.getByRole('option', {
                        name: ReportingGranularityLabels[newAggregation],
                    }),
                )
            })

            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.StatFilterSelected,
                {
                    name: FilterKey.AggregationWindow,
                    logical_operator: null,
                },
            )
        })

        it('should display selected value in compact mode', () => {
            const value = ReportingGranularity.Month
            const { container } = renderWithStore(
                <AggregationWindowFilter
                    period={period}
                    dispatchUpdate={dispatchUpdate}
                    value={value}
                    compact
                />,
                defaultState,
            )

            const compactValue = container.querySelector('.compactValue')
            expect(compactValue).toBeInTheDocument()
            expect(compactValue?.textContent).toBe(
                ReportingGranularityLabels[value],
            )
        })

        it('should handle null selectedItem gracefully in compact mode', () => {
            renderWithStore(
                <AggregationWindowFilter
                    period={period}
                    dispatchUpdate={dispatchUpdate}
                    value={undefined}
                    compact
                />,
                defaultState,
            )

            expect(screen.getByText('Aggregation')).toBeInTheDocument()
        })
    })

    describe('AggregationWindowFilterWithState', () => {
        it('should call dispatchUpdate', () => {
            const aggregation = ReportingGranularity.Hour
            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator',
            )
            renderWithStore(<AggregationWindowFilterWithState />, defaultState)

            userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
            userEvent.click(
                screen.getByRole('option', {
                    name: new RegExp(ReportingGranularityLabels[aggregation]),
                }),
            )

            expect(spy).toHaveBeenCalled()
        })

        it('should work in compact mode with state', () => {
            const stateWithCompactValue = {
                ...defaultState,
                stats: {
                    ...statsSlice.initialState,
                    filters: {
                        ...statsSlice.initialState.filters,
                    },
                },
                ui: {
                    stats: {
                        filters: {
                            ...filtersSlice.initialState,
                            aggregationWindow: ReportingGranularity.Day,
                        },
                    },
                },
            } as unknown as RootState

            const { container } = renderWithStore(
                <AggregationWindowFilterWithState compact />,
                stateWithCompactValue,
            )

            const trigger = container.querySelector(
                '[data-name="select-trigger"]',
            )
            expect(trigger).toBeInTheDocument()

            const compactTrigger = container.querySelector('.compactTrigger')
            expect(compactTrigger).toBeInTheDocument()

            const compactLabel = container.querySelector('.compactLabel')
            expect(compactLabel).toBeInTheDocument()
            expect(compactLabel?.textContent).toBe('Aggregation')
        })
    })
})
