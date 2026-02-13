import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type {
    GuidanceVariable,
    GuidanceVariableGroup,
    GuidanceVariableList,
} from 'pages/aiAgent/components/GuidanceEditor/variables.types'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

import SlashCommandSuggestions from '../SlashCommandSuggestions'

jest.mock('pages/common/draftjs/plugins/guidanceActions/utils', () => ({
    encodeAction: (action: GuidanceAction) => `$$$${action.value}$$$`,
}))

jest.mock('pages/common/components/dropdown/Dropdown', () => {
    return function MockDropdown({ children, isOpen, onToggle }: any) {
        return (
            <div data-mock="dropdown" data-open={isOpen}>
                {isOpen && children}
                <button
                    aria-label="close dropdown"
                    onClick={() => onToggle(false)}
                >
                    Close
                </button>
            </div>
        )
    }
})

jest.mock('pages/common/components/dropdown/DropdownHeader', () => {
    return function MockDropdownHeader({ children }: any) {
        return <div data-mock="header">{children}</div>
    }
})

jest.mock('pages/common/components/dropdown/DropdownBody', () => {
    return function MockDropdownBody({ children }: any) {
        return <div data-mock="body">{children}</div>
    }
})

jest.mock('pages/common/components/dropdown/DropdownItem', () => {
    const { forwardRef } = jest.requireActual('react')
    return forwardRef(({ children, onClick, option }: any, ref: any) => (
        <div
            role="option"
            onClick={onClick}
            aria-label={option.label}
            ref={ref}
        >
            {children}
        </div>
    ))
})

jest.mock('pages/common/components/button/ButtonIconLabel', () => {
    return function MockButtonIconLabel({ children, icon }: any) {
        return <span data-icon={icon}>{children}</span>
    }
})

jest.mock('pages/common/components/Search', () => {
    return function MockSearch(props: any) {
        return (
            <input
                role="searchbox"
                placeholder={props.placeholder}
                value={props.value}
                onChange={(e: any) => props.onChange(e.target.value)}
                onKeyDown={(e: any) => props.onKeyDown?.(e)}
                onFocus={() => props.onFocus?.()}
                onBlur={() => props.onBlur?.()}
            />
        )
    }
})

const mockVariableGroup: GuidanceVariableGroup = {
    name: 'Order',
    variables: [
        {
            name: 'Order ID',
            value: '{{order.id}}',
            category: 'order' as const,
        },
        {
            name: 'Order Total',
            value: '{{order.total}}',
            category: 'order' as const,
        },
    ],
}

const mockVariable: GuidanceVariable = {
    name: 'Customer Email',
    value: '{{customer.email}}',
    category: 'customer' as const,
}

const mockAction: GuidanceAction = {
    name: 'Transfer',
    value: 'transfer',
}

const mockAction2: GuidanceAction = {
    name: 'Close ticket',
    value: 'close_ticket',
}

function defaultProps(
    overrides: Partial<
        React.ComponentProps<typeof SlashCommandSuggestions>
    > = {},
): React.ComponentProps<typeof SlashCommandSuggestions> {
    return {
        items: [],
        variableList: [mockVariableGroup, mockVariable],
        guidanceActions: [mockAction, mockAction2],
        searchText: '',
        isOpen: true,
        position: { top: 100, left: 200 },
        highlightedIndex: 0,
        selectHighlightedRef: { current: null },
        navigateLeftRef: { current: null },
        onSelect: jest.fn(),
        onClose: jest.fn(),
        onInteractionStart: jest.fn(),
        onSearchTextChange: jest.fn(),
        onSearchFocusChange: jest.fn(),
        onNavigate: jest.fn(),
        onItemCountChange: jest.fn(),
        onProviderViewChange: jest.fn(),
        onCanNavigateRightChange: jest.fn(),
        onResetHighlight: jest.fn(),
        ...overrides,
    }
}

