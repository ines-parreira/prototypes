import type { ComponentProps, ContextType } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { focusOnNextItem } from 'components/Dropdown'
import { DropdownContext } from 'pages/common/components/dropdown/Dropdown'
import useSearch from 'search/useSearch'
import { useListTeams } from 'teams/queries'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import TeamAssigneeDropdownMenu from '../TeamAssigneeDropdownMenu'
import type TeamDropdownItem from '../TeamDropdownItem'

jest.mock('components/Dropdown/focusOnNextItem')
const mockFocusOnNextItem = focusOnNextItem as jest.Mock

jest.mock('teams/queries')
const mockUseListTeams = useListTeams as jest.Mock

jest.mock('search/useSearch')
const mockUseSearch = useSearch as jest.Mock

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    LegacyLoadingSpinner: () => 'SpinnerMock',
}))
const queryClient = mockQueryClient()

jest.mock(
    '../TeamDropdownItem',
    () =>
        ({ item }: ComponentProps<typeof TeamDropdownItem>) => (
            <div>{item.name}</div>
        ),
)

const mockContext: ContextType<typeof DropdownContext> = {
    isMultiple: false,
    value: null,
    query: '',
    onToggle: jest.fn(),
    getHighlightedLabel: (string) => string,
    onQueryChange: jest.fn(),
}

describe('<TeamAssigneeDropdownMenu />', () => {
    const mockFetchNextPage = jest.fn()
    const props = {
        onClick: jest.fn(),
    }
    const renderWithWrapper = () =>
        render(
            <DropdownContext.Provider value={mockContext}>
                <QueryClientProvider client={queryClient}>
                    <TeamAssigneeDropdownMenu {...props} />
                </QueryClientProvider>
            </DropdownContext.Provider>,
        )

    beforeEach(() => {
        mockUseListTeams.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            data: [
                                { id: 11, name: 'Super agents' },
                                { id: 29, name: 'Chat team' },
                            ],
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
        mockUseListTeams.mockReturnValue({
            isFetching: true,
        })

        renderWithWrapper()

        expect(screen.getByText('SpinnerMock')).toBeInTheDocument()
        expect(screen.queryByText(/Clear assignee/)).toBeInTheDocument()
    })

    it('should display teams', () => {
        renderWithWrapper()

        expect(screen.getByText('Super agents')).toBeInTheDocument()
        expect(screen.getByText('Chat team')).toBeInTheDocument()
    })

    it('should trigger team request for searched term', async () => {
        renderWithWrapper()

        fireEvent.change(screen.getByPlaceholderText(/Search/), {
            target: { value: 'Foo' },
        })

        await waitFor(() =>
            expect(mockUseSearch).toHaveBeenCalledWith(
                expect.objectContaining({
                    query: 'Foo',
                }),
                expect.objectContaining({
                    refetchOnWindowFocus: false,
                }),
            ),
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

    it('should assign team on click', () => {
        renderWithWrapper()

        screen.getByText('Super agents').click()

        expect(props.onClick).toHaveBeenCalledWith({
            id: 11,
            name: 'Super agents',
        })
        expect(screen.getByPlaceholderText(/Search/)).toHaveValue('')
    })

    it('should assign team on keyboard event', () => {
        renderWithWrapper()

        fireEvent.keyDown(screen.getByText('Super agents'), {
            key: 'Enter',
        })

        expect(props.onClick).toHaveBeenCalledWith({
            id: 11,
            name: 'Super agents',
        })
        expect(screen.getByPlaceholderText(/Search/)).toHaveValue('')
    })

    it('should load more data', async () => {
        const originalScrollHeight = Object.getOwnPropertyDescriptor(
            Element.prototype,
            'scrollHeight',
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
            target: { scrollTop: 100 },
        })

        await waitFor(() => expect(mockFetchNextPage).toBeCalled())
        Object.defineProperty(
            HTMLElement.prototype,
            'scrollHeight',
            originalScrollHeight,
        )
    })
})
