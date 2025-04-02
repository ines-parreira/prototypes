import React from 'react'

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { useRouteMatch } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { useListMacros } from '@gorgias/api-queries'

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
import history from 'pages/history'
import { notify } from 'state/notifications/actions'
import { RootState, StoreDispatch } from 'state/types'
import { assumeMock } from 'utils/testing'

import { MacrosSettingsContent } from '../MacrosSettingsContent'

const mockProperty = MacroSortableProperties.CreatedDatetime
const mockOrder = OrderDirection.Asc

jest.mock('pages/history')

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

jest.mock('@gorgias/api-queries', () => ({
    __esModule: true,
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

    it('should fetch the next macros when changing page', () => {
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>,
        )

        screen.getByText('keyboard_arrow_right').click()
        expect(mockUseListMacros).toHaveBeenNthCalledWith(
            2,
            {
                order_by: 'created_datetime:asc',
                cursor: 'next_cursor',
            },
            {
                query: {
                    staleTime: expect.any(Number),
                },
            },
        )

        screen.getByText('keyboard_arrow_left').click()
        expect(mockUseListMacros).toHaveBeenNthCalledWith(
            3,
            {
                order_by: 'created_datetime:asc',
                cursor: 'prev_cursor',
            },
            {
                query: {
                    staleTime: expect.any(Number),
                },
            },
        )
    })

    it('should fetch macros when sorting options change', () => {
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>,
        )

        userEvent.click(screen.getByText('Macro'))

        expect(mockUseListMacros).toHaveBeenNthCalledWith(
            2,
            {
                order_by: `name:${mockOrder}`,
            },
            {
                query: {
                    staleTime: expect.any(Number),
                },
            },
        )
    })

    it('should refetch macros at previous page if last page is empty', () => {
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

        screen.getByText('more_vert').click()
        screen.getByText(/Delete/).click()
        screen.getByText('Confirm').click()

        expect(mockMutateDelete).toHaveBeenCalled()
        ;(
            mockMutateDelete.mock.calls[0] as { onSettled: () => void }[]
        )[1].onSettled()

        expect(mockUseListMacros).toHaveBeenNthCalledWith(
            2,
            {
                order_by: `${mockProperty}:${mockOrder}`,
                cursor: 'prev_cursor',
            },
            {
                query: {
                    staleTime: expect.any(Number),
                },
            },
        )
    })

    it('should refetch macros once a macro has been deleted', () => {
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

        screen.getByText('keyboard_arrow_right').click()
        screen.getByText('more_vert').click()
        screen.getByText(/Delete/).click()
        screen.getByText('Confirm').click()
        ;(
            mockMutateDelete.mock.calls[0] as { onSettled: () => void }[]
        )[1].onSettled()

        expect(mockUseListMacros).toHaveBeenNthCalledWith(
            3,
            {
                order_by: `${mockProperty}:${mockOrder}`,
                cursor: undefined,
            },
            {
                query: {
                    staleTime: expect.any(Number),
                },
            },
        )
    })

    it('should duplicate macro with success', () => {
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>,
        )

        screen.getAllByText('more_vert')[0].click()
        screen.getByText(/Make a copy/).click()

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
            expect(mockUseListMacros).toHaveBeenNthCalledWith(
                2,
                {
                    order_by: `${mockProperty}:${mockOrder}`,
                    search: searchTerm,
                },
                {
                    query: {
                        staleTime: expect.any(Number),
                    },
                },
            ),
        )
    })

    it('should not sort when searching', () => {
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

        userEvent.click(screen.getByText('Macro'))

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

    it('should reset selected macros on tab change', () => {
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

        checkboxAll.click()
        screen.getByText('Active').click()

        expect(checkboxAll).not.toBeChecked()
        expect(checkboxFirstMacro).not.toBeChecked()
        expect(checkboxSecondMacro).not.toBeChecked()

        checkboxFirstMacro.click()

        expect(checkboxFirstMacro).toBeChecked()
        expect(checkboxAll).not.toBeChecked()

        screen.getByText('Archived').click()

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
        act(() => {
            screen.getByText('keyboard_arrow_right').click()
        })

        const searchTerm = 'foobar'
        act(() => {
            fireEvent.change(screen.getByPlaceholderText('Search macros...'), {
                target: { value: searchTerm },
            })
        })

        await waitFor(() =>
            expect(mockUseListMacros).toHaveBeenCalledWith(
                {
                    order_by: 'created_datetime:asc',
                    search: searchTerm,
                    cursor: undefined,
                },
                {
                    query: {
                        staleTime: expect.any(Number),
                    },
                },
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
        act(() => {
            screen.getByText('keyboard_arrow_right').click()
        })

        // Simulate filter change
        const mockFilterParams = {
            languages: ['en'],
            tags: ['support'],
        }

        // Trigger the filter change through the exposed onChange handler
        ;(global as any).mockMacroFiltersOnChange(mockFilterParams)

        // Wait for and verify the last call to useListMacros
        await waitFor(() => {
            const lastCall =
                mockUseListMacros.mock.calls[
                    mockUseListMacros.mock.calls.length - 1
                ]
            expect(lastCall[0]).toMatchObject({
                order_by: expect.any(String),
                cursor: undefined,
                ...mockFilterParams,
            })
        })
    })
})
