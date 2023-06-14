import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {render} from '@testing-library/react'
import {fromJS, List, Map} from 'immutable'

import {UserRole} from 'config/types/user'
import {user} from 'fixtures/users'
import {RootState} from 'state/types'

import {TicketMacrosContainer} from '../TicketMacros'

jest.mock(
    '../../../../common/macros/components/MacroNoResults',
    () => () => 'No macros found'
)
jest.mock(
    '../../../../common/macros/components/MacroList',
    () => () => 'Macro list'
)

const mockStore = configureMockStore([thunk])

describe('<TicketMacros />', () => {
    const defaultUser = fromJS(user) as Map<any, any>
    const defaultState: Partial<RootState> = {
        currentUser: defaultUser,
    }

    const minProps: ComponentProps<typeof TicketMacrosContainer> = {
        applyMacro: jest.fn(),
        currentMacro: fromJS({}),
        initialMacrosLoaded: true,
        loadMacros: jest.fn(),
        macros: fromJS({}),
        searchParams: {},
        selectMacro: jest.fn(),
    }

    const macros: List<any> = fromJS([
        {
            id: 1,
            name: 'Refund my order',
            actions: [
                {
                    name: 'setResponseText',
                },
                {
                    name: 'addAttachments',
                },
            ],
        },
        {
            id: 2,
            name: 'Order my refund',
            actions: [],
        },
    ])

    it("should display an empty state if there's no macros", () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketMacrosContainer {...minProps} />
            </Provider>
        )

        expect(getByText('No macros found')).toBeTruthy()
    })

    it('should display macros list, and selected macro', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketMacrosContainer
                    {...minProps}
                    macros={macros}
                    currentMacro={macros.get(1)}
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not display the edition dropdown when the user is observer, lite or basic agent', () => {
        const {queryByText} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentUser: defaultUser.setIn(
                        ['role', 'name'],
                        UserRole.BasicAgent
                    ),
                })}
            >
                <TicketMacrosContainer {...minProps} macros={macros} />
            </Provider>
        )

        expect(queryByText('settings')).toBeNull()
    })
})
