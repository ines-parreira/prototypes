import React from 'react'
import {render} from '@testing-library/react'
import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import {CampaignStatsFilters} from 'pages/stats/convert/providers/CampaignStatsFilters/CampaignStatsFilters'
import {useShopifyIntegrations} from 'pages/stats/convert/hooks/useShopifyIntegrations'
import {useGetCampaignsForStore} from 'pages/stats/convert/hooks/useGetCampaignsForStore'
import {campaign} from 'fixtures/campaign'
import {FiltersContext} from '../context'

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

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(() => ({
        CONVERT_ROUTE_PARAM_NAME: '1',
    })),
}))

describe('CampaignStatsFilters', () => {
    const deletedCampaignId = '8bd36873-35fc-4b99-83ac-701f20d570bd'
    const deletedCampaign = {
        ...campaign,
        id: deletedCampaignId,
        deleted_datetime: '2021-02-03T00:00:00.000Z',
    }

    beforeEach(() => {
        useAppSelectorMock.mockImplementation(() => {
            return {getIn: jest.fn().mockReturnValue('1')}
        })
        useAppDispatchMock.mockReturnValue(jest.fn())
        useShopifyIntegrationsMock.mockReturnValue([{id: 1} as any])
    })

    it('should provide the correct value for allCampaigns', () => {
        useGetCampaignsForStoreMock.mockReturnValue([
            campaign,
            deletedCampaign,
        ] as any)

        const TestComponent = () => (
            <FiltersContext.Consumer>
                {({allCampaigns}) =>
                    allCampaigns.map((campaign) => (
                        <div key={campaign.id}>{campaign.id}</div>
                    ))
                }
            </FiltersContext.Consumer>
        )

        const {getByText} = render(
            <CampaignStatsFilters>
                <TestComponent />
            </CampaignStatsFilters>
        )

        expect(getByText(campaign.id)).toBeInTheDocument()
        expect(getByText(deletedCampaignId)).toBeInTheDocument()
    })

    it('should provide the correct value for campaigns', () => {
        useGetCampaignsForStoreMock.mockReturnValue([
            campaign,
            deletedCampaign,
        ] as any)

        const TestComponent = () => (
            <FiltersContext.Consumer>
                {({campaigns}) =>
                    campaigns.map((campaign) => (
                        <div key={campaign.id}>{campaign.id}</div>
                    ))
                }
            </FiltersContext.Consumer>
        )

        const {getByText, queryByText} = render(
            <CampaignStatsFilters>
                <TestComponent />
            </CampaignStatsFilters>
        )

        expect(getByText(campaign.id)).toBeInTheDocument()
        expect(queryByText(deletedCampaignId)).not.toBeInTheDocument()
    })
})
