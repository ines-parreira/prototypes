import type { ComponentProps } from 'react'
import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import type { RootState, StoreDispatch } from 'state/types'

import SetAssigneeAction from '../SetAssigneeAction'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({} as RootState)

describe('<SetAssigneeAction/>', () => {
    describe('render()', () => {
        const minProps: ComponentProps<typeof SetAssigneeAction> = {
            action: fromJS({}),
            index: 1,
            updateActionArgs: jest.fn(),
        }

        it('should render user dropdown', () => {
            const { container } = render(
                <Provider store={store}>
                    <SetAssigneeAction {...minProps} handleUsers />
                </Provider>,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render team dropdown', () => {
            const { container } = render(
                <Provider store={store}>
                    <SetAssigneeAction {...minProps} handleTeams />
                </Provider>,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render user dropdown with current assignee', () => {
            const { container } = render(
                <Provider store={store}>
                    <SetAssigneeAction
                        {...minProps}
                        action={fromJS({
                            arguments: {
                                assignee_user: fromJS({
                                    id: 1,
                                    name: 'Team 1',
                                    decoration: {},
                                }),
                            },
                        })}
                        handleUsers
                    />
                </Provider>,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render team dropdown with current assignee', () => {
            const { container } = render(
                <Provider store={store}>
                    <SetAssigneeAction
                        {...minProps}
                        action={fromJS({
                            arguments: {
                                assignee_team: fromJS({
                                    id: 1,
                                    name: 'Team 1',
                                    decoration: {},
                                }),
                            },
                        })}
                        handleTeams
                    />
                </Provider>,
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
