import { history } from '@repo/routing'
import { assumeMock } from '@repo/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { useLocation, useRouteMatch } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import type { ListMacrosParams } from '@gorgias/helpdesk-queries'
import { useListMacros } from '@gorgias/helpdesk-queries'

import { macros as macrosFixtures } from 'fixtures/macro'
import { user } from 'fixtures/users'
import {
    useBulkArchiveMacros,
    useBulkUnarchiveMacros,
    useCreateMacro,
    useDeleteMacro,
} from 'hooks/macros'
import useAppDispatch from 'hooks/useAppDispatch'
import { OrderDirection } from 'models/api/types'
import { MacroSortableProperties } from 'models/macro/types'
import { notify } from 'state/notifications/actions'
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
    default: ({ onChange }: { onChange: (params: any) => void }) => {
        // Expose the onChange handler to the test
        ;(global as any).mockMacroFiltersOnChange = onChange
        return 'MacroFilters'
    },
}))

jest.mock('state/notifications/actions')
const mockNotify = notify as jest.Mock

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
                ({ children }: { children: React.ReactNode }) => children,
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

jest.mock('@gorgias/helpdesk-queries', () => ({
    __esModule: true,
    ...jest.requireActual('@gorgias/helpdesk-queries'),
    useListMacros: jest.fn(),
    queryKeys: {
        macros: {
            listMacros: () => ({ pop: () => null }),
        },
    },
}))
const mockUseListMacros = assumeMock(useListMacros)

jest.mock('hooks/macros')
const mockUseCreateMacro = assumeMock(useCreateMacro)
const mockUseDeleteMacro = assumeMock(useDeleteMacro)

const useBulkArchiveMacrosMock = assumeMock(useBulkArchiveMacros)
const useBulkUnarchiveMacrosMock = assumeMock(useBulkUnarchiveMacros)
const mockMutateBulkArchive = jest.fn()
const mockMutateBulkUnarchive = jest.fn()

describe('<MacrosSettingsContent/>', () => {
    beforeEach(() => {
        mockListMacrosParams = { order_by: 'created_datetime:asc' }
        mockSetListMacrosParams.mockClear()
        useAppDispatchMock.mockReturnValue(jest.fn())
        mockUseListMacros.mockReturnValue({
            data: {
                data: {
                    data: macrosFixtures,
                    meta: {
                        next_cursor: 'next_cursor',
                        prev_cursor: 'prev_cursor',
                    },
                },
            },
            isError: false,
        } as ReturnType<typeof useListMacros>)
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

    it('should display list of macros', () => {
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>,
        )

        expect(useListMacros).toHaveBeenCalledWith(
            {
                order_by: 'created_datetime:asc',
            },
            {
                query: {
                    staleTime: expect.any(Number),
                },
            },
        )
        expect(
            screen.getByText(
                /Macros are pre-made responses to customer questions/,
            ),
        ).toBeInTheDocument()
    })

    it('should notify when fetching macros fails', () => {
        mockUseListMacros.mockReturnValue({
            data: {
                data: {
                    data: [],
                    meta: {
                        next_cursor: 'next_cursor',
                        prev_cursor: 'prev_cursor',
                    },
                },
            },
            isError: true,
        } as ReturnType<typeof useListMacros>)
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>,
        )

        expect(mockNotify).toHaveBeenCalledWith({
            message: 'Failed to fetch macros',
            status: 'error',
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

        await userEvent.click(screen.getByText('keyboard_arrow_right'))
        expect(mockSetListMacrosParams).toHaveBeenCalledWith({
            order_by: 'created_datetime:asc',
            cursor: 'next_cursor',
        })

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
        mockUseListMacros.mockReturnValue({
            data: {
                data: {
                    data: [macrosFixtures[0]],
                    meta: {
                        next_cursor: 'next_cursor',
                        prev_cursor: 'prev_cursor',
                    },
                },
            },
            isError: false,
        } as ReturnType<typeof useListMacros>)
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>,
        )

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
        mockUseListMacros
            .mockReturnValueOnce({
                data: {
                    data: {
                        data: macrosFixtures,
                        meta: {
                            next_cursor: 'next_cursor',
                            prev_cursor: 'prev_cursor',
                        },
                    },
                },
                isError: false,
            } as ReturnType<typeof useListMacros>)
            .mockReturnValueOnce({
                data: {
                    data: {
                        data: [macrosFixtures[0]],
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                        },
                    },
                },
                isError: false,
            } as ReturnType<typeof useListMacros>)
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>,
        )

        await userEvent.click(screen.getByText('keyboard_arrow_right'))
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

        await userEvent.click(screen.getByText('Macro'))

        expect(mockUseListMacros).not.toHaveBeenNthCalledWith(
            2,
            {
                order_by: `name:${mockOrder}`,
                search: searchTerm,
            },
            {
                query: {
                    staleTime: expect.any(Number),
                },
            },
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

        const checkboxAll = screen.getByLabelText('Select all')
        const checkboxFirstMacro = screen.getByLabelText(macrosFixtures[0].id!)
        const checkboxSecondMacro = screen.getByLabelText(macrosFixtures[1].id!)

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

    it('should display list of archived macros', () => {
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

        expect(useListMacros).toHaveBeenCalledWith(
            {
                archived: true,
                order_by: 'created_datetime:asc',
            },
            {
                query: {
                    staleTime: expect.any(Number),
                },
            },
        )
    })

    it('should reset cursor when searching', async () => {
        // Set initial state with a cursor
        mockUseListMacros.mockReturnValue({
            data: {
                data: {
                    data: macrosFixtures,
                    meta: {
                        next_cursor: 'next_cursor',
                        prev_cursor: 'prev_cursor',
                    },
                },
            },
            isError: false,
        } as ReturnType<typeof useListMacros>)

        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>,
        )

        // Navigate to next page to set a cursor
        await userEvent.click(screen.getByText('keyboard_arrow_right'))

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
        // Set initial state with a cursor
        mockUseListMacros.mockReturnValue({
            data: {
                data: {
                    data: macrosFixtures,
                    meta: {
                        next_cursor: 'next_cursor',
                        prev_cursor: 'prev_cursor',
                    },
                },
            },
            isError: false,
        } as ReturnType<typeof useListMacros>)

        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>,
        )

        // Navigate to next page to set a cursor
        await userEvent.click(screen.getByText('keyboard_arrow_right'))

        // Simulate filter change
        const mockFilterParams = {
            languages: ['en'],
            tags: ['support'],
        }

        // Trigger the filter change through the exposed onChange handler
        ;(global as any).mockMacroFiltersOnChange(mockFilterParams)

        // Wait for and verify the call to setListMacrosParams
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
