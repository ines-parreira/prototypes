import { assumeMock } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'

import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { useFirstStoreWithAiSalesData } from 'domains/reporting/pages/convert/hooks/useFirstStoreWithAiSalesData'
import { useGetCampaignsForStore } from 'domains/reporting/pages/convert/hooks/useGetCampaignsForStore'
import { useShopifyIntegrations } from 'domains/reporting/pages/convert/hooks/useShopifyIntegrations'
import { CampaignStatsFilters } from 'domains/reporting/pages/convert/providers/CampaignStatsFilters/CampaignStatsFilters'
import { FiltersContext } from 'domains/reporting/pages/convert/providers/CampaignStatsFilters/context'
import {
    defaultStatsFilters,
    initialState,
    mergeStatsFiltersWithLogicalOperator,
} from 'domains/reporting/state/stats/statsSlice'
import { campaign } from 'fixtures/campaign'
import { integrationsState } from 'fixtures/integrations'
import { InferredCampaignStatus } from 'models/convert/campaign/types'
import { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({
        CONVERT_ROUTE_PARAM_NAME: '1',
    }),
}))

jest.mock('domains/reporting/pages/convert/hooks/useShopifyIntegrations')
const useShopifyIntegrationsMock =
    useShopifyIntegrations as jest.MockedFunction<typeof useShopifyIntegrations>

jest.mock('domains/reporting/pages/convert/hooks/useGetCampaignsForStore')
const useGetCampaignsForStoreMock = assumeMock(useGetCampaignsForStore)

jest.mock('domains/reporting/pages/convert/hooks/useFirstStoreWithAiSalesData')
const useFirstStoreWithAiSalesDataMock = assumeMock(
    useFirstStoreWithAiSalesData,
)

