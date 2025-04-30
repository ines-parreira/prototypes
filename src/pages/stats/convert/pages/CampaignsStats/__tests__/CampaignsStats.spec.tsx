import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { Provider } from 'react-redux'
import routerDom, { Route, useParams } from 'react-router-dom'

import { campaign } from 'fixtures/campaign'
import { convertStatusOk } from 'fixtures/convert'
import { CampaignPreview } from 'models/convert/campaign/types'
import { IntegrationType } from 'models/integration/constants'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import useGetConvertStatus from 'pages/convert/common/hooks/useGetConvertStatus'
import { DrillDownModal } from 'pages/stats/common/drill-down/DrillDownModal'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import { useGetCampaignsForStore } from 'pages/stats/convert/hooks/useGetCampaignsForStore'
import ConvertCampaignsStats from 'pages/stats/convert/pages/CampaignsStats/CampaignsStats'
import CampaignStatsPaywallView from 'pages/stats/convert/pages/CampaignsStats/CampaignStatsPaywallView'
import { RootState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { getStateWithHelpdeskPlan } from 'utils/paywallTesting'
import { assumeMock, mockStore, renderWithRouter } from 'utils/testing'

jest.mock('react-router-dom', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    ...(jest.requireActual('react-router-dom') as typeof routerDom),
    useParams: jest.fn(),
}))

jest.mock('pages/stats/convert/components/RequestABTest', () => () => {
    return <div>RequestABTest</div>
})

jest.mock('pages/stats/convert/containers/RevenueStatsContent', () => ({
    RevenueStatsContent: () => {
        return <div>ConvertStatsContent</div>
    },
}))

jest.mock('pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper')
const FiltersPanelWrapperMock = assumeMock(FiltersPanelWrapper)
jest.mock('pages/stats/common/drill-down/DrillDownModal.tsx')
const DrillDownModalMock = assumeMock(DrillDownModal)

jest.mock('hooks/reporting/useCleanStatsFilters')

jest.mock('state/ui/stats/selectors')

jest.mock('pages/convert/common/hooks/useGetConvertStatus')

const useGetConvertStatusMock = assumeMock(useGetConvertStatus)

jest.mock('pages/stats/convert/hooks/useGetCampaignsForStore')
const useGetCampaignsForStoreMock = assumeMock(useGetCampaignsForStore)

jest.mock('launchdarkly-react-client-sdk')
const useFlagsMock = assumeMock(useFlags)

jest.mock('react-router-dom', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    ...(jest.requireActual('react-router-dom') as typeof routerDom),
    useParams: jest.fn(),
}))

jest.mock('hooks/reporting/support-performance/useStatsFilters', () => ({
    useStatsFilters: () => ({
        cleanStatsFilters: {},
        userTimezone: 'UTC',
        granularity: 'day',
    }),
}))

const queryClient = mockQueryClient()

const useParamsMock = assumeMock(useParams)

describe('CampaignsStats', () => {
    const history = createMemoryHistory()

    const renderWithStore = (state: Partial<RootState>, props = {}) =>
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(state as any)}>
                    <Route path="/app/stats/convert/campaigns">
                        <CampaignStatsPaywallView />
                    </Route>
                    <Route path="/app/convert/123/performance">
                        <CampaignStatsPaywallView />
                    </Route>
                    <ConvertCampaignsStats {...props} />
                </Provider>
            </QueryClientProvider>,

            { history },
        )
    const mockedState = getStateWithHelpdeskPlan()

    beforeEach(() => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber',
        ).mockImplementation(() => true)
        FiltersPanelWrapperMock.mockImplementation(() => <div />)
        DrillDownModalMock.mockImplementation(() => <div />)
        useGetConvertStatusMock.mockReturnValue(convertStatusOk)

        useGetCampaignsForStoreMock.mockReturnValue({
            campaigns: [campaign as CampaignPreview],
            channelConnectionExternalIds: [],
        })

        useFlagsMock.mockReturnValue({
            'any-flag': true,
        })

        useParamsMock.mockReturnValue({})
    })

    it('should render the paywall with modal for Convert non-subscriber', () => {
        ;(useParams as jest.Mock).mockReturnValue({})
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber',
        ).mockImplementation(() => false)

        const { getByText, queryByText } = renderWithStore(mockedState)

        expect(queryByText('ConvertStatsContent')).not.toBeInTheDocument()
        expect(
            getByText(
                'Meet Gorgias Convert - Your onsite revenue generation toolkit 🤩',
            ),
        ).toBeInTheDocument()

        expect(history.location.pathname).toEqual(
            '/app/stats/convert/campaigns/subscribe',
        )
    })

    it('should redirect to Convert section performance paywall', () => {
        ;(useParams as jest.Mock).mockReturnValue({})
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber',
        ).mockImplementation(() => false)

        useParamsMock.mockReturnValue({ id: '123' })

        const { getByText, queryByText } = renderWithStore(mockedState)

        expect(queryByText('ConvertStatsContent')).not.toBeInTheDocument()
        expect(
            getByText(
                'Meet Gorgias Convert - Your onsite revenue generation toolkit 🤩',
            ),
        ).toBeInTheDocument()

        expect(history.location.pathname).toEqual(
            '/app/convert/123/performance/subscribe',
        )
    })

    it('should not render and wait for flags', () => {
        useFlagsMock.mockReturnValue({})

        const { queryByText } = renderWithStore(mockedState)

        expect(queryByText('ConvertStatsContent')).not.toBeInTheDocument()
        expect(queryByText('Learn More')).not.toBeInTheDocument()
    })

    it('should render stats for Convert subscriber', () => {
        ;(useParams as jest.Mock).mockReturnValue({})
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber',
        ).mockImplementation(() => true)

        const { getByText } = renderWithStore(mockedState)

        expect(getByText('ConvertStatsContent')).toBeInTheDocument()
    })

    it('should render stats request A/B test button', () => {
        ;(useParams as jest.Mock).mockReturnValue({
            id: '123',
        })

        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber',
        ).mockImplementation(() => true)

        const { getByText } = renderWithStore(mockedState)

        expect(getByText('ConvertStatsContent')).toBeInTheDocument()
        expect(getByText('RequestABTest')).toBeInTheDocument()
    })

    it('should render error when there is no Shopify store integration', () => {
        ;(useParams as jest.Mock).mockReturnValue({})

        const stateWithoutIntegration = {
            ...mockedState,
            integrations: fromJS({
                integrations: [
                    {
                        type: IntegrationType.BigCommerce,
                    },
                ],
            }),
        } as unknown as RootState

        const { getByText } = renderWithStore(stateWithoutIntegration)

        expect(
            getByText(
                'Campaigns dashboard is only available for Shopify stores.',
            ),
        ).toBeInTheDocument()
    })
})
