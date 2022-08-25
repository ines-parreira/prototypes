import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {dummyErrorLog} from 'fixtures/appErrors'
import AppErrorRow from 'pages/integrations/Advanced/AppErrorRow'

const mockStore = configureMockStore([thunk])
const store = mockStore({currentAccount: fromJS({domain: '20-1 rpz'})})

global.Math.random = jest.fn(() => 0.123456789)

describe(`AppErrorRow`, () => {
    it('should render', () => {
        const {container} = render(
            <Provider store={store}>
                <AppErrorRow {...dummyErrorLog} />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render without a payload', () => {
        const {container} = render(
            <Provider store={store}>
                <AppErrorRow {...dummyErrorLog} payload={null} />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })
})
