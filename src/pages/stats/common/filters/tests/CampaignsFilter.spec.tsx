import React from 'react'
import userEvent from '@testing-library/user-event'
import {screen} from '@testing-library/react'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {emptyFilter} from 'pages/stats/common/filters/helpers'

import {mergeStatsFiltersWithLogicalOperator} from 'state/stats/statsSlice'
import {useGetCampaignsForStore} from 'pages/stats/convert/hooks/useGetCampaignsForStore'

import {assumeMock, renderWithStore} from 'utils/testing'
import {
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    FILTER_VALUE_PLACEHOLDER,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import CampaignsFilter from 'pages/stats/common/filters/CampaignsFilter'
import {campaignsList} from 'fixtures/campaign'
import {FilterLabels} from 'pages/stats/common/filters/constants'
import {FilterKey} from 'models/stat/types'
import {SegmentEvent, logEvent} from 'common/segment'

const CAMPAIGNS_FILTER_NAME = FilterLabels[FilterKey.Campaigns]
const mockedCampaignsList = campaignsList
const mockedDispatch = jest.fn()

jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('pages/stats/convert/hooks/useGetCampaignsForStore')
jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {StatFilterSelected: 'stat-filter-selected'},
}))

const mockedUseGetCampaignsForStore = assumeMock(useGetCampaignsForStore)
const mockedUseParamsReturnValue = jest.fn(() => ({id: 1}))
jest.mock('react-router-dom', () => ({
    useParams: () => mockedUseParamsReturnValue(),
}))

const defaultState = {}

const renderComponent = () =>
    renderWithStore(
        <CampaignsFilter value={emptyFilter} campaigns={mockedCampaignsList} />,
        {}
    )

describe('CampaignsFilter', () => {
    beforeEach(() => {
        mockedUseGetCampaignsForStore.mockReturnValue({
            campaigns: mockedCampaignsList,
            channelConnectionExternalIds: undefined,
        })
    })

    it('should render CampaignsFilter component', () => {
        mockedUseParamsReturnValue.mockImplementationOnce(() => ({id: 321}))
        renderComponent()

        expect(screen.getByText(CAMPAIGNS_FILTER_NAME)).toBeInTheDocument()
    })

    it('should render with empty filter', () => {
        renderWithStore(
            <CampaignsFilter value={undefined} campaigns={[]} />,
            defaultState
        )

        expect(screen.getByText(CAMPAIGNS_FILTER_NAME)).toBeInTheDocument()
    })

    it('should render CampaignsFilter options', () => {
        renderComponent()
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(
            screen.getByText(mockedCampaignsList[0].name)
        ).toBeInTheDocument()
        expect(
            screen.getByText(mockedCampaignsList[1].name)
        ).toBeInTheDocument()
    })

    it('should dispatch mergeStatsFilters action on selecting a campaign', () => {
        renderComponent()

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(mockedCampaignsList[0].name))
        userEvent.click(screen.getByText(mockedCampaignsList[1].name))

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                campaigns: withDefaultLogicalOperator([
                    mockedCampaignsList[0].id,
                ]),
            })
        )

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                campaigns: withDefaultLogicalOperator([
                    mockedCampaignsList[1].id,
                ]),
            })
        )
    })

    it('should dispatch mergeStatsFilters action on deselecting a campaign', () => {
        renderWithStore(
            <CampaignsFilter
                value={withDefaultLogicalOperator([mockedCampaignsList[0].id])}
                campaigns={mockedCampaignsList}
            />,
            defaultState
        )

        userEvent.click(screen.getByText(campaignsList[0].name))
        userEvent.click(
            screen.getByRole('option', {name: mockedCampaignsList[0].name})
        )

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                campaigns: withDefaultLogicalOperator([]),
            })
        )
    })

    it('should dispatch mergeStatsFilters action on selecting all campaigns and deselecting all campaigns', () => {
        const {rerenderComponent} = renderComponent()
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

        const allAvailableCampaignsIds = mockedCampaignsList.map(
            (campaign) => campaign.id
        )

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                campaigns: withDefaultLogicalOperator(allAvailableCampaignsIds),
            })
        )

        rerenderComponent(
            defaultState,
            <CampaignsFilter
                value={withDefaultLogicalOperator(allAvailableCampaignsIds)}
                campaigns={mockedCampaignsList}
            />
        )

        userEvent.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                campaigns: withDefaultLogicalOperator([]),
            })
        )
    })

    it('should dispatch mergeStatsFilters action on deselecting one of the campaigns', () => {
        const {rerenderComponent} = renderComponent()

        const allAvailableCampaignsIds = mockedCampaignsList.map(
            (campaign) => campaign.id
        )

        rerenderComponent(
            defaultState,
            <CampaignsFilter
                value={withDefaultLogicalOperator(allAvailableCampaignsIds)}
                campaigns={mockedCampaignsList}
            />
        )

        userEvent.click(
            screen.getByText(
                campaignsList
                    .map((value) => (value ? `${value.name}` : undefined))
                    .join(', ')
            )
        )
        userEvent.click(screen.getByText(mockedCampaignsList[0].name))

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                campaigns: withDefaultLogicalOperator(
                    allAvailableCampaignsIds.filter(
                        (campaign) => campaign !== mockedCampaignsList[0].id
                    )
                ),
            })
        )
    })

    it('should dispatch mergeStatsFilters action on deselecting all integrations when filters dropdown is closed', () => {
        const {rerenderComponent} = renderComponent()
        const clearFilterIcon = 'close'

        const allAvailableCampaignsIds = mockedCampaignsList.map(
            (campaign) => campaign.id
        )

        rerenderComponent(
            defaultState,
            <CampaignsFilter
                value={withDefaultLogicalOperator(allAvailableCampaignsIds)}
                campaigns={mockedCampaignsList}
            />
        )

        userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                campaigns: withDefaultLogicalOperator([]),
            })
        )
    })

    it('should check mergeStatsFilters action calls on opening and closing dropdown', () => {
        const {rerenderComponent} = renderWithStore(
            <CampaignsFilter
                value={emptyFilter}
                campaigns={mockedCampaignsList}
            />,
            defaultState
        )

        expect(screen.getByText(CAMPAIGNS_FILTER_NAME)).toBeInTheDocument()

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(mockedDispatch).toHaveBeenCalledWith({
            type: 'STAT/STAT_FILTERS_DIRTY',
        })

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        rerenderComponent(
            defaultState,
            <CampaignsFilter
                value={emptyFilter}
                campaigns={mockedCampaignsList}
            />
        )

        expect(mockedDispatch).toHaveBeenCalledWith({
            type: 'STAT/STAT_FILTERS_CLEAN',
        })
    })

    it('should call segment analytics log event on filter dropdown close', () => {
        const {rerenderComponent} = renderWithStore(
            <CampaignsFilter
                value={emptyFilter}
                campaigns={mockedCampaignsList}
            />,
            defaultState
        )

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        rerenderComponent(
            defaultState,
            <CampaignsFilter
                value={emptyFilter}
                campaigns={mockedCampaignsList}
            />
        )

        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: FilterKey.Campaigns,
            logical_operator:
                LogicalOperatorLabel[
                    LogicalOperatorEnum.ONE_OF
                ].toLocaleLowerCase(),
        })
    })
})
