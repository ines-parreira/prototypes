import React from 'react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fireEvent, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import {initialState} from 'state/stats/statsSlice'

import {RootState} from 'state/types'

import {integrationsState} from 'fixtures/integrations'
import {channelConnection} from 'fixtures/channelConnection'
import {assumeMock} from 'utils/testing'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {useListCampaigns} from 'models/convert/campaign/queries'
import {campaign} from 'fixtures/campaign'
import CampaignsStatsFilter from '../CampaignsStatsFilter'

const mockStore = configureMockStore([thunk])

jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection
)

jest.mock('models/convert/campaign/queries')
const useListCampaignMock = assumeMock(useListCampaigns)

describe('CampaignsStatsFilter', () => {
    const gorgiasChatId = 8
    const defaultState = {
        integrations: fromJS(integrationsState),
        stats: initialState,
    } as RootState

    beforeEach(() => {
        useGetOrCreateChannelConnectionMock.mockReturnValue({
            channelConnection: channelConnection,
        } as any)
        useListCampaignMock.mockReturnValue({
            data: [campaign],
        } as any)
    })

    it('should render campaigns stats filter', () => {
        const {getByLabelText} = render(
            <Provider store={mockStore(defaultState)}>
                <CampaignsStatsFilter
                    value={[campaign.id]}
                    selectedIntegrations={[gorgiasChatId]}
                />
            </Provider>
        )
        expect(getByLabelText(campaign.name)).toBeInTheDocument()
    })

    it('should merge stats filters on item select', () => {
        const store = mockStore(defaultState)
        const {getByLabelText} = render(
            <Provider store={store}>
                <CampaignsStatsFilter
                    value={[]}
                    selectedIntegrations={[gorgiasChatId]}
                />
            </Provider>
        )

        fireEvent.click(getByLabelText(campaign.name))

        const action: Record<string, unknown> = store.getActions()[0]
        expect(action.type).toBe('stats/mergeStatsFilters')
        expect(action.payload).toEqual({
            campaigns: [campaign.id],
        })
    })
})
