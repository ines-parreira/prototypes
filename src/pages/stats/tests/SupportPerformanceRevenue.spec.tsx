import React, {ComponentProps} from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import _noop from 'lodash/noop'
import LD from 'launchdarkly-react-client-sdk'
import useStatResource from 'hooks/reporting/useStatResource'

import {RootState, StoreDispatch} from 'state/types'
import {TicketChannel} from 'business/types/ticket'
import {
    revenueOverview,
    revenuePerAgent,
    revenuePerDay,
    revenuePerTicket,
} from 'fixtures/stats'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {assumeMock, renderWithRouter} from 'utils/testing'
import {
    REVENUE_OVERVIEW,
    REVENUE_PER_AGENT,
    REVENUE_PER_DAY,
} from 'config/stats'
import FeaturePaywall from 'pages/common/components/FeaturePaywall/FeaturePaywall'
import {agents} from 'fixtures/agents'
import {teams} from 'fixtures/teams'
import {account} from 'fixtures/account'
import {AccountFeature} from 'state/currentAccount/types'

import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import {convertStatusOk} from 'fixtures/convert'
import useGetConvertStatus from 'pages/convert/common/hooks/useGetConvertStatus'
import {billingState} from 'fixtures/billing'
import {IntegrationType} from 'models/integration/constants'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {useListCampaigns} from 'models/convert/campaign/queries'
import {channelConnection} from 'fixtures/channelConnection'
import {campaign} from 'fixtures/campaign'
import TagsStatsFilter from 'pages/stats/TagsStatsFilter'
import SupportPerformanceRevenue from 'pages/stats/SupportPerformanceRevenue'
import {FeatureFlagKey} from 'config/featureFlags'

jest.mock('hooks/reporting/useStatResource')
jest.mock('react-chartjs-2', () => ({Bar: () => <canvas />}))
jest.mock(
    'pages/common/components/FeaturePaywall/FeaturePaywall',
    () =>
        ({feature}: ComponentProps<typeof FeaturePaywall>) => {
            return <div>Paywall for {feature}</div>
        }
)
jest.mock(
    'pages/stats/TagsStatsFilter',
    () =>
        ({value}: ComponentProps<typeof TagsStatsFilter>) =>
            <div>TagsStatsFilterMock, value: {JSON.stringify(value)}</div>
)
jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
jest.mock('pages/stats/ChannelsStatsFilter', () => () => (
    <div>ChannelsStatsFilter</div>
))

jest.mock('pages/convert/common/hooks/useGetConvertStatus')
jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection
)

jest.mock('models/convert/campaign/queries')
const useListCampaignMock = assumeMock(useListCampaigns)

const useGetConvertStatusMock = assumeMock(useGetConvertStatus)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useStatResourceMock = assumeMock(useStatResource)
let dateNowSpy: jest.SpiedFunction<typeof Date.now>
let mathRandomSpy: jest.SpiedFunction<typeof Math.random>

export const integrationsState = {
    integrations: [
        {
            deleted_datetime: null,
            meta: {
                preferences: {
                    linked_email_integration: 5,
                },
                shop_integration_id: 516,
            },
            facebook: null,
            http: null,
            deactivated_datetime: null,
            name: 'Chitty chatty',
            user: {
                id: 2,
            },
            uri: '/api/integrations/8/',
            decoration: null,
            locked_datetime: null,
            created_datetime: '2017-02-07T06:07:43.481450+00:00',
            type: 'gorgias_chat',
            id: 8,
            description: null,
            updated_datetime: '2017-02-07T06:07:43.481517+00:00',
        },
        {
            deleted_datetime: null,
            meta: {
                preferences: {
                    linked_email_integration: 5,
                },
                shop_integration_id: 516,
            },
            facebook: null,
            http: null,
            deactivated_datetime: null,
            name: 'Another chat integration',
            user: {
                id: 2,
            },
            uri: '/api/integrations/9/',
            decoration: null,
            locked_datetime: null,
            created_datetime: '2017-02-07T06:07:43.481450+00:00',
            type: 'gorgias_chat',
            id: 9,
            description: null,
            updated_datetime: '2017-02-07T06:07:43.481517+00:00',
        },
        {
            deleted_datetime: null,
            meta: {
                preferences: {
                    linked_email_integration: 5,
                },
                shop_integration_id: 1,
            },
            facebook: null,
            http: null,
            deactivated_datetime: null,
            name: 'Unlinked chat',
            user: {
                id: 2,
            },
            uri: '/api/integrations/10/',
            decoration: null,
            locked_datetime: null,
            created_datetime: '2017-02-07T06:07:43.481450+00:00',
            type: 'gorgias_chat',
            id: 10,
            description: null,
            updated_datetime: '2017-02-07T06:07:43.481517+00:00',
        },
        {
            deleted_datetime: null,
            meta: {
                shop_name: 'My shop',
                currency: 'USD',
            },
            http: null,
            deactivated_datetime: null,
            name: 'My Shop',
            uri: '/api/integrations/516/',
            decoration: null,
            locked_datetime: null,
            created_datetime: '2017-02-07T06:07:43.481450+00:00',
            type: IntegrationType.Shopify,
            id: 516,
            description: null,
            updated_datetime: '2017-02-07T06:07:43.481517+00:00',
        },
    ],
    state: {
        loading: {
            integrations: false,
            integration: false,
        },
    },
}

