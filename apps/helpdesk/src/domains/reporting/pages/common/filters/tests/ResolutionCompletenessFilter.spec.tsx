import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { userEvent } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'

import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { FilterKey } from 'domains/reporting/models/stat/types'
import {
    FILTER_CLEAR_ICON,
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'domains/reporting/pages/common/components/Filter/constants'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import {
    ResolutionCompletenessFilter,
    ResolutionCompletenessFilterWithSavedState,
    ResolutionCompletenessFilterWithState,
} from 'domains/reporting/pages/common/filters/ResolutionCompletenessFilter'
import * as statsSlice from 'domains/reporting/state/stats/statsSlice'
import * as filtersSlice from 'domains/reporting/state/ui/stats/filtersSlice'
import { FILTER_VALUE_PLACEHOLDER } from 'pages/common/forms/FilterInput/constants'
import type { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

const mockedRemove = jest.fn()

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { StatFilterSelected: 'stat-filter-selected' },
}))

const defaultState = {
    stats: statsSlice.initialState,
    ui: {
        stats: {
            filters: filtersSlice.initialState,
        },
    },
} as RootState

describe('ResolutionCompletenessFilter', () => {
    const dispatchUpdate = jest.fn()
    const dispatchRemove = jest.fn()
    const dispatchStatFiltersDirty = jest.fn()
    const dispatchStatFiltersClean = jest.fn()

    const renderComponent = () =>
        renderWithStore(
            <ResolutionCompletenessFilter
                onRemove={mockedRemove}
                value={withLogicalOperator([])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

    it('should render ResolutionCompletenessFilter component just fine if value is undefined', () => {
        renderWithStore(
            <ResolutionCompletenessFilter
                onRemove={mockedRemove}
                value={undefined}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        expect(
            screen.getByText(FilterLabels[FilterKey.ResolutionCompleteness]),
        ).toBeInTheDocument()
        expect(screen.getByText(FILTER_VALUE_PLACEHOLDER)).toBeTruthy()
    })

    it('should render filter options when clicked', () => {
        renderComponent()

        fireEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(screen.getByText('Complete')).toBeInTheDocument()
        expect(screen.getByText('Incomplete')).toBeInTheDocument()
    })

    it('should dispatch the right actions on option selection', () => {
        renderComponent()

        fireEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        fireEvent.click(screen.getByText('Complete'))

        expect(dispatchUpdate).toHaveBeenCalledWith(withLogicalOperator(['1']))
    })

    it('should dispatch dirty and clean actions when opening/closing dropdown', () => {
        renderComponent()

        fireEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(dispatchStatFiltersDirty).toHaveBeenCalled()

        fireEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(dispatchStatFiltersClean).toHaveBeenCalled()
        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: FilterKey.ResolutionCompleteness,
            logical_operator: null,
        })
    })

    it('should remove the filter', () => {
        renderComponent()

        fireEvent.click(screen.getByText(FILTER_CLEAR_ICON))

        expect(dispatchRemove).toHaveBeenCalledWith()
        expect(mockedRemove).toHaveBeenCalled()
    })

    it('should change logical operator when clicked', () => {
        renderComponent()

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        const isNotOneOfRadioLabel = screen.getByLabelText(
            new RegExp(
                LogicalOperatorLabel[LogicalOperatorEnum.NOT_ONE_OF],
                'i',
            ),
        )

        userEvent.click(isNotOneOfRadioLabel)

        expect(dispatchUpdate).toHaveBeenCalledWith({
            operator: LogicalOperatorEnum.NOT_ONE_OF,
            values: [],
        })
    })

    it('should select all options when "Select all" is clicked', () => {
        renderComponent()

        fireEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        fireEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

        expect(dispatchUpdate).toHaveBeenCalledWith({
            operator: LogicalOperatorEnum.ONE_OF,
            values: ['1', '0'],
        })
    })

    it('should deselect all options when "Deselect all" is clicked', () => {
        renderWithStore(
            <ResolutionCompletenessFilter
                onRemove={mockedRemove}
                value={withLogicalOperator(['0', '1'])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        fireEvent.click(
            screen.getByText(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF]),
        )
        fireEvent.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

        expect(dispatchUpdate).toHaveBeenCalledWith({
            operator: LogicalOperatorEnum.ONE_OF,
            values: [],
        })
    })

    it('should dispatch the right actions on options deselection', () => {
        const { rerenderComponent } = renderComponent()

        rerenderComponent(
            <ResolutionCompletenessFilter
                onRemove={mockedRemove}
                value={withLogicalOperator(['1'])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        fireEvent.click(
            screen.getByText(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF]),
        )
        fireEvent.click(screen.getAllByText('Complete')[1])

        expect(dispatchUpdate).toHaveBeenCalledWith(withLogicalOperator([]))
    })

    describe('ResolutionCompletenessFilterWithState', () => {
        it('should render with state and handle updates', () => {
            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator',
            )

            renderWithStore(
                <ResolutionCompletenessFilterWithState />,
                defaultState,
            )

            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            userEvent.click(screen.getByText('Complete'))

            expect(
                screen.getByText(
                    FilterLabels[FilterKey.ResolutionCompleteness],
                ),
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()

            fireEvent.click(screen.getByText(FILTER_CLEAR_ICON))
            expect(spy).toHaveBeenCalledWith({
                [FilterKey.ResolutionCompleteness]: withLogicalOperator([]),
            })
        })
    })

    describe('ResolutionCompletenessFilterWithSavedState', () => {
        it('should render ResolutionCompletenessFilterWithSavedState component', () => {
            const spy = jest.spyOn(filtersSlice, 'upsertSavedFilterFilter')
            const removeSpy = jest.spyOn(
                filtersSlice,
                'removeFilterFromSavedFilterDraft',
            )

            renderWithStore(
                <ResolutionCompletenessFilterWithSavedState />,
                defaultState,
            )
            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

            expect(
                screen.getByText(
                    FilterLabels[FilterKey.ResolutionCompleteness],
                ),
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()

            fireEvent.click(screen.getByText(FILTER_CLEAR_ICON))
            expect(removeSpy).toHaveBeenCalledWith({
                filterKey: FilterKey.ResolutionCompleteness,
            })
        })
    })
})
