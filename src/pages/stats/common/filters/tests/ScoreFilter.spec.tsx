import React from 'react'
import {fireEvent, screen} from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import {
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    FILTER_VALUE_PLACEHOLDER,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import {
    initialState,
    mergeStatsFiltersWithLogicalOperator,
} from 'state/stats/statsSlice'
import {renderWithStore} from 'utils/testing'
import {withLogicalOperator} from 'models/reporting/queryFactories/utils'
import {FilterLabels} from 'pages/stats/common/filters/constants'
import {FilterKey} from 'models/stat/types'
import {STAT_FILTERS_CLEAN} from 'state/ui/stats/constants'
import {SegmentEvent, logEvent} from 'common/segment'
import {
    MAX_SCORE_VALUE,
    ScoreFilter,
    ScoreFiltersWithState,
} from 'pages/stats/common/filters/ScoreFilter'
import {
    getScoreLabelByValue,
    getScoreLabelsAndValues,
} from 'pages/stats/common/filters/utils'

const mockedDispatch = jest.fn()
const mockedRemove = jest.fn()

jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {StatFilterSelected: 'stat-filter-selected'},
}))

const defaultState = {
    stats: initialState,
}

const dispatchChangeValuePayload = (
    values: string[],
    operator = LogicalOperatorEnum.ONE_OF
) =>
    mergeStatsFiltersWithLogicalOperator({
        score: {
            values,
            operator,
        },
    })

const scoreLabels = getScoreLabelsAndValues(MAX_SCORE_VALUE, true).map(
    ({label: label}) => label
)

describe('ScoreFilter', () => {
    const renderComponent = () =>
        renderWithStore(
            <ScoreFilter
                onRemove={mockedRemove}
                value={withLogicalOperator([])}
            />,
            defaultState
        )

    it('should render ScoreFilter component just fine if value is undefined', () => {
        renderWithStore(
            <ScoreFilter onRemove={mockedRemove} value={undefined} />,
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
        expect(mockedDispatch).toHaveBeenCalledWith(
            dispatchChangeValuePayload([`${numberOfStars}`])
        )
    })

    it('should dispatch the right actions on options deselection', () => {
        const numberOfStars = 5
        renderComponent().rerenderComponent(
            <ScoreFilter
                onRemove={mockedRemove}
                value={withLogicalOperator([`${numberOfStars}`])}
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
        expect(mockedDispatch).toHaveBeenCalledWith(
            dispatchChangeValuePayload([])
        )
    })

    it('should dispatch the right action on deselect all', () => {
        const {rerenderComponent} = renderComponent()
        fireEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        fireEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))
        expect(mockedDispatch).toHaveBeenNthCalledWith(
            2,
            dispatchChangeValuePayload(
                Array.from({length: MAX_SCORE_VALUE})
                    .fill(undefined)
                    .map((_, index) => `${MAX_SCORE_VALUE - index}`)
            )
        )
        rerenderComponent(
            <ScoreFilter
                onRemove={mockedRemove}
                value={withLogicalOperator([`5`, `4`, `3`])}
            />,
            defaultState
        )
        fireEvent.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))
        expect(mockedDispatch).toHaveBeenCalledWith(
            dispatchChangeValuePayload([])
        )
    })

    it('should remove the Score filter', () => {
        renderComponent()
        fireEvent.click(screen.getByText('close'))
        expect(mockedDispatch).toHaveBeenCalledWith(
            dispatchChangeValuePayload([])
        )
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

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                score: {
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                    values: [],
                },
            })
        )

        userEvent.click(isOneOfRadioLabel)

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                score: {
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                    values: [],
                },
            })
        )
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
            />,
            defaultState
        )

        expect(mockedDispatch).toHaveBeenCalledWith({type: STAT_FILTERS_CLEAN})
        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: FilterKey.Score,
            logical_operator:
                LogicalOperatorLabel[
                    LogicalOperatorEnum.ONE_OF
                ].toLocaleLowerCase(),
        })
    })

    describe('ScoreFiltersWithState', () => {
        it('should render ScoreFilter component', () => {
            renderWithStore(<ScoreFiltersWithState />, defaultState)
            expect(
                screen.getByText(FilterLabels[FilterKey.Score])
            ).toBeInTheDocument()
        })
    })
})
