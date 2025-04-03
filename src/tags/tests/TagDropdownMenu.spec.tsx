import React, { ComponentProps, ContextType } from 'react'

import { QueryClientProvider, QueryKey } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { act } from 'react-dom/test-utils'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { queryKeys } from '@gorgias/api-queries'

import { UserRole } from 'config/types/user'
import { user } from 'fixtures/users'
import { DropdownContext } from 'pages/common/components/dropdown/Dropdown'
import useListTags from 'tags/useListTags'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import TagDropdownMenu from '../TagDropdownMenu'

jest.mock('tags/useListTags')
const mockUseListTags = useListTags as jest.Mock

jest.mock('@gorgias/merchant-ui-kit', () => ({
    LoadingSpinner: () => 'SpinnerMock',
}))

const mockStore = configureMockStore([thunk])

const mockContext: ContextType<typeof DropdownContext> = {
    isMultiple: false,
    value: null,
    query: '',
    onToggle: jest.fn(),
    getHighlightedLabel: (string) => string,
    onQueryChange: jest.fn(),
}

const defaultState = {
    currentUser: fromJS(user),
}
const queryClient = mockQueryClient()
const removeQueriesMock = jest.spyOn(queryClient, 'removeQueries')

describe('<TagDropdownMenu />', () => {
    const props = {
        onClick: jest.fn(),
    }
    const mockCustomColor = '#456123'

    const renderWithWrappers = (
        props: ComponentProps<typeof TagDropdownMenu>,
        state = defaultState,
    ) =>
        render(
            <Provider store={mockStore(state)}>
                <DropdownContext.Provider value={mockContext}>
                    <QueryClientProvider client={queryClient}>
                        <TagDropdownMenu {...props} />
                    </QueryClientProvider>
                </DropdownContext.Provider>
            </Provider>,
        )

    beforeEach(() => {
        jest.useFakeTimers()
        mockUseListTags.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            data: [
                                { id: 1, name: 'exchange' },
                                {
                                    id: 2,
                                    name: 'refund',
                                    decoration: { color: mockCustomColor },
                                },
                            ],
                        },
                    },
                ],
            },
        })
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should display loader', () => {
        mockUseListTags.mockReturnValue({
            isFetching: true,
        })

        renderWithWrappers(props)

        expect(screen.getByText('SpinnerMock')).toBeInTheDocument()
    })

    it('should display tags', () => {
        renderWithWrappers(props)

        expect(screen.getByText('exchange')).toBeInTheDocument()
        expect(screen.getByText('refund')).toBeInTheDocument()
    })

    it('should filter tags', () => {
        const filterBy = jest.fn()
        renderWithWrappers({ ...props, filterBy })

        expect(filterBy).toHaveBeenCalled()
    })

    it('should trigger tag request for searched term', async () => {
        renderWithWrappers(props)

        fireEvent.change(screen.getByPlaceholderText(/Search/), {
            target: { value: 'Foo' },
        })

        await waitFor(() =>
            expect(mockUseListTags).toHaveBeenCalledWith(
                expect.objectContaining({
                    search: 'Foo',
                }),
                expect.objectContaining({
                    refetchOnWindowFocus: false,
                }),
            ),
        )
    })

    it('should loop through items via keyboard events', () => {
        renderWithWrappers(props)

        const searchInput = screen.getByPlaceholderText(/Search/)
        fireEvent.change(searchInput, {
            target: { value: 'x' },
        })
        act(() => jest.runAllTimers())
        const items = screen.getAllByRole('listitem')

        expect(searchInput).toEqual(items[0])
        expect(searchInput).toHaveFocus()

        fireEvent.keyDown(items[0], {
            key: 'ArrowDown',
        })
        expect(screen.getByText(/exchange/)).toEqual(items[1].firstChild)
        expect(items[1]).toHaveFocus()

        fireEvent.keyDown(items[1], {
            key: 'ArrowDown',
        })
        expect(screen.getByText(/refund/)).toEqual(items[2].firstChild)
        expect(items[2]).toHaveFocus()

        fireEvent.keyDown(items[2], {
            key: 'ArrowDown',
        })
        expect(items[3]).toHaveFocus()
        expect(screen.getByText(/Create/).parentElement).toEqual(items[3])
        fireEvent.keyDown(screen.getByText(/Create/), {
            key: 'ArrowDown',
        })
        expect(searchInput).toHaveFocus()

        fireEvent.keyDown(items[0], {
            key: 'ArrowUp',
        })
        expect(items[3]).toHaveFocus()

        fireEvent.keyDown(items[3], {
            key: 'ArrowUp',
        })
        expect(items[2]).toHaveFocus()

        fireEvent.keyDown(items[2], {
            key: 'ArrowUp',
        })
        expect(items[1]).toHaveFocus()

        fireEvent.keyDown(items[1], {
            key: 'ArrowUp',
        })
        expect(searchInput).toHaveFocus()
    })

    it('should remove matching queries after tag creation', () => {
        renderWithWrappers(props)
        const queryKeysTags = queryKeys.tags.listTags()

        fireEvent.change(screen.getByPlaceholderText(/Search/), {
            target: { value: 'Foo' },
        })
        act(() => jest.runAllTimers())

        screen.getByText(/Create/i).click()
        const removeQuery = removeQueriesMock.mock.calls[0][0] as unknown as {
            predicate: ({ queryKey }: { queryKey: QueryKey }) => boolean
        }

        expect(
            removeQuery.predicate({
                queryKey: [queryKeysTags[0], queryKeysTags[1]],
            }),
        ).toBeFalsy()
        expect(
            removeQuery.predicate({ queryKey: ['agent', 'lists'] }),
        ).toBeFalsy()
        expect(
            removeQuery.predicate({
                queryKey: [
                    queryKeysTags[0],
                    queryKeysTags[1],
                    {
                        queryParams: {
                            search: 'Fo',
                        },
                    },
                ],
            }),
        ).toBeTruthy()
    })

    it('should trigger tag creation through keyboard shortcut', () => {
        renderWithWrappers(props)
        fireEvent.change(screen.getByPlaceholderText(/Search/), {
            target: { value: 'Foo' },
        })
        act(() => jest.runAllTimers())

        fireEvent.keyDown(screen.getByText(/Create/i), { key: 'Enter' })
        expect(props.onClick).toHaveBeenCalledWith({ name: 'Foo' })
    })

    it('should enable tag creation for lead agent', () => {
        renderWithWrappers(props)

        fireEvent.change(screen.getByPlaceholderText(/Search/), {
            target: { value: 'Foo' },
        })
        act(() => jest.runAllTimers())

        expect(screen.getByText(/Create/i)).toBeInTheDocument()
    })

    it('should disable tag creation for basic agent and below', () => {
        renderWithWrappers(props, {
            currentUser: fromJS({
                ...user,
                role: { name: UserRole.BasicAgent },
            }),
        })

        fireEvent.change(screen.getByPlaceholderText(/Search/), {
            target: { value: 'Foo' },
        })
        act(() => jest.runAllTimers())

        expect(screen.queryByText(/Create/i)).not.toBeInTheDocument()
    })
})
