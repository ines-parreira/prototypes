import React from 'react'
import configureMockStore from 'redux-mock-store'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'

import {RootState, StoreDispatch} from 'state/types'
import {Integration} from 'models/integration/types'
import ConnectionsList from '../ConnectionsList'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: 'app',
                application_id: '1',
                name: 'my app',
                meta: {address: '@myapp'},
            } as Integration,
        ],
    }),
} as unknown as RootState)

describe('<ConnectionsList/>', () => {
    describe('render()', () => {
        it('should render a list of connected integrations', () => {
            const {getByText} = render(
                <Provider store={store}>
                    <ConnectionsList appId="1" />
                </Provider>
            )

            expect(getByText('my app')).toBeDefined()
        })
    })
})
