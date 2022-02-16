import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {RootState} from 'state/types'

import GorgiasChatCampaignDetail from '../GorgiasChatCampaignDetail'

const chatIntegration = {
    id: 1,
    type: 'gorgias_chat',
    name: 'My new chat',
    decoration: {
        main_color: '#fefefe',
    },
}

const commonProps = {
    agents: fromJS([
        {
            name: 'John',
            email: 'john@gorgias.io',
            id: 1,
        },
        {
            name: 'Doe',
            email: 'doe@gorgias.io',
            id: 2,
        },
    ]),
    createCampaign: jest.fn(),
    updateCampaign: jest.fn(),
    deleteCampaign: jest.fn(),
    notify: jest.fn(),
}

jest.mock('draft-js/lib/generateRandomKey', () => () => 'someRandomKey')

describe('<GorgiasChatCampaignDetail/>', () => {
    const mockStore = configureMockStore([thunk])

    const realDateNow = Date.now
    beforeEach(() => {
        jest.resetAllMocks()
        Date.now = jest.fn(() => 42)
    })
    afterAll(() => {
        Date.now = realDateNow
    })

    describe('render()', () => {
        it("should display default value when it's a new campaign", () => {
            const state: Partial<RootState> = {
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            meta: {
                                campaigns: [],
                            },
                        },
                    ],
                }),
            }
            const {container} = render(
                <Provider store={mockStore(state)}>
                    <GorgiasChatCampaignDetail
                        {...commonProps}
                        integration={fromJS(chatIntegration)}
                        id="new"
                    />
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should display the campaign correctly when updating it', () => {
            const message = {
                author: {
                    name: 'John',
                    email: 'john@gorgias.io',
                    avatar_url:
                        'https://gravatar.docker/as74d6as4d86as4dasd/avatar.jpg',
                },
                html: '<div>My little message</div>',
                text: 'My little message',
            }
            const state: Partial<RootState> = {
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            meta: {
                                campaigns: [
                                    {
                                        name: 'My little campaign',
                                        id: '789das-ds54f6s-asd64',
                                        message,
                                        triggers: [
                                            {
                                                key: 'current_url',
                                                operator: 'contains',
                                                value: 'gorgias',
                                            },
                                            {
                                                key: 'time_spent_on_page',
                                                operator: 'gt',
                                                value: 42,
                                            },
                                        ],
                                    },
                                ],
                            },
                        },
                    ],
                }),
            }

            const {container} = render(
                <Provider store={mockStore(state)}>
                    <GorgiasChatCampaignDetail
                        {...commonProps}
                        integration={fromJS(chatIntegration)}
                        id="789das-ds54f6s-asd64"
                    />
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should display the campaign correctly when updating it and strip the html', () => {
            const message = {
                author: {
                    name: 'John',
                    email: 'john@gorgias.io',
                    avatar_url:
                        'https://gravatar.docker/as74d6as4d86as4dasd/avatar.jpg',
                },
                html: '<div><img onerror="alert(1)" src="#"/>My little message</div>',
                text: 'My little message',
            }
            const state: Partial<RootState> = {
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            meta: {
                                campaigns: [
                                    {
                                        name: 'My little campaign',
                                        id: '789das-ds54f6s-asd64',
                                        message,
                                        triggers: [
                                            {
                                                key: 'current_url',
                                                operator: 'contains',
                                                value: 'gorgias',
                                            },
                                            {
                                                key: 'time_spent_on_page',
                                                operator: 'gt',
                                                value: 42,
                                            },
                                        ],
                                    },
                                ],
                            },
                        },
                    ],
                }),
            }

            const {container} = render(
                <Provider store={mockStore(state)}>
                    <GorgiasChatCampaignDetail
                        {...commonProps}
                        integration={fromJS(chatIntegration)}
                        id="789das-ds54f6s-asd64"
                    />
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })
    })
})
