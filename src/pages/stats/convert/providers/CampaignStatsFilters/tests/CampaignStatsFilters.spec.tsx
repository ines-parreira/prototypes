import React from 'react'
import {render} from '@testing-library/react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import {CampaignStatsFilters} from 'pages/stats/convert/providers/CampaignStatsFilters/CampaignStatsFilters'
import {useShopifyIntegrations} from 'pages/stats/convert/hooks/useShopifyIntegrations'
import {useGetCampaignsForStore} from 'pages/stats/convert/hooks/useGetCampaignsForStore'
import {campaign} from 'fixtures/campaign'
import {FeatureFlagKey} from 'config/featureFlags'
import {FiltersContext} from 'pages/stats/convert/providers/CampaignStatsFilters/context'

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
}))

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = useAppSelector as jest.MockedFunction<
    typeof useAppSelector
>

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.MockedFunction<
    typeof useAppDispatch
>

jest.mock('pages/stats/convert/hooks/useShopifyIntegrations')
const useShopifyIntegrationsMock =
    useShopifyIntegrations as jest.MockedFunction<typeof useShopifyIntegrations>

jest.mock('pages/stats/convert/hooks/useGetCampaignsForStore.ts')
const useGetCampaignsForStoreMock =
    useGetCampaignsForStore as jest.MockedFunction<
        typeof useGetCampaignsForStore
    >

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

describe('CampaignStatsFilters', () => {
    beforeEach(() => {
        useAppSelectorMock.mockReturnValue({getIn: jest.fn()})
        useAppDispatchMock.mockReturnValue(jest.fn())
        useShopifyIntegrationsMock.mockReturnValue([{id: 1} as any])
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AnalyticsNewFiltersConvert]: false,
        })
    })

    it('should provide the correct value for campaigns', () => {
        useGetCampaignsForStoreMock.mockReturnValue(campaignsForStore as any)

        const {getByText, queryByText} = render(
            <CampaignStatsFilters>
                <TestComponent />
            </CampaignStatsFilters>
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

        const {getByText} = render(
            <CampaignStatsFilters>
                <TestComponent />
            </CampaignStatsFilters>
        )

        expect(getByText(channelConnectionExternalId)).toBeInTheDocument()
    })
})

describe('CampaignStatsFilters without storeIntegrationId', () => {
    beforeEach(() => {
        useAppSelectorMock.mockReturnValue({getIn: jest.fn()})
        useAppDispatchMock.mockReturnValue(jest.fn())
        useShopifyIntegrationsMock.mockReturnValue([{id: 1} as any])
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AnalyticsNewFiltersConvert]: false,
        })
    })

    it('should provide the correct value for campaigns', () => {
        useGetCampaignsForStoreMock.mockReturnValue(campaignsForStore as any)

        const {getByText, queryByText} = render(
            <CampaignStatsFilters>
                <TestComponent />
            </CampaignStatsFilters>
        )

        expect(getByText(campaign.id)).toBeInTheDocument()
        expect(queryByText(deletedCampaignId)).toBeInTheDocument()
    })
})

describe('CampaignStatsFilters with AnalyticsNewFiltersConvert', () => {
    beforeEach(() => {
        useAppSelectorMock.mockReturnValue({getIn: jest.fn()})
        useAppDispatchMock.mockReturnValue(jest.fn())
        useShopifyIntegrationsMock.mockReturnValue([{id: 1} as any])
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AnalyticsNewFiltersConvert]: true,
        })
    })

    it('should provide the correct value for campaigns', () => {
        useGetCampaignsForStoreMock.mockReturnValue(campaignsForStore as any)

        const {getByText, queryByText} = render(
            <CampaignStatsFilters>
                <TestComponent />
            </CampaignStatsFilters>
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

        const {getByText} = render(
            <CampaignStatsFilters>
                <TestComponent />
            </CampaignStatsFilters>
        )

        expect(getByText(channelConnectionExternalId)).toBeInTheDocument()
    })
})
