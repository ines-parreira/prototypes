import {render, screen} from '@testing-library/react'
import {fromJS, List, Map} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import shortcutManager from 'services/shortcutManager'
import {makeExecuteKeyboardAction} from 'utils/testing'

import MacroModalList from '../MacroModalList'

const mockStore = configureMockStore([thunk])

jest.mock('services/shortcutManager')
const shortcutManagerMock = shortcutManager as jest.Mocked<
    typeof shortcutManager
>

const shortcutEventMock = {
    preventDefault: jest.fn(),
} as unknown as jest.Mocked<Event>

jest.mock('pages/common/components/MacroFilters/MacroFilters', () => () => (
    <div>MacroFiltersMock</div>
))

describe('<MacroModalList />', () => {
    const macros = [
        {id: 1, name: 'Pizza Pepperoni', relevance_rank: 1},
        {id: 2, name: 'Pizza Capricciosa'},
        {
            id: 3,
            name: 'Pizza Margherita',
            actions: [{name: 'http'}],
        },
    ]

    const props = {
        currentMacro: fromJS(macros[0]),
        fetchMacros: jest.fn(),
        handleClickItem: jest.fn(),
        onSearch: jest.fn(),
        searchParams: {},
        searchResults: fromJS(macros),
    }

    it('should render list of macros with the filters', () => {
        render(
            <Provider store={mockStore({})}>
                <MacroModalList {...props} />
            </Provider>
        )

        expect(shortcutManagerMock.bind).toHaveBeenCalled()

        expect(
            screen.getByPlaceholderText(
                'Search macros by name, tags or body...'
            )
        ).toBeInTheDocument()
        expect(screen.getByText('MacroFiltersMock')).toBeInTheDocument()
        expect(screen.getByText(macros[0].name)).toBeInTheDocument()
        expect(screen.getByText(macros[1].name)).toBeInTheDocument()
        expect(screen.getByText(macros[2].name)).toBeInTheDocument()
    })

    it('should navigate via keyboard events and ignore disabled macros', () => {
        render(
            <Provider store={mockStore({})}>
                <MacroModalList {...props} areExternalActionsDisabled />
            </Provider>
        )
        expect(shortcutManagerMock.bind).toHaveBeenCalled()

        makeExecuteKeyboardAction(
            shortcutManagerMock,
            shortcutEventMock,
            'MacroModal'
        )('GO_NEXT_MACRO')
        expect(props.handleClickItem).toHaveBeenLastCalledWith(macros[1].id)

        makeExecuteKeyboardAction(
            shortcutManagerMock,
            shortcutEventMock,
            'MacroModal'
        )('GO_NEXT_MACRO')
        // skip macro id 3 i.e. macros[2]
        expect(props.handleClickItem).toHaveBeenLastCalledWith(macros[0].id)

        makeExecuteKeyboardAction(
            shortcutManagerMock,
            shortcutEventMock,
            'MacroModal'
        )('GO_NEXT_MACRO')
        expect(props.handleClickItem).toHaveBeenLastCalledWith(macros[1].id)

        makeExecuteKeyboardAction(
            shortcutManagerMock,
            shortcutEventMock,
            'MacroModal'
        )('GO_PREV_MACRO')
        expect(props.handleClickItem).toHaveBeenLastCalledWith(macros[0].id)
    })

    it('should not bind keyboard shortcuts when results are empty', () => {
        render(
            <Provider store={mockStore({})}>
                <MacroModalList
                    {...props}
                    searchResults={fromJS([])}
                    currentMacro={fromJS({})}
                />
            </Provider>
        )

        expect(shortcutManagerMock.bind).not.toHaveBeenCalled()
    })

    it('should not bind keyboard shortcuts when all macros are disabled', () => {
        const macros: List<Map<any, any>> = fromJS([
            {id: 1, name: 'Pizza Pepperoni', actions: [{name: 'http'}]},
            {id: 2, name: 'Pizza Capricciosa', actions: [{name: 'http'}]},
            {
                id: 3,
                name: 'Pizza Margherita',
                actions: [{name: 'http'}],
            },
        ])
        render(
            <Provider store={mockStore({})}>
                <MacroModalList
                    {...props}
                    areExternalActionsDisabled
                    searchResults={macros}
                    currentMacro={macros.first()}
                />
            </Provider>
        )

        expect(shortcutManagerMock.bind).not.toHaveBeenCalled()
    })
})
