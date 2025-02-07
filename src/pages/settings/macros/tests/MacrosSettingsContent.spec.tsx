import {
    useListMacros,
    useCreateMacro,
    useDeleteMacro,
} from '@gorgias/api-queries'
import {QueryClient, useQueryClient} from '@tanstack/react-query'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import {useRouteMatch} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import {useFlag} from 'core/flags'
import {macros as macrosFixtures} from 'fixtures/macro'
import {user} from 'fixtures/users'
import {useBulkArchiveMacros, useBulkUnarchiveMacros} from 'hooks/macros'
import useAppDispatch from 'hooks/useAppDispatch'
import {OrderDirection} from 'models/api/types'
import {MacroSortableProperties} from 'models/macro/types'
import history from 'pages/history'
import {notify} from 'state/notifications/actions'
import {RootState, StoreDispatch} from 'state/types'
import {assumeMock} from 'utils/testing'

import {MacrosSettingsContent} from '../MacrosSettingsContent'

const mockProperty = MacroSortableProperties.CreatedDatetime
const mockOrder = OrderDirection.Asc

jest.mock('pages/history')

jest.mock('@tanstack/react-query')
const useQueryClientMock = assumeMock(useQueryClient)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

jest.mock('../MacrosCreateDropdown', () => ({
    MacrosCreateDropdown: () => <div />,
}))

jest.mock(
    'pages/common/components/MacroFilters/MacroFilters',
    () => () => 'MacroFilters'
)

jest.mock('state/notifications/actions')
const mockNotify = notify as jest.Mock

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.Mock

const mockMutateAsyncCreate = jest.fn()
const mockMutateAsyncDelete = jest.fn()
const invalidateQueriesMock = jest.fn()

jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            useRouteMatch: jest.fn(),
            Link: jest.fn(
                ({children}: {children: React.ReactNode}) => children
            ),
            NavLink: ({
                children,
                onClick,
            }: {
                children: React.ReactNode
                onClick: () => void
            }) => <div onClick={onClick}>{children}</div>,
        }) as Record<string, unknown>
)
const mockUseRouteMatch = useRouteMatch as jest.Mock

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
const mockUseFlag = useFlag as jest.Mock

jest.mock('@gorgias/api-queries', () => ({
    __esModule: true,
    useListMacros: jest.fn(),
    useCreateMacro: jest.fn(),
    useDeleteMacro: jest.fn(),
    queryKeys: {
        macros: {
            listMacros: () => ({pop: () => null}),
        },
    },
}))

const mockUseListMacros = assumeMock(useListMacros)
const mockUseCreateMacro = assumeMock(useCreateMacro)
const mockUseDeleteMacro = assumeMock(useDeleteMacro)

jest.mock('hooks/macros')
const useBulkArchiveMacrosMock = assumeMock(useBulkArchiveMacros)
const useBulkUnarchiveMacrosMock = assumeMock(useBulkUnarchiveMacros)
const mockMutateAsyncBulkArchive = jest.fn()
const mockMutateAsyncBulkUnarchive = jest.fn()

