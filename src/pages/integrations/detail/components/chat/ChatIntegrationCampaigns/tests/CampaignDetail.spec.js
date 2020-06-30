import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'

import {CampaignDetail} from '../CampaignDetail'

const chatIntegration = {
    id: 1,
    type: 'smooch_inside',
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

describe('CampaignDetail component', () => {
    let container

    beforeEach(() => {
        // reactstrap popover needs to be in the dom
        // https://github.com/reactstrap/reactstrap/issues/818
        container = document.createElement('div')
        document.body.appendChild(container)
        jest.resetAllMocks()
    })

    it("should display default value when it's a new campaign", () => {
        const component = shallow(
            <CampaignDetail
                {...commonProps}
                campaign={fromJS({})}
                integration={fromJS(chatIntegration)}
                id="new"
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display the campaign correctly when updating it', () => {
        const message = {
            author: {
                name: 'John',
                email: 'john@gorgias.io',
                avatar_url:
                    'https://gravatar.docker/as74d6as4d86as4dasd/avatar.jpg',
            },
            html:
                '<div><img onerror="alert(1)" src="#"/>My little message</div>',
            text: 'My little message',
        }

        const component = shallow(
            <CampaignDetail
                {...commonProps}
                campaign={fromJS({
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
                })}
                integration={fromJS(chatIntegration)}
                id="my-litte-campaign-789das-ds54f6s-asd64"
            />,
            {attachTo: container}
        ).setState({message: fromJS(message)})

        expect(component).toMatchSnapshot()
    })

    it('should display the campaign correctly when updating it and strip the html', () => {
        const message = {
            author: {
                name: 'John',
                email: 'john@gorgias.io',
                avatar_url:
                    'https://gravatar.docker/as74d6as4d86as4dasd/avatar.jpg',
            },
            html:
                '<div><img onerror="alert(1)" src="#"/>My little message</div>',
            text: 'My little message',
        }

        const component = shallow(
            <CampaignDetail
                {...commonProps}
                campaign={fromJS({
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
                })}
                integration={fromJS(chatIntegration)}
                id="my-litte-campaign-789das-ds54f6s-asd64"
            />,
            {attachTo: container}
        ).setState({message: fromJS(message)})

        expect(component).toMatchSnapshot()
    })
})
