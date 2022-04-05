import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS, Map} from 'immutable'

import {RootState} from 'state/types'
import {UserRole} from 'config/types/user'
import {user} from 'fixtures/users'

import MacroNoResults from '../MacroNoResults'

const mockStore = configureMockStore([thunk])

describe('<MacroNoResults />', () => {
    const defaultState: Partial<RootState> = {
        currentUser: fromJS(user),
    }
    const minProps: ComponentProps<typeof MacroNoResults> = {
        searchParams: {search: ''},
        newAction: jest.fn(),
    }

    it('should display no macros available without search query', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <MacroNoResults {...minProps} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display no macros found with search query', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <MacroNoResults
                    {...minProps}
                    searchParams={{search: 'Pizza Pepperoni'}}
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not display the create a new macro button when the user is observer, lite and basic', () => {
        const {queryByText} = render(
            <Provider
                store={mockStore({
                    currentUser: (fromJS(user) as Map<any, any>).setIn(
                        ['roles', 0, 'name'],
                        UserRole.BasicAgent
                    ),
                })}
            >
                <MacroNoResults {...minProps} />
            </Provider>
        )

        expect(queryByText('Create a new macro')).toBeNull()
    })
})
