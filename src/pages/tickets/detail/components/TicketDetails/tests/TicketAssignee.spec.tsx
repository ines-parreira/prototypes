import React, { ComponentProps } from 'react'

import { render } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import TicketAssignee from '../TicketAssignee/TicketAssignee'

const users: Map<any, any> = fromJS({
    all: [
        { id: 1, name: 'User 1', email: 'email1@foo.com', meta: {} },
        { id: 2, name: 'User 2', email: 'email2@foo.com', meta: {} },
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
    })
})
