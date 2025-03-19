import React from 'react'

import { waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'

import { campaign } from 'fixtures/campaign'
import { integrationsState } from 'fixtures/integrations'
import { InferredCampaignStatus } from 'models/convert/campaign/types'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { FilterKey } from 'models/stat/types'
import { useGetCampaignsForStore } from 'pages/stats/convert/hooks/useGetCampaignsForStore'
import { useShopifyIntegrations } from 'pages/stats/convert/hooks/useShopifyIntegrations'
import { CampaignStatsFilters } from 'pages/stats/convert/providers/CampaignStatsFilters/CampaignStatsFilters'
import { FiltersContext } from 'pages/stats/convert/providers/CampaignStatsFilters/context'
import {
    defaultStatsFilters,
    initialState,
    mergeStatsFiltersWithLogicalOperator,
} from 'state/stats/statsSlice'
import { RootState } from 'state/types'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
}))

jest.mock('pages/stats/convert/hooks/useShopifyIntegrations')

const useShopifyIntegrationsMock =
    useShopifyIntegrations as jest.MockedFunction<typeof useShopifyIntegrations>
jest.mock('pages/stats/convert/hooks/useGetCampaignsForStore.ts')
const useGetCampaignsForStoreMock = assumeMock(useGetCampaignsForStore)
jest.mock('state/ui/stats/selectors')

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(() => ({
        CONVERT_ROUTE_PARAM_NAME: '1',
    })),
}))

const deletedCampaignId = '8bd36873-35fc-4b99-83ac-701f20d570bd'
const deletedCampaign = {
    ...campaign,
    id: deletedCampaignId,
    deleted_datetime: '2021-02-03T00:00:00.000Z',
}
const channelConnectionExternalId = '123'
const campaignsForStore = {
    campaigns: [campaign, deletedCampaign],
    channelConnectionExternalIds: [channelConnectionExternalId],
}

const TestComponent = () => (
    <FiltersContext.Consumer>
        {({ campaigns }) =>
            campaigns.map((campaign) => (
                <div key={campaign.id}>{campaign.id}</div>
            ))
        }
    </FiltersContext.Consumer>
)

const state = {
    integrations: fromJS(integrationsState),
    stats: { filters: defaultStatsFilters },
} as RootState

