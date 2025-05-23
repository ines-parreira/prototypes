import { render, screen } from '@testing-library/react'

import { VoiceQueue } from '@gorgias/helpdesk-queries'

import { logEvent, SegmentEvent } from 'common/segment'
import { useVoiceQueueSearch } from 'hooks/reporting/common/useVoiceQueueSearch'
import { FilterKey } from 'models/stat/types'
import { FILTER_VALUE_PLACEHOLDER } from 'pages/common/forms/FilterInput/constants'
import {
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import { FilterLabels } from 'pages/stats/common/filters/constants'
import * as statsSlice from 'state/stats/statsSlice'
import { RootState } from 'state/types'
import * as filtersSlice from 'state/ui/stats/filtersSlice'
import { assumeMock, renderWithStore } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

import {
    VoiceQueuesFilter,
    VoiceQueuesFilterWithSavedState,
    VoiceQueuesFilterWithState,
} from '../VoiceQueuesFilter'

jest.mock('hooks/reporting/common/useVoiceQueueSearch')
const useVoiceQueueSearchMock = assumeMock(useVoiceQueueSearch)

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { StatFilterSelected: 'stat-filter-selected' },
}))

describe('<VoiceQueuesFilter />', () => {
    const someVoiceQueues = [
        { id: 1, name: 'Queue 1' },
        { id: 2 },
        { id: 3, name: 'Queue 3' },
    ] as VoiceQueue[]

    const dispatchUpdate = jest.fn()
    const dispatchRemove = jest.fn()
    const dispatchStatFiltersDirty = jest.fn()
    const dispatchStatFiltersClean = jest.fn()
    const onRemove = jest.fn()

    const defaultProps = {
        value: { values: [], operator: LogicalOperatorEnum.ONE_OF },
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

    beforeEach(() => {
        useVoiceQueueSearchMock.mockReturnValue({
            handleVoiceQueueSearch: jest.fn() as any,
            onLoad: jest.fn(),
            voiceQueues: someVoiceQueues,
            shouldLoadMore: false,
        } as unknown as ReturnType<typeof useVoiceQueueSearch>)
    })

    it('should render correctly', () => {
        render(<VoiceQueuesFilter {...defaultProps} />)

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(screen.getByText('Queue 1')).toBeInTheDocument()
        expect(screen.getByText('Queue #2')).toBeInTheDocument()
        expect(screen.getByText('Queue 3')).toBeInTheDocument()

        expect(useVoiceQueueSearchMock).toHaveBeenCalledWith()
        expect(dispatchStatFiltersDirty).toHaveBeenCalledWith()
    })

    it('should render with default props', () => {
        render(
            <VoiceQueuesFilter
                value={{ values: [], operator: LogicalOperatorEnum.ONE_OF }}
                dispatchRemove={dispatchRemove}
                dispatchUpdate={dispatchUpdate}
            />,
        )

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(screen.getByText('Queue 1')).toBeInTheDocument()
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on selecting queue', () => {
        render(<VoiceQueuesFilter {...defaultProps} />)

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText('Queue 1'))

        expect(dispatchUpdate).toHaveBeenCalledWith({
            operator: LogicalOperatorEnum.ONE_OF,
            values: [1],
        })
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on selecting all queues and deselecting all queues', () => {
        const { rerender } = render(<VoiceQueuesFilter {...defaultProps} />)

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

        expect(dispatchUpdate).toHaveBeenCalledWith({
            values: [1, 2, 3],
            operator: LogicalOperatorEnum.ONE_OF,
        })

        rerender(
            <VoiceQueuesFilter
                {...defaultProps}
                value={{
                    values: [1, 2, 3],
                    operator: LogicalOperatorEnum.ONE_OF,
                }}
            />,
        )

        userEvent.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

        expect(dispatchUpdate).toHaveBeenCalledWith({
            values: [],
            operator: LogicalOperatorEnum.ONE_OF,
        })
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on deselecting one of the queues', () => {
        render(
            <VoiceQueuesFilter
                {...defaultProps}
                value={{
                    values: [1, 2, 3],
                    operator: LogicalOperatorEnum.ONE_OF,
                }}
            />,
        )

        userEvent.click(
            screen.getByText(
                new RegExp(
                    LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF],
                    'i',
                ),
            ),
        )
        userEvent.click(screen.getByText('Queue #2'))

        expect(dispatchUpdate).toHaveBeenCalledWith({
            values: [1, 3],
            operator: LogicalOperatorEnum.ONE_OF,
        })
    })

    it('should change selection of logical operator when one of the options is clicked', () => {
        const { rerender } = render(
            <VoiceQueuesFilter
                {...defaultProps}
                value={{
                    values: [],
                    operator: LogicalOperatorEnum.ONE_OF,
                }}
            />,
        )

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        const isOneOfRadioLabel = screen.getByLabelText(
            new RegExp(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF], 'i'),
        )
        const isNotOneOfRadioLabel = screen.getByLabelText(
            new RegExp(
                LogicalOperatorLabel[LogicalOperatorEnum.NOT_ONE_OF],
                'i',
            ),
        )

        userEvent.click(isNotOneOfRadioLabel)

        expect(dispatchUpdate).toHaveBeenCalledWith({
            values: [],
            operator: LogicalOperatorEnum.NOT_ONE_OF,
        })

        rerender(
            <VoiceQueuesFilter
                {...defaultProps}
                value={{
                    values: [],
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                }}
            />,
        )

        userEvent.click(isOneOfRadioLabel)

        expect(dispatchUpdate).toHaveBeenCalledWith({
            values: [],
            operator: LogicalOperatorEnum.ONE_OF,
        })
    })

    it('should dispatch cleanFilters action and call segment analytics log event on filter dropdown close', () => {
        render(
            <VoiceQueuesFilter
                {...defaultProps}
                value={{
                    values: [1, 2, 3],
                    operator: LogicalOperatorEnum.ONE_OF,
                }}
            />,
        )

        userEvent.click(
            screen.getByText(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF]),
        )
        userEvent.click(screen.getByText('Queue 1'))
        userEvent.click(
            screen.getAllByText(
                LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF],
            )[0],
        )

        expect(dispatchStatFiltersClean).toHaveBeenCalled()
        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: FilterKey.VoiceQueues,
            logical_operator:
                LogicalOperatorLabel[
                    LogicalOperatorEnum.ONE_OF
                ].toLocaleLowerCase(),
        })
    })

    describe('VoiceQueuesFilterWithState', () => {
        it('should pass dispatch action', () => {
            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator',
            )

            const { getByText } = renderWithStore(
                <VoiceQueuesFilterWithState />,
                defaultState,
            )

            userEvent.click(getByText(FILTER_VALUE_PLACEHOLDER))
            userEvent.click(getByText(FILTER_SELECT_ALL_LABEL))

            expect(
                getByText(FilterLabels[FilterKey.VoiceQueues]),
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()

            userEvent.click(getByText(new RegExp('close', 'i')))
            expect(spy).toHaveBeenCalledWith({
                [FilterKey.VoiceQueues]: {
                    values: [1, 2, 3],
                    operator: LogicalOperatorEnum.ONE_OF,
                },
            })
        })
    })

    describe('VoiceQueuesFilterWithSavedState', () => {
        it('should pass dispatch action', () => {
            const spy = jest.spyOn(filtersSlice, 'upsertSavedFilterFilter')
            const removeSpy = jest.spyOn(
                filtersSlice,
                'removeFilterFromSavedFilterDraft',
            )

            renderWithStore(<VoiceQueuesFilterWithSavedState />, defaultState)
            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

            expect(
                screen.getByText(FilterLabels[FilterKey.VoiceQueues]),
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalledWith({
                member: FilterKey.VoiceQueues,
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['1', '2', '3'],
            })

            userEvent.click(screen.getByText(new RegExp('close', 'i')))
            expect(removeSpy).toHaveBeenCalledWith({
                filterKey: FilterKey.VoiceQueues,
            })
        })
    })
})
