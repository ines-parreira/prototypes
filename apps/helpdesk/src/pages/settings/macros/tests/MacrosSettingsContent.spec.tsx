import { history } from '@repo/routing'
import { assumeMock, render } from '@repo/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { useLocation, useRouteMatch } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { toast } from '@gorgias/axiom'
import {
    mockListMacrosHandler,
    mockListMacrosResponse,
} from '@gorgias/helpdesk-mocks'
import type { ListMacrosParams } from '@gorgias/helpdesk-queries'

import { macros as macrosFixtures } from 'fixtures/macro'
import { user } from 'fixtures/users'
import {
    useBulkArchiveMacros,
    useBulkUnarchiveMacros,
    useCreateMacro,
    useDeleteMacro,
} from 'hooks/macros'
import { useAppDispatch } from 'hooks/useAppDispatch'
import { OrderDirection } from 'models/api/types'
import { MacroSortableProperties } from 'models/macro/types'
import type { RootState, StoreDispatch } from 'state/types'

import { MacrosSettingsContent } from '../MacrosSettingsContent'

const mockProperty = MacroSortableProperties.CreatedDatetime
const mockOrder = OrderDirection.Asc

jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    history: {
        push: jest.fn(),
    },
}))

let mockListMacrosParams: Pick<
    ListMacrosParams,
    'search' | 'tags' | 'languages' | 'order_by' | 'cursor'
> = {
    order_by: 'created_datetime:asc',
}
const mockSetListMacrosParams = jest.fn(
    (
        updater:
            | typeof mockListMacrosParams
            | ((
                  prev: typeof mockListMacrosParams,
              ) => typeof mockListMacrosParams),
    ) => {
        mockListMacrosParams =
            typeof updater === 'function'
                ? updater(mockListMacrosParams)
                : updater
    },
)

jest.mock('../hooks/useMacroListSearchParams', () => ({
    useMacroListSearchParams: () => [
        mockListMacrosParams,
        mockSetListMacrosParams,
    ],
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

jest.mock('../MacrosCreateDropdown', () => ({
    MacrosCreateDropdown: () => <div />,
}))

jest.mock('pages/common/components/MacroFilters/MacroFilters', () => ({
    __esModule: true,
    MacroFilters: ({ onChange }: { onChange: (params: any) => void }) => {
        // Expose the onChange handler to the test
        ;(global as any).mockMacroFiltersOnChange = onChange
        return 'MacroFilters'
    },
}))

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.Mock

const mockMutateCreate = jest.fn()
const mockMutateDelete = jest.fn()

jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            useRouteMatch: jest.fn(),
            useLocation: jest.fn(),
            Link: jest.fn(
                ({ children }: { children?: React.ReactNode }) => children,
            ),
            NavLink: ({
                children,
                onClick,
            }: {
                children: React.ReactNode
                onClick: () => void
            }) => <div onClick={onClick}>{children}</div>,
        }) as Record<string, unknown>,
)
const mockUseRouteMatch = useRouteMatch as jest.Mock
const mockUseLocation = useLocation as jest.Mock

jest.mock('hooks/macros')
const mockUseCreateMacro = assumeMock(useCreateMacro)
const mockUseDeleteMacro = assumeMock(useDeleteMacro)

const useBulkArchiveMacrosMock = assumeMock(useBulkArchiveMacros)
const useBulkUnarchiveMacrosMock = assumeMock(useBulkUnarchiveMacros)
const mockMutateBulkArchive = jest.fn()
const mockMutateBulkUnarchive = jest.fn()

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const waitForMacroList = () => screen.findByText(macrosFixtures[0].name!)

const mockListMacrosResponseBody = (
    data = macrosFixtures,
    meta: { next_cursor: string | null; prev_cursor: string | null } = {
        next_cursor: 'next_cursor',
        prev_cursor: 'prev_cursor',
    },
) =>
    mockListMacrosResponse({
        data,
        meta,
    })

