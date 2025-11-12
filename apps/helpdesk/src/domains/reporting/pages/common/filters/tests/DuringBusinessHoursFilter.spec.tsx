import { logEvent, SegmentEvent } from '@repo/logging'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { FilterKey } from 'domains/reporting/models/stat/types'
import {
    FILTER_CLEAR_ICON,
    LogicalOperatorEnum,
} from 'domains/reporting/pages/common/components/Filter/constants'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import {
    ANYTIME_OPTION_LABEL,
    ANYTIME_OPTION_VALUE,
    DuringBusinessHoursFilter,
    DuringBusinessHoursFilterWithSavedState,
    DuringBusinessHoursFilterWithState,
    OUTSIDE_BUSINESS_HOURS_OPTION_LABEL,
    WITHIN_BUSINESS_HOURS_OPTION_LABEL,
} from 'domains/reporting/pages/common/filters/DuringBusinessHoursFilter'
import { emptyFilter } from 'domains/reporting/pages/common/filters/helpers'
import * as statsSlice from 'domains/reporting/state/stats/statsSlice'
import * as filtersSlice from 'domains/reporting/state/ui/stats/filtersSlice'
import { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { StatFilterSelected: 'stat-filter-selected' },
}))

describe('<DuringBusinessHoursFilter />', () => {
    const dispatchUpdate = jest.fn()
    const dispatchRemove = jest.fn()
    const dispatchStatFiltersDirty = jest.fn()
    const dispatchStatFiltersClean = jest.fn()
    const onRemove = jest.fn()

    const defaultProps = {
        value: {
            values: [ANYTIME_OPTION_VALUE],
            operator: LogicalOperatorEnum.ONE_OF,
        },
        dispatchUpdate: dispatchUpdate,
        dispatchRemove: dispatchRemove,
        dispatchStatFiltersDirty: dispatchStatFiltersDirty,
        dispatchStatFiltersClean: dispatchStatFiltersClean,
        onRemove: onRemove,
    }

    const defaultState = {
        stats: statsSlice.initialState,
        ui: {
            stats: {
                filters: filtersSlice.initialState,
            },
        },
    } as RootState

    it('should render correctly', () => {
        render(<DuringBusinessHoursFilter {...defaultProps} />)

        expect(
            screen.getByText(FilterLabels[FilterKey.IsDuringBusinessHours]),
        ).toBeInTheDocument()
        expect(screen.getByText('Anytime')).toBeInTheDocument()
    })

    it('should dispatch update action on selecting an option', () => {
        render(<DuringBusinessHoursFilter {...defaultProps} />)

        fireEvent.click(screen.getByText(ANYTIME_OPTION_LABEL))
        fireEvent.click(screen.getByText(WITHIN_BUSINESS_HOURS_OPTION_LABEL))

        expect(dispatchUpdate).toHaveBeenCalledWith({
            operator: LogicalOperatorEnum.ONE_OF,
            values: ['1'],
        })
    })

    it('should display correct selected option', () => {
        const { rerender } = render(
            <DuringBusinessHoursFilter {...defaultProps} />,
        )

        expect(screen.getByText(ANYTIME_OPTION_LABEL)).toBeInTheDocument()

        rerender(
            <DuringBusinessHoursFilter
                {...defaultProps}
                value={{
                    values: ['1'],
                    operator: LogicalOperatorEnum.ONE_OF,
                }}
            />,
        )
        expect(
            screen.getByText(WITHIN_BUSINESS_HOURS_OPTION_LABEL),
        ).toBeInTheDocument()

        rerender(
            <DuringBusinessHoursFilter
                {...defaultProps}
                value={{
                    values: ['0'],
                    operator: LogicalOperatorEnum.ONE_OF,
                }}
            />,
        )
        expect(screen.getByText('Outside business hours')).toBeInTheDocument()
    })

    it('should handle remove action correctly', () => {
        render(<DuringBusinessHoursFilter {...defaultProps} />)

        fireEvent.click(screen.getByText(new RegExp(FILTER_CLEAR_ICON, 'i')))

        expect(dispatchRemove).toHaveBeenCalled()
        expect(onRemove).toHaveBeenCalled()
    })

    it('should dispatch dirty action on dropdown open and clean action on dropdown close', () => {
        render(<DuringBusinessHoursFilter {...defaultProps} />)

        fireEvent.click(screen.getByText(ANYTIME_OPTION_LABEL))
        expect(dispatchStatFiltersDirty).toHaveBeenCalled()

        fireEvent.click(screen.getAllByText(ANYTIME_OPTION_LABEL)[0])
        expect(dispatchStatFiltersClean).toHaveBeenCalled()
        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: FilterKey.IsDuringBusinessHours,
            logical_operator: null,
        })
    })

    it('should handle "Remove" correctly', () => {
        render(
            <DuringBusinessHoursFilter
                {...defaultProps}
                value={{
                    values: ['1'],
                    operator: LogicalOperatorEnum.ONE_OF,
                }}
            />,
        )

        expect(
            screen.getByText(WITHIN_BUSINESS_HOURS_OPTION_LABEL),
        ).toBeInTheDocument()

        fireEvent.click(screen.getByText(WITHIN_BUSINESS_HOURS_OPTION_LABEL))
        fireEvent.click(screen.getByText(new RegExp(FILTER_CLEAR_ICON, 'i')))

        expect(dispatchRemove).toHaveBeenCalled()
        expect(onRemove).toHaveBeenCalled()
    })

    describe('DuringBusinessHoursFilterWithState', () => {
        it('should pass dispatch action', () => {
            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator',
            )

            const { getByText } = renderWithStore(
                <DuringBusinessHoursFilterWithState />,
                defaultState,
            )

            fireEvent.click(getByText(ANYTIME_OPTION_LABEL))
            fireEvent.click(getByText(WITHIN_BUSINESS_HOURS_OPTION_LABEL))

            expect(
                getByText(FilterLabels[FilterKey.IsDuringBusinessHours]),
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()

            fireEvent.click(getByText(new RegExp(FILTER_CLEAR_ICON, 'i')))
            expect(spy).toHaveBeenCalledWith({
                [FilterKey.IsDuringBusinessHours]: emptyFilter,
            })
        })
    })

    describe('DuringBusinessHoursFilterWithSavedState', () => {
        it('should pass dispatch action', () => {
            const spy = jest.spyOn(filtersSlice, 'upsertSavedFilterFilter')
            const removeSpy = jest.spyOn(
                filtersSlice,
                'removeFilterFromSavedFilterDraft',
            )

            renderWithStore(
                <DuringBusinessHoursFilterWithSavedState />,
                defaultState,
            )
            fireEvent.click(screen.getByText(ANYTIME_OPTION_LABEL))
            fireEvent.click(
                screen.getByText(OUTSIDE_BUSINESS_HOURS_OPTION_LABEL),
            )

            expect(
                screen.getByText(FilterLabels[FilterKey.IsDuringBusinessHours]),
            ).toBeInTheDocument()
            waitFor(() => {
                expect(spy).toHaveBeenCalledWith({
                    member: FilterKey.IsDuringBusinessHours,
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['0'],
                })
            })

            fireEvent.click(
                screen.getByText(new RegExp(FILTER_CLEAR_ICON, 'i')),
            )

            expect(removeSpy).toHaveBeenCalledWith({
                filterKey: FilterKey.IsDuringBusinessHours,
            })
        })
    })
})
