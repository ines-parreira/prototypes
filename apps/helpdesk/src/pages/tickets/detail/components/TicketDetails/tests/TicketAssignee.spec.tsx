import type { ComponentProps } from 'react'
import React from 'react'

import { shortcutManager } from '@repo/utils'
import { act, fireEvent, render, screen } from '@testing-library/react'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import TicketAssignee from '../TicketAssignee/TicketAssignee'

jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    shortcutManager: {
        bind: jest.fn(),
        unbind: jest.fn(),
    },
}))

jest.mock('reactstrap', () => {
    const actual = jest.requireActual('reactstrap')

    return {
        ...actual,
        Dropdown: ({
            children,
            className,
            isOpen,
            toggle,
        }: {
            children: React.ReactNode
            className?: string
            isOpen?: boolean
            toggle?: () => void
        }) => (
            <div className={className} data-open={isOpen}>
                {children}
                <button
                    type="button"
                    aria-label="Toggle assignee dropdown"
                    onClick={toggle}
                />
            </div>
        ),
        DropdownToggle: ({
            children,
            className,
            disabled,
            type = 'button',
        }: {
            children: React.ReactNode
            className?: string
            disabled?: boolean
            type?: 'button' | 'submit' | 'reset'
        }) => (
            <button type={type} className={className} disabled={disabled}>
                {children}
            </button>
        ),
        DropdownMenu: ({
            children,
            className,
        }: {
            children: React.ReactNode
            className?: string
        }) => <div className={className}>{children}</div>,
        DropdownItem: ({
            children,
            className,
            header,
            onClick,
            type = 'button',
        }: {
            children: React.ReactNode
            className?: string
            header?: boolean
            onClick?: () => void
            type?: 'button' | 'submit' | 'reset'
        }) =>
            header ? (
                <div className={className}>{children}</div>
            ) : (
                <button type={type} className={className} onClick={onClick}>
                    {children}
                </button>
            ),
    }
})

const users: Map<any, any> = fromJS({
    all: [
        { id: 1, name: 'User 1', email: 'email1@foo.com', meta: {} },
        { id: 2, name: 'User 2', email: 'email2@foo.com', meta: {} },
        {
            id: 3,
            name: 'Gorgias Support Agent',
            email: 'support@gorgias.xyz',
            meta: {},
            role: { name: 'internal-agent' },
        },
    ],
})

const minProps: Omit<
    ComponentProps<typeof TicketAssignee>,
    'handleTeams' | 'handleUsers'
> = {
    currentAssigneeUser: null,
    currentAssigneeTeam: null,
    menuDirection: 'right',
    setUser: jest.fn(),
    setTeam: jest.fn(),
    className: 'classname',
    transparent: true,
}

const mockStore = configureMockStore([thunk])
const shortcutManagerMock = jest.mocked(shortcutManager)

describe('<TicketAssignee />', () => {
    const store = mockStore({
        agents: users,
        teams: fromJS({
            all: [
                { id: 1, name: 'Team 1', decoration: {} },
                { id: 2, name: 'Team 2', decoration: {} },
            ],
        }),
        currentUser: fromJS({ id: 1, email: 'steve@acme.gorgias.io' }),
    })

    describe('render()', () => {
        beforeEach(() => {
            jest.clearAllMocks()
        })

        it('should not display any agent info because there is no assignee', () => {
            const { getByText } = render(
                <Provider store={store}>
                    <TicketAssignee {...minProps} />
                </Provider>,
            )
            expect(getByText(/Unassigned/)).toBeInTheDocument()
        })

        it('should display the info of the agent assigned', () => {
            const { getAllByText } = render(
                <Provider store={store}>
                    <TicketAssignee
                        {...minProps}
                        currentAssigneeUser={fromJS({
                            id: 1,
                            name: 'Steve Frizeli',
                        })}
                        profilePictureUrl="profilePictureUrl"
                    />
                </Provider>,
            )

            expect(getAllByText(/Steve Frizeli/)).toHaveLength(2)
            expect(getAllByText(/SF/)).toHaveLength(2)
        })

        it('should display the email of the agent assigned as its name because it has no name', () => {
            const email = 'steve@acme.gorgias.io'
            const { getAllByText } = render(
                <Provider store={store}>
                    <TicketAssignee
                        {...minProps}
                        currentAssigneeUser={fromJS({
                            id: 1,
                            email,
                        })}
                    />
                </Provider>,
            )

            expect(getAllByText(email)).toHaveLength(2)
        })

        it('should display the info of the agent assigned even if a team is assigned too', () => {
            const email = 'steve@acme.gorgias.io'
            const { getAllByText } = render(
                <Provider store={store}>
                    <TicketAssignee
                        {...minProps}
                        currentAssigneeUser={fromJS({
                            id: 1,
                            email,
                        })}
                        currentAssigneeTeam={fromJS({
                            id: 1,
                            name: 'Team 1',
                        })}
                    />
                </Provider>,
            )

            expect(getAllByText(email)).toHaveLength(2)
        })

        it('should display the name of the team assigned because there is no user assigned', () => {
            const name = 'Team 1'
            const { getAllByText } = render(
                <Provider store={store}>
                    <TicketAssignee
                        {...minProps}
                        currentAssigneeTeam={fromJS({
                            id: 1,
                            name,
                        })}
                    />
                </Provider>,
            )

            expect(getAllByText(name)).toHaveLength(2)
        })

        it('should display users only', () => {
            const { getByText, queryByText } = render(
                <Provider store={store}>
                    <TicketAssignee {...minProps} handleTeams={false} />
                </Provider>,
            )

            expect(getByText(/Users/)).toBeInTheDocument()
            expect(queryByText(/Teams/)).not.toBeInTheDocument()
            expect(queryByText(/Gorgias Support Agent/)).not.toBeInTheDocument()
        })

        it('should display teams only', () => {
            const { getByText, queryByText } = render(
                <Provider store={store}>
                    <TicketAssignee {...minProps} handleUsers={false} />
                </Provider>,
            )

            expect(queryByText(/Users/)).not.toBeInTheDocument()
            expect(getByText(/Teams/)).toBeInTheDocument()
        })

        it('should not bind keyboard shortcuts when disabled', () => {
            render(
                <Provider store={store}>
                    <TicketAssignee {...minProps} bindKeys disabled />
                </Provider>,
            )

            expect(shortcutManagerMock.bind).not.toHaveBeenCalled()
        })

        it('should open the search input when the dropdown toggles', () => {
            render(
                <Provider store={store}>
                    <TicketAssignee {...minProps} />
                </Provider>,
            )

            expect(
                screen.queryByPlaceholderText('Search users or teams...'),
            ).not.toBeInTheDocument()

            act(() => {
                fireEvent.click(
                    screen.getByRole('button', {
                        name: 'Toggle assignee dropdown',
                    }),
                )
            })

            expect(
                screen.getByPlaceholderText('Search users or teams...'),
            ).toBeInTheDocument()
        })

        it('should not open the search input when disabled and the dropdown toggles', () => {
            render(
                <Provider store={store}>
                    <TicketAssignee {...minProps} disabled />
                </Provider>,
            )

            expect(
                screen.queryByPlaceholderText('Search users or teams...'),
            ).not.toBeInTheDocument()

            act(() => {
                fireEvent.click(
                    screen.getByRole('button', {
                        name: 'Toggle assignee dropdown',
                    }),
                )
            })

            expect(
                screen.queryByPlaceholderText('Search users or teams...'),
            ).not.toBeInTheDocument()
        })
    })
})
