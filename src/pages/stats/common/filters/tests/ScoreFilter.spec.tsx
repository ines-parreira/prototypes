import {fireEvent, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import React from 'react'

import {SegmentEvent, logEvent} from 'common/segment'
import {withLogicalOperator} from 'models/reporting/queryFactories/utils'
import {FilterKey} from 'models/stat/types'
import {
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    FILTER_VALUE_PLACEHOLDER,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import {FilterLabels} from 'pages/stats/common/filters/constants'
import {
    MAX_SCORE_VALUE,
    ScoreFilter,
    ScoreFiltersWithSavedState,
    ScoreFiltersWithState,
} from 'pages/stats/common/filters/ScoreFilter'
import {
    getScoreLabelByValue,
    getScoreLabelsAndValues,
} from 'pages/stats/common/filters/utils'
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

const scoreLabels = getScoreLabelsAndValues(MAX_SCORE_VALUE, true).map(
    ({label: label}) => label
)

describe('ScoreFilter', () => {
    const dispatchUpdate = jest.fn()
    const dispatchStatFiltersDirty = jest.fn()
    const dispatchStatFiltersClean = jest.fn()
    const renderComponent = () =>
        renderWithStore(
            <ScoreFilter
                onRemove={mockedRemove}
                value={withLogicalOperator([])}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState
        )

    it('should render ScoreFilter component just fine if value is undefined', () => {
        renderWithStore(
            <ScoreFilter
                onRemove={mockedRemove}
                value={undefined}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState
        )
        expect(
            screen.getByText(FilterLabels[FilterKey.Score])
        ).toBeInTheDocument()
        expect(screen.getByText(FILTER_VALUE_PLACEHOLDER)).toBeTruthy()
    })

    it('should render ScoreFilter component', () => {
        renderComponent()
        expect(
            screen.getByText(FilterLabels[FilterKey.Score])
        ).toBeInTheDocument()
        expect(screen.getByText(FILTER_VALUE_PLACEHOLDER)).toBeTruthy()
    })

    it('should open the select component and contain all star labels', () => {
        renderComponent()
        fireEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        const starElements = screen.getAllByText(/[★☆]+/)

        const ratings = starElements.map((element) => element.textContent)
        const starCounts = ratings.map(
            (rating) => (rating?.match(/★/g) || []).length
        )

        scoreLabels.forEach((starLabel) => {
            expect(screen.getByText(starLabel)).toBeInTheDocument()
        })
        expect(starCounts).toHaveLength(MAX_SCORE_VALUE)
    })

    it('should dispatch the right actions on options selection', () => {
        const numberOfStars = 5
        renderComponent()
        expect(
            screen.queryByText(
                getScoreLabelByValue(numberOfStars, MAX_SCORE_VALUE)
            )
        ).toBeFalsy()
        fireEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        fireEvent.click(
            screen.getByText(
                getScoreLabelByValue(numberOfStars, MAX_SCORE_VALUE)
            )
        )
        expect(dispatchUpdate).toHaveBeenCalledWith(
            withLogicalOperator([`${numberOfStars}`])
        )
    })

    it('should dispatch the right actions on options deselection', () => {
        const numberOfStars = 5
        renderComponent().rerenderComponent(
            <ScoreFilter
                onRemove={mockedRemove}
                value={withLogicalOperator([`${numberOfStars}`])}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState
        )
        fireEvent.click(
            screen.getByText(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF])
        )
        fireEvent.click(
            screen.getAllByText(
                getScoreLabelByValue(numberOfStars, MAX_SCORE_VALUE)
            )[1]
        )
        expect(dispatchUpdate).toHaveBeenCalledWith(withLogicalOperator([]))
    })

    it('should dispatch the right action on deselect all', () => {
        const {rerenderComponent} = renderComponent()
        fireEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        fireEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withLogicalOperator(
                Array.from({length: MAX_SCORE_VALUE})
                    .fill(undefined)
                    .map((_, index) => `${MAX_SCORE_VALUE - index}`)
            )
        )
        rerenderComponent(
            <ScoreFilter
                onRemove={mockedRemove}
                value={withLogicalOperator([`5`, `4`, `3`])}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState
        )
        fireEvent.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))
        expect(dispatchUpdate).toHaveBeenCalledWith(withLogicalOperator([]))
    })

    it('should remove the Score filter', () => {
        renderComponent()
        fireEvent.click(screen.getByText('close'))

        expect(dispatchUpdate).toHaveBeenCalledWith(withLogicalOperator([]))
        expect(mockedRemove).toHaveBeenCalled()
    })

    it('should change selection of logical operator when one of the options is clicked', () => {
        renderComponent()
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        const isOneOfRadioLabel = screen.getByLabelText(
            new RegExp(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF], 'i')
        )
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

        userEvent.click(isOneOfRadioLabel)

        expect(dispatchUpdate).toHaveBeenCalledWith({
            operator: LogicalOperatorEnum.NOT_ONE_OF,
            values: [],
        })
    })

    it('should dispatch cleanFilters action and call segment analytics log event on filter dropdown close', () => {
        const numberOfStars = 5
        const {rerenderComponent} = renderComponent()

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(
            screen.getByText(
                getScoreLabelByValue(numberOfStars, MAX_SCORE_VALUE)
            )
        )
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        rerenderComponent(
            <ScoreFilter
                onRemove={mockedRemove}
                value={withLogicalOperator([`${numberOfStars}`])}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState
        )

        expect(dispatchStatFiltersClean).toHaveBeenCalledWith()
        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: FilterKey.Score,
            logical_operator:
                LogicalOperatorLabel[
                    LogicalOperatorEnum.ONE_OF
                ].toLocaleLowerCase(),
        })
    })

    describe('ScoreFiltersWithState', () => {
        it('should render ScoreFiltersWithState component', () => {
            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator'
            )
            renderWithStore(<ScoreFiltersWithState />, defaultState)
            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

            expect(
                screen.getByText(FilterLabels[FilterKey.Score])
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()
        })
    })

    describe('ScoreFiltersWithSavedState', () => {
        it('should render ScoreFiltersWithSavedState component', () => {
            const spy = jest.spyOn(filtersSlice, 'upsertSavedFilterFilter')

            renderWithStore(<ScoreFiltersWithSavedState />, defaultState)
            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

            expect(
                screen.getByText(FilterLabels[FilterKey.Score])
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()
        })
    })
})
