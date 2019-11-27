import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'

import {FACEBOOK_INTEGRATION_TYPE} from '../../../../../../../constants/integration'
import FacebookIntegrationList from '../'

describe('FacebookIntegrationList component', () => {
    const middlewares = [thunk]
    const mockStore = configureMockStore(middlewares)

    const store = mockStore({
        integrations: fromJS({
            integrations: [{
                id: 1,
                name: 'mylittleintegration',
                type: FACEBOOK_INTEGRATION_TYPE,
                created_datetime: '2018-01-01 00:00:00',
                facebook: {
                    name: 'My Page',
                    picture: {
                        data: {
                            url: 'https://fake.url/picture.jpg'
                        },
                    },
                    category: 'Category'
                }
            }]
        }),
    })

    it('should render', () => {
        const component = shallow(
            <Provider store={store}>
                <FacebookIntegrationList
                    loading={{}}
                    actions={{}}
                    redirectUri="https://.../"
                />
            </Provider>
        ).dive()

        expect(component.dive()).toMatchSnapshot()
    })
})
