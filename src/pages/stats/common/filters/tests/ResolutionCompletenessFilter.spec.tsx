import {fireEvent, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import {SegmentEvent, logEvent} from 'common/segment'
import {withLogicalOperator} from 'models/reporting/queryFactories/utils'
import {FilterKey} from 'models/stat/types'
import {
    FILTER_CLEAR_ICON,
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    FILTER_VALUE_PLACEHOLDER,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import {FilterLabels} from 'pages/stats/common/filters/constants'
import {
    ResolutionCompletenessFilter,
    ResolutionCompletenessFilterWithState,
} from 'pages/stats/common/filters/ResolutionCompletenessFilter'
import * as statsSlice from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import * as filtersSlice from 'state/ui/stats/filtersSlice'
import {renderWithStore} from 'utils/testing'

const mockedRemove = jest.fn()

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {StatFilterSelected: 'stat-filter-selected'},
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
    const dispatchStatFiltersDirty = jest.fn()
    const dispatchStatFiltersClean = jest.fn()

    const renderComponent = () =>
        renderWithStore(
            <ResolutionCompletenessFilter
                onRemove={mockedRemove}
                value={withLogicalOperator([])}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState
        )

    it('should render ResolutionCompletenessFilter component just fine if value is undefined', () => {
        renderWithStore(
            <ResolutionCompletenessFilter
                onRemove={mockedRemove}
                value={undefined}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState
        )

        expect(
            screen.getByText(FilterLabels[FilterKey.ResolutionCompleteness])
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

        expect(dispatchUpdate).toHaveBeenCalledWith(withLogicalOperator([]))
        expect(mockedRemove).toHaveBeenCalled()
    })

    it('should change logical operator when clicked', () => {
        renderComponent()

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        const isNotOneOfRadioLabel = screen.getByLabelText(
            new RegExp(
                LogicalOperatorLabel[LogicalOperatorEnum.NOT_ONE_OF],
                'i'
            )
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
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState
        )

        fireEvent.click(
            screen.getByText(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF])
        )
        fireEvent.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

        expect(dispatchUpdate).toHaveBeenCalledWith({
            operator: LogicalOperatorEnum.ONE_OF,
            values: [],
        })
    })

    it('should dispatch the right actions on options deselection', () => {
        const {rerenderComponent} = renderComponent()

        rerenderComponent(
            <ResolutionCompletenessFilter
                onRemove={mockedRemove}
                value={withLogicalOperator(['1'])}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState
        )

        fireEvent.click(
            screen.getByText(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF])
        )
        fireEvent.click(screen.getAllByText('Complete')[1])

        expect(dispatchUpdate).toHaveBeenCalledWith(withLogicalOperator([]))
    })

    describe('ResolutionCompletenessFilterWithState', () => {
        it('should render with state and handle updates', () => {
            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator'
            )

            renderWithStore(
                <ResolutionCompletenessFilterWithState />,
                defaultState
            )

            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            userEvent.click(screen.getByText('Complete'))

            expect(
                screen.getByText(FilterLabels[FilterKey.ResolutionCompleteness])
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()
        })
    })
})
