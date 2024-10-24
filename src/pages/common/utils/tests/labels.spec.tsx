import {render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import React, {ReactElement} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {
    TicketChannel,
    TicketMessageSourceType,
    TicketStatus,
} from 'business/types/ticket'
import {channels as mockChannels} from 'fixtures/channels'

import {IntegrationType} from 'models/integration/types'
import * as Avatar from 'pages/common/components/Avatar/Avatar'
import * as channelsService from 'services/channels'

import DatetimeLabel from '../DatetimeLabel'
import * as labels from '../labels'

const integrationJsObject = {
    type: 'email',
    name: 'common',
    meta: {address: 'specific'},
}
const integrationMap = fromJS(integrationJsObject)

const mockStore = configureMockStore()

jest.mock('@gorgias/ui-kit', () => {
    return {
        ...jest.requireActual('@gorgias/ui-kit'),
        Tooltip: () => 'TooltipMock',
    } as Record<string, unknown>
})
jest.mock('state/integrations/selectors', () => ({
    getIntegrationChannel: () => () => mockChannels[0],
}))
jest.spyOn(channelsService, 'toChannel').mockReturnValue(mockChannels[0])

const AvatarSpy = jest.spyOn(Avatar, 'default')

describe('components utils: labels', () => {
    beforeEach(() => {
        AvatarSpy.mockClear()
    })
    describe('RenderLabel', () => {
        describe('distribution', () => {
            ;[
                {
                    type: 'created',
                    value: '2016-01-15',
                    expected: <DatetimeLabel dateTime="2016-01-15" />,
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
                    AvatarSpy.mockImplementation((() => (
                        <div data-testid="avatar" />
                    )) as jest.Mock)

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
                            <Provider store={mockStore({})}>
                                <labels.RenderLabel
                                    field={fromJS({name: type})}
                                    value={fromJS(value)}
                                />
                            </Provider>
                        ).container
                    }

                    expect(result.firstChild).toMatchSnapshot()
                })
            })
        })

        describe('ValueRendered', () => {
            it('should display the address to prevent confusion', () => {
                const {container} = render(
                    <Provider store={mockStore({})}>
                        <labels.IntegrationsDetailLabel
                            integration={fromJS({
                                type: IntegrationType.Email,
                                name: 'common',
                                meta: {address: 'specific'},
                            })}
                        />
                    </Provider>
                )
                expect(container.firstChild).toMatchSnapshot()
            })

            it('should display the name because the address is empty', () => {
                const {container} = render(
                    <Provider store={mockStore({})}>
                        <labels.IntegrationsDetailLabel
                            integration={fromJS({
                                type: IntegrationType.Email,
                                name: 'common',
                                meta: {address: ''},
                            })}
                        />
                    </Provider>
                )
                expect(container.firstChild).toMatchSnapshot()
            })

            it('should display the name because the type is facebook', () => {
                const {container} = render(
                    <Provider store={mockStore({})}>
                        <labels.IntegrationsDetailLabel
                            integration={fromJS({
                                type: IntegrationType.Facebook,
                                name: 'common',
                                meta: {address: 'specific'},
                            })}
                        />
                    </Provider>
                )
                expect(container.firstChild).toMatchSnapshot()
            })

            it('should display name and address formatted in-lined', () => {
                const {container} = render(
                    <Provider store={mockStore({})}>
                        <labels.IntegrationsDetailLabel
                            integration={fromJS({
                                type: IntegrationType.Gmail,
                                name: 'common',
                                address: 'inlined email',
                            })}
                        />
                    </Provider>
                )
                expect(container.firstChild).toMatchSnapshot()
            })

            it('should display name and address formatted as aircall eg: with address into parenthesis', () => {
                const {container} = render(
                    <Provider store={mockStore({})}>
                        <labels.IntegrationsDetailLabel
                            integration={fromJS({
                                type: IntegrationType.Aircall,
                                name: 'common',
                                address: 'aircall style',
                            })}
                        />
                    </Provider>
                )
                expect(container.firstChild).toMatchSnapshot()
            })

            it('should display correctly for app type integrations', () => {
                const {getByAltText} = render(
                    <Provider store={mockStore({})}>
                        <labels.IntegrationsDetailLabel
                            integration={fromJS({
                                id: 1,
                                type: IntegrationType.App,
                                name: 'An App Integration',
                            })}
                        />
                    </Provider>
                )
                expect(getByAltText('TikTok Shop')).toBeDefined()
            })
        })
    })

    describe('<AgentLabel/>', () => {
        it('should render the avatar because a profile picture url is passed', () => {
            AvatarSpy.mockImplementation((() => (
                <div data-testid="avatar" />
            )) as jest.Mock)
            render(
                <labels.AgentLabel
                    name="Marie Curie"
                    profilePictureUrl="https://gorgias.io/profilepicture.png"
                />
            )

            const avatar = screen.getByTestId('avatar')
            expect(avatar).toBeInTheDocument()
        })

        it('should render the name of the agent because a name is passed', () => {
            const {getByText} = render(<labels.AgentLabel name="Marie Curie" />)

            const name = getByText('Marie Curie')
            expect(name).toBeInTheDocument()
            expect(name).not.toHaveClass('semibold')
        })

        it('should render the name of the agent with semibold style because the `semibold` option is passed', () => {
            const {getByText} = render(
                <labels.AgentLabel name="Marie Curie" semibold />
            )

            const name = getByText('Marie Curie')
            expect(name).toBeInTheDocument()
            expect(name).toHaveClass('semibold')
        })

        it('should render the status badge because the `badgeColor` option is passed', () => {
            AvatarSpy.mockImplementation((({
                badgeColor,
            }: {
                badgeColor: string
            }) => <div data-testid="avatar">{badgeColor}</div>) as jest.Mock)
            render(
                <labels.AgentLabel
                    name="Marie Curie"
                    shouldDisplayAvatar
                    badgeColor="testColor"
                />
            )

            const avatar = screen.getByTestId('avatar')
            expect(avatar).toHaveTextContent('testColor')
        })

        it('should not render the status badge because the `badgeColor` option is not passed', () => {
            AvatarSpy.mockImplementation((({
                badgeColor,
            }: {
                badgeColor: string
            }) => <div data-testid="avatar">{badgeColor}</div>) as jest.Mock)
            render(<labels.AgentLabel name="Marie Curie" shouldDisplayAvatar />)

            const avatar = screen.getByTestId('avatar')
            expect(avatar).toHaveTextContent('')
        })

        it('should render the avatar because the `avatar` option is passed but no profile picture url is passed', () => {
            AvatarSpy.mockImplementation((() => (
                <div data-testid="avatar" />
            )) as jest.Mock)
            render(<labels.AgentLabel name="Marie Curie" shouldDisplayAvatar />)

            const avatar = screen.getByTestId('avatar')
            expect(avatar).toBeInTheDocument()
        })

        it('should render the agent icon because no profile picture url nor the `avatar` option are passed', () => {
            const name = 'Marie Curie'
            render(<labels.AgentLabel name={name} />)
            const agentIcon = screen.getByLabelText(`${name} icon`)

            expect(agentIcon).toBeInTheDocument()
        })

        it('should not render the name of the agent because no name is passed', () => {
            const {container} = render(
                <labels.AgentLabel profilePictureUrl="https://gorgias.io/profilepicture.png" />
            )

            const name = container.querySelector('.name')
            expect(name).not.toBeInTheDocument()
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
})
