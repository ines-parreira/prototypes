import React from 'react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {mount} from 'enzyme'
import CampaignDetail from '../CampaignDetail'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

const chatIntegration = {
    id: 1,
    type: 'smooch_inside',
    name: 'My new chat',
    decoration: {
        main_color: '#fefefe'
    }
}

jest.mock('draft-js/lib/generateRandomKey', () => () => 'someRandomKey')

describe('CampaignDetail component', () => {
    let store

    beforeEach(() => {
        store = mockStore({
            integrations: fromJS({
                integration: chatIntegration,
                integrations: [chatIntegration]
            }),
            users: fromJS({
                agents: [{
                    name: 'John',
                    email: 'john@gorgias.io',
                    id: 1
                }, {
                    name: 'Doe',
                    email: 'doe@gorgias.io',
                    id: 2
                }]
            })
        })
    })

    it('should display default value when it\'s a new campaign', () => {
        const component = mount(
            <CampaignDetail
                store={store}
                campaign={fromJS({})}
                integration={fromJS(chatIntegration)}
                id='new'
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display the campaign correctly when updating it', () => {
        const component = mount(
            <CampaignDetail
                store={store}
                campaign={fromJS({
                    name: 'My little campaign',
                    id: '789das-ds54f6s-asd64',
                    message: {
                        author: {
                            name: 'John',
                            email: 'john@gorgias.io',
                            avatar_url: 'https://gravatar.docker/as74d6as4d86as4dasd/avatar.jpg'
                        },
                        html: '<div>My little message</div>',
                        text: 'My little message'
                    },
                    triggers: [{
                        key: 'current_url',
                        operator: 'contains',
                        value: 'gorgias'
                    }, {
                        key: 'time_spent_on_page',
                        operator: 'gt',
                        value: 42
                    }]
                })}
                integration={fromJS(chatIntegration)}
                id='my-litte-campaign-789das-ds54f6s-asd64'
            />
        )

        expect(component).toMatchSnapshot()
    })
})
