import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'

import {RootState, StoreDispatch} from '../../../state/types'
import StatsPage from '../StatsPage'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('StatsPage', () => {
    const defaultState = {
        stats: fromJS({
            filters: fromJS({}),
        }),
    } as RootState

    it('should render the title, children and filters', () => {
        const store = mockStore(defaultState)
        const {container} = render(
            <Provider store={store}>
                <StatsPage
                    title="Foo"
                    description="Foo statistic page"
                    helpUrl="http://example.com"
                    filters={<p>Filters</p>}
                >
                    Children
                </StatsPage>
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
