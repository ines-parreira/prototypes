import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import FindReplaceDialog from '../FindReplaceDialog'
import type { FindReplaceStore } from '../index'

function createStore(
    overrides: Partial<FindReplaceStore> = {},
): FindReplaceStore {
    return {
        searchTerm: '',
        matches: [],
        currentMatchIndex: 0,
        isOpen: true,
        showReplace: false,
        replaceTerm: '',
        shouldScrollToMatch: false,
        ...overrides,
    }
}

function createHandlers() {
    return {
        onSearchChange: jest.fn(),
        onReplaceChange: jest.fn(),
        onFindNext: jest.fn(),
        onFindPrevious: jest.fn(),
        onReplace: jest.fn(),
        onReplaceAll: jest.fn(),
        onClose: jest.fn(),
        onToggleReplace: jest.fn(),
    }
}

describe('FindReplaceDialog', () => {
    it('should not render when store.isOpen is false', () => {
        const store = createStore({ isOpen: false })
        const handlers = createHandlers()

        const { container } = render(
            <FindReplaceDialog store={store} {...handlers} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should render find input when open', () => {
        const store = createStore()
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        expect(screen.getByPlaceholderText('Find')).toBeInTheDocument()
    })

    it('should not render replace row when showReplace is false', () => {
        const store = createStore({ showReplace: false })
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        expect(
            screen.queryByPlaceholderText('Replace with…'),
        ).not.toBeInTheDocument()
    })

    it('should render replace row when showReplace is true', () => {
        const store = createStore({ showReplace: true })
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        expect(screen.getByPlaceholderText('Replace with…')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /^Replace$/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /Replace All/i }),
        ).toBeInTheDocument()
    })

    it('should show match count when there are matches', () => {
        const store = createStore({
            searchTerm: 'test',
            matches: [
                { blockKey: 'a', start: 0, end: 4 },
                { blockKey: 'a', start: 10, end: 14 },
            ],
            currentMatchIndex: 0,
        })
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        expect(screen.getByText('1 of 2')).toBeInTheDocument()
    })

    it('should show "No results" when search term has no matches', () => {
        const store = createStore({
            searchTerm: 'xyz',
            matches: [],
        })
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        expect(screen.getByText('No results')).toBeInTheDocument()
    })

    it('should call onClose when close button is clicked', async () => {
        const user = userEvent.setup()
        const store = createStore()
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        await user.click(screen.getByRole('button', { name: /^close$/i }))

        expect(handlers.onClose).toHaveBeenCalled()
    })

    it('should call onFindNext when next button is clicked', async () => {
        const user = userEvent.setup()
        const store = createStore({
            searchTerm: 'test',
            matches: [{ blockKey: 'a', start: 0, end: 4 }],
        })
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        await user.click(screen.getByRole('button', { name: /next match/i }))

        expect(handlers.onFindNext).toHaveBeenCalled()
    })

    it('should call onFindPrevious when previous button is clicked', async () => {
        const user = userEvent.setup()
        const store = createStore({
            searchTerm: 'test',
            matches: [{ blockKey: 'a', start: 0, end: 4 }],
        })
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        await user.click(
            screen.getByRole('button', { name: /previous match/i }),
        )

        expect(handlers.onFindPrevious).toHaveBeenCalled()
    })

    it('should disable nav buttons when there are no matches', () => {
        const store = createStore({ matches: [] })
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        expect(
            screen.getByRole('button', { name: /previous match/i }),
        ).toBeDisabled()
        expect(
            screen.getByRole('button', { name: /next match/i }),
        ).toBeDisabled()
    })

    it('should call onSearchChange when typing in search input', async () => {
        const user = userEvent.setup()
        const store = createStore()
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        await user.type(screen.getByPlaceholderText('Find'), 'test')

        expect(handlers.onSearchChange).toHaveBeenCalled()
    })

    it('should call onReplaceChange when typing in replace input', async () => {
        const user = userEvent.setup()
        const store = createStore({ showReplace: true })
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        await user.type(screen.getByPlaceholderText('Replace with…'), 'new')

        expect(handlers.onReplaceChange).toHaveBeenCalled()
    })

    it('should call onToggleReplace when toggle button is clicked', async () => {
        const user = userEvent.setup()
        const store = createStore()
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        await user.click(
            screen.getByRole('button', { name: /toggle replace/i }),
        )

        expect(handlers.onToggleReplace).toHaveBeenCalled()
    })

    it('should call onClose when Escape is pressed', () => {
        const store = createStore()
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        fireEvent.keyDown(screen.getByPlaceholderText('Find'), {
            key: 'Escape',
        })

        expect(handlers.onClose).toHaveBeenCalled()
    })

    it('should call onFindNext when Enter is pressed in search input', () => {
        const store = createStore()
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        fireEvent.keyDown(screen.getByPlaceholderText('Find'), {
            key: 'Enter',
        })

        expect(handlers.onFindNext).toHaveBeenCalled()
    })

    it('should call onFindPrevious when Shift+Enter is pressed in search input', () => {
        const store = createStore()
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        fireEvent.keyDown(screen.getByPlaceholderText('Find'), {
            key: 'Enter',
            shiftKey: true,
        })

        expect(handlers.onFindPrevious).toHaveBeenCalled()
    })

    it('should call onReplace when Enter is pressed in replace input', () => {
        const store = createStore({ showReplace: true })
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        const replaceInput = screen.getByPlaceholderText('Replace with…')
        replaceInput.focus()
        fireEvent.keyDown(replaceInput, {
            key: 'Enter',
        })

        expect(handlers.onReplace).toHaveBeenCalled()
    })

    it('should disable replace buttons when there are no matches', () => {
        const store = createStore({ showReplace: true, matches: [] })
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        expect(
            screen.getByRole('button', { name: /^Replace$/i }),
        ).toBeDisabled()
        expect(
            screen.getByRole('button', { name: /Replace all/i }),
        ).toBeDisabled()
    })

    it('should call onReplace when replace button is clicked', async () => {
        const user = userEvent.setup()
        const store = createStore({
            showReplace: true,
            searchTerm: 'test',
            matches: [{ blockKey: 'a', start: 0, end: 4 }],
        })
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        await user.click(screen.getByRole('button', { name: /^Replace$/i }))

        expect(handlers.onReplace).toHaveBeenCalled()
    })

    it('should call onReplaceAll when replace all button is clicked', async () => {
        const user = userEvent.setup()
        const store = createStore({
            showReplace: true,
            searchTerm: 'test',
            matches: [{ blockKey: 'a', start: 0, end: 4 }],
        })
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        await user.click(screen.getByRole('button', { name: /Replace all/i }))

        expect(handlers.onReplaceAll).toHaveBeenCalled()
    })

    it('should show empty match count text when no search term', () => {
        const store = createStore({ searchTerm: '', matches: [] })
        const handlers = createHandlers()

        const { container } = render(
            <FindReplaceDialog store={store} {...handlers} />,
        )

        const matchCountEl = container.querySelector('[class*="matchCount"]')
        expect(matchCountEl?.textContent).toBe('')
    })

    it('should move focus from search to replace on Tab', () => {
        const store = createStore({ showReplace: true })
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        const searchInput = screen.getByPlaceholderText('Find')
        const replaceInput = screen.getByPlaceholderText('Replace with…')

        searchInput.focus()
        fireEvent.keyDown(searchInput, { key: 'Tab' })

        expect(document.activeElement).toBe(replaceInput)
    })

    it('should move focus from replace to search on Tab', () => {
        const store = createStore({ showReplace: true })
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        const searchInput = screen.getByPlaceholderText('Find')
        const replaceInput = screen.getByPlaceholderText('Replace with…')

        replaceInput.focus()
        fireEvent.keyDown(replaceInput, { key: 'Tab' })

        expect(document.activeElement).toBe(searchInput)
    })

    it('should not change focus on Tab when replace row is hidden', () => {
        const store = createStore({ showReplace: false })
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        const searchInput = screen.getByPlaceholderText('Find')
        searchInput.focus()
        fireEvent.keyDown(searchInput, { key: 'Tab' })

        expect(document.activeElement).toBe(searchInput)
    })

    it('should focus search input when dialog opens', () => {
        const handlers = createHandlers()
        const closedStore = createStore({ isOpen: false })

        const { rerender } = render(
            <FindReplaceDialog store={closedStore} {...handlers} />,
        )

        const openStore = createStore({ isOpen: true })
        rerender(<FindReplaceDialog store={openStore} {...handlers} />)

        expect(document.activeElement).toBe(screen.getByPlaceholderText('Find'))
    })

    it('should call stopPropagation on keyDown events', () => {
        const store = createStore()
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        const searchInput = screen.getByPlaceholderText('Find')
        const event = new KeyboardEvent('keydown', {
            key: 'a',
            bubbles: true,
            cancelable: true,
        })
        const stopPropagationSpy = jest.spyOn(event, 'stopPropagation')

        searchInput.dispatchEvent(event)

        expect(stopPropagationSpy).toHaveBeenCalled()
    })

    it('should call onFindNext when ArrowDown is pressed in search input', () => {
        const store = createStore()
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        fireEvent.keyDown(screen.getByPlaceholderText('Find'), {
            key: 'ArrowDown',
        })

        expect(handlers.onFindNext).toHaveBeenCalled()
    })

    it('should call onFindPrevious when ArrowUp is pressed in search input', () => {
        const store = createStore()
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        fireEvent.keyDown(screen.getByPlaceholderText('Find'), {
            key: 'ArrowUp',
        })

        expect(handlers.onFindPrevious).toHaveBeenCalled()
    })

    it('should call onFindNext when ArrowDown is pressed in replace input', () => {
        const store = createStore({ showReplace: true })
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        const replaceInput = screen.getByPlaceholderText('Replace with…')
        replaceInput.focus()
        fireEvent.keyDown(replaceInput, {
            key: 'ArrowDown',
        })

        expect(handlers.onFindNext).toHaveBeenCalled()
    })

    it('should call onFindPrevious when ArrowUp is pressed in replace input', () => {
        const store = createStore({ showReplace: true })
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        const replaceInput = screen.getByPlaceholderText('Replace with…')
        replaceInput.focus()
        fireEvent.keyDown(replaceInput, {
            key: 'ArrowUp',
        })

        expect(handlers.onFindPrevious).toHaveBeenCalled()
    })

    it('should call preventDefault on mouseDown on the dialog', () => {
        const store = createStore()
        const handlers = createHandlers()

        render(<FindReplaceDialog store={store} {...handlers} />)

        const dialog = document.querySelector('[data-find-replace-dialog]')!
        const event = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
        })
        const preventDefaultSpy = jest.spyOn(event, 'preventDefault')

        dialog.dispatchEvent(event)

        expect(preventDefaultSpy).toHaveBeenCalled()
    })
})
