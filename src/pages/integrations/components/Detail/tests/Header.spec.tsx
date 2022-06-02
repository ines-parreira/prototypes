import React from 'react'
import {fromJS} from 'immutable'
import {render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import Header from 'pages/integrations/components/Detail/Header'
import {dummyAppDetail} from 'fixtures/apps'
import {TrialPeriod} from 'models/integration/types/app'

const mockStore = configureMockStore([thunk])
const store = mockStore({currentAccount: fromJS({domain: '20-1 rpz'})})

describe(`Header`, () => {
    it('should render', () => {
        const {container} = render(
            <Provider store={store}>
                <Header {...dummyAppDetail} />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should display correct trial tag', () => {
        const {rerender} = render(
            <Provider store={store}>
                <Header
                    {...{
                        ...dummyAppDetail,
                        hasFreeTrial: true,
                        freeTrialPeriod: TrialPeriod.CUSTOM,
                    }}
                />
            </Provider>
        )
        expect(screen.getByText('FREE TRIAL'))
        rerender(
            <Provider store={store}>
                <Header
                    {...{
                        ...dummyAppDetail,
                        hasFreeTrial: true,
                        freeTrialPeriod: TrialPeriod.FOURTEEN,
                    }}
                />
            </Provider>
        )
        expect(screen.getByText('14 DAYS FREE TRIAL'))
    })
})