describe('<MacrosSettingsContent/>', () => {
    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(jest.fn())
        useQueryClientMock.mockImplementation(
            () =>
                ({
                    invalidateQueries: invalidateQueriesMock,
                }) as unknown as QueryClient
        )
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
            mutateAsync: mockMutateAsyncCreate,
        } as unknown as ReturnType<typeof useCreateMacro>)
        mockUseDeleteMacro.mockReturnValue({
            mutateAsync: mockMutateAsyncDelete,
        } as unknown as ReturnType<typeof useDeleteMacro>)
        useBulkArchiveMacrosMock.mockReturnValue({
            mutateAsync: mockMutateAsyncBulkArchive,
        } as unknown as ReturnType<typeof useBulkArchiveMacros>)
        useBulkUnarchiveMacrosMock.mockReturnValue({
            mutateAsync: mockMutateAsyncBulkUnarchive,
        } as unknown as ReturnType<typeof useBulkUnarchiveMacros>)
        mockUseFlag.mockImplementation(() => false)
        mockUseRouteMatch.mockReturnValue({
            url: '/app/settings/macros',
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
            </Provider>
        )

        expect(useListMacros).toHaveBeenCalledWith(
            {
                order_by: 'created_datetime:asc',
            },
            {
                query: {
                    staleTime: expect.any(Number),
                },
            }
        )
        expect(
            screen.getByText(
                /Macros are pre-made responses to customer questions/
            )
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
            </Provider>
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
            </Provider>
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
            }
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
            }
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
            </Provider>
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
            }
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
            </Provider>
        )

        screen.getByText('delete').click()
        screen.getByText('Confirm').click()

        expect(mockMutateAsyncDelete).toHaveBeenCalled()
        ;(
            mockMutateAsyncDelete.mock.calls[0] as {onSettled: () => void}[]
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
            }
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
            </Provider>
        )

        screen.getByText('keyboard_arrow_right').click()
        screen.getByText('delete').click()
        screen.getByText('Confirm').click()
        ;(
            mockMutateAsyncDelete.mock.calls[0] as {onSettled: () => void}[]
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
            }
        )
    })

    it('should notice when macro deletion succeeded', () => {
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
            </Provider>
        )

        screen.getByText('delete').click()
        screen.getByText('Confirm').click()

        expect(mockMutateAsyncDelete).toHaveBeenCalled()
        ;(
            mockMutateAsyncDelete.mock.calls[0] as {
                onSuccess: () => void
            }[]
        )[1].onSuccess()

        expect(mockNotify).toHaveBeenCalledWith({
            message: 'Successfully deleted macro',
            status: 'success',
        })
    })

    it('should notice when macro deletion failed', () => {
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>
        )

        screen.getAllByText('delete')[0].click()
        screen.getByText('Confirm').click()

        const msg = 'nope'
        expect(mockMutateAsyncDelete).toHaveBeenCalled()
        ;(
            mockMutateAsyncDelete.mock.calls[0] as {
                onError: (a: unknown) => void
            }[]
        )[1].onError({
            response: {
                data: {
                    error: {
                        msg,
                    },
                },
            },
        })

        expect(mockNotify).toHaveBeenCalledWith({
            title: msg,
            allowHTML: true,
            message: null,
            status: 'error',
        })
    })

    it('should duplicate macro with success', () => {
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>
        )

        screen.getAllByText('file_copy')[0].click()
        ;(
            mockMutateAsyncCreate.mock.calls[0] as {onSettled: () => void}[]
        )[1].onSettled()

        const id = 18
        expect(invalidateQueriesMock).toHaveBeenCalled()
        ;(
            mockMutateAsyncCreate.mock.calls[0] as {
                onSuccess: (resp: unknown) => void
            }[]
        )[1].onSuccess({data: {id}})

        expect(history.push).toHaveBeenCalledWith(`/app/settings/macros/${id}`)
    })

    it('should fail to duplicate macro', () => {
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>
        )

        screen.getAllByText('file_copy')[0].click()
        ;(
            mockMutateAsyncCreate.mock.calls[0] as {onError: () => void}[]
        )[1].onError()

        expect(mockNotify).toHaveBeenCalledWith({
            message: 'Failed to duplicate macro',
            status: 'error',
        })
    })

    it('should fetch macros when searching', async () => {
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>
        )

        const searchTerm = 'foobar'
        fireEvent.change(screen.getByPlaceholderText('Search macros...'), {
            target: {value: searchTerm},
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
                }
            )
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
            </Provider>
        )

        const searchTerm = 'foobar'
        fireEvent.change(screen.getByPlaceholderText('Search macros...'), {
            target: {value: searchTerm},
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
            }
        )
    })

    it('should reset selected macros on tab change', () => {
        mockUseFlag.mockImplementation(() => true)
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS(user),
                })}
            >
                <MacrosSettingsContent />
            </Provider>
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
        mockUseFlag.mockImplementation(() => true)
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
            </Provider>
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
            }
        )
    })
})
