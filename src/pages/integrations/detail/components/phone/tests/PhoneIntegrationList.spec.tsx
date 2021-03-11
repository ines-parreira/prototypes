import React from 'react'
import {render} from '@testing-library/react'
import {fromJS, List, Map} from 'immutable'
import {BrowserRouter} from 'react-router-dom'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {IntegrationType} from '../../../../../../models/integration/types'

import PhoneIntegrationList from '../PhoneIntegrationList'

describe('<PhoneIntegrationList/>', () => {
    const middlewares = [thunk]
    const mockStore = configureMockStore(middlewares)

    let integrations: List<Map<string, any>>
    let activate: jest.MockedFunction<any>
    let deactivate: jest.MockedFunction<any>

    beforeEach(() => {
        const integration = {
            id: 1,
            type: IntegrationType.PhoneIntegrationType,
        }
        integrations = fromJS([integration])

        activate = jest.fn()
        deactivate = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const store = mockStore({
                integrations,
            })

            const {container} = render(
                <PhoneIntegrationList
                    integrations={integrations}
                    loading={false}
                    activate={activate}
                    deactivate={deactivate}
                />,
                {
                    wrapper: (props) => (
                        <Provider store={store}>
                            <BrowserRouter>{props?.children}</BrowserRouter>
                        </Provider>
                    ),
                }
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
