import type { ComponentProps } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { Macro } from '@gorgias/helpdesk-queries'

import { logEvent } from 'common/segment'
import { user } from 'fixtures/users'
import { RootState } from 'state/types'

import MacroListContainer from '../MacroList'

jest.mock('common/segment')
const logEventMock = logEvent as jest.Mock

const mockStore = configureMockStore([thunk])

describe('MacroList component', () => {
    const defaultStore: Partial<RootState> = {
        currentUser: fromJS(user),
    }

    const macros = [
        { id: 1, name: 'Pizza Pepperoni', relevance_rank: 1 },
        { id: 2, name: 'Pizza Capricciosa' },
        {
            id: 3,
            name: 'Pizza Margherita',
            actions: [{ name: 'http' }],
        },
        { id: 4, name: '' },
    ] as Macro[]

    const minProps: ComponentProps<typeof MacroListContainer> = {
        searchResults: macros,
        currentMacro: macros[0],
        onClickItem: jest.fn(),
        onHoverItem: jest.fn(),
        loadMore: jest.fn(),
    }

    it('should render the macro list', () => {
        render(
            <Provider store={mockStore(defaultStore)}>
                <MacroListContainer {...minProps} />
            </Provider>,
        )

        expect(screen.getByText(macros[0].name!)).toHaveClass('active')
        expect(screen.getByText(macros[0].name!).textContent).toMatch(
            /verified/,
        )
        expect(screen.getByText(macros[1].name!)).toBeInTheDocument()
        expect(screen.getByText(macros[2].name!)).toBeInTheDocument()
        expect(screen.getByText('No name')).toBeInTheDocument()
    })

    it('should render active and disabled macros', () => {
        render(
            <Provider store={mockStore(defaultStore)}>
                <MacroListContainer
                    {...minProps}
                    currentMacro={macros[1]}
                    areExternalActionsDisabled
                />
            </Provider>,
        )

        expect(screen.getByText(macros[1].name!)).toHaveClass('active')
        expect(screen.getByText(macros[2].name!)).toHaveClass('disabled')
    })

    it('should send event to segment on send', () => {
        const { getAllByText } = render(
            <Provider store={mockStore(defaultStore)}>
                <MacroListContainer
                    {...minProps}
                    currentMacro={macros[1]}
                    areExternalActionsDisabled
                />
            </Provider>,
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

    it('should call onHoverItem when hovering over macro items', () => {
        const onHoverItemMock = jest.fn()
        render(
            <Provider store={mockStore(defaultStore)}>
                <MacroListContainer
                    {...minProps}
                    onHoverItem={onHoverItemMock}
                />
            </Provider>,
        )

        fireEvent.mouseEnter(screen.getByText(macros[0].name!))
        expect(onHoverItemMock).toHaveBeenCalledWith(macros[0])

        fireEvent.mouseEnter(screen.getByText(macros[1].name!))
        expect(onHoverItemMock).toHaveBeenCalledWith(macros[1])
    })

    it('should not call onClickItem when clicking on disabled macro', () => {
        const onClickItemMock = jest.fn()
        render(
            <Provider store={mockStore(defaultStore)}>
                <MacroListContainer
                    {...minProps}
                    onClickItem={onClickItemMock}
                    areExternalActionsDisabled
                />
            </Provider>,
        )

        fireEvent.click(screen.getByText(macros[2].name!))
        expect(onClickItemMock).not.toHaveBeenCalled()
        expect(logEventMock).not.toHaveBeenCalled()
    })

    it('should call onClickItem when clicking on enabled macro', () => {
        const onClickItemMock = jest.fn()
        render(
            <Provider store={mockStore(defaultStore)}>
                <MacroListContainer
                    {...minProps}
                    onClickItem={onClickItemMock}
                />
            </Provider>,
        )

        fireEvent.click(screen.getByText(macros[1].name!))
        expect(onClickItemMock).toHaveBeenCalledWith(macros[1])
    })

    it('should apply custom className when provided', () => {
        const customClassName = 'custom-macro-list'
        const { container } = render(
            <Provider store={mockStore(defaultStore)}>
                <MacroListContainer {...minProps} className={customClassName} />
            </Provider>,
        )

        expect(container.firstChild).toHaveClass(customClassName)
    })

    it('should show verified icon for recommended macros (relevance_rank 1)', () => {
        render(
            <Provider store={mockStore(defaultStore)}>
                <MacroListContainer {...minProps} />
            </Provider>,
        )

        expect(screen.getByText('verified')).toBeInTheDocument()
        expect(screen.getByText('verified')).toHaveClass('material-icons')
    })

    it('should not show verified icon for non-recommended macros (relevance_rank 0)', () => {
        const nonRecommendedMacros = [
            { id: 1, name: 'Pizza Pepperoni', relevance_rank: 0 },
            { id: 2, name: 'Pizza Capricciosa', relevance_rank: 100000 },
        ] as Macro[]

        render(
            <Provider store={mockStore(defaultStore)}>
                <MacroListContainer
                    {...minProps}
                    searchResults={nonRecommendedMacros}
                />
            </Provider>,
        )

        expect(screen.queryByText('verified')).not.toBeInTheDocument()
    })
})