describe('SupportPerformanceRevenue', () => {
    const shopifyIntegration = integrationsState.integrations.find(
        (integration) => {
            return integration.type === IntegrationType.Shopify
        }
    )

    const defaultState = {
        currentAccount: fromJS(account),
        integrations: fromJS(integrationsState),
        stats: {
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                channels: [TicketChannel.Chat],
                integrations: [shopifyIntegration && shopifyIntegration.id],
                agents: [agents[0].id],
                tags: [1],
                campaigns: [campaign.id],
            },
        },
        agents: fromJS({
            all: agents,
        }),
        teams: fromJS({
            all: teams,
        }),
        billing: fromJS(billingState),
        ui: {
            stats: uiStatsInitialState,
        },
    } as RootState

    beforeEach(() => {
        useStatResourceMock.mockReturnValue([null, true, _noop])
        dateNowSpy = jest
            .spyOn(Date, 'now')
            .mockImplementation(() => 1487076708000)
        mathRandomSpy = jest.spyOn(Math, 'random').mockImplementation(() => 42)

        useGetConvertStatusMock.mockReturnValue(convertStatusOk)
        useGetOrCreateChannelConnectionMock.mockReturnValue({
            channelConnection: channelConnection,
        } as any)
        useListCampaignMock.mockReturnValue({
            data: [campaign],
        } as any)
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.NewDatePickerVariant]: false,
        }))
    })

    afterEach(() => {
        dateNowSpy.mockRestore()
        mathRandomSpy.mockRestore()
    })

    it('should render the filters and stats when stats filters are defined', () => {
        useStatResourceMock.mockImplementation(({resourceName}) => {
            switch (resourceName) {
                case REVENUE_OVERVIEW:
                    return [revenueOverview, false, _noop]
                case REVENUE_PER_DAY:
                    return [revenuePerDay, false, _noop]
                case REVENUE_PER_AGENT:
                    return [revenuePerAgent, false, _noop]
                default:
                    return [revenuePerTicket, false, _noop]
            }
        })
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)

        const {container} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceRevenue />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render the campaign filters if the flag is deactivated', () => {
        useStatResourceMock.mockImplementation(({resourceName}) => {
            switch (resourceName) {
                case REVENUE_OVERVIEW:
                    return [revenueOverview, false, _noop]
                case REVENUE_PER_DAY:
                    return [revenuePerDay, false, _noop]
                case REVENUE_PER_AGENT:
                    return [revenuePerAgent, false, _noop]
                default:
                    return [revenuePerTicket, false, _noop]
            }
        })
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => false)

        const {queryByPlaceholderText} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceRevenue />
            </Provider>
        )

        expect(queryByPlaceholderText('Search campaigns...')).toBe(null)
    })

    it('should render the paywall when the current account has no revenue statistics feature', () => {
        const store = mockStore({
            ...defaultState,
            currentAccount: defaultState.currentAccount.setIn(
                ['features', AccountFeature.RevenueStatistics, 'enabled'],
                false
            ),
        })
        const {container} = render(
            <Provider store={store}>
                <SupportPerformanceRevenue />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the restricted feature page when where are no store integrations', () => {
        const store = mockStore({
            ...defaultState,
            integrations: fromJS([]),
        })
        const {container} = render(
            <Provider store={store}>
                <SupportPerformanceRevenue />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
