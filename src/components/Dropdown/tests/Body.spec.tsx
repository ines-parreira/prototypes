import React, {ComponentProps, ContextType} from 'react'
import {fireEvent, render} from '@testing-library/react'

import {DropdownContext} from 'pages/common/components/dropdown/Dropdown'

import Body from '../Body'
import Context from '../Context'
import focusOnNextItem from '../focusOnNextItem'

jest.mock('pages/common/components/Spinner', () => () => 'SpinnerMock')

jest.mock('../focusOnNextItem')
const mockFocusOnNextItem = focusOnNextItem as jest.Mock

const mockDropdownContext: ContextType<typeof DropdownContext> = {
    isMultiple: false,
    value: null,
    query: '',
    onToggle: jest.fn(),
    getHighlightedLabel: (string) => string,
    onQueryChange: jest.fn(),
}

const mockContext = {
    data: [
        {id: 1, name: 'exchange'},
        {id: 2, name: 'refund'},
    ],
    onClick: jest.fn(),
    search: '',
    setSearch: jest.fn(),
    debouncedSearch: '',
    shouldRender: true,
}

describe('<Body />', () => {
    const renderWithContexts = (
        context: ContextType<typeof Context>,
        props?: ComponentProps<typeof Body>
    ) =>
        render(
            <DropdownContext.Provider value={mockDropdownContext}>
                <Context.Provider value={context}>
                    <Body {...props} />
                </Context.Provider>
            </DropdownContext.Provider>
        )

    it('should display loading state', () => {
        const {getByText} = renderWithContexts({
            ...mockContext,
            isLoading: true,
        })

        expect(getByText('SpinnerMock')).toBeInTheDocument()
    })

    it('should handle case for no results', () => {
        const {getByPlaceholderText, getByText, getAllByRole} =
            renderWithContexts({...mockContext, data: []})

        expect(getAllByRole('listitem').length).toBe(1)
        expect(getAllByRole('listitem')[0]).toBe(getByPlaceholderText('Search'))
        expect(getByText('No results')).toBeInTheDocument()
    })

    it('should not render any content when data is not available', () => {
        const {queryByText, queryAllByRole} = renderWithContexts({
            ...mockContext,
            shouldRender: false,
        })

        expect(queryAllByRole('listitem').length).toBe(1)
        expect(queryByText('No results')).not.toBeInTheDocument()
    })

    it('should handle click on item', () => {
        const {getAllByRole} = renderWithContexts(mockContext)

        getAllByRole('listitem')[1].click()

        expect(mockContext.onClick).toHaveBeenCalledWith({
            id: 1,
            name: 'exchange',
        })
    })

    it('should set search', () => {
        const {getByPlaceholderText} = renderWithContexts(mockContext)

        fireEvent.change(getByPlaceholderText(/Search/), {
            target: {value: 'Foo'},
        })
        expect(mockContext.setSearch).toHaveBeenCalledWith('Foo')
    })

    it('should trigger focusOnNextItem on key down events', () => {
        const {getByText, getByPlaceholderText} =
            renderWithContexts(mockContext)
        fireEvent.keyDown(getByPlaceholderText(/Search/), {
            key: 'ArrowDown',
        })
        expect(mockFocusOnNextItem).toHaveBeenCalled()

        fireEvent.keyDown(getByText('exchange'), {
            key: 'ArrowDown',
        })
        expect(mockFocusOnNextItem).toHaveBeenCalled()

        fireEvent.keyDown(getByText('refund'), {
            key: 'ArrowDown',
        })
        expect(mockFocusOnNextItem).toHaveBeenCalled()
    })

    it('should use custom item rendering function', () => {
        const onRenderItemMock = jest.fn()
        renderWithContexts(mockContext, {
            onRenderItem: onRenderItemMock,
        })

        expect(onRenderItemMock).toHaveBeenNthCalledWith(1, mockContext.data[0])
        expect(onRenderItemMock).toHaveBeenNthCalledWith(2, mockContext.data[1])
    })
})
