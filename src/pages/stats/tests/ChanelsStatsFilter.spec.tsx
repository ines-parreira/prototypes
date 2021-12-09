import React from 'react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fireEvent, render} from '@testing-library/react'
import {Provider} from 'react-redux'

import {RootState} from '../../../state/types'
import ChannelsStatsFilter from '../ChannelsStatsFilter'
import {TicketChannel} from '../../../business/types/ticket'

const mockStore = configureMockStore([thunk])

describe('ChannelsStatsFilter', () => {
    const allChannels = Object.values(TicketChannel)
    const defaultState = {
        stats: fromJS({
            filters: null,
        }),
    } as RootState

    it('should render channels stats filter', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <ChannelsStatsFilter
                    value={[allChannels[0]]}
                    channels={allChannels}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should merge stats filters on item select', () => {
        const store = mockStore(defaultState)
        const {getByLabelText} = render(
            <Provider store={store}>
                <ChannelsStatsFilter
                    value={[]}
                    channels={Object.values(TicketChannel)}
                />
            </Provider>
        )

        fireEvent.click(getByLabelText('Email'))

        expect(store.getActions()).toMatchSnapshot()
    })
})
