import { useAreFlagsLoading } from '@repo/feature-flags'
import { assumeMock, render } from '@repo/testing'
import { fromJS } from 'immutable'
import type routerDom from 'react-router-dom'
import { Route, useParams } from 'react-router-dom'

import { DrillDownModal } from 'domains/reporting/pages/common/drill-down/DrillDownModal'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import { useGetCampaignsForStore } from 'domains/reporting/pages/convert/hooks/useGetCampaignsForStore'
import ConvertCampaignsStats from 'domains/reporting/pages/convert/pages/CampaignsStats/CampaignsStats'
import CampaignStatsPaywallView from 'domains/reporting/pages/convert/pages/CampaignsStats/CampaignStatsPaywallView'
import { campaign } from 'fixtures/campaign'
import { convertStatusOk } from 'fixtures/convert'
import type { CampaignPreview } from 'models/convert/campaign/types'
import { IntegrationType } from 'models/integration/constants'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import useGetConvertStatus from 'pages/convert/common/hooks/useGetConvertStatus'
import type { RootState } from 'state/types'
import { getStateWithHelpdeskPlan } from 'utils/paywallTesting'

jest.mock('react-router-dom', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    ...(jest.requireActual('react-router-dom') as typeof routerDom),
    useParams: jest.fn(),
}))

jest.mock(
    'domains/reporting/pages/convert/components/RequestABTest',
    () => () => {
        return <div>RequestABTest</div>
    },
)

jest.mock(
    'domains/reporting/pages/convert/containers/RevenueStatsContent',
    () => ({
        RevenueStatsContent: () => {
            return <div>ConvertStatsContent</div>
        },
    }),
)

jest.mock(
    'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper',
)
const FiltersPanelWrapperMock = assumeMock(FiltersPanelWrapper)
jest.mock('domains/reporting/pages/common/drill-down/DrillDownModal.tsx')
const DrillDownModalMock = assumeMock(DrillDownModal)

jest.mock('domains/reporting/hooks/useCleanStatsFilters')

jest.mock('domains/reporting/state/ui/stats/selectors')

jest.mock('pages/convert/common/hooks/useGetConvertStatus')

const useGetConvertStatusMock = assumeMock(useGetConvertStatus)

jest.mock('domains/reporting/pages/convert/hooks/useGetCampaignsForStore')
const useGetCampaignsForStoreMock = assumeMock(useGetCampaignsForStore)

jest.mock('react-router-dom', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    ...(jest.requireActual('react-router-dom') as typeof routerDom),
    useParams: jest.fn(),
}))

jest.mock('@repo/feature-flags')
const useAreFlagsLoadingMock = assumeMock(useAreFlagsLoading)

jest.mock(
    'domains/reporting/hooks/support-performance/useStatsFilters',
    () => ({
        useStatsFilters: () => ({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2021-01-01T00:00:00Z',
                    end_datetime: '2021-01-02T00:00:00Z',
                },
            },
            userTimezone: 'UTC',
            granularity: 'day',
        }),
    }),
)

const useParamsMock = assumeMock(useParams)

describe('CampaignsStats', () => {
    const renderWithStore = (
        state: Partial<RootState>,
        props = {},
        initialEntry = '/app/stats/convert/campaigns',
    ) =>
        render(
            <>
                <Route path="/app/stats/convert/campaigns">
                    <CampaignStatsPaywallView />
                </Route>
                <Route path="/app/convert/123/performance">
                    <CampaignStatsPaywallView />
                </Route>
                <Route path="/app/stats/convert/campaigns/subscribe">
                    Convert campaigns subscribe route
                </Route>
                <Route path="/app/convert/123/performance/subscribe">
                    Convert performance subscribe route
                </Route>
                <ConvertCampaignsStats {...props} />
            </>,
            { initialEntries: [initialEntry], storeState: state },
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
        useAreFlagsLoadingMock.mockReturnValue(false)
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

        expect(
            getByText('Convert campaigns subscribe route'),
        ).toBeInTheDocument()
    })

    it('should redirect to Convert section performance paywall', () => {
        ;(useParams as jest.Mock).mockReturnValue({})
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber',
        ).mockImplementation(() => false)

        useParamsMock.mockReturnValue({ id: '123' })

        const { getByText, queryByText } = renderWithStore(
            mockedState,
            {},
            '/app/convert/123/performance',
        )

        expect(queryByText('ConvertStatsContent')).not.toBeInTheDocument()
        expect(
            getByText(
                'Meet Gorgias Convert - Your onsite revenue generation toolkit 🤩',
            ),
        ).toBeInTheDocument()

        expect(
            getByText('Convert performance subscribe route'),
        ).toBeInTheDocument()
    })

    it('should not render and wait for flags', () => {
        useAreFlagsLoadingMock.mockReturnValue(true)
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
