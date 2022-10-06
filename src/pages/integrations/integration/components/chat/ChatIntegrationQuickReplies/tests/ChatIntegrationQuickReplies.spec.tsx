import React, {FormEvent} from 'react'
import {mount, shallow} from 'enzyme'
import {fromJS, Map} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import ChatIntegrationQuickReplies, {
    ChatIntegrationQuickRepliesComponent,
} from '../ChatIntegrationQuickReplies'

const mockStore = configureMockStore([thunk])

describe('<ChatIntegrationQuickReplies/>', () => {
    const integration: Map<any, any> = fromJS({
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
                <Provider store={mockStore({})}>
                    <ChatIntegrationQuickReplies integration={integration} />
                </Provider>
            )

            expect(component).toMatchSnapshot()
        })

        it('should render quick replies from the integration', () => {
            const quickRepliesState: Map<any, any> = fromJS({
                enabled: true,
                replies: ['foo', 'bar'],
            })

            const component = mount(
                <Provider store={mockStore({})}>
                    <ChatIntegrationQuickReplies
                        integration={integration.setIn(
                            ['meta', 'quick_replies'],
                            quickRepliesState
                        )}
                    />
                </Provider>
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_submit()', () => {
        it('should trim quick replies in the payload before calling updateOrCreateIntegration', () => {
            const updateOrCreateIntegrationSpy = jest.fn(() =>
                Promise.resolve()
            )
            const expectedPayload: Map<any, any> = fromJS({
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

            const component = shallow<ChatIntegrationQuickRepliesComponent>(
                <ChatIntegrationQuickRepliesComponent
                    integration={integration.setIn(
                        ['meta', 'quick_replies'],
                        quickRepliesState
                    )}
                    updateOrCreateIntegration={updateOrCreateIntegrationSpy}
                />
            )

            const fakeEvent = {
                preventDefault: jest.fn(),
            } as unknown as FormEvent
            void component.instance()._submit(fakeEvent)

            expect(updateOrCreateIntegrationSpy).toHaveBeenCalledWith(
                expectedPayload
            )
            expect(fakeEvent.preventDefault).toHaveBeenCalledTimes(1)
        })
    })
})
