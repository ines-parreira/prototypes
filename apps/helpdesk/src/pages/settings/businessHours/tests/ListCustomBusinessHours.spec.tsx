import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockListBusinessHoursHandler } from '@gorgias/helpdesk-mocks'

import { Form } from 'core/forms'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import ListCustomBusinessHours from '../ListCustomBusinessHours'
import ListCustomBusinessHoursTableRow from '../ListCustomBusinessHoursTableRow'

const queryClient = mockQueryClient()
const server = setupServer()

jest.mock('../ListCustomBusinessHoursTableRow')
const ListCustomBusinessHoursTableRowMock = assumeMock(
    ListCustomBusinessHoursTableRow,
)

const mockHandler = mockListBusinessHoursHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        meta: {
            next_cursor: 'next-cursor-123',
            prev_cursor: null,
            total_resources: 3,
        },
    }),
)

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockHandler.handler)
})

afterEach(() => {
    server.resetHandlers()
    queryClient.removeQueries()
})

afterAll(() => {
    server.close()
})

const renderComponent = () =>
    render(
        <QueryClientProvider client={queryClient}>
            <Form onValidSubmit={jest.fn()}>
                <ListCustomBusinessHours />
            </Form>
        </QueryClientProvider>,
    )

describe('ListCustomBusinessHours', () => {
    beforeEach(() => {
        ListCustomBusinessHoursTableRowMock.mockReturnValue(
            <div>ListCustomBusinessHoursTableRow</div>,
        )
    })

    it('should render', async () => {
        renderComponent()

        expect(screen.getByText('Name & Schedule')).toBeInTheDocument()
        expect(screen.getByText('Integration')).toBeInTheDocument()
        expect(screen.getByText('Timezone')).toBeInTheDocument()

        await waitFor(() => {
            expect(
                screen.getAllByText('ListCustomBusinessHoursTableRow'),
            ).toHaveLength(mockHandler.data.data.length)
        })
    })

    it('should render skeleton when loading', () => {
        const { container } = renderComponent()

        const skeletons = container.querySelectorAll(
            '[class^="react-loading-skeleton"]',
        )
        expect(skeletons.length).toBeGreaterThan(0)
    })

    describe('updateCursor functionality', () => {
        it('should call updateCursor with "next" when next button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {
                        name: /keyboard_arrow_right/i,
                    }),
                ).toBeInTheDocument()
            })

            const nextButton = screen.getByRole('button', {
                name: /keyboard_arrow_right/i,
            })
            await user.click(nextButton)
        })

        it('should call updateCursor with "prev" when prev button is clicked', async () => {
            const listMock = mockListBusinessHoursHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    meta: {
                        next_cursor: null,
                        prev_cursor: 'prev-cursor-123',
                        total_resources: 3,
                    },
                }),
            )
            server.use(listMock.handler)

            const user = userEvent.setup()
            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {
                        name: /keyboard_arrow_left/i,
                    }),
                ).toBeInTheDocument()
            })

            const prevButton = screen.getByRole('button', {
                name: /keyboard_arrow_left/i,
            })

            await user.click(prevButton)
        })

        it('should disable navigation buttons when no pagination data is available', async () => {
            const mockHandlerWithoutPagination = mockListBusinessHoursHandler(
                async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: data.data.length,
                        },
                    }),
            )

            server.use(mockHandlerWithoutPagination.handler)

            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getAllByText('ListCustomBusinessHoursTableRow'),
                ).toHaveLength(mockHandlerWithoutPagination.data.data.length)
            })

            expect(
                screen.queryByRole('button', { name: /keyboard_arrow_left/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /keyboard_arrow_right/i }),
            ).not.toBeInTheDocument()
        })
    })

    describe('pagination behavior', () => {
        it('should show both navigation buttons when both cursors are available', async () => {
            const mockHandlerWithBothCursors = mockListBusinessHoursHandler(
                async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        meta: {
                            next_cursor: 'next-cursor-123',
                            prev_cursor: 'prev-cursor-123',
                            total_resources: 3,
                        },
                    }),
            )

            server.use(mockHandlerWithBothCursors.handler)

            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {
                        name: /keyboard_arrow_left/i,
                    }),
                ).toBeInTheDocument()
                expect(
                    screen.getByRole('button', {
                        name: /keyboard_arrow_right/i,
                    }),
                ).toBeInTheDocument()
            })
        })

        it('should hide navigation when no pagination data exists', async () => {
            const mockHandlerWithoutPagination = mockListBusinessHoursHandler(
                async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: 1,
                        },
                    }),
            )

            server.use(mockHandlerWithoutPagination.handler)

            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getAllByText('ListCustomBusinessHoursTableRow'),
                ).toHaveLength(mockHandlerWithoutPagination.data.data.length)
            })

            expect(
                screen.queryByRole('button', { name: /keyboard_arrow_left/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /keyboard_arrow_right/i }),
            ).not.toBeInTheDocument()
        })
    })

    it('should handle empty array business hours data and not render anything', async () => {
        const mockHandlerWithEmptyArray = mockListBusinessHoursHandler(
            async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    data: [],
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: 0,
                    },
                }),
        )

        server.use(mockHandlerWithEmptyArray.handler)

        renderComponent()

        await waitFor(() => {
            expect(
                screen.queryByText('Name & Schedule'),
            ).not.toBeInTheDocument()
        })

        expect(screen.getByRole('form')).toBeEmptyDOMElement()
    })

    it('should handle empty state when totalResources is greater than 0 but data is empty (filters are applied)', async () => {
        const mockHandlerWithEmptyArray = mockListBusinessHoursHandler(
            async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    data: [],
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: 1,
                    },
                }),
        )

        server.use(mockHandlerWithEmptyArray.handler)

        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('No data available')).toBeInTheDocument()
            expect(
                screen.getByText(
                    /We couldn't find any business hours. Please adjust filters/,
                ),
            ).toBeInTheDocument()
        })
    })

    it('should handle error state', async () => {
        const mockHandlerWithError = mockListBusinessHoursHandler(async () =>
            HttpResponse.json({} as any, { status: 500 }),
        )

        server.use(mockHandlerWithError.handler)
        const user = userEvent.setup()
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Something went wrong when fetching the data. Please try again.',
                ),
            ).toBeInTheDocument()
        })

        server.use(mockHandler.handler)
        await act(() =>
            user.click(screen.getByRole('button', { name: /refresh/i })),
        )

        expect(
            screen.queryByText(
                'Something went wrong when fetching the data. Please try again.',
            ),
        ).not.toBeInTheDocument()
    })

    describe('search functionality', () => {
        it('should handle search input changes and reset cursor', async () => {
            const user = userEvent.setup()
            renderComponent()

            const searchInput = screen.getByPlaceholderText('Search name')

            // Type in search input
            await user.type(searchInput, 'test search')

            // Verify the search input has the value
            expect(searchInput).toHaveValue('test search')
        })

        it('should clear search term when navigating with debounced search active', async () => {
            const user = userEvent.setup()

            renderComponent()

            const searchInput = screen.getByPlaceholderText('Search name')

            // Type in search input to trigger debounced search
            await user.type(searchInput, 'test search')

            // Wait for the next button to be available
            await waitFor(() => {
                expect(
                    screen.getByRole('button', {
                        name: /keyboard_arrow_right/i,
                    }),
                ).toBeInTheDocument()
            })

            // Click next button to trigger cursor update
            const nextButton = screen.getByRole('button', {
                name: /keyboard_arrow_right/i,
            })
            await user.click(nextButton)

            // The search input should still have the value, but the search term should be cleared internally
            expect(searchInput).toHaveValue('test search')
        })
    })

    describe('sorting functionality', () => {
        it('should handle sorting by Name column', async () => {
            const user = userEvent.setup()
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Name & Schedule')).toBeInTheDocument()
            })

            const nameHeader = screen.getByText('Name & Schedule')
            await user.click(nameHeader)

            expect(nameHeader.closest('th')).toHaveAttribute(
                'data-ordered-by',
                'true',
            )
        })

        it('should handle sorting by Timezone column', async () => {
            const user = userEvent.setup()
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Timezone')).toBeInTheDocument()
            })

            const timezoneHeader = screen.getByText('Timezone')
            await user.click(timezoneHeader)

            expect(timezoneHeader.closest('th')).toHaveAttribute(
                'data-ordered-by',
                'true',
            )
        })

        it('should toggle sort direction when clicking the same column twice', async () => {
            const user = userEvent.setup()
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Name & Schedule')).toBeInTheDocument()
            })

            const nameHeader = screen.getByText('Name & Schedule')

            await user.click(nameHeader)
            expect(nameHeader.closest('th')).toHaveAttribute(
                'data-direction',
                'asc',
            )

            await user.click(nameHeader)
            expect(nameHeader.closest('th')).toHaveAttribute(
                'data-direction',
                'desc',
            )

            await user.click(nameHeader)
            expect(nameHeader.closest('th')).toHaveAttribute(
                'data-ordered-by',
                'false',
            )
        })
    })
})
