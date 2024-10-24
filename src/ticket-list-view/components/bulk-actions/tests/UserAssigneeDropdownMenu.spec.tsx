import {QueryClientProvider} from '@tanstack/react-query'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import React, {ComponentProps, ContextType} from 'react'

import {focusOnNextItem} from 'components/Dropdown'
import {DropdownContext} from 'pages/common/components/dropdown/Dropdown'
import useSearch from 'search/useSearch'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import useListUsers from 'users/useListUsers'

import UserAssigneeDropdownMenu from '../UserAssigneeDropdownMenu'
import UserDropdownItem from '../UserDropdownItem'

jest.mock('components/Dropdown/focusOnNextItem')
const mockFocusOnNextItem = focusOnNextItem as jest.Mock

jest.mock('users/useListUsers')
const mockUseListUsers = useListUsers as jest.Mock

jest.mock('search/useSearch')
const mockUseSearch = useSearch as jest.Mock

jest.mock('pages/common/components/Spinner', () => () => 'SpinnerMock')
jest.mock(
    '../UserDropdownItem',
    () =>
        ({item}: ComponentProps<typeof UserDropdownItem>) => (
            <div>{item.name}</div>
        )
)

const queryClient = mockQueryClient()

const mockContext: ContextType<typeof DropdownContext> = {
    isMultiple: false,
    value: null,
    query: '',
    onToggle: jest.fn(),
    getHighlightedLabel: (string) => string,
    onQueryChange: jest.fn(),
}

describe('<UserAssigneeDropdownMenu />', () => {
    const mockFetchNextPage = jest.fn()
    const props = {
        onClick: jest.fn(),
    }
    const renderWithWrapper = () =>
        render(
            <DropdownContext.Provider value={mockContext}>
                <QueryClientProvider client={queryClient}>
                    <UserAssigneeDropdownMenu {...props} />
                </QueryClientProvider>
            </DropdownContext.Provider>
        )

    const agents = [
        {id: 8, name: 'Agent numero uno'},
        {id: 23, name: 'Backup agent'},
    ]
    beforeEach(() => {
        mockUseListUsers.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            data: agents,
                        },
                    },
                ],
            },
            hasNextPage: true,
            fetchNextPage: mockFetchNextPage,
        })
        mockUseSearch.mockReturnValue({
            data: {
                data: {
                    data: [],
                },
            },
        })
    })

    it('should load', () => {
        mockUseListUsers.mockReturnValue({
            isFetching: true,
        })

        renderWithWrapper()

        expect(screen.getByText('SpinnerMock')).toBeInTheDocument()
        expect(screen.getByText(/Clear assignee/)).toBeInTheDocument()
    })

    it('should display users', () => {
        renderWithWrapper()

        expect(screen.getByText(agents[0].name)).toBeInTheDocument()
        expect(screen.getByText(agents[1].name)).toBeInTheDocument()
    })

    it('should trigger user request for searched term', async () => {
        renderWithWrapper()

        fireEvent.change(screen.getByPlaceholderText(/Search/), {
            target: {value: 'Foo'},
        })

        await waitFor(() =>
            expect(mockUseSearch).toHaveBeenCalledWith(
                expect.objectContaining({
                    query: 'Foo',
                }),
                expect.objectContaining({
                    refetchOnWindowFocus: false,
                })
            )
        )
    })

    it('should clear assignee', () => {
        renderWithWrapper()

        screen.getByText(/Clear assignee/).click()
        expect(props.onClick).toHaveBeenCalledWith(null)
    })

    it('should clear assignee on keyboard event', () => {
        renderWithWrapper()

        fireEvent.keyDown(screen.getByText(/Clear assignee/), {
            key: 'Enter',
        })
        expect(props.onClick).toHaveBeenCalledWith(null)
        expect(screen.getByPlaceholderText(/Search/)).toHaveValue('')
    })

    it('should navigate from footer on keyboard event', () => {
        renderWithWrapper()

        fireEvent.keyDown(screen.getByText(/Clear assignee/), {
            key: 'a',
        })
        expect(mockFocusOnNextItem).toHaveBeenCalled()
        expect(screen.getByPlaceholderText(/Search/)).toHaveValue('')
    })

    it('should assign user on click', () => {
        renderWithWrapper()

        screen.getByText(agents[0].name).click()

        expect(props.onClick).toHaveBeenCalledWith({
            id: 8,
            name: agents[0].name,
        })
        expect(screen.getByPlaceholderText(/Search/)).toHaveValue('')
    })

    it('should assign user on keyboard event', () => {
        renderWithWrapper()

        fireEvent.keyDown(screen.getByText(agents[0].name), {
            key: 'Enter',
        })

        expect(props.onClick).toHaveBeenCalledWith({
            id: 8,
            name: agents[0].name,
        })
        expect(screen.getByPlaceholderText(/Search/)).toHaveValue('')
    })

    it('should load more data', async () => {
        const originalScrollHeight = Object.getOwnPropertyDescriptor(
            Element.prototype,
            'scrollHeight'
        ) || {
            configurable: true,
            value: 0,
        }
        Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
            configurable: true,
            value: 100,
        })

        renderWithWrapper()
        fireEvent.scroll(screen.getByRole('list'), {
            target: {scrollTop: 100},
        })

        await waitFor(() => expect(mockFetchNextPage).toBeCalled())
        Object.defineProperty(
            HTMLElement.prototype,
            'scrollHeight',
            originalScrollHeight
        )
    })
})
