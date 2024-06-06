import React from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {ScoreStatsFilter} from 'pages/stats/ScoreStatsFilter'
import {initialState} from 'state/stats/statsSlice'
import {RootState} from 'state/types'

const mockStore = configureMockStore([thunk])

describe('ScoreStatsFilter', () => {
    const defaultState = {
        stats: initialState,
    } as RootState

    it('should render score stats filter', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <ScoreStatsFilter
                    value={['2', '4']}
                    minValue={1}
                    maxValue={5}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render score stats filter in descending order', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <ScoreStatsFilter
                    value={['1', '3']}
                    minValue={1}
                    maxValue={3}
                    isDescending
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
