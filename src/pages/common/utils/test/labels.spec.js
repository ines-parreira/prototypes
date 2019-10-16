import React from 'react'
import {mount, shallow} from 'enzyme'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {EMAIL_CHANNEL} from '../../../../config/ticket'

import {
    AIRCALL_INTEGRATION_TYPE,
    EMAIL_INTEGRATION_TYPE,
    FACEBOOK_INTEGRATION_TYPE,
    GMAIL_INTEGRATION_TYPE
} from '../../../../constants/integration'
import {OPEN_STATUS} from '../../../../constants/ticket'
import * as labels from '../labels'

/* DatetimeLabel uses Math.random.
 * Mock it to always return the same data.
 */
const mockMath = Object.create(global.Math)
const integrationJsObject = {type: 'email', name: 'common', meta: {address: 'specific'}}
const integrationMap = fromJS(integrationJsObject)
mockMath.random = () => 1
global.Math = mockMath
const mockStore = configureMockStore()

jest.mock('../../components/Tooltip', () => 'TooltipMock')


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
                    expected: (
                        <labels.DatetimeLabel
                            dateTime="2016-01-15"
                        />
                    ),
                    toHTML: (comp) => {
                        return mount(
                            <Provider
                                store={mockStore({currentUser: fromJS({timezone: 'utc'})})}
                            >
                                {comp}
                            </Provider>
                        ).html()
                    }
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
                    expected: (
                        <labels.AssigneeLabel
                            assignee={fromJS({
                                name: 'Mario',
                                email: 'mario@gorgias.io',
                                meta: {
                                    profile_picture_url: 'https://gorgias.io/avatar.png'
                                }
                            })}
                        />
                    ),
                    toHTML: (comp) => {
                        return mount(
                            <Provider store={mockStore()}>{comp}</Provider>
                        ).html()
                    }
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
                const {type, value, expected, toHTML} = element
                const render = (comp) => {
                    if (!React.isValidElement(comp)) {
                        return comp
                    }
                    return toHTML ? toHTML(comp) : shallow(comp).html()
                }

                it(`${type} label`, () => {
                    const rendered = render(
                        <labels.RenderLabel
                            field={fromJS({name: type})}
                            value={fromJS(value)}
                        />
                    )
                    expect(rendered).toEqual(render(expected))
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

    describe('<AgentLabel/>', () => {
        describe('render()', () => {
            it('should render the avatar because a profile picture url is passed', () => {
                const component = shallow(
                    <labels.AgentLabel
                        name="Marie Curie"
                        profilePictureUrl="https://gorgias.io/profilepicture.png"
                    />
                )

                expect(component).toMatchSnapshot()
            })

            it(
                'should render the avatar because the `avatar` option is passed but no profile picture url is passed',
                () => {
                    const component = shallow(
                        <labels.AgentLabel
                            name="Marie Curie"
                            shouldDisplayAvatar
                        />
                    )

                    expect(component).toMatchSnapshot()
                }
            )

            it('should render the agent icon because no profile picture url nor the `avatar` option are passed', () => {
                const component = shallow(
                    <labels.AgentLabel
                        name="Marie Curie"
                    />
                )

                expect(component).toMatchSnapshot()
            })

            it('should not render the name of the agent because no name is passed', () => {
                const component = shallow(
                    <labels.AgentLabel
                        profilePictureUrl="https://gorgias.io/profilepicture.png"
                    />
                )

                expect(component).toMatchSnapshot()
            })
        })
    })

    describe('<TeamLabel/>', () => {
        describe('render()', () => {
            it('should render without avatar', () => {
                const component = shallow(<labels.TeamLabel name="Team 1"/>)
                expect(component).toMatchSnapshot()
            })

            it('should render with default avatar', () => {
                const component = shallow(
                    <labels.TeamLabel
                        name="Team 1"
                        shouldDisplayAvatar
                    />
                )

                expect(component).toMatchSnapshot()
            })

            it('should render with emoji', () => {
                const component = shallow(
                    <labels.TeamLabel
                        name="Team 1"
                        shouldDisplayAvatar
                        emoji={fromJS({
                            'colons': ':wink:',
                            'emoticons': [
                                ';)',
                                ';-)'
                            ],
                            'id': 'wink',
                            'name': 'Winking Face',
                            'native': '😉',
                            'skin': null,
                            'unified': '1f609'
                        })}
                    />
                )

                expect(component).toMatchSnapshot()
            })

            it('should render with default avatar and "team" icon', () => {
                const component = shallow(
                    <labels.TeamLabel
                        name="Team 1"
                        shouldDisplayAvatar
                        shouldDisplayTeamIcon
                    />
                )

                expect(component).toMatchSnapshot()
            })
        })
    })
})
