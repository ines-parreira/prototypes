import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import ChatIntegrationQuickReplies from '../ChatIntegrationQuickReplies'

const mockStore = configureMockStore([thunk])

describe('ChatIntegrationQuickReplies component', () => {
    let integration = fromJS({
        name: 'my chat integration',
        meta: {},
        decoration: {
            introduction_text: 'this is an intro',
            input_placeholder: 'type something please',
            main_color: '#123456'
        }
    })

    it('should render defaults because there is no quick replies in the integration', () => {
        const component = mount(
            <ChatIntegrationQuickReplies
                store={mockStore({})}
                integration={integration}
                updateOrCreateIntegration={() => {}}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render quick replies from the integration', () => {
        const quickRepliesState = fromJS({
            enabled: true,
            replies: ['foo', 'bar']
        })

        const component = mount(
            <ChatIntegrationQuickReplies
                store={mockStore({})}
                integration={integration.setIn(['meta', 'quick_replies'], quickRepliesState)}
                updateOrCreateIntegration={() => {}}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
