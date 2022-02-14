import React, {ReactElement} from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {IntegrationType} from '../../../../models/integration/types'
import {
    TicketChannel,
    TicketMessageSourceType,
    TicketStatus,
} from '../../../../business/types/ticket'
import * as labels from '../labels'
import {RECHARGE_INTEGRATION_TYPE} from '../../../../constants/integration'

/* DatetimeLabel uses Math.random.
 * Mock it to always return the same data.
 */
const mockMath = Object.create(global.Math) as typeof global.Math
const integrationJsObject = {
    type: 'email',
    name: 'common',
    meta: {address: 'specific'},
}
const integrationMap = fromJS(integrationJsObject)
mockMath.random = () => 1
global.Math = mockMath
const mockStore = configureMockStore()

jest.mock('../../components/Tooltip', () => () => 'TooltipMock')

describe('components utils: labels', () => {
    describe('RenderLabel', () => {
        describe('distribution', () => {
            ;[
                {
                    type: 'tags',
                    value: 'help',
                    expected: <labels.TagLabel>help</labels.TagLabel>,
                },
                {
                    type: 'created',
                    value: '2016-01-15',
                    expected: <labels.DatetimeLabel dateTime="2016-01-15" />,
                    wrapper: (comp: ReactElement) => {
                        return render(
                            <Provider
                                store={mockStore({
                                    currentUser: fromJS({timezone: 'utc'}),
                                })}
                            >
                                {comp}
                            </Provider>
                        )
                    },
                },
                {
                    type: 'status',
                    value: TicketStatus.Open,
                    expected: <labels.StatusLabel status={TicketStatus.Open} />,
                },
                {
                    type: 'assignee',
                    value: {
                        name: 'Mario',
                        email: 'mario@gorgias.io',
                        meta: {
                            profile_picture_url:
                                'https://gorgias.io/avatar.png',
                        },
                    },
                    expected: (
                        <labels.UserAssigneeLabel
                            assigneeUser={fromJS({
                                name: 'Mario',
                                email: 'mario@gorgias.io',
                                meta: {
                                    profile_picture_url:
                                        'https://gorgias.io/avatar.png',
                                },
                            })}
                        />
                    ),
                    wrapper: (comp: ReactElement) => {
                        return render(
                            <Provider store={mockStore()}>{comp}</Provider>
                        )
                    },
                },
                {
                    type: 'assignee_team',
                    value: {
                        name: 'Team 1',
                        decoration: {
                            emoji: {},
                        },
                    },
                    expected: (
                        <labels.TeamAssigneeLabel
                            assigneeTeam={fromJS({
                                name: 'Team 1',
                                decoration: {
                                    emoji: {},
                                },
                            })}
                        />
                    ),
                    wrapper: (comp: ReactElement) => {
                        return render(
                            <Provider store={mockStore()}>{comp}</Provider>
                        )
                    },
                },
                {
                    type: 'customer',
                    value: {
                        name: 'Luigi',
                    },
                    expected: (
                        <labels.CustomerLabel
                            customer={{name: 'Luigi', id: '8'}}
                        />
                    ),
                },
                {
                    type: 'channel',
                    value: TicketChannel.Email,
                    expected: (
                        <labels.ChannelLabel
                            channel={TicketMessageSourceType.Email}
                        />
                    ),
                },
                {
                    type: 'thisshouldreturnnull',
                    value: undefined,
                    expected: null,
                },
                {
                    type: 'integrations',
                    value: integrationJsObject,
                    expected: (
                        <labels.IntegrationsDetailLabel
                            integration={integrationMap}
                        />
                    ),
                },
            ].forEach(({type, value, wrapper}) => {
                it(`${type} label`, () => {
                    let result
                    if (wrapper) {
                        result = wrapper(
                            <labels.RenderLabel
                                field={fromJS({name: type})}
                                value={fromJS(value)}
                            />
                        ).container
                    } else {
                        result = render(
                            <labels.RenderLabel
                                field={fromJS({name: type})}
                                value={fromJS(value)}
                            />
                        ).container
                    }

                    expect(result.firstChild).toMatchSnapshot()
                })
            })
        })

        describe('ValueRendered', () => {
            it('should display the address to prevent confusion', () => {
                const {container} = render(
                    <labels.IntegrationsDetailLabel
                        integration={fromJS({
                            type: IntegrationType.Email,
                            name: 'common',
                            meta: {address: 'specific'},
                        })}
                    />
                )
                expect(container.firstChild).toMatchSnapshot()
            })

            it('should display the name because the address is empty', () => {
                const {container} = render(
                    <labels.IntegrationsDetailLabel
                        integration={fromJS({
                            type: IntegrationType.Email,
                            name: 'common',
                            meta: {address: ''},
                        })}
                    />
                )
                expect(container.firstChild).toMatchSnapshot()
            })

            it('should display the name because the type is facebook', () => {
                const {container} = render(
                    <labels.IntegrationsDetailLabel
                        integration={fromJS({
                            type: IntegrationType.Facebook,
                            name: 'common',
                            meta: {address: 'specific'},
                        })}
                    />
                )
                expect(container.firstChild).toMatchSnapshot()
            })

            it('should display name and address formatted in-lined', () => {
                const {container} = render(
                    <labels.IntegrationsDetailLabel
                        integration={fromJS({
                            type: IntegrationType.Gmail,
                            name: 'common',
                            address: 'inlined email',
                        })}
                    />
                )
                expect(container.firstChild).toMatchSnapshot()
            })

            it('should display name and address formatted as aircall eg: with address into parenthesis', () => {
                const {container} = render(
                    <labels.IntegrationsDetailLabel
                        integration={fromJS({
                            type: IntegrationType.Aircall,
                            name: 'common',
                            address: 'aircall style',
                        })}
                    />
                )
                expect(container.firstChild).toMatchSnapshot()
            })
        })
    })

    describe('<AgentLabel/>', () => {
        describe('render()', () => {
            it('should render the avatar because a profile picture url is passed', () => {
                const {container} = render(
                    <labels.AgentLabel
                        name="Marie Curie"
                        profilePictureUrl="https://gorgias.io/profilepicture.png"
                    />
                )

                expect(container.firstChild).toMatchSnapshot()
            })

            it('should render the avatar because the `avatar` option is passed but no profile picture url is passed', () => {
                const {container} = render(
                    <labels.AgentLabel name="Marie Curie" shouldDisplayAvatar />
                )

                expect(container.firstChild).toMatchSnapshot()
            })

            it('should render the agent icon because no profile picture url nor the `avatar` option are passed', () => {
                const {container} = render(
                    <labels.AgentLabel name="Marie Curie" />
                )

                expect(container.firstChild).toMatchSnapshot()
            })

            it('should not render the name of the agent because no name is passed', () => {
                const {container} = render(
                    <labels.AgentLabel profilePictureUrl="https://gorgias.io/profilepicture.png" />
                )

                expect(container.firstChild).toMatchSnapshot()
            })
        })
    })

    describe('<TeamLabel/>', () => {
        describe('render()', () => {
            it('should render without avatar', () => {
                const {container} = render(<labels.TeamLabel name="Team 1" />)
                expect(container.firstChild).toMatchSnapshot()
            })

            it('should render with default avatar', () => {
                const {container} = render(
                    <labels.TeamLabel name="Team 1" shouldDisplayAvatar />
                )

                expect(container.firstChild).toMatchSnapshot()
            })

            it('should render with emoji', () => {
                const {container} = render(
                    <labels.TeamLabel
                        name="Team 1"
                        shouldDisplayAvatar
                        emoji={fromJS({
                            colons: ':wink:',
                            emoticons: [';)', ';-)'],
                            id: 'wink',
                            name: 'Winking Face',
                            native: '😉',
                            skin: null,
                            unified: '1f609',
                        })}
                    />
                )

                expect(container.firstChild).toMatchSnapshot()
            })

            it('should render with default avatar and "team" icon', () => {
                const {container} = render(
                    <labels.TeamLabel
                        name="Team 1"
                        shouldDisplayAvatar
                        shouldDisplayTeamIcon
                    />
                )

                expect(container.firstChild).toMatchSnapshot()
            })
        })
    })

    describe('<TimedeltaLabel/>', () => {
        describe('render()', () => {
            it('should render with hour duration', () => {
                const {container} = render(
                    <labels.TimedeltaLabel duration={'1h'} />
                )
                expect(container.firstChild).toMatchSnapshot()
            })
            it('should render with minute duration', () => {
                const {container} = render(
                    <labels.TimedeltaLabel duration={'1m'} />
                )
                expect(container.firstChild).toMatchSnapshot()
            })
            it('should render with day duration', () => {
                const {container} = render(
                    <labels.TimedeltaLabel duration={'1d'} />
                )
                expect(container.firstChild).toMatchSnapshot()
            })
        })
    })

    describe('<DatetimeLabel/>', () => {
        describe('render()', () => {
            it('should render with zero width space', () => {
                const {container} = render(
                    <Provider
                        store={mockStore({
                            currentUser: fromJS({timezone: 'utc'}),
                        })}
                    >
                        <labels.DatetimeLabel dateTime="2016-01-15" breakDate />
                    </Provider>
                )

                expect(container.firstChild).toMatchSnapshot()
            })

            it('should render a modified date because integrationType is Recharge', () => {
                const {container} = render(
                    <Provider
                        store={mockStore({
                            currentUser: fromJS({timezone: 'US/Pacific'}),
                        })}
                    >
                        <labels.DatetimeLabel
                            dateTime="2022-01-01T03:11:07"
                            integrationType={RECHARGE_INTEGRATION_TYPE}
                            labelFormat="MM-DD-YYYY HH:mm"
                        />
                    </Provider>
                )

                expect(container.firstChild).toMatchSnapshot()
            })
        })
    })
})
