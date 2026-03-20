import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, userEvent } from '@repo/testing'
import { screen } from '@testing-library/react'

import * as clientSideFilterSearchModule from 'domains/reporting/hooks/filters/useClientSideFilterSearch'
import {
    withDefaultLogicalOperator,
    withLogicalOperator,
} from 'domains/reporting/models/queryFactories/utils'
import { FilterKey } from 'domains/reporting/models/stat/types'
import {
    FILTER_CLEAR_ICON,
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'domains/reporting/pages/common/components/Filter/constants'
import CampaignsFilter, {
    CampaignsFilterFromContext,
    CampaignsFilterFromSavedContext,
} from 'domains/reporting/pages/common/filters/CampaignsFilter'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import { emptyFilter } from 'domains/reporting/pages/common/filters/helpers'
import { useGetCampaignsForStore } from 'domains/reporting/pages/convert/hooks/useGetCampaignsForStore'
import * as statsSlice from 'domains/reporting/state/stats/statsSlice'
import * as filtersActions from 'domains/reporting/state/ui/stats/actions'
import * as filtersSlice from 'domains/reporting/state/ui/stats/filtersSlice'
import { campaignsList } from 'fixtures/campaign'
import { FILTER_VALUE_PLACEHOLDER } from 'pages/common/forms/FilterInput/constants'
import type { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

const CAMPAIGNS_FILTER_NAME = FilterLabels[FilterKey.Campaigns]
const mockedCampaignsList = campaignsList

jest.mock('domains/reporting/pages/convert/hooks/useGetCampaignsForStore')
jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { StatFilterSelected: 'stat-filter-selected' },
}))
const mockedUseGetCampaignsForStore = assumeMock(useGetCampaignsForStore)
const mockedUseParamsReturnValue = jest.fn(() => ({ id: 1 }))
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => mockedUseParamsReturnValue(),
}))

const dispatchUpdate = jest.fn()
const dispatchRemove = jest.fn()
const dispatchStatFiltersDirty = jest.fn()
const dispatchStatFiltersClean = jest.fn()
const defaultState = {
    stats: statsSlice.initialState,
    ui: {
        stats: {
            filters: filtersSlice.initialState,
        },
    },
} as RootState

const renderComponent = () =>
    renderWithStore(
        <CampaignsFilter
            value={emptyFilter}
            campaigns={mockedCampaignsList}
            dispatchUpdate={dispatchUpdate}
            dispatchRemove={dispatchRemove}
            dispatchStatFiltersDirty={dispatchStatFiltersDirty}
            dispatchStatFiltersClean={dispatchStatFiltersClean}
        />,
        {},
    )

