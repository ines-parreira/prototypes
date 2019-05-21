import React from 'react'
import {shallow, mount} from 'enzyme'
import {fromJS} from 'immutable'
import {EMAIL_CHANNEL} from '../../../../config/ticket'
import {
    AIRCALL_INTEGRATION_TYPE,
    EMAIL_INTEGRATION_TYPE,
    FACEBOOK_INTEGRATION_TYPE,
    GMAIL_INTEGRATION_TYPE
} from '../../../../constants/integration'
import {OPEN_STATUS} from '../../../../constants/ticket'
import {AgentLabel} from '../labels'

import * as labels from '../labels'
import Avatar from '../../components/Avatar'

/* DatetimeLabel uses Math.random.
 * Mock it to always return the same data.
 */
const mockMath = Object.create(global.Math)
const integrationJsObject = { type: 'email', name: 'common', meta: { address: 'specific' } }
const integrationMap = fromJS(integrationJsObject)
mockMath.random = () => 1
global.Math = mockMath

describe('components utils : labels', () => {
    describe('RenderLabel', () => {
        describe('distribution', () => {
            [
                {
                    type: 'tags',
                    value: 'help',
                    expected: <labels.TagLabel>help</labels.TagLabel>
                },
                {
                    type: 'created',
                    value: '2016-01-15',
                    expected: <labels.DatetimeLabel dateTime="2016-01-15"/>
                },
                {
                    type: 'status',
                    value: OPEN_STATUS,
                    expected: <labels.StatusLabel status={OPEN_STATUS}/>
                },
                {
                    type: 'assignee',
                    value: {
                        name: 'Mario',
                        email: 'mario@gorgias.io',
                        meta: {
                            profile_picture_url: 'https://gorgias.io/avatar.png'
                        }
                    },
                    expected: (<div>
                        <Avatar
                            name="Mario"
                            email="mario@gorgias.io"
                            url="https://gorgias.io/avatar.png"
                            size={26}
                            className="d-inline-block mr-2"
                        />
                        <div className="d-inline-block">Mario</div>
                    </div>)
                },
                {
                    type: 'customer',
                    value: {
                        name: 'Luigi'
                    },
                    expected: <labels.CustomerLabel customer="Luigi"/>
                },
                {
                    type: 'channel',
                    value: EMAIL_CHANNEL,
                    expected: <labels.ChannelLabel channel={EMAIL_CHANNEL}/>
                },
                {
                    type: 'thisshouldreturnnull',
                    value: undefined,
                    expected: null
                },
                {
                    type: 'integrations',
                    value: integrationJsObject,
                    expected: <labels.IntegrationsDetailLabel integration={integrationMap}/>
                }
            ].forEach((element) => {
                const renderedComponent = (
                    <labels.RenderLabel
                        field={fromJS({name: element.type})}
                        value={fromJS(element.value)}
                    />
                )

                // if renderedComponent is an element, shallow render it
                let rendered

                if (React.isValidElement(renderedComponent)) {
                    rendered = shallow(renderedComponent).html()
                } else {
                    rendered = renderedComponent
                }

                let expected

                it(`${element.type} label`, () => {
                    // if the expected result is an element, shallow render it
                    if (React.isValidElement(element.expected)) {
                        expected = shallow(element.expected).html()

                        expect(rendered).toEqual(expected)
                    } else {
                        expected = element.expected

                        expect(rendered).toBe(expected)
                    }
                })
            })
        })

        describe('ValueRendered', () => {
            it('should display the address to prevent confusion', () => {
                const componentRuleIntegrationListTypeEmail = mount(
                    <labels.IntegrationsDetailLabel
                        integration={fromJS({
                            type: EMAIL_INTEGRATION_TYPE,
                            name: 'common',
                            meta: {address: 'specific'}
                        })}
                    />
                )
                expect(componentRuleIntegrationListTypeEmail).toMatchSnapshot()
            })

            it('should display the name because the address is empty', () => {
                const componentRuleIntegrationListTypeEmailNoAddress = mount(
                    <labels.IntegrationsDetailLabel
                        integration={fromJS({
                            type: EMAIL_INTEGRATION_TYPE,
                            name: 'common',
                            meta: {address: ''}
                        })}
                    />
                )
                expect(componentRuleIntegrationListTypeEmailNoAddress).toMatchSnapshot()
            })

            it('should display the name because the type is facebook', () => {
                const componentRuleIntegrationListTypeFacebook = mount(
                    <labels.IntegrationsDetailLabel
                        integration={fromJS({
                            type: FACEBOOK_INTEGRATION_TYPE,
                            name: 'common',
                            meta: {address: 'specific'}
                        })}
                    />
                )
                expect(componentRuleIntegrationListTypeFacebook).toMatchSnapshot()
            })

            it('should display name and address formatted in-lined', () => {
                const componentRuleIntegrationListTypeMailInline = mount(
                    <labels.IntegrationsDetailLabel
                        integration={fromJS({
                            type: GMAIL_INTEGRATION_TYPE,
                            name: 'common',
                            address: 'inlined email'
                        })}
                    />
                )
                expect(componentRuleIntegrationListTypeMailInline).toMatchSnapshot()
            })

            it('should display name and address formatted as aircall eg: with address into parenthesis', () => {
                const componentRuleIntegrationListTypeAircall = mount(
                    <labels.IntegrationsDetailLabel
                        integration={fromJS({
                            type: AIRCALL_INTEGRATION_TYPE,
                            name: 'common',
                            address: 'aircall style'
                        })}
                    />
                )
                expect(componentRuleIntegrationListTypeAircall).toMatchSnapshot()
            })
        })
    })

    describe('AgentLabel', () => {
        it('should render the avatar because a profile picture url is passed', () => {
            const component = shallow(
                <AgentLabel
                    name="Marie Curie"
                    profilePictureUrl="https://gorgias.io/profilepicture.png"
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render the avatar because the `avatar` option is passed but no profile picture url ' +
            'is passed', () => {
            const component = shallow(
                <AgentLabel
                    name="Marie Curie"
                    avatar
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render the agent icon because no profile picture url nor the `avatar` option are passed', () => {
            const component = shallow(
                <AgentLabel
                    name="Marie Curie"
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should not render the name of the agent because no name is passed', () => {
            const component = shallow(
                <AgentLabel
                    profilePictureUrl="https://gorgias.io/profilepicture.png"
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
