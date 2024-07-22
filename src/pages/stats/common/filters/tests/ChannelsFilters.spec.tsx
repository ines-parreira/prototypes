import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {TicketMessageSourceType} from 'business/types/ticket'
import {channels} from 'fixtures/channels'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import ChannelsFilter, {
    CHANNELS_FILTER_NAME,
} from 'pages/stats/common/filters/ChannelsFilter'
import {getChannels, toChannel} from 'services/channels'
import {
    initialState,
    mergeStatsFiltersWithLogicalOperator,
} from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import getChannelFromSourceType from 'tickets/common/utils/getChannelFromSourceType'
import {assumeMock, renderWithStore} from 'utils/testing'

const mockedChannels = channels

jest.mock('services/channels')
const mockedGetChannels = assumeMock(getChannels)
const mockedToChannels = assumeMock(toChannel)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

jest.mock('config/views.tsx', () => <div />)

describe('ChannelsFilter', () => {
    let component: ReturnType<typeof renderWithStore>
    const isOneOfRegex = new RegExp(
        `${LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF]}`,
        'i'
    )

    const defaultState = {
        stats: initialState,
    } as RootState

    const DROPDOWN_SELECT_VALUE_ELEMENT_TEXT = 'Select value...'

    beforeEach(() => {
        mockedGetChannels.mockImplementation(() => mockedChannels)
        mockedToChannels.mockImplementation((arg) =>
            mockedChannels.find((channel) => channel.slug === arg)
        )
        component = renderWithStore(
            <ChannelsFilter value={withDefaultLogicalOperator([])} />,
            defaultState
        )
    })

    it('should render ChannelsStatsFilter component', () => {
        expect(screen.getByText(CHANNELS_FILTER_NAME)).toBeInTheDocument()
    })

    it('should render ChannelsStatsFilter options', () => {
        userEvent.click(screen.getByText(DROPDOWN_SELECT_VALUE_ELEMENT_TEXT))

        expect(screen.getByText(mockedChannels[0].name)).toBeInTheDocument()
        expect(screen.getByText(mockedChannels[1].name)).toBeInTheDocument()
    })

    it('should dispatch mergeStatsFilters action on selecting channel', () => {
        userEvent.click(screen.getByText(DROPDOWN_SELECT_VALUE_ELEMENT_TEXT))
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

    it('should dispatch mergeStatsFilters action on selecting all channels and deselecting all channels', () => {
        const {rerender} = component
        userEvent.click(screen.getByText(DROPDOWN_SELECT_VALUE_ELEMENT_TEXT))
        userEvent.click(screen.getByText(/select all/i))

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
        userEvent.click(screen.getByText(/deselect all/i))

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                channels: {
                    values: [],
                    operator: LogicalOperatorEnum.ONE_OF,
                },
            })
        )
    })

    it('should dispatch mergeStatsFilters action on deselecting one of the channels', () => {
        const {rerender} = component

        const allAvailableChannelsSlugs = mockedChannels.map((channel) =>
            getChannelFromSourceType(
                channel.slug as TicketMessageSourceType,
                []
            )
        ) as string[]

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

    it('should dispatch mergeStatsFilters action on deselecting all channels when filters dropdown is closed', () => {
        const {rerender} = component
        const clearFilterIcon = 'close'

        const allAvailableChannelsSlugs = mockedChannels.map((channel) =>
            getChannelFromSourceType(
                channel.slug as TicketMessageSourceType,
                []
            )
        ) as string[]

        rerender(
            <ChannelsFilter
                value={withDefaultLogicalOperator(allAvailableChannelsSlugs)}
            />
        )

        userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))

        expect(mockedDispatch).toHaveBeenNthCalledWith(
            3,
            mergeStatsFiltersWithLogicalOperator({
                channels: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [],
                },
            })
        )
    })

    it('should change selection of logical operator when one of the options is clicked', () => {
        userEvent.click(screen.getByText(DROPDOWN_SELECT_VALUE_ELEMENT_TEXT))

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
})
