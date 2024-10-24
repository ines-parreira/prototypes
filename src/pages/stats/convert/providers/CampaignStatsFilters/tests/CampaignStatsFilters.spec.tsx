import {fromJS} from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {campaign} from 'fixtures/campaign'
import {integrationsState} from 'fixtures/integrations'
import {useGetCampaignsForStore} from 'pages/stats/convert/hooks/useGetCampaignsForStore'
import {useShopifyIntegrations} from 'pages/stats/convert/hooks/useShopifyIntegrations'
import {CampaignStatsFilters} from 'pages/stats/convert/providers/CampaignStatsFilters/CampaignStatsFilters'
import {FiltersContext} from 'pages/stats/convert/providers/CampaignStatsFilters/context'
import {defaultStatsFilters} from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import {assumeMock, renderWithStore} from 'utils/testing'

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

const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>

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
        {({campaigns}) =>
            campaigns.map((campaign) => (
                <div key={campaign.id}>{campaign.id}</div>
            ))
        }
    </FiltersContext.Consumer>
)

const state = {
    integrations: fromJS(integrationsState),
    stats: {filters: defaultStatsFilters},
} as RootState

describe('CampaignStatsFilters', () => {
    beforeEach(() => {
        useShopifyIntegrationsMock.mockReturnValue([{id: 1} as any])
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AnalyticsNewFiltersConvert]: false,
        })
    })

    it('should provide the correct value for campaigns', () => {
        useGetCampaignsForStoreMock.mockReturnValue(campaignsForStore as any)

        const {getByText, queryByText} = renderWithStore(
            <CampaignStatsFilters>
                <TestComponent />
            </CampaignStatsFilters>,
            state
        )

        expect(getByText(campaign.id)).toBeInTheDocument()
        expect(queryByText(deletedCampaignId)).toBeInTheDocument()
    })

    it('should provide the correct value for channelConnectionExternalIds', () => {
        useGetCampaignsForStoreMock.mockReturnValue(campaignsForStore as any)

        const TestComponent = () => (
            <FiltersContext.Consumer>
                {({channelConnectionExternalIds}) => (
                    <div>{channelConnectionExternalIds}</div>
                )}
            </FiltersContext.Consumer>
        )

        const {getByText} = renderWithStore(
            <CampaignStatsFilters>
                <TestComponent />
            </CampaignStatsFilters>,
            state
        )

        expect(getByText(channelConnectionExternalId)).toBeInTheDocument()
    })
})

describe('CampaignStatsFilters without storeIntegrationId', () => {
    const state = {
        integrations: fromJS(integrationsState),
        stats: {filters: defaultStatsFilters},
    } as RootState
    beforeEach(() => {
        useShopifyIntegrationsMock.mockReturnValue([{id: 1} as any])
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AnalyticsNewFiltersConvert]: false,
        })
    })

    it('should provide the correct value for campaigns', () => {
        useGetCampaignsForStoreMock.mockReturnValue(campaignsForStore as any)

        const {getByText, queryByText} = renderWithStore(
            <CampaignStatsFilters>
                <TestComponent />
            </CampaignStatsFilters>,
            state
        )

        expect(getByText(campaign.id)).toBeInTheDocument()
        expect(queryByText(deletedCampaignId)).toBeInTheDocument()
    })
})

describe('CampaignStatsFilters with AnalyticsNewFiltersConvert', () => {
    const state = {
        integrations: fromJS(integrationsState),
        stats: {filters: defaultStatsFilters},
    } as RootState
    beforeEach(() => {
        useShopifyIntegrationsMock.mockReturnValue([{id: 1} as any])
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AnalyticsNewFiltersConvert]: true,
        })
    })

    it('should provide the correct value for campaigns', () => {
        useGetCampaignsForStoreMock.mockReturnValue(campaignsForStore as any)

        const {getByText, queryByText} = renderWithStore(
            <CampaignStatsFilters>
                <TestComponent />
            </CampaignStatsFilters>,
            state
        )

        expect(getByText(campaign.id)).toBeInTheDocument()
        expect(queryByText(deletedCampaignId)).toBeInTheDocument()
    })

    it('should provide the correct value for channelConnectionExternalIds', () => {
        useGetCampaignsForStoreMock.mockReturnValue(campaignsForStore as any)

        const TestComponent = () => (
            <FiltersContext.Consumer>
                {({channelConnectionExternalIds}) => (
                    <div>{channelConnectionExternalIds}</div>
                )}
            </FiltersContext.Consumer>
        )

        const {getByText} = renderWithStore(
            <CampaignStatsFilters>
                <TestComponent />
            </CampaignStatsFilters>,
            state
        )

        expect(getByText(channelConnectionExternalId)).toBeInTheDocument()
    })
})
