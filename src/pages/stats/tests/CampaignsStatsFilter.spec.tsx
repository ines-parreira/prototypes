import {fireEvent, render} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {campaign} from 'fixtures/campaign'
import {channelConnection} from 'fixtures/channelConnection'
import {integrationsState} from 'fixtures/integrations'
import {useListCampaigns} from 'models/convert/campaign/queries'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {initialState} from 'state/stats/statsSlice'

import {RootState} from 'state/types'

import {assumeMock} from 'utils/testing'

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