describe('SlashCommandSuggestions', () => {
    describe('visibility', () => {
        it('should not render content when isOpen is false', () => {
            const props = defaultProps({ isOpen: false })
            render(<SlashCommandSuggestions {...props} />)

            expect(
                screen.queryByText('INSERT VARIABLE'),
            ).not.toBeInTheDocument()
        })

        it('should not render content when position is null', () => {
            const props = defaultProps({ position: null })
            render(<SlashCommandSuggestions {...props} />)

            expect(
                screen.queryByText('INSERT VARIABLE'),
            ).not.toBeInTheDocument()
        })

        it('should render content when isOpen is true and position is set', () => {
            const props = defaultProps()
            render(<SlashCommandSuggestions {...props} />)

            expect(screen.getByText('INSERT VARIABLE')).toBeInTheDocument()
        })
    })

    describe('default view', () => {
        it('should render INSERT VARIABLE header', () => {
            const props = defaultProps()
            render(<SlashCommandSuggestions {...props} />)

            expect(screen.getByText('INSERT VARIABLE')).toBeInTheDocument()
        })

        it('should render INSERT ACTION header', () => {
            const props = defaultProps()
            render(<SlashCommandSuggestions {...props} />)

            expect(screen.getByText('INSERT ACTION')).toBeInTheDocument()
        })

        it('should render variable groups and standalone variables', () => {
            const props = defaultProps()
            render(<SlashCommandSuggestions {...props} />)

            expect(
                screen.getByRole('option', { name: 'Order' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('option', { name: 'Customer Email' }),
            ).toBeInTheDocument()
        })

        it('should render actions', () => {
            const props = defaultProps()
            render(<SlashCommandSuggestions {...props} />)

            expect(screen.getByText('Transfer')).toBeInTheDocument()
            expect(screen.getByText('Close ticket')).toBeInTheDocument()
        })

        it('should render chevron icon for groups', () => {
            const props = defaultProps()
            render(<SlashCommandSuggestions {...props} />)

            expect(
                screen
                    .getByText('Order')
                    .closest('[role="option"]')!
                    .querySelector('svg'),
            ).toBeInTheDocument()
        })

        it('should not render chevron icon for standalone variables', () => {
            const props = defaultProps()
            render(<SlashCommandSuggestions {...props} />)

            expect(
                screen
                    .getByText('Customer Email')
                    .closest('[role="option"]')!
                    .querySelector('svg'),
            ).not.toBeInTheDocument()
        })

        it('should render a search input', () => {
            const props = defaultProps()
            render(<SlashCommandSuggestions {...props} />)

            expect(screen.getByRole('searchbox')).toBeInTheDocument()
        })

        it('should not render INSERT VARIABLE header when variableList is empty', () => {
            const props = defaultProps({
                variableList: [],
                guidanceActions: [mockAction],
            })
            render(<SlashCommandSuggestions {...props} />)

            expect(
                screen.queryByText('INSERT VARIABLE'),
            ).not.toBeInTheDocument()
            expect(screen.getByText('INSERT ACTION')).toBeInTheDocument()
        })

        it('should not render INSERT ACTION header when guidanceActions is empty', () => {
            const props = defaultProps({ guidanceActions: [] })
            render(<SlashCommandSuggestions {...props} />)

            expect(screen.getByText('INSERT VARIABLE')).toBeInTheDocument()
            expect(screen.queryByText('INSERT ACTION')).not.toBeInTheDocument()
        })
    })

    describe('search view', () => {
        it('should show filtered variables when searchText matches', () => {
            const props = defaultProps({
                searchText: 'Order',
                items: [
                    {
                        label: 'Order ID',
                        value: '{{order.id}}',
                        type: 'variable',
                    },
                ],
            })
            render(<SlashCommandSuggestions {...props} />)

            expect(screen.getByText('INSERT VARIABLE')).toBeInTheDocument()
            expect(screen.getByText(/Order ID/)).toBeInTheDocument()
        })

        it('should show filtered actions when searchText matches', () => {
            const props = defaultProps({
                searchText: 'Transfer',
                items: [
                    {
                        label: 'Transfer',
                        value: '$$$transfer$$$',
                        type: 'action',
                    },
                ],
            })
            render(<SlashCommandSuggestions {...props} />)

            expect(screen.getByText('INSERT ACTION')).toBeInTheDocument()
            expect(screen.getByText('Transfer')).toBeInTheDocument()
        })

        it('should show "No results" when nothing matches', () => {
            const props = defaultProps({
                searchText: 'zzzzz',
                items: [],
            })
            render(<SlashCommandSuggestions {...props} />)

            expect(screen.getByText('No results')).toBeInTheDocument()
        })

        it('should show both variables and actions in search results', () => {
            const variableList: GuidanceVariableList = [
                {
                    name: 'Order',
                    variables: [
                        {
                            name: 'Order Transfer',
                            value: '{{order.transfer}}',
                            category: 'order' as const,
                        },
                    ],
                },
            ]

            const actions: GuidanceAction[] = [
                { name: 'Transfer', value: 'transfer' },
            ]

            const props = defaultProps({
                searchText: 'Transfer',
                items: [
                    {
                        label: 'Order Transfer',
                        value: '{{order.transfer}}',
                        type: 'variable',
                    },
                    {
                        label: 'Transfer',
                        value: '$$$transfer$$$',
                        type: 'action',
                    },
                ],
                variableList,
                guidanceActions: actions,
            })
            render(<SlashCommandSuggestions {...props} />)

            expect(screen.getByText('INSERT VARIABLE')).toBeInTheDocument()
            expect(screen.getByText('INSERT ACTION')).toBeInTheDocument()
        })

        it('should prefix variable names with category in search view', () => {
            const props = defaultProps({
                searchText: 'Order',
                items: [
                    {
                        label: 'Order ID',
                        value: '{{order.id}}',
                        type: 'variable',
                    },
                ],
            })
            render(<SlashCommandSuggestions {...props} />)

            expect(screen.getByText(/Order: Order ID/)).toBeInTheDocument()
        })

        it('should prefix customer variables with "Customer" in search view', () => {
            const props = defaultProps({
                searchText: 'Customer',
                variableList: [mockVariable],
                items: [
                    {
                        label: 'Customer Email',
                        value: '{{customer.email}}',
                        type: 'variable',
                    },
                ],
            })
            render(<SlashCommandSuggestions {...props} />)

            expect(
                screen.getByText(/Customer: Customer Email/),
            ).toBeInTheDocument()
        })
    })

    describe('provider view', () => {
        it('should show back button with provider name after clicking a group', async () => {
            const user = userEvent.setup()
            const props = defaultProps()
            render(<SlashCommandSuggestions {...props} />)

            await user.click(screen.getByRole('option', { name: 'Order' }))

            expect(
                screen.getByRole('button', { name: /Order/ }),
            ).toBeInTheDocument()
        })

        it('should show category headers in uppercase', async () => {
            const user = userEvent.setup()
            const props = defaultProps()
            render(<SlashCommandSuggestions {...props} />)

            await user.click(screen.getByRole('option', { name: 'Order' }))

            expect(screen.getByText('ORDER')).toBeInTheDocument()
        })

        it('should show variables grouped by category', async () => {
            const user = userEvent.setup()
            const props = defaultProps()
            render(<SlashCommandSuggestions {...props} />)

            await user.click(screen.getByRole('option', { name: 'Order' }))

            expect(screen.getByText('Order ID')).toBeInTheDocument()
            expect(screen.getByText('Order Total')).toBeInTheDocument()
        })

        it('should not show the search input in provider view', async () => {
            const user = userEvent.setup()
            const props = defaultProps()
            render(<SlashCommandSuggestions {...props} />)

            await user.click(screen.getByRole('option', { name: 'Order' }))

            expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
        })

        it('should return to default view when back button is clicked', async () => {
            const user = userEvent.setup()
            const props = defaultProps()
            render(<SlashCommandSuggestions {...props} />)

            await user.click(screen.getByRole('option', { name: 'Order' }))

            expect(screen.getByText('ORDER')).toBeInTheDocument()

            await user.click(screen.getByRole('button', { name: /Order/ }))

            expect(screen.queryByText('ORDER')).not.toBeInTheDocument()
            expect(screen.getByText('INSERT VARIABLE')).toBeInTheDocument()
            expect(screen.getByText('INSERT ACTION')).toBeInTheDocument()
        })
    })

    describe('selection', () => {
        it('should call onSelect when clicking a standalone variable', async () => {
            const user = userEvent.setup()
            const onSelect = jest.fn()
            const props = defaultProps({ onSelect })
            render(<SlashCommandSuggestions {...props} />)

            await user.click(
                screen.getByRole('option', { name: 'Customer Email' }),
            )

            expect(onSelect).toHaveBeenCalledWith({
                label: 'Customer Email',
                value: '{{customer.email}}',
                type: 'variable',
                category: 'customer',
            })
        })

        it('should call onSelect when clicking a variable in provider view', async () => {
            const user = userEvent.setup()
            const onSelect = jest.fn()
            const props = defaultProps({ onSelect })
            render(<SlashCommandSuggestions {...props} />)

            await user.click(screen.getByRole('option', { name: 'Order' }))

            await user.click(screen.getByRole('option', { name: 'Order ID' }))

            expect(onSelect).toHaveBeenCalledWith({
                label: 'Order ID',
                value: '{{order.id}}',
                type: 'variable',
                category: 'order',
            })
        })

        it('should call onSelect with encoded value when clicking an action', async () => {
            const user = userEvent.setup()
            const onSelect = jest.fn()
            const props = defaultProps({ onSelect })
            render(<SlashCommandSuggestions {...props} />)

            await user.click(screen.getByRole('option', { name: 'Transfer' }))

            expect(onSelect).toHaveBeenCalledWith({
                label: 'Transfer',
                value: '$$$transfer$$$',
                type: 'action',
            })
        })

        it('should enter provider view when clicking a group (not call onSelect)', async () => {
            const user = userEvent.setup()
            const onSelect = jest.fn()
            const props = defaultProps({ onSelect })
            render(<SlashCommandSuggestions {...props} />)

            await user.click(screen.getByRole('option', { name: 'Order' }))

            expect(onSelect).not.toHaveBeenCalled()
            expect(screen.getByText('ORDER')).toBeInTheDocument()
        })

        it('should call onSelect when clicking a variable in search view', async () => {
            const user = userEvent.setup()
            const onSelect = jest.fn()
            const props = defaultProps({
                onSelect,
                searchText: 'Order',
                items: [
                    {
                        label: 'Order ID',
                        value: '{{order.id}}',
                        type: 'variable',
                    },
                ],
            })
            render(<SlashCommandSuggestions {...props} />)

            const options = screen.getAllByRole('option')
            await user.click(options[0])

            expect(onSelect).toHaveBeenCalledWith({
                label: 'Order ID',
                value: '{{order.id}}',
                type: 'variable',
                category: 'order',
            })
        })
    })

    describe('keyboard navigation in search', () => {
        it('should call onNavigate("down") on ArrowDown', () => {
            const onNavigate = jest.fn()
            const props = defaultProps({ onNavigate })
            render(<SlashCommandSuggestions {...props} />)

            const searchInput = screen.getByRole('searchbox')
            fireEvent.keyDown(searchInput, { key: 'ArrowDown' })

            expect(onNavigate).toHaveBeenCalledWith('down')
        })

        it('should call onNavigate("up") on ArrowUp', () => {
            const onNavigate = jest.fn()
            const props = defaultProps({ onNavigate })
            render(<SlashCommandSuggestions {...props} />)

            const searchInput = screen.getByRole('searchbox')
            fireEvent.keyDown(searchInput, { key: 'ArrowUp' })

            expect(onNavigate).toHaveBeenCalledWith('up')
        })

        it('should invoke selectHighlightedRef.current on Enter', () => {
            const onSelect = jest.fn()
            const selectHighlightedRef: React.MutableRefObject<
                (() => void) | null
            > = { current: null }
            const props = defaultProps({
                onSelect,
                selectHighlightedRef,
                highlightedIndex: 1,
            })
            render(<SlashCommandSuggestions {...props} />)

            const searchInput = screen.getByRole('searchbox')
            fireEvent.keyDown(searchInput, { key: 'Enter' })

            expect(onSelect).toHaveBeenCalledWith({
                label: 'Customer Email',
                value: '{{customer.email}}',
                type: 'variable',
                category: 'customer',
            })
        })
    })

    describe('useEffect callbacks', () => {
        it('should call onItemCountChange with correct count for default view', () => {
            const onItemCountChange = jest.fn()
            const props = defaultProps({ onItemCountChange })
            render(<SlashCommandSuggestions {...props} />)

            // variableList has 2 items (Order group + Customer Email) + 2 actions = 4
            expect(onItemCountChange).toHaveBeenCalledWith(4)
        })

        it('should call onItemCountChange with correct count for provider view', async () => {
            const user = userEvent.setup()
            const onItemCountChange = jest.fn()
            const props = defaultProps({ onItemCountChange })
            render(<SlashCommandSuggestions {...props} />)

            await user.click(screen.getByRole('option', { name: 'Order' }))

            // Order group has 2 variables
            expect(onItemCountChange).toHaveBeenCalledWith(2)
        })

        it('should call onProviderViewChange(false) initially', () => {
            const onProviderViewChange = jest.fn()
            const props = defaultProps({ onProviderViewChange })
            render(<SlashCommandSuggestions {...props} />)

            expect(onProviderViewChange).toHaveBeenCalledWith(false)
        })

        it('should call onProviderViewChange(true) when entering provider view', async () => {
            const user = userEvent.setup()
            const onProviderViewChange = jest.fn()
            const props = defaultProps({ onProviderViewChange })
            render(<SlashCommandSuggestions {...props} />)

            await user.click(screen.getByRole('option', { name: 'Order' }))

            expect(onProviderViewChange).toHaveBeenCalledWith(true)
        })

        it('should call onCanNavigateRightChange(true) when highlighted item is a group', () => {
            const onCanNavigateRightChange = jest.fn()
            const props = defaultProps({
                onCanNavigateRightChange,
                highlightedIndex: 0,
            })
            render(<SlashCommandSuggestions {...props} />)

            expect(onCanNavigateRightChange).toHaveBeenCalledWith(true)
        })

        it('should call onCanNavigateRightChange(false) when highlighted item is a variable', () => {
            const onCanNavigateRightChange = jest.fn()
            const props = defaultProps({
                onCanNavigateRightChange,
                highlightedIndex: 1,
            })
            render(<SlashCommandSuggestions {...props} />)

            expect(onCanNavigateRightChange).toHaveBeenCalledWith(false)
        })

        it('should call onResetHighlight when provider changes', async () => {
            const user = userEvent.setup()
            const onResetHighlight = jest.fn()
            const props = defaultProps({ onResetHighlight })
            render(<SlashCommandSuggestions {...props} />)

            onResetHighlight.mockClear()

            await user.click(screen.getByRole('option', { name: 'Order' }))

            expect(onResetHighlight).toHaveBeenCalled()
        })

        it('should reset selectedProvider when isOpen becomes false', () => {
            const onProviderViewChange = jest.fn()
            const props = defaultProps({ onProviderViewChange })
            const { rerender } = render(<SlashCommandSuggestions {...props} />)

            fireEvent.click(screen.getByRole('option', { name: 'Order' }))

            expect(onProviderViewChange).toHaveBeenCalledWith(true)

            onProviderViewChange.mockClear()

            rerender(<SlashCommandSuggestions {...props} isOpen={false} />)

            expect(onProviderViewChange).toHaveBeenCalledWith(false)
        })
    })

    describe('handleToggle', () => {
        it('should call onClose when dropdown is closed', async () => {
            const user = userEvent.setup()
            const onClose = jest.fn()
            const props = defaultProps({ onClose })
            render(<SlashCommandSuggestions {...props} />)

            await user.click(
                screen.getByRole('button', { name: 'close dropdown' }),
            )

            expect(onClose).toHaveBeenCalled()
        })
    })

    describe('ref wiring', () => {
        it('should wire selectHighlightedRef to select the highlighted item', () => {
            const onSelect = jest.fn()
            const selectHighlightedRef: React.MutableRefObject<
                (() => void) | null
            > = { current: null }
            const props = defaultProps({
                onSelect,
                selectHighlightedRef,
                highlightedIndex: 1,
            })
            render(<SlashCommandSuggestions {...props} />)

            expect(selectHighlightedRef.current).not.toBeNull()

            selectHighlightedRef.current!()

            expect(onSelect).toHaveBeenCalledWith({
                label: 'Customer Email',
                value: '{{customer.email}}',
                type: 'variable',
                category: 'customer',
            })
        })

        it('should wire navigateLeftRef to return to default view from provider view', async () => {
            const user = userEvent.setup()
            const navigateLeftRef: React.MutableRefObject<
                (() => boolean) | null
            > = { current: null }
            const props = defaultProps({ navigateLeftRef })
            render(<SlashCommandSuggestions {...props} />)

            await user.click(screen.getByRole('option', { name: 'Order' }))

            expect(screen.getByText('ORDER')).toBeInTheDocument()

            const result = navigateLeftRef.current!()
            expect(result).toBe(true)
        })

        it('should return false from navigateLeftRef when not in provider view', () => {
            const navigateLeftRef: React.MutableRefObject<
                (() => boolean) | null
            > = { current: null }
            const props = defaultProps({ navigateLeftRef })
            render(<SlashCommandSuggestions {...props} />)

            const result = navigateLeftRef.current!()
            expect(result).toBe(false)
        })
    })

    describe('mouse event handling', () => {
        it('should prevent default on mouseDown for non-input targets', () => {
            const props = defaultProps()
            render(<SlashCommandSuggestions {...props} />)

            const dropdownBody = screen
                .getByText('INSERT VARIABLE')
                .closest('[data-mock="body"]')!
            const contentDiv = dropdownBody.parentElement!

            const prevented = !fireEvent.mouseDown(contentDiv)

            expect(prevented).toBe(true)
        })

        it('should not prevent default on mouseDown for input targets', () => {
            const props = defaultProps()
            render(<SlashCommandSuggestions {...props} />)

            const searchInput = screen.getByRole('searchbox')

            const prevented = !fireEvent.mouseDown(searchInput)

            expect(prevented).toBe(false)
        })

        it('should stop propagation on click', () => {
            const props = defaultProps()
            const parentClickHandler = jest.fn()
            render(
                <div onClick={parentClickHandler}>
                    <SlashCommandSuggestions {...props} />
                </div>,
            )

            const dropdownBody = screen
                .getByText('INSERT VARIABLE')
                .closest('[data-mock="body"]')!
            const contentDiv = dropdownBody.parentElement!

            fireEvent.click(contentDiv)

            expect(parentClickHandler).not.toHaveBeenCalled()
        })
    })

    describe('pointer event listener', () => {
        it('should call onInteractionStart when pointerdown fires on content', () => {
            const onInteractionStart = jest.fn()
            const props = defaultProps({ onInteractionStart })
            render(<SlashCommandSuggestions {...props} />)

            const dropdownBody = screen
                .getByText('INSERT VARIABLE')
                .closest('[data-mock="body"]')!
            const contentDiv = dropdownBody.parentElement!

            const pointerEvent = new Event('pointerdown', { bubbles: true })
            contentDiv.dispatchEvent(pointerEvent)

            expect(onInteractionStart).toHaveBeenCalled()
        })

        it('should remove pointer event listener on cleanup', () => {
            const onInteractionStart = jest.fn()
            const props = defaultProps({ onInteractionStart })
            const { unmount } = render(<SlashCommandSuggestions {...props} />)

            const dropdownBody = screen
                .getByText('INSERT VARIABLE')
                .closest('[data-mock="body"]')!
            const contentDiv = dropdownBody.parentElement!

            unmount()

            onInteractionStart.mockClear()
            const pointerEvent = new Event('pointerdown', { bubbles: true })
            contentDiv.dispatchEvent(pointerEvent)

            expect(onInteractionStart).not.toHaveBeenCalled()
        })
    })

    describe('keyboard navigation with ArrowRight', () => {
        it('should select group when ArrowRight is pressed on a group item', () => {
            const props = defaultProps({ highlightedIndex: 0 })
            render(<SlashCommandSuggestions {...props} />)

            const searchInput = screen.getByRole('searchbox')
            fireEvent.keyDown(searchInput, { key: 'ArrowRight' })

            expect(screen.getByText('ORDER')).toBeInTheDocument()
        })

        it('should not change view when ArrowRight is pressed on a variable item', () => {
            const props = defaultProps({ highlightedIndex: 1 })
            render(<SlashCommandSuggestions {...props} />)

            const searchInput = screen.getByRole('searchbox')
            fireEvent.keyDown(searchInput, { key: 'ArrowRight' })

            expect(screen.queryByText('ORDER')).not.toBeInTheDocument()
            expect(screen.getByText('INSERT VARIABLE')).toBeInTheDocument()
            expect(screen.getByText('INSERT ACTION')).toBeInTheDocument()
        })

        it('should not change view when ArrowRight is pressed on an action item', () => {
            const props = defaultProps({ highlightedIndex: 2 })
            render(<SlashCommandSuggestions {...props} />)

            const searchInput = screen.getByRole('searchbox')
            fireEvent.keyDown(searchInput, { key: 'ArrowRight' })

            expect(screen.getByText('INSERT VARIABLE')).toBeInTheDocument()
            expect(screen.getByText('INSERT ACTION')).toBeInTheDocument()
        })
    })

    describe('selectItem edge cases', () => {
        it('should not call onSelect when selectHighlightedRef is called with out-of-bounds index', () => {
            const onSelect = jest.fn()
            const selectHighlightedRef: React.MutableRefObject<
                (() => void) | null
            > = { current: null }
            const props = defaultProps({
                onSelect,
                selectHighlightedRef,
                highlightedIndex: 999,
            })
            render(<SlashCommandSuggestions {...props} />)

            selectHighlightedRef.current!()

            expect(onSelect).not.toHaveBeenCalled()
        })

        it('should select action via selectHighlightedRef', () => {
            const onSelect = jest.fn()
            const selectHighlightedRef: React.MutableRefObject<
                (() => void) | null
            > = { current: null }
            const props = defaultProps({
                onSelect,
                selectHighlightedRef,
                highlightedIndex: 2,
            })
            render(<SlashCommandSuggestions {...props} />)

            selectHighlightedRef.current!()

            expect(onSelect).toHaveBeenCalledWith({
                label: 'Transfer',
                value: '$$$transfer$$$',
                type: 'action',
            })
        })

        it('should select group via selectHighlightedRef and enter provider view', () => {
            const onSelect = jest.fn()
            const selectHighlightedRef: React.MutableRefObject<
                (() => void) | null
            > = { current: null }
            const props = defaultProps({
                onSelect,
                selectHighlightedRef,
                highlightedIndex: 0,
            })
            render(<SlashCommandSuggestions {...props} />)

            act(() => {
                selectHighlightedRef.current!()
            })

            expect(onSelect).not.toHaveBeenCalled()
            expect(screen.getByText('ORDER')).toBeInTheDocument()
        })
    })

    describe('scrollIntoView on highlight change', () => {
        it('should call scrollIntoView on the highlighted item', () => {
            const scrollIntoViewMock = jest.fn()
            HTMLDivElement.prototype.scrollIntoView = scrollIntoViewMock

            const props = defaultProps({ highlightedIndex: 0 })
            const { rerender } = render(<SlashCommandSuggestions {...props} />)

            scrollIntoViewMock.mockClear()

            rerender(
                <SlashCommandSuggestions {...props} highlightedIndex={1} />,
            )

            expect(scrollIntoViewMock).toHaveBeenCalledWith({
                block: 'nearest',
            })
        })
    })

    describe('search view category labels', () => {
        it('should show "Customer" prefix for customer category variables', () => {
            const props = defaultProps({
                searchText: 'Email',
                variableList: [
                    {
                        name: 'Customer Email',
                        value: '{{customer.email}}',
                        category: 'customer' as const,
                    },
                ],
                items: [
                    {
                        label: 'Customer Email',
                        value: '{{customer.email}}',
                        type: 'variable',
                    },
                ],
                guidanceActions: [],
            })
            render(<SlashCommandSuggestions {...props} />)

            expect(
                screen.getByText(/Customer: Customer Email/),
            ).toBeInTheDocument()
        })

        it('should show "Order" prefix for order category variables', () => {
            const props = defaultProps({
                searchText: 'Total',
                variableList: [
                    {
                        name: 'Order',
                        variables: [
                            {
                                name: 'Order Total',
                                value: '{{order.total}}',
                                category: 'order' as const,
                            },
                        ],
                    },
                ],
                items: [
                    {
                        label: 'Order Total',
                        value: '{{order.total}}',
                        type: 'variable',
                    },
                ],
                guidanceActions: [],
            })
            render(<SlashCommandSuggestions {...props} />)

            expect(screen.getByText(/Order: Order Total/)).toBeInTheDocument()
        })
    })

    describe('provider view variable categories', () => {
        it('should display customer category header for customer variables', async () => {
            const user = userEvent.setup()
            const customerGroup: GuidanceVariableGroup = {
                name: 'Shopify',
                variables: [
                    {
                        name: 'Customer Email',
                        value: '{{customer.email}}',
                        category: 'customer' as const,
                    },
                    {
                        name: 'Order ID',
                        value: '{{order.id}}',
                        category: 'order' as const,
                    },
                ],
            }

            const props = defaultProps({
                variableList: [customerGroup],
                guidanceActions: [],
            })
            render(<SlashCommandSuggestions {...props} />)

            await user.click(screen.getByRole('option', { name: 'Shopify' }))

            expect(screen.getByText('CUSTOMER')).toBeInTheDocument()
            expect(screen.getByText('ORDER')).toBeInTheDocument()
            expect(screen.getByText('Customer Email')).toBeInTheDocument()
            expect(screen.getByText('Order ID')).toBeInTheDocument()
        })
    })

    describe('navigableItems computation', () => {
        it('should report correct item count in search mode with both variables and actions', () => {
            const onItemCountChange = jest.fn()
            const variableList: GuidanceVariableList = [
                {
                    name: 'Shopify',
                    variables: [
                        {
                            name: 'Transfer Status',
                            value: '{{order.transfer_status}}',
                            category: 'order' as const,
                        },
                    ],
                },
            ]

            const actions: GuidanceAction[] = [
                { name: 'Transfer', value: 'transfer' },
            ]

            const props = defaultProps({
                searchText: 'Transfer',
                items: [
                    {
                        label: 'Transfer Status',
                        value: '{{order.transfer_status}}',
                        type: 'variable',
                    },
                    {
                        label: 'Transfer',
                        value: '$$$transfer$$$',
                        type: 'action',
                    },
                ],
                variableList,
                guidanceActions: actions,
                onItemCountChange,
            })
            render(<SlashCommandSuggestions {...props} />)

            expect(onItemCountChange).toHaveBeenCalledWith(2)
        })

        it('should report correct item count when search has only matching variables', () => {
            const onItemCountChange = jest.fn()
            const props = defaultProps({
                searchText: 'Order',
                items: [
                    {
                        label: 'Order ID',
                        value: '{{order.id}}',
                        type: 'variable',
                    },
                ],
                onItemCountChange,
                guidanceActions: [],
            })
            render(<SlashCommandSuggestions {...props} />)

            expect(onItemCountChange).toHaveBeenCalledWith(2)
        })

        it('should report zero items when search matches nothing', () => {
            const onItemCountChange = jest.fn()
            const props = defaultProps({
                searchText: 'zzzzz',
                items: [],
                onItemCountChange,
                variableList: [],
                guidanceActions: [],
            })
            render(<SlashCommandSuggestions {...props} />)

            expect(onItemCountChange).toHaveBeenCalledWith(0)
        })
    })

    describe('search focus handling', () => {
        it('should call onSearchFocusChange(true) on focus', () => {
            const onSearchFocusChange = jest.fn()
            const props = defaultProps({ onSearchFocusChange })
            render(<SlashCommandSuggestions {...props} />)

            const searchInput = screen.getByRole('searchbox')
            fireEvent.focus(searchInput)

            expect(onSearchFocusChange).toHaveBeenCalledWith(true)
        })

        it('should call onSearchFocusChange(false) on blur', () => {
            const onSearchFocusChange = jest.fn()
            const props = defaultProps({ onSearchFocusChange })
            render(<SlashCommandSuggestions {...props} />)

            const searchInput = screen.getByRole('searchbox')
            fireEvent.blur(searchInput)

            expect(onSearchFocusChange).toHaveBeenCalledWith(false)
        })
    })

    describe('search text change', () => {
        it('should call onSearchTextChange when typing in the search input', async () => {
            const user = userEvent.setup()
            const onSearchTextChange = jest.fn()
            const props = defaultProps({ onSearchTextChange })
            render(<SlashCommandSuggestions {...props} />)

            const searchInput = screen.getByRole('searchbox')
            await user.type(searchInput, 'o')

            expect(onSearchTextChange).toHaveBeenCalledWith('o')
        })
    })

    describe('action click in search view', () => {
        it('should call onSelect with encoded action when clicking an action in search results', async () => {
            const user = userEvent.setup()
            const onSelect = jest.fn()
            const props = defaultProps({
                onSelect,
                searchText: 'Transfer',
                items: [
                    {
                        label: 'Transfer',
                        value: '$$$transfer$$$',
                        type: 'action',
                    },
                ],
                variableList: [],
                guidanceActions: [mockAction],
            })
            render(<SlashCommandSuggestions {...props} />)

            await user.click(screen.getByRole('option', { name: 'Transfer' }))

            expect(onSelect).toHaveBeenCalledWith({
                label: 'Transfer',
                value: '$$$transfer$$$',
                type: 'action',
            })
        })
    })
})
