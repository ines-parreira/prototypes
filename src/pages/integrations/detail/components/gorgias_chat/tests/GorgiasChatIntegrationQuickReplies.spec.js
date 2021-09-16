import React from 'react'
import {mount, shallow} from 'enzyme'

import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import GorgiasChatIntegrationQuickReplies, {
    GorgiasChatIntegrationQuickRepliesComponent,
} from '../GorgiasChatIntegrationQuickReplies.tsx'

const mockStore = configureMockStore([thunk])

describe('<GorgiasChatIntegrationQuickReplies/>', () => {
    let integration = fromJS({
        id: 7,
        name: 'my chat integration',
        meta: {},
        decoration: {
            introduction_text: 'this is an intro',
            input_placeholder: 'type something please',
            main_color: '#123456',
        },
    })

    describe('render()', () => {
        it('should render defaults because there is no quick replies in the integration', () => {
            const component = mount(
                <GorgiasChatIntegrationQuickReplies
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
                replies: ['foo', 'bar'],
            })

            const component = mount(
                <GorgiasChatIntegrationQuickReplies
                    store={mockStore({})}
                    integration={integration.setIn(
                        ['meta', 'quick_replies'],
                        quickRepliesState
                    )}
                    updateOrCreateIntegration={() => {}}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_submit()', () => {
        it('should trim quick replies in the payload before calling updateOrCreateIntegration', () => {
            const updateOrCreateIntegrationSpy = jest.fn(() =>
                Promise.resolve()
            )
            const expectedPayload = fromJS({
                id: 7,
                meta: {
                    quick_replies: {
                        enabled: true,
                        replies: ['foo', 'bar'],
                    },
                },
            })

            const quickRepliesState = fromJS({
                enabled: true,
                replies: [' foo ', 'bar  '],
            })

            const component = shallow(
                <GorgiasChatIntegrationQuickRepliesComponent
                    integration={integration.setIn(
                        ['meta', 'quick_replies'],
                        quickRepliesState
                    )}
                    updateOrCreateIntegration={updateOrCreateIntegrationSpy}
                />
            )

            const fakeEvent = {preventDefault: jest.fn()}
            component.instance()._submit(fakeEvent)

            expect(updateOrCreateIntegrationSpy).toHaveBeenCalledWith(
                expectedPayload
            )
            expect(fakeEvent.preventDefault).toHaveBeenCalledTimes(1)
        })
    })
})
