import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import PlaceholderWidget from '../PlaceholderWidget'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('PlaceholderWidget component', () => {
    let store

    const integrationId = 1

    const baseTemplate = fromJS({
        path: ['ticket', 'customer', 'integrations', integrationId],
        templatePath: '0.template'
    })

    const baseWidget = fromJS({
        type: 'shopify'
    })

    const baseEditing = {
        actions: {
            foo: () => {},
            removeEditedWidget: () => {}
        }
    }

    beforeEach(() => {
        store = mockStore({
            integrations: fromJS({
                integrations: [
                    {
                        id: integrationId,
                        type: 'http',
                        name: 'my little integration http'
                    }
                ]
            })
        })
    })

    it('should display the integration type if the widget is not for an HTTP integration', () => {
        const component = shallow(
            <PlaceholderWidget
                store={store}
                widget={baseWidget}
                template={baseTemplate}
                editing={baseEditing}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should display the integration name if the widget is for an HTTP integration', () => {
        const widget = baseWidget
            .set('type', 'http')
            .set('integration_id', integrationId)

        const component = shallow(
            <PlaceholderWidget
                store={store}
                widget={widget}
                template={baseTemplate}
                editing={baseEditing}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })
})
