import React from 'react'
import {Provider} from 'react-redux'
import routerDom, {Route, useParams} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {createMemoryHistory} from 'history'
import {RootState} from 'state/types'
import {assumeMock, mockStore, renderWithRouter} from 'utils/testing'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import {getStateWithPrice} from 'utils/paywallTesting'
import {convertStatusOk} from 'fixtures/convert'
import useGetConvertStatus from 'pages/convert/common/hooks/useGetConvertStatus'
import {useGetCampaignsForStore} from 'pages/stats/convert/hooks/useGetCampaignsForStore'

import {campaign} from 'fixtures/campaign'
import {Campaign} from 'models/convert/campaign/types'
import ConvertCampaignsStats from '../CampaignsStats'
import CampaignStatsPaywallView from '../CampaignStatsPaywallView'

jest.mock('../../../containers/RevenueStatsContent', () => ({
    RevenueStatsContent: () => {
        return <div>ConvertStatsContent</div>
    },
}))

jest.mock('../../../containers/RevenueFilters', () => ({
    RevenueFilters: () => {
        return <div>Filters</div>
    },
}))
jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))

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
const useParamsMock = assumeMock(useParams)

describe('CampaignsStats', () => {
    const history = createMemoryHistory()

    const renderWithStore = (state: Partial<RootState>, props = {}) =>
        renderWithRouter(
            <Provider store={mockStore(state as any)}>
                <Route path="/app/stats/convert/campaigns">
                    <CampaignStatsPaywallView />
                </Route>
                <Route path="/app/convert/123/performance">
                    <CampaignStatsPaywallView />
                </Route>
                <ConvertCampaignsStats {...props} />
            </Provider>,
            {history}
        )
    const mockedState = getStateWithPrice()

    beforeEach(() => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)

        useGetConvertStatusMock.mockReturnValue(convertStatusOk)

        useGetCampaignsForStoreMock.mockReturnValue([campaign as Campaign])

        useFlagsMock.mockReturnValue({
            'any-flag': true,
        })

        useParamsMock.mockReturnValue({})
    })

    it('should render the paywall with modal for Convert non-subscriber', () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => false)

        const {getByText, queryByText} = renderWithStore(mockedState)

        expect(queryByText('ConvertStatsContent')).not.toBeInTheDocument()
        expect(getByText('Select plan to get started')).toBeInTheDocument()

        expect(history.location.pathname).toEqual(
            '/app/stats/convert/campaigns/subscribe'
        )
    })

    it('should redirect to Convert section performance paywall', () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => false)

        useParamsMock.mockReturnValue({id: '123'})

        const {getByText, queryByText} = renderWithStore(mockedState)

        expect(queryByText('ConvertStatsContent')).not.toBeInTheDocument()
        expect(getByText('Select plan to get started')).toBeInTheDocument()

        expect(history.location.pathname).toEqual(
            '/app/convert/123/performance/subscribe'
        )
    })

    it('should not render and wait for flags', () => {
        useFlagsMock.mockReturnValue({})

        const {queryByText} = renderWithStore(mockedState)

        expect(queryByText('ConvertStatsContent')).not.toBeInTheDocument()
        expect(
            queryByText('Select plan to get started')
        ).not.toBeInTheDocument()
    })

    it('should render stats for Convert subscriber', () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)

        const {getByText} = renderWithStore(mockedState)

        expect(getByText('ConvertStatsContent')).toBeInTheDocument()
    })
})
