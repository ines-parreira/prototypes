import React from 'react'
import {fromJS} from 'immutable'
import {render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import Detail from 'pages/integrations/components/Detail'
import {IntegrationType} from 'models/integration/types'
import {dummyAppDetail} from 'fixtures/apps'

const mockStore = configureMockStore([thunk])
const store = mockStore({currentAccount: fromJS({domain: '20-1 rpz'})})

describe(`Detail`, () => {
    it('should render', () => {
        const {container} = render(
            <Provider store={store}>
                <Detail {...dummyAppDetail} />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should display a banner with the right text', () => {
        const notification = 'Beware!'
        render(
            <Provider store={store}>
                <Detail
                    {...{
                        ...dummyAppDetail,
                        type: IntegrationType.Recharge,
                        isExternalConnectUrl: false,
                        notification: {
                            message: notification,
                        },
                    }}
                />
            </Provider>
        )
        expect(screen.getByText(notification))
    })
})