jest.mock('domains/reporting/state/ui/stats/selectors')

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
        useFirstStoreWithAiSalesDataMock.mockReturnValue({
            storeId: 1,
            isLoading: true,
        })
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

    it('should dispatch fallback storeIntegration if none is selected and fallbackStoreId is available', async () => {
        const fallbackStoreId = 321
        useFirstStoreWithAiSalesDataMock.mockReturnValue({
            storeId: fallbackStoreId,
            isLoading: false,
        })

        useGetCampaignsForStoreMock.mockReturnValue(campaignsForStore as any)

        const stateWithEmptyStoreIntegrations = {
            ...state,
            stats: {
                ...state.stats,
                filters: {
                    ...state.stats.filters,
                    [FilterKey.StoreIntegrations]: withDefaultLogicalOperator(
                        [],
                    ),
                },
            },
        } as RootState

        const TestComponent = () => (
            <FiltersContext.Consumer>
                {({ selectedIntegrations }) => (
                    <div>{selectedIntegrations.join(',')}</div>
                )}
            </FiltersContext.Consumer>
        )

        const { getByText, store } = renderWithStore(
            <CampaignStatsFilters isSelectStoreWithData>
                <TestComponent />
            </CampaignStatsFilters>,
            stateWithEmptyStoreIntegrations,
        )

        await waitFor(() => {
            expect(store.getActions()).toContainEqual(
                mergeStatsFiltersWithLogicalOperator({
                    [FilterKey.StoreIntegrations]: withDefaultLogicalOperator([
                        fallbackStoreId,
                    ]),
                    [FilterKey.Campaigns]: withDefaultLogicalOperator([]),
                    [FilterKey.CampaignStatuses]: withDefaultLogicalOperator(
                        [],
                    ),
                }),
            )
            expect(getByText(`${fallbackStoreId}`)).toBeInTheDocument()
        })
    })

    it('should dispatch first storeIntegration if none is selected and fallbackStoreId is not available', async () => {
        useFirstStoreWithAiSalesDataMock.mockReturnValue({
            storeId: null,
            isLoading: false,
        })

        useGetCampaignsForStoreMock.mockReturnValue(campaignsForStore as any)

        const stateWithEmptyStoreIntegrations = {
            ...state,
            stats: {
                ...state.stats,
                filters: {
                    ...state.stats.filters,
                    [FilterKey.StoreIntegrations]: withDefaultLogicalOperator(
                        [],
                    ),
                },
            },
        } as RootState

        const TestComponent = () => (
            <FiltersContext.Consumer>
                {({ selectedIntegrations }) => (
                    <div>{selectedIntegrations.join(',')}</div>
                )}
            </FiltersContext.Consumer>
        )

        const { store } = renderWithStore(
            <CampaignStatsFilters isSelectStoreWithData>
                <TestComponent />
            </CampaignStatsFilters>,
            stateWithEmptyStoreIntegrations,
        )

        await waitFor(() => {
            expect(store.getActions()).toContainEqual(
                mergeStatsFiltersWithLogicalOperator({
                    [FilterKey.StoreIntegrations]: withDefaultLogicalOperator([
                        1,
                    ]),
                    [FilterKey.Campaigns]: withDefaultLogicalOperator([]),
                    [FilterKey.CampaignStatuses]: withDefaultLogicalOperator(
                        [],
                    ),
                }),
            )
        })
    })

    it('should use storeIntegration from filters if storeIntegrationId is missing', () => {
        const integrationFromFilters = 456

        useFirstStoreWithAiSalesDataMock.mockReturnValue({
            storeId: 999, // fallback exists but shouldn't be used
            isLoading: false,
        })

        useGetCampaignsForStoreMock.mockReturnValue(campaignsForStore as any)

        const customState = {
            integrations: fromJS(integrationsState),
            stats: {
                ...initialState,
                filters: {
                    ...initialState.filters,
                    [FilterKey.StoreIntegrations]: withDefaultLogicalOperator([
                        integrationFromFilters,
                    ]),
                },
            },
        } as RootState

        // simulate missing shop_integration_id to force fallback logic
        jest.mock('react-router-dom', () => ({
            ...jest.requireActual('react-router-dom'),
            useParams: () => ({
                CONVERT_ROUTE_PARAM_NAME: '1',
            }),
        }))

        const TestComponent = () => (
            <FiltersContext.Consumer>
                {({ selectedIntegrations }) => (
                    <div>{selectedIntegrations.join(',')}</div>
                )}
            </FiltersContext.Consumer>
        )

        const { getByText } = renderWithStore(
            <CampaignStatsFilters isSelectStoreWithData>
                <TestComponent />
            </CampaignStatsFilters>,
            customState,
        )

        expect(getByText(`${integrationFromFilters}`)).toBeInTheDocument()
    })

    it('should not fallback to any default integration in case no', () => {
        useShopifyIntegrationsMock.mockReturnValue([])
        useFirstStoreWithAiSalesDataMock.mockReturnValue({
            storeId: null,
            isLoading: false,
        })

        useGetCampaignsForStoreMock.mockReturnValue(campaignsForStore as any)

        const customState = {
            ...state,
            integrations: fromJS([]),
            stats: {
                ...state.stats,
                filters: {
                    ...state.stats.filters,
                    [FilterKey.StoreIntegrations]: withDefaultLogicalOperator(
                        [],
                    ),
                },
            },
        } as RootState

        // simulate missing shop_integration_id to force fallback logic
        jest.mock('react-router-dom', () => ({
            ...jest.requireActual('react-router-dom'),
            useParams: () => ({
                CONVERT_ROUTE_PARAM_NAME: '',
            }),
        }))

        const TestComponent = () => (
            <FiltersContext.Consumer>
                {({ selectedIntegrations }) => (
                    <div>
                        {selectedIntegrations.length > 0
                            ? 'have-filters'
                            : 'no-filters'}
                    </div>
                )}
            </FiltersContext.Consumer>
        )

        const { getByText } = renderWithStore(
            <CampaignStatsFilters isSelectStoreWithData>
                <TestComponent />
            </CampaignStatsFilters>,
            customState,
        )

        expect(getByText(`no-filters`)).toBeInTheDocument()
    })
})
