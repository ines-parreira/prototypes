import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {DEPRECATED_ScoreStatsFilter} from 'pages/stats/common/filters/DEPRECATED_ScoreStatsFilter'
import {initialState} from 'state/stats/statsSlice'
import {RootState} from 'state/types'

const mockStore = configureMockStore([thunk])

describe('DEPRECATED_ScoreStatsFilter', () => {
    const defaultState = {
        stats: initialState,
    } as RootState

    it('should render score stats filter', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <DEPRECATED_ScoreStatsFilter
                    value={[]}
                    minValue={1}
                    maxValue={5}
                    isDescending={false}
                />
            </Provider>
        )

        expect(getByText('All scores')).toBeInTheDocument()
    })

    it('should render score stats filter in descending order', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <DEPRECATED_ScoreStatsFilter
                    value={['1', '3']}
                    minValue={1}
                    maxValue={3}
                    isDescending={true}
                />
            </Provider>
        )

        const starElements = screen.getAllByText(/[★☆]+/)

        const ratings = starElements.map((element) => element.textContent)

        const starCounts = ratings.map(
            (rating) => (rating?.match(/★/g) || []).length
        )

        const isDescending = starCounts.every(
            (count, index) => index === 0 || count <= starCounts[index - 1]
        )

        expect(isDescending).toBe(true)

        expect(starCounts).toEqual([3, 2, 1])
        expect(ratings).toEqual(['★★★', '★★☆', '★☆☆'])
    })
})