describe('CampaignStatsFilters', () => {
    beforeEach(() => {
        useShopifyIntegrationsMock.mockReturnValue([{ id: 1 } as any])
    })

    it('should provide the correct value for campaigns', () => {
        useGetCampaignsForStoreMock.mockReturnValue(campaignsForStore as any)

        const { getByText, queryByText } = renderWithStore(
            <CampaignStatsFilters>
                <TestComponent />
            </CampaignStatsFilters>,
            state,
        )

        expect(getByText(campaign.id)).toBeInTheDocument()
        expect(queryByText(deletedCampaignId)).toBeInTheDocument()
    })

    it('should provide the correct value for channelConnectionExternalIds', () => {
        useGetCampaignsForStoreMock.mockReturnValue(campaignsForStore as any)

        const TestComponent = () => (
            <FiltersContext.Consumer>
                {({ channelConnectionExternalIds }) => (
                    <div>{channelConnectionExternalIds}</div>
                )}
            </FiltersContext.Consumer>
        )

        const { getByText } = renderWithStore(
            <CampaignStatsFilters>
                <TestComponent />
            </CampaignStatsFilters>,
            state,
        )

        expect(getByText(channelConnectionExternalId)).toBeInTheDocument()
    })

    it('should reset storeIntegration filter to single selection', () => {
        const stateWithMultipleStoreIntegrationsSelected = {
            integrations: fromJS(integrationsState),
            stats: {
                ...initialState,
                filters: {
                    ...initialState.filters,
                    [FilterKey.StoreIntegrations]: withDefaultLogicalOperator([
                        123, 456,
                    ]),
                },
            },
        } as RootState

        useGetCampaignsForStoreMock.mockReturnValue(campaignsForStore as any)

        const TestComponent = () => (
            <FiltersContext.Consumer>
                {({ channelConnectionExternalIds }) => (
                    <div>{channelConnectionExternalIds}</div>
                )}
            </FiltersContext.Consumer>
        )

        const { store } = renderWithStore(
            <CampaignStatsFilters>
                <TestComponent />
            </CampaignStatsFilters>,
            stateWithMultipleStoreIntegrationsSelected,
        )

        waitFor(() => {
            expect(store.getActions()).toContainEqual(
                mergeStatsFiltersWithLogicalOperator({
                    [FilterKey.StoreIntegrations]: withDefaultLogicalOperator([
                        123,
                    ]),
                }),
            )
        })
    })

    it('should change the storeIntegration', () => {
        const integrationId = 987
        useGetCampaignsForStoreMock.mockReturnValue(campaignsForStore as any)

        const TestComponent = () => (
            <FiltersContext.Consumer>
                {({ channelConnectionExternalIds, onChangeIntegration }) => {
                    onChangeIntegration([integrationId])
                    return <div>{channelConnectionExternalIds}</div>
                }}
            </FiltersContext.Consumer>
        )

        const { store } = renderWithStore(
            <CampaignStatsFilters>
                <TestComponent />
            </CampaignStatsFilters>,
            state,
        )

        waitFor(() => {
            expect(store.getActions()).toContainEqual(
                mergeStatsFiltersWithLogicalOperator({
                    [FilterKey.StoreIntegrations]: withDefaultLogicalOperator([
                        integrationId,
                    ]),
                }),
            )
        })
    })

    it('should change the campaign', () => {
        const campaignId = '789465'
        useGetCampaignsForStoreMock.mockReturnValue(campaignsForStore as any)

        const TestComponent = () => (
            <FiltersContext.Consumer>
                {({ onChangeCampaigns }) => {
                    onChangeCampaigns([campaignId])
                    return <div />
                }}
            </FiltersContext.Consumer>
        )

        const { store } = renderWithStore(
            <CampaignStatsFilters>
                <TestComponent />
            </CampaignStatsFilters>,
            state,
        )

        waitFor(() => {
            expect(store.getActions()).toContainEqual(
                mergeStatsFiltersWithLogicalOperator({
                    [FilterKey.Campaigns]: withDefaultLogicalOperator([
                        campaignId,
                    ]),
                }),
            )
        })
    })

    it('should change the campaign status', () => {
        const campaignStatus = InferredCampaignStatus.Active
        useGetCampaignsForStoreMock.mockReturnValue(campaignsForStore as any)

        const TestComponent = () => (
            <FiltersContext.Consumer>
                {({ onChangeCampaignsByStatus }) => {
                    onChangeCampaignsByStatus([campaignStatus])
                    return <div />
                }}
            </FiltersContext.Consumer>
        )

        const { store } = renderWithStore(
            <CampaignStatsFilters>
                <TestComponent />
            </CampaignStatsFilters>,
            state,
        )

        waitFor(() => {
            expect(store.getActions()).toContainEqual(
                mergeStatsFiltersWithLogicalOperator({
                    [FilterKey.Campaigns]: withDefaultLogicalOperator([
                        campaignStatus,
                    ]),
                }),
            )
        })
    })
})

describe('CampaignStatsFilters without storeIntegrationId', () => {
    const state = {
        integrations: fromJS(integrationsState),
        stats: { filters: defaultStatsFilters },
    } as RootState

    beforeEach(() => {
        useShopifyIntegrationsMock.mockReturnValue([{ id: 1 } as any])
    })

    it('should provide the correct value for campaigns', () => {
        useGetCampaignsForStoreMock.mockReturnValue(campaignsForStore as any)

        const { getByText, queryByText } = renderWithStore(
            <CampaignStatsFilters>
                <TestComponent />
            </CampaignStatsFilters>,
            state,
        )

        expect(getByText(campaign.id)).toBeInTheDocument()
        expect(queryByText(deletedCampaignId)).toBeInTheDocument()
    })
})
