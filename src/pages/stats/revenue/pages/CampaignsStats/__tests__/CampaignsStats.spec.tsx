import React from 'react'
import {Provider} from 'react-redux'
import {render} from '@testing-library/react'
import {MemoryRouter, Route} from 'react-router-dom'
import {RootState} from 'state/types'
import {assumeMock, mockStore} from 'utils/testing'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import {getStateWithPrice} from 'utils/paywallTesting'
import {convertStatusOk} from 'fixtures/convert'
import useGetConvertStatus from 'pages/settings/revenue/hooks/useGetConvertStatus'
import {useGetCampaignsForStore} from 'pages/stats/revenue/hooks/useGetCampaignsForStore'
import {Campaign} from 'models/integration/types'
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

jest.mock('pages/settings/revenue/hooks/useGetConvertStatus')

const useGetConvertStatusMock = assumeMock(useGetConvertStatus)

jest.mock('pages/stats/revenue/hooks/useGetCampaignsForStore')
const useGetCampaignsForStoreMock = assumeMock(useGetCampaignsForStore)

describe('CampaignsStats', () => {
    const renderWithStore = (state: Partial<RootState>, props = {}) =>
        render(
            <MemoryRouter>
                <Provider store={mockStore(state as any)}>
                    <Route path="/app/stats/convert/campaigns">
                        <CampaignStatsPaywallView />
                    </Route>
                    <ConvertCampaignsStats {...props} />
                </Provider>
            </MemoryRouter>
        )
    const mockedState = getStateWithPrice()

    beforeEach(() => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)

        useGetConvertStatusMock.mockReturnValue(convertStatusOk)

        useGetCampaignsForStoreMock.mockReturnValue([
            {
                id: '123',
                name: 'some campaign',
            } as Campaign,
        ])
    })

    it('should render the paywall with modal for Convert non-subscriber', () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => false)

        const {queryByText} = renderWithStore(mockedState)

        expect(queryByText('ConvertStatsContent')).not.toBeInTheDocument()
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
