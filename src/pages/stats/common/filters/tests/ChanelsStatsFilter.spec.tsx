import React from 'react'

import { fireEvent, render } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { channels } from 'fixtures/channels'
import DEPRECATED_ChannelsStatsFilter from 'pages/stats/common/filters/DEPRECATED_ChannelsStatsFilter'
import * as channelsService from 'services/channels'
import { initialState, mergeStatsFilters } from 'state/stats/statsSlice'
import { RootState } from 'state/types'

const mockStore = configureMockStore([thunk])

jest.spyOn(channelsService, 'getChannels').mockReturnValue(channels)

describe('ChannelsStatsFilter', () => {
    const allChannels = channelsService.getChannels()
    const defaultState = {
        stats: initialState,
    } as RootState

    it('should render channels stats filter', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <DEPRECATED_ChannelsStatsFilter
                    value={[allChannels[0]?.slug]}
                />
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should merge stats filters on item select', () => {
        const store = mockStore(defaultState)
        const { getByLabelText } = render(
            <Provider store={store}>
                <DEPRECATED_ChannelsStatsFilter value={[]} />
            </Provider>,
        )

        fireEvent.click(getByLabelText('Email'))

        expect(store.getActions()).toContainEqual(
            mergeStatsFilters({ channels: [] }),
        )
    })
})
