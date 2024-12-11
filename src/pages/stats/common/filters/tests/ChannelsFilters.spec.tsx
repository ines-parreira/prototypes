import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import {TicketMessageSourceType} from 'business/types/ticket'
import {SegmentEvent, logEvent} from 'common/segment'
import {channels} from 'fixtures/channels'
import {
    withDefaultLogicalOperator,
    withLogicalOperator,
} from 'models/reporting/queryFactories/utils'
import {FilterKey} from 'models/stat/types'
import {
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    FILTER_VALUE_PLACEHOLDER,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import {
    ChannelsFilter,
    ChannelsFilterWithSavedState,
    ChannelsFilterWithState,
} from 'pages/stats/common/filters/ChannelsFilter'
import {FilterLabels} from 'pages/stats/common/filters/constants'
import {getChannels, toChannel} from 'services/channels'
import * as statsSlice from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import * as filtersSlice from 'state/ui/stats/filtersSlice'
import getChannelFromSourceType from 'tickets/common/utils/getChannelFromSourceType'
import {assumeMock, renderWithStore} from 'utils/testing'

const mockedChannels = channels
const clearFilterIcon = 'close'

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
    const dispatchUpdate = jest.fn()
    const dispatchRemove = jest.fn()
    const dispatchStatFiltersDirty = jest.fn()
    const dispatchStatFiltersClean = jest.fn()
    const isOneOfRegex = new RegExp(
        `${LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF]}`,
        'i'
    )

    const defaultState = {
        stats: statsSlice.initialState,
        ui: {
            stats: {
                filters: filtersSlice.initialState,
            },
        },
    } as RootState

    beforeEach(() => {
        mockedGetChannels.mockImplementation(() => mockedChannels)
        mockedToChannels.mockImplementation((arg) =>
            mockedChannels.find((channel) => channel.slug === arg)
        )
    })

    it('should render ChannelsStatsFilter even if the value is undefined', () => {
        renderWithStore(
            <ChannelsFilter
                value={undefined}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState
        )
        expect(
            screen.getByText(FilterLabels[FilterKey.Channels])
        ).toBeInTheDocument()
    })

    it('should render ChannelsStatsFilter component', () => {
        renderWithStore(
            <ChannelsFilter
                value={withDefaultLogicalOperator([])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState
        )
        expect(
            screen.getByText(FilterLabels[FilterKey.Channels])
        ).toBeInTheDocument()
    })

    it('should render ChannelsStatsFilter options', () => {
        renderWithStore(
            <ChannelsFilter
                value={withDefaultLogicalOperator([])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState
        )
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(screen.getByText(mockedChannels[0].name)).toBeInTheDocument()
        expect(screen.getByText(mockedChannels[1].name)).toBeInTheDocument()
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on selecting channel', () => {
        renderWithStore(
            <ChannelsFilter
                value={withDefaultLogicalOperator([])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState
        )
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(mockedChannels[0].name))
        userEvent.click(screen.getByText(mockedChannels[1].name))

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([mockedChannels[0].slug])
        )

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([mockedChannels[1].slug])
        )
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on selecting all channels and deselecting all channels', () => {
        const {rerender} = renderWithStore(
            <ChannelsFilter
                value={withDefaultLogicalOperator([])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState
        )
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

        const allAvailableChannelsSlugs = mockedChannels.map(
            (channel) => channel.slug
        )

        expect(dispatchUpdate).toHaveBeenCalledWith({
            values: allAvailableChannelsSlugs,
            operator: LogicalOperatorEnum.ONE_OF,
        })

        rerender(
            <ChannelsFilter
                value={withDefaultLogicalOperator(allAvailableChannelsSlugs)}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />
        )

        userEvent.click(screen.getByText(isOneOfRegex))
        userEvent.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

        expect(dispatchUpdate).toHaveBeenCalledWith({
            values: [],
            operator: LogicalOperatorEnum.ONE_OF,
        })
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on deselecting one of the channels', () => {
        const {rerender} = renderWithStore(
            <ChannelsFilter
                value={withDefaultLogicalOperator([])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
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
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />
        )

        userEvent.click(screen.getByText(isOneOfRegex))
        userEvent.click(screen.getByText(mockedChannels[0].name))

        expect(dispatchUpdate).toHaveBeenCalledWith({
            operator: LogicalOperatorEnum.ONE_OF,
            values: allAvailableChannelsSlugs.filter(
                (channel) => channel !== mockedChannels[0].slug
            ),
        })
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on deselecting all channels when filters dropdown is closed', () => {
        const {rerender} = renderWithStore(
            <ChannelsFilter
                value={withDefaultLogicalOperator([])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
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
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />
        )

        userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))

        expect(dispatchRemove).toHaveBeenCalledWith()
    })

    it('should change selection of logical operator when one of the options is clicked', () => {
        renderWithStore(
            <ChannelsFilter
                value={withDefaultLogicalOperator([])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
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
        const {rerenderComponent} = renderWithStore(
            <ChannelsFilter
                value={withDefaultLogicalOperator([])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState
        )

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(mockedChannels[0].name))
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        rerenderComponent(
            <ChannelsFilter
                value={withDefaultLogicalOperator([])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState
        )

        expect(dispatchStatFiltersClean).toHaveBeenCalled()
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
            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator'
            )

            renderWithStore(<ChannelsFilterWithState />, defaultState)
            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

            expect(
                screen.getByText(FilterLabels[FilterKey.Channels])
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()

            userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))
            expect(spy).toHaveBeenCalledWith({
                [FilterKey.Channels]: withLogicalOperator([]),
            })
        })
    })

    describe('ChannelsFilterWithSavedState', () => {
        it('should render ChannelsFilterWithSavedState component', () => {
            const spy = jest.spyOn(filtersSlice, 'upsertSavedFilterFilter')
            const removeSpy = jest.spyOn(
                filtersSlice,
                'removeFilterFromSavedFilterDraft'
            )

            renderWithStore(<ChannelsFilterWithSavedState />, defaultState)
            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

            expect(
                screen.getByText(FilterLabels[FilterKey.Channels])
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()

            userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))
            expect(removeSpy).toHaveBeenCalledWith({
                filterKey: FilterKey.Channels,
            })
        })
    })
})
