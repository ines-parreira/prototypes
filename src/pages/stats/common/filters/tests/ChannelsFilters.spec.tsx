import React from 'react'
import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {mergeStatsFilters, initialState} from 'state/stats/statsSlice'
import ChannelsFilter, {
    CHANNELS_FILTER_NAME,
} from 'pages/stats/common/filters/ChannelsFilter'
import {channels} from 'fixtures/channels'
import {assumeMock, renderWithStore} from 'utils/testing'
import {RootState} from 'state/types'
import getChannelFromSourceType from 'tickets/common/utils/getChannelFromSourceType'
import {TicketMessageSourceType} from 'business/types/ticket'
import {
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import {getChannels, toChannel} from 'services/channels'

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
        component = renderWithStore(<ChannelsFilter value={[]} />, defaultState)
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

        expect(mockedDispatch).toHaveBeenNthCalledWith(
            3,
            mergeStatsFilters({
                channels: [mockedChannels[0].slug],
            })
        )

        expect(mockedDispatch).toHaveBeenNthCalledWith(
            5,
            mergeStatsFilters({
                channels: [mockedChannels[1].slug],
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

        expect(mockedDispatch).toHaveBeenNthCalledWith(
            3,
            mergeStatsFilters({
                channels: allAvailableChannelsSlugs,
            })
        )

        rerender(<ChannelsFilter value={allAvailableChannelsSlugs} />)

        userEvent.click(screen.getByText(isOneOfRegex))
        userEvent.click(screen.getByText(/deselect all/i))

        expect(mockedDispatch).toHaveBeenNthCalledWith(
            6,
            mergeStatsFilters({
                channels: [],
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

        rerender(<ChannelsFilter value={allAvailableChannelsSlugs} />)

        userEvent.click(screen.getByText(isOneOfRegex))
        userEvent.click(screen.getByText(mockedChannels[0].name))

        expect(mockedDispatch).toHaveBeenNthCalledWith(
            4,
            mergeStatsFilters({
                channels: allAvailableChannelsSlugs.filter(
                    (channel) => channel !== mockedChannels[0].slug
                ),
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

        rerender(<ChannelsFilter value={allAvailableChannelsSlugs} />)

        userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))

        expect(mockedDispatch).toHaveBeenNthCalledWith(
            3,
            mergeStatsFilters({
                channels: [],
            })
        )
    })

    it('should change selection of logical operator when one of the options is clicked', () => {
        userEvent.click(screen.getByText(DROPDOWN_SELECT_VALUE_ELEMENT_TEXT))

        const isOneOfRadioLabel = screen.getByLabelText(
            new RegExp(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF], 'i')
        )
        const isOneOfRadioInput = document.querySelector(
            `input[id=${LogicalOperatorEnum.ONE_OF}]`
        )
        const isNotOneOfRadioLabel = screen.getByLabelText(
            new RegExp(
                LogicalOperatorLabel[LogicalOperatorEnum.NOT_ONE_OF],
                'i'
            )
        )
        const isNotOneOfRadioInput = document.querySelector(
            `input[id=${LogicalOperatorEnum.NOT_ONE_OF}]`
        )

        userEvent.click(isNotOneOfRadioLabel)

        expect(isOneOfRadioInput).not.toBeChecked()
        expect(isNotOneOfRadioInput).toBeChecked()

        userEvent.click(isOneOfRadioLabel)

        expect(isOneOfRadioInput).toBeChecked()
        expect(isNotOneOfRadioInput).not.toBeChecked()
    })
})