describe('<MacrosSettingsContent/>', () => {
    afterEach(() => {
        toast.dismiss()
    })

    beforeEach(() => {
        mockListMacrosParams = { order_by: 'created_datetime:asc' }
        mockSetListMacrosParams.mockClear()
        mockMutateCreate.mockClear()
        mockMutateDelete.mockClear()
        mockMutateBulkArchive.mockClear()
        mockMutateBulkUnarchive.mockClear()
        useAppDispatchMock.mockReturnValue(jest.fn())
        server.use(
            mockListMacrosHandler(async () =>
                HttpResponse.json(mockListMacrosResponseBody()),
            ).handler,
        )
        mockUseCreateMacro.mockReturnValue({
            mutate: mockMutateCreate,
        } as unknown as ReturnType<typeof useCreateMacro>)
        mockUseDeleteMacro.mockReturnValue({
            mutate: mockMutateDelete,
        } as unknown as ReturnType<typeof useDeleteMacro>)
        useBulkArchiveMacrosMock.mockReturnValue({
            mutateAsync: mockMutateBulkArchive,
        } as unknown as ReturnType<typeof useBulkArchiveMacros>)
        useBulkUnarchiveMacrosMock.mockReturnValue({
            mutateAsync: mockMutateBulkUnarchive,
        } as unknown as ReturnType<typeof useBulkUnarchiveMacros>)
        mockUseRouteMatch.mockReturnValue(false)
        mockUseLocation.mockReturnValue({
            pathname: '/app/settings/macros',
            search: '',
            hash: '',
            state: null,
        })
    })

    it('should display list of macros', async () => {
        const listMacrosMock = mockListMacrosHandler(async () =>
            HttpResponse.json(mockListMacrosResponseBody()),
        )
        const waitForListMacrosRequest = listMacrosMock.waitForRequest(server)
        server.use(listMacrosMock.handler)

        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>,
        )

        await waitForListMacrosRequest((request) => {
            const searchParams = new URL(request.url).searchParams

            expect(searchParams.get('order_by')).toBe('created_datetime:asc')
        })
        expect(
            screen.getByText(
                /Macros are pre-made responses to customer questions/,
            ),
        ).toBeInTheDocument()
    })

    it('should notify when fetching macros fails', async () => {
        server.use(
            mockListMacrosHandler(async () =>
                HttpResponse.json(
                    { error: { msg: 'Failed to fetch macros' } } as any,
                    { status: 500 },
                ),
            ).handler,
        )
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>,
        )

        await waitFor(() => {
            expect(
                screen.getByRole('status', { name: 'Failed to fetch macros' }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should fetch the next macros when changing page', async () => {
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>,
        )

        await waitForMacroList()
        await userEvent.click(screen.getByText('keyboard_arrow_right'))
        expect(mockSetListMacrosParams).toHaveBeenCalledWith({
            order_by: 'created_datetime:asc',
            cursor: 'next_cursor',
        })

        await waitForMacroList()
        await userEvent.click(screen.getByText('keyboard_arrow_left'))
        expect(mockSetListMacrosParams).toHaveBeenCalledWith({
            order_by: 'created_datetime:asc',
            cursor: 'prev_cursor',
        })
    })

    it('should fetch macros when sorting options change', async () => {
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>,
        )

        await userEvent.click(screen.getByText('Macro'))

        expect(mockSetListMacrosParams).toHaveBeenCalledWith({
            order_by: `name:${mockOrder}`,
        })
    })

    it('should refetch macros at previous page if last page is empty', async () => {
        server.use(
            mockListMacrosHandler(async () =>
                HttpResponse.json(
                    mockListMacrosResponseBody([macrosFixtures[0]], {
                        next_cursor: 'next_cursor',
                        prev_cursor: 'prev_cursor',
                    }),
                ),
            ).handler,
        )
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>,
        )

        await waitForMacroList()
        await userEvent.click(screen.getByText('more_vert'))
        await screen.findByText(/Delete/)
        await userEvent.click(screen.getByText(/Delete/))
        await screen.findByText('Confirm')
        await userEvent.click(screen.getByText('Confirm'))

        expect(mockMutateDelete).toHaveBeenCalled()
        ;(
            mockMutateDelete.mock.calls[0] as { onSettled: () => void }[]
        )[1].onSettled()

        await waitFor(() => {
            expect(mockSetListMacrosParams).toHaveBeenCalledWith({
                order_by: `${mockProperty}:${mockOrder}`,
                cursor: 'prev_cursor',
            })
        })
    })

    it('should refetch macros once a macro has been deleted', async () => {
        mockListMacrosParams = {
            order_by: 'created_datetime:asc',
            cursor: 'next_cursor',
        }
        server.use(
            mockListMacrosHandler(async () =>
                HttpResponse.json(
                    mockListMacrosResponseBody([macrosFixtures[0]], {
                        next_cursor: null,
                        prev_cursor: null,
                    }),
                ),
            ).handler,
        )
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>,
        )

        await screen.findByText('more_vert')
        await userEvent.click(screen.getByText('more_vert'))
        await screen.findByText(/Delete/)
        await userEvent.click(screen.getByText(/Delete/))
        await screen.findByText('Confirm')
        await userEvent.click(screen.getByText('Confirm'))
        ;(
            mockMutateDelete.mock.calls[0] as { onSettled: () => void }[]
        )[1].onSettled()

        await waitFor(() => {
            expect(mockSetListMacrosParams).toHaveBeenLastCalledWith({
                order_by: `${mockProperty}:${mockOrder}`,
                cursor: undefined,
            })
        })
    })

    it('should duplicate macro with success', async () => {
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>,
        )

        await waitForMacroList()
        await userEvent.click(screen.getAllByText('more_vert')[0])
        await userEvent.click(screen.getByText(/Make a copy/))

        const id = 18
        ;(
            mockMutateCreate.mock.calls[0] as {
                onSuccess: (resp: unknown) => void
            }[]
        )[1].onSuccess({ data: { id } })

        expect(history.push).toHaveBeenCalledWith(`/app/settings/macros/${id}`)
    })

    it('should fetch macros when searching', async () => {
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>,
        )

        const searchTerm = 'foobar'
        fireEvent.change(screen.getByPlaceholderText('Search macros...'), {
            target: { value: searchTerm },
        })

        await waitFor(() =>
            expect(mockSetListMacrosParams).toHaveBeenCalledWith({
                order_by: `${mockProperty}:${mockOrder}`,
                search: searchTerm,
                cursor: undefined,
            }),
        )
    })

    it('should not sort when searching', async () => {
        const { rerender } = render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>,
        )

        const searchTerm = 'foobar'
        fireEvent.change(screen.getByPlaceholderText('Search macros...'), {
            target: { value: searchTerm },
        })

        await waitFor(() =>
            expect(mockSetListMacrosParams).toHaveBeenCalledWith({
                order_by: `${mockProperty}:${mockOrder}`,
                search: searchTerm,
                cursor: undefined,
            }),
        )
        mockSetListMacrosParams.mockClear()
        rerender(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>,
        )
        await userEvent.click(screen.getByText('Macro'))

        expect(mockSetListMacrosParams).not.toHaveBeenCalledWith(
            expect.objectContaining({
                order_by: `name:${mockOrder}`,
            }),
        )
    })

    it('should reset selected macros on tab change', async () => {
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>,
        )

        await waitForMacroList()

        const checkboxAll = screen.getByLabelText('Select all')
        const checkboxFirstMacro = screen.getByLabelText(
            String(macrosFixtures[0].id),
        )
        const checkboxSecondMacro = screen.getByLabelText(
            String(macrosFixtures[1].id),
        )

        await userEvent.click(checkboxAll)
        await userEvent.click(screen.getByText('Active'))

        expect(checkboxAll).not.toBeChecked()
        expect(checkboxFirstMacro).not.toBeChecked()
        expect(checkboxSecondMacro).not.toBeChecked()

        await userEvent.click(checkboxFirstMacro)

        expect(checkboxFirstMacro).toBeChecked()
        expect(checkboxAll).not.toBeChecked()

        await userEvent.click(screen.getByText('Archived'))

        expect(checkboxFirstMacro).not.toBeChecked()
    })

    it('should display list of archived macros', async () => {
        const listMacrosMock = mockListMacrosHandler(async () =>
            HttpResponse.json(mockListMacrosResponseBody()),
        )
        const waitForListMacrosRequest = listMacrosMock.waitForRequest(server)
        server.use(listMacrosMock.handler)
        mockUseRouteMatch.mockReturnValue({
            url: '/app/settings/macros/archived',
        })
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>,
        )

        await waitForListMacrosRequest((request) => {
            const searchParams = new URL(request.url).searchParams

            expect(searchParams.get('archived')).toBe('true')
            expect(searchParams.get('order_by')).toBe('created_datetime:asc')
        })
    })

    it('should reset cursor when searching', async () => {
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>,
        )

        await userEvent.click(await screen.findByText('keyboard_arrow_right'))

        const searchTerm = 'foobar'
        act(() => {
            fireEvent.change(screen.getByPlaceholderText('Search macros...'), {
                target: { value: searchTerm },
            })
        })

        await waitFor(() =>
            expect(mockSetListMacrosParams).toHaveBeenCalledWith(
                expect.objectContaining({
                    search: searchTerm,
                    cursor: undefined,
                }),
            ),
        )
    })

    it('should reset cursor when changing filters', async () => {
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>,
        )

        await userEvent.click(await screen.findByText('keyboard_arrow_right'))

        const mockFilterParams = {
            languages: ['en'],
            tags: ['support'],
        }

        ;(global as any).mockMacroFiltersOnChange(mockFilterParams)

        await waitFor(() => {
            expect(mockSetListMacrosParams).toHaveBeenCalledWith(
                expect.objectContaining({
                    cursor: undefined,
                    ...mockFilterParams,
                }),
            )
        })
    })
})
