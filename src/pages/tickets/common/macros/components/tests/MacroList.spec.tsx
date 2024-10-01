import React, {ComponentProps} from 'react'
import {fromJS, List} from 'immutable'
import {render, fireEvent, screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {logEvent} from 'common/segment'
import {user} from 'fixtures/users'
import {RootState} from 'state/types'

import MacroListContainer from '../MacroList'

jest.mock('common/segment')
const logEventMock = logEvent as jest.Mock

const mockStore = configureMockStore([thunk])

describe('MacroList component', () => {
    const defaultStore: Partial<RootState> = {
        currentUser: fromJS(user),
    }

    const macros: List<any> = fromJS([
        {id: 1, name: 'Pizza Pepperoni', relevance_rank: 1},
        {id: 2, name: 'Pizza Capricciosa'},
        {
            id: 3,
            name: 'Pizza Margherita',
            actions: [{name: 'http'}],
        },
        {id: 4, name: ''},
    ])

    const minProps: ComponentProps<typeof MacroListContainer> = {
        searchResults: macros,
        currentMacro: macros.first(),
        onClickItem: jest.fn(),
        onHoverItem: jest.fn(),
        loadMore: jest.fn(),
    }

    it('should render the macro list', () => {
        render(
            <Provider store={mockStore(defaultStore)}>
                <MacroListContainer {...minProps} />
            </Provider>
        )

        expect(screen.getByText(macros.getIn([0, 'name']))).toHaveClass(
            'active'
        )
        expect(screen.getByText(macros.getIn([0, 'name'])).textContent).toMatch(
            /auto_awesome/
        )
        expect(screen.getByText(macros.getIn([1, 'name']))).toBeInTheDocument()
        expect(screen.getByText(macros.getIn([2, 'name']))).toBeInTheDocument()
        expect(screen.getByText('No name')).toBeInTheDocument()
    })

    it('should render active and disabled macros', () => {
        render(
            <Provider store={mockStore(defaultStore)}>
                <MacroListContainer
                    {...minProps}
                    currentMacro={macros.get(1)}
                    areExternalActionsDisabled
                />
            </Provider>
        )

        expect(screen.getByText(macros.getIn([1, 'name']))).toHaveClass(
            'active'
        )
        expect(screen.getByText(macros.getIn([2, 'name']))).toHaveClass(
            'disabled'
        )
    })

    it('should send event to segment on send', () => {
        const {getAllByText} = render(
            <Provider store={mockStore(defaultStore)}>
                <MacroListContainer
                    {...minProps}
                    currentMacro={macros.get(1)}
                    areExternalActionsDisabled
                />
            </Provider>
        )
        fireEvent.click(getAllByText('Pizza Capricciosa')[0])
        expect(logEventMock.mock.calls[0]).toEqual([
            'macro-applied-searchbar',
            {
                is_recommended: false,
                macro_id: 2,
                rank: undefined,
                user_id: 2,
            },
        ])
    })
})