describe('CampaignsFilter', () => {
    beforeEach(() => {
        mockedUseGetCampaignsForStore.mockReturnValue({
            campaigns: mockedCampaignsList,
            channelConnectionExternalIds: undefined,
        })
    })

    it('should render CampaignsFilter component', () => {
        mockedUseParamsReturnValue.mockImplementationOnce(() => ({ id: 321 }))
        renderComponent()

        expect(screen.getByText(CAMPAIGNS_FILTER_NAME)).toBeInTheDocument()
    })

    it('should render with empty filter', () => {
        renderWithStore(
            <CampaignsFilter
                value={undefined}
                campaigns={[]}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        expect(screen.getByText(CAMPAIGNS_FILTER_NAME)).toBeInTheDocument()
    })

    it('should render CampaignsFilter options', () => {
        renderComponent()
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(
            screen.getByText(mockedCampaignsList[0].name),
        ).toBeInTheDocument()
        expect(
            screen.getByText(mockedCampaignsList[1].name),
        ).toBeInTheDocument()
    })

    it('should dispatch mergeStatsFilters action on selecting a campaign', () => {
        renderComponent()

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(mockedCampaignsList[0].name))
        userEvent.click(screen.getByText(mockedCampaignsList[1].name))

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([mockedCampaignsList[0].id]),
        )

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([mockedCampaignsList[1].id]),
        )
    })

    it('should dispatch mergeStatsFilters action on deselecting a campaign', () => {
        renderWithStore(
            <CampaignsFilter
                value={withDefaultLogicalOperator([mockedCampaignsList[0].id])}
                campaigns={mockedCampaignsList}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        userEvent.click(screen.getByText(campaignsList[0].name))
        userEvent.click(
            screen.getByRole('option', { name: mockedCampaignsList[0].name }),
        )

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([]),
        )
    })

    it('should dispatch mergeStatsFilters action on selecting all campaigns and deselecting all campaigns', () => {
        const { rerenderComponent } = renderComponent()
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

        const allAvailableCampaignsIds = mockedCampaignsList.map(
            (campaign) => campaign.id,
        )

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator(allAvailableCampaignsIds),
        )

        rerenderComponent(
            <CampaignsFilter
                value={withDefaultLogicalOperator(allAvailableCampaignsIds)}
                campaigns={mockedCampaignsList}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        userEvent.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([]),
        )
    })

    it('should dispatch mergeStatsFilters action on deselecting one of the campaigns', () => {
        const { rerenderComponent } = renderComponent()

        const allAvailableCampaignsIds = mockedCampaignsList.map(
            (campaign) => campaign.id,
        )

        rerenderComponent(
            <CampaignsFilter
                value={withDefaultLogicalOperator(allAvailableCampaignsIds)}
                campaigns={mockedCampaignsList}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        userEvent.click(
            screen.getByText(
                campaignsList
                    .map((value) => (value ? `${value.name}` : undefined))
                    .join(', '),
            ),
        )
        userEvent.click(screen.getByText(mockedCampaignsList[0].name))

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator(
                allAvailableCampaignsIds.filter(
                    (campaign) => campaign !== mockedCampaignsList[0].id,
                ),
            ),
        )
    })

    it('should dispatch mergeStatsFilters action on deselecting all integrations when filters dropdown is closed', () => {
        const { rerenderComponent } = renderComponent()

        const allAvailableCampaignsIds = mockedCampaignsList.map(
            (campaign) => campaign.id,
        )

        rerenderComponent(
            <CampaignsFilter
                value={withDefaultLogicalOperator(allAvailableCampaignsIds)}
                campaigns={mockedCampaignsList}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        userEvent.click(screen.getByText(new RegExp(FILTER_CLEAR_ICON, 'i')))

        expect(dispatchRemove).toHaveBeenCalledWith()
    })

    it('should check mergeStatsFilters action calls on opening and closing dropdown', () => {
        const { rerenderComponent } = renderWithStore(
            <CampaignsFilter
                value={emptyFilter}
                campaigns={mockedCampaignsList}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        expect(screen.getByText(CAMPAIGNS_FILTER_NAME)).toBeInTheDocument()

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(dispatchStatFiltersDirty).toHaveBeenCalled()

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        rerenderComponent(
            <CampaignsFilter
                value={emptyFilter}
                campaigns={mockedCampaignsList}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        expect(dispatchStatFiltersClean).toHaveBeenCalled()
    })

    it('should call segment analytics log event on filter dropdown close', () => {
        const { rerenderComponent } = renderWithStore(
            <CampaignsFilter
                value={emptyFilter}
                campaigns={mockedCampaignsList}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        rerenderComponent(
            <CampaignsFilter
                value={emptyFilter}
                campaigns={mockedCampaignsList}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: FilterKey.Campaigns,
            logical_operator:
                LogicalOperatorLabel[
                    LogicalOperatorEnum.ONE_OF
                ].toLocaleLowerCase(),
        })
    })

    describe('CampaignsFilterFromContext', () => {
        it('should render', () => {
            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator',
            )
            const spy2 = jest.spyOn(filtersActions, 'statFiltersClean')
            renderWithStore(<CampaignsFilterFromContext />, defaultState)

            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))
            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

            expect(
                screen.getByText(FilterLabels[FilterKey.Campaigns]),
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()
            expect(spy2).toHaveBeenCalled()

            userEvent.click(
                screen.getByText(new RegExp(FILTER_CLEAR_ICON, 'i')),
            )
            expect(spy).toHaveBeenCalledWith({
                [FilterKey.Campaigns]: withLogicalOperator([]),
            })
        })
    })

    describe('CampaignsFilterFromSavedContext', () => {
        it('should render', () => {
            const spy = jest.spyOn(filtersSlice, 'upsertSavedFilterFilter')
            const removeSpy = jest.spyOn(
                filtersSlice,
                'removeFilterFromSavedFilterDraft',
            )

            renderWithStore(<CampaignsFilterFromSavedContext />, defaultState)

            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

            expect(
                screen.getByText(FilterLabels[FilterKey.Campaigns]),
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()

            userEvent.click(
                screen.getByText(new RegExp(FILTER_CLEAR_ICON, 'i')),
            )
            expect(removeSpy).toHaveBeenCalledWith({
                filterKey: FilterKey.Campaigns,
            })
        })
    })

    describe('search with no results', () => {
        let useClientSideFilterSearchSpy: jest.SpyInstance

        function mockClientSideFilterSearch(
            override: Partial<clientSideFilterSearchModule.ClientSideFilterSearch>,
        ) {
            useClientSideFilterSearchSpy = jest
                .spyOn(
                    clientSideFilterSearchModule,
                    'useClientSideFilterSearch',
                )
                .mockReturnValue({
                    value: '',
                    result: [{ options: [] }],
                    onSearch: jest.fn(),
                    onClear: jest.fn(),
                    ...override,
                })
        }

        afterEach(() => {
            useClientSideFilterSearchSpy.mockRestore()
        })

        it('should show "No results" when search matches nothing', () => {
            mockClientSideFilterSearch({
                value: 'nonexistentcampaign',
                result: [{ options: [] }],
            })

            renderComponent()
            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

            expect(screen.getByText('No results')).toBeInTheDocument()
        })

        it('should hide "Select all" and "Deselect all" when search matches nothing', () => {
            mockClientSideFilterSearch({
                value: 'nonexistentcampaign',
                result: [{ options: [] }],
            })

            renderComponent()
            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

            expect(
                screen.queryByText(FILTER_SELECT_ALL_LABEL),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText(FILTER_DESELECT_ALL_LABEL),
            ).not.toBeInTheDocument()
        })

        it('should show options normally when search matches', () => {
            mockClientSideFilterSearch({
                value: mockedCampaignsList[0].name,
                result: [
                    {
                        options: [
                            {
                                label: mockedCampaignsList[0].name,
                                value: mockedCampaignsList[0].id,
                            },
                        ],
                    },
                ],
            })

            renderComponent()
            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

            expect(
                screen.getByText(mockedCampaignsList[0].name),
            ).toBeInTheDocument()
            expect(screen.queryByText('No results')).not.toBeInTheDocument()
        })
    })
})
