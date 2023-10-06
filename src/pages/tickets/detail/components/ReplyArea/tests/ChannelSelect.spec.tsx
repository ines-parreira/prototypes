import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {channels as mockChannels} from 'fixtures/channels'
import {applications as mockApplications} from 'fixtures/applications'
import {channelsQueryKeys as mockChannelsQueryKeys} from 'models/channel/queries'
import {applicationsQueryKeys as mockApplicationsQueryKeys} from 'models/application/queries'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {ChannelIdentifier} from 'services/channels'

import ChannelSelect from '../ChannelSelect'

jest.mock('api/queryClient', () => ({
    appQueryClient: mockQueryClient({
        cachedData: [
            [mockChannelsQueryKeys.list(), mockChannels],
            [mockApplicationsQueryKeys.list(), mockApplications],
        ],
    }),
}))

jest.mock('state/newMessage/actions', () => ({
    prepare: jest.fn().mockImplementation((channel: ChannelIdentifier) => ({
        type: 'MOCKED_PREPARE_NEW_MESSAGE',
        payload: channel,
    })),
}))

describe('<ChannelSelect/>', () => {
    it('should render a list of (new and legacy) channels', () => {
        const store = configureMockStore()({
            integrations: fromJS({
                integrations: [{type: 'email'}],
            }),
        })

        const {queryByText} = render(
            <Provider store={store}>
                <ChannelSelect />
            </Provider>
        )

        expect(queryByText('Email')).toBeInTheDocument()
        expect(queryByText('TikTok Shop')).toBeInTheDocument()
    })

    it('should trigger a channel change when selecting a channel', () => {
        const store = configureMockStore([thunk])({
            ticket: fromJS({messages: []}),
            integrations: fromJS({
                integrations: [
                    {type: 'email', meta: {address: 'test@gorgias.com'}},
                ],
            }),
        })

        const {getByText} = render(
            <Provider store={store}>
                <ChannelSelect />
            </Provider>
        )

        fireEvent.click(getByText('Email'))
        expect(store.getActions()).toEqual([
            {
                type: 'MOCKED_PREPARE_NEW_MESSAGE',
                payload: 'email',
            },
        ])
    })
})
