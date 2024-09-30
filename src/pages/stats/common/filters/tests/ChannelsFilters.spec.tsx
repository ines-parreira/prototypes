import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {TicketMessageSourceType} from 'business/types/ticket'
import {channels} from 'fixtures/channels'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    FILTER_VALUE_PLACEHOLDER,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import {
    ChannelsFilter,
    ChannelsFilterWithState,
} from 'pages/stats/common/filters/ChannelsFilter'
import {getChannels, toChannel} from 'services/channels'
import {
    initialState,
    mergeStatsFiltersWithLogicalOperator,
} from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import getChannelFromSourceType from 'tickets/common/utils/getChannelFromSourceType'
import {assumeMock, renderWithStore} from 'utils/testing'
import {FilterLabels} from 'pages/stats/common/filters/constants'
import {FilterKey} from 'models/stat/types'
import {STAT_FILTERS_CLEAN} from 'state/ui/stats/constants'
import {SegmentEvent, logEvent} from 'common/segment'

const mockedChannels = channels

jest.mock('services/channels')
const mockedGetChannels = assumeMock(getChannels)
const mockedToChannels = assumeMock(toChannel)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

jest.mock('config/views.tsx', () => <div />)

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {StatFilterSelected: 'stat-filter-selected'},
}))

describe('ChannelsFilter', () => {
    const isOneOfRegex = new RegExp(
        `${LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF]}`,
        'i'
    )

    const defaultState = {
        stats: initialState,
    } as RootState

    beforeEach(() => {
        mockedGetChannels.mockImplementation(() => mockedChannels)
        mockedToChannels.mockImplementation((arg) =>
            mockedChannels.find((channel) => channel.slug === arg)
        )
    })

    it('should render ChannelsStatsFilter even if the value is undefined', () => {
        renderWithStore(<ChannelsFilter value={undefined} />, defaultState)
        expect(
            screen.getByText(FilterLabels[FilterKey.Channels])
        ).toBeInTheDocument()
    })

    it('should render ChannelsStatsFilter component', () => {
        renderWithStore(
            <ChannelsFilter value={withDefaultLogicalOperator([])} />,
            defaultState
        )
        expect(
            screen.getByText(FilterLabels[FilterKey.Channels])
        ).toBeInTheDocument()
    })

    it('should render ChannelsStatsFilter options', () => {
        renderWithStore(
            <ChannelsFilter value={withDefaultLogicalOperator([])} />,
            defaultState
        )
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(screen.getByText(mockedChannels[0].name)).toBeInTheDocument()
        expect(screen.getByText(mockedChannels[1].name)).toBeInTheDocument()
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on selecting channel', () => {
        renderWithStore(
            <ChannelsFilter value={withDefaultLogicalOperator([])} />,
            defaultState
        )
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(mockedChannels[0].name))
        userEvent.click(screen.getByText(mockedChannels[1].name))

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                channels: withDefaultLogicalOperator([mockedChannels[0].slug]),
            })
        )

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                channels: withDefaultLogicalOperator([mockedChannels[1].slug]),
            })
        )
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on selecting all channels and deselecting all channels', () => {
        const {rerender} = renderWithStore(
            <ChannelsFilter value={withDefaultLogicalOperator([])} />,
            defaultState
        )
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

        const allAvailableChannelsSlugs = mockedChannels.map(
            (channel) => channel.slug
        )

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                channels: {
                    values: allAvailableChannelsSlugs,
                    operator: LogicalOperatorEnum.ONE_OF,
                },
            })
        )

        rerender(
            <ChannelsFilter
                value={withDefaultLogicalOperator(allAvailableChannelsSlugs)}
            />
        )

        userEvent.click(screen.getByText(isOneOfRegex))
        userEvent.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                channels: {
                    values: [],
                    operator: LogicalOperatorEnum.ONE_OF,
                },
            })
        )
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on deselecting one of the channels', () => {
        const {rerender} = renderWithStore(
            <ChannelsFilter value={withDefaultLogicalOperator([])} />,
            defaultState
        )

        const allAvailableChannelsSlugs = mockedChannels.map((channel) =>
            getChannelFromSourceType(
                channel.slug as TicketMessageSourceType,
                []
            )
        )

        rerender(
            <ChannelsFilter
                value={withDefaultLogicalOperator(allAvailableChannelsSlugs)}
            />
        )

        userEvent.click(screen.getByText(isOneOfRegex))
        userEvent.click(screen.getByText(mockedChannels[0].name))

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                channels: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: allAvailableChannelsSlugs.filter(
                        (channel) => channel !== mockedChannels[0].slug
                    ),
                },
            })
        )
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on deselecting all channels when filters dropdown is closed', () => {
        const {rerender} = renderWithStore(
            <ChannelsFilter value={withDefaultLogicalOperator([])} />,
            defaultState
        )
        const clearFilterIcon = 'close'

        const allAvailableChannelsSlugs = mockedChannels.map((channel) =>
            getChannelFromSourceType(
                channel.slug as TicketMessageSourceType,
                []
            )
        )

        rerender(
            <ChannelsFilter
                value={withDefaultLogicalOperator(allAvailableChannelsSlugs)}
            />
        )

        userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                channels: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [],
                },
            })
        )
    })

    it('should change selection of logical operator when one of the options is clicked', () => {
        renderWithStore(
            <ChannelsFilter value={withDefaultLogicalOperator([])} />,
            defaultState
        )
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
                channels: {
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                    values: [],
                },
            })
        )

        userEvent.click(isOneOfRadioLabel)

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                channels: {
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                    values: [],
                },
            })
        )
    })

    it('should dispatch cleanFilters action and call segment analytics log event on filter dropdown close', () => {
        const {rerenderComponent} = renderWithStore(
            <ChannelsFilter value={withDefaultLogicalOperator([])} />,
            defaultState
        )

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(mockedChannels[0].name))
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        rerenderComponent(
            <ChannelsFilter value={withDefaultLogicalOperator([])} />,
            defaultState
        )

        expect(mockedDispatch).toHaveBeenCalledWith({type: STAT_FILTERS_CLEAN})
        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: FilterKey.Channels,
            logical_operator:
                LogicalOperatorLabel[
                    LogicalOperatorEnum.ONE_OF
                ].toLocaleLowerCase(),
        })
    })

    describe('ChannelsFilterWithState', () => {
        it('should render ChannelsFilterWithState component', () => {
            renderWithStore(<ChannelsFilterWithState />, defaultState)
            expect(
                screen.getByText(FilterLabels[FilterKey.Channels])
            ).toBeInTheDocument()
        })
    })
})
