import {
    useCreateAnalyticsFilter,
    useDeleteAnalyticsFilter,
    useListAnalyticsFilters,
    useUpdateAnalyticsFilter,
} from '@gorgias/api-queries'
import {QueryClientProvider} from '@tanstack/react-query'
import {within} from '@testing-library/dom'
import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS} from 'immutable'
import React from 'react'
import {MemoryRouter} from 'react-router-dom'

import {
    FilterKey,
    SavedFilter,
    SavedFilterAPI,
    SavedFilterDraft,
} from 'models/stat/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {fromApiFormatted} from 'pages/stats/common/filters/helpers'
import {SAVED_FILTER_ACTIONS_MENU_ICON} from 'pages/stats/common/filters/SavedFilterMenu'
import {
    CANCEL_BUTTON_LABEL,
    COLLAPSE_CLOSED_ICON,
    COLLAPSE_OPEN_ICON,
    DELETE_CONFIRMATION_BUTTON_LABEL,
    DELETE_FILTER_ACTION_LABEL,
    DUPLICATE_FILTER_ACTION_LABEL,
    FILTER_DELETED_ERROR_MESSAGE,
    FILTER_SAVED_ERROR_MESSAGE,
    getDeleteConfirmationTitle,
    SAVE_BUTTON_LABEL,
    SavedFiltersPanel,
    UNAPPLY_FILTER_ICON,
} from 'pages/stats/common/filters/SavedFiltersPanel'
import {CampaignStatsFilters} from 'pages/stats/convert/providers/CampaignStatsFilters'
import * as statsSlice from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import {
    clearSavedFilterDraft,
    duplicateSavedFilterDraftFromSavedFilter,
    initialiseSavedFilterDraftFromSavedFilter,
    initialState,
    unapplySavedFilter,
    updateSavedFilterDraftName,
} from 'state/ui/stats/filtersSlice'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock, renderWithStore} from 'utils/testing'

const queryClient = mockQueryClient()
jest.mock('pages/stats/common/filters/FiltersPanel')
jest.mock('pages/stats/convert/providers/CampaignStatsFilters')
const CampaignStatsFiltersMock = assumeMock(CampaignStatsFilters)

jest.mock('@gorgias/api-queries')
const useListAnalyticsFiltersMock = assumeMock(useListAnalyticsFilters)
const useCreateAnalyticsFilterMock = assumeMock(useCreateAnalyticsFilter)
const useUpdateAnalyticsFilterMock = assumeMock(useUpdateAnalyticsFilter)
const useDeleteAnalyticsFilterMock = assumeMock(useDeleteAnalyticsFilter)

describe('SavedFiltersPanel', () => {
    const defaultState = {
        ui: {
            stats: {
                filters: initialState,
            },
        },
    } as RootState

    beforeEach(() => {
        CampaignStatsFiltersMock.mockImplementation(() => <div />)
        useListAnalyticsFiltersMock.mockReturnValue({
            data: undefined,
            error: undefined,
        } as any)
        useCreateAnalyticsFilterMock.mockReturnValue({
            data: undefined,
            error: undefined,
        } as any)
        useUpdateAnalyticsFilterMock.mockReturnValue({
            data: undefined,
            error: undefined,
        } as any)
        useDeleteAnalyticsFilterMock.mockReturnValue({
            data: undefined,
            error: undefined,
        } as any)
    })

    it('should not render when no saved filter draft', () => {
        const {container} = renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            defaultState
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('should render collapsed in Saved Filter applied state', () => {
        const savedFilterName = 'Some Name'
        const savedFilterDraft: SavedFilterDraft = {
            name: savedFilterName,
            filter_group: [],
        }
        const state = {
            stats: statsSlice.initialState,
            integrations: fromJS({
                integration: {
                    id: 1,
                },
            }),
            ui: {
                stats: {
                    filters: {
                        ...initialState,
                        savedFilterDraft,
                        appliedSavedFilterId: 123,
                    },
                },
            },
        } as RootState

        renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            state
        )

        expect(screen.getByText(COLLAPSE_CLOSED_ICON))
        expect(screen.getByText(new RegExp(savedFilterName)))
        expect(screen.getByText(UNAPPLY_FILTER_ICON))
    })

    it('should render expanded in Saved Filter Draft state', () => {
        const savedFilterName = 'Some Name draft'
        const savedFilterDraft: SavedFilterDraft = {
            name: savedFilterName,
            filter_group: [],
        }
        const state = {
            stats: statsSlice.initialState,
            integrations: fromJS({
                integration: {
                    id: 1,
                },
            }),
            ui: {
                stats: {
                    filters: {
                        ...initialState,
                        savedFilterDraft,
                    },
                },
            },
        } as RootState

        renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            state
        )

        expect(screen.getByText(COLLAPSE_OPEN_ICON))
        expect(screen.getByDisplayValue(new RegExp(savedFilterName)))
    })

    it('should create Saved Filter from Draft', () => {
        const savedFilterName = 'Some Name draft'
        const savedFilterDraft: SavedFilterDraft = {
            name: savedFilterName,
            filter_group: [
                {
                    member: FilterKey.Agents,
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['1'],
                },
            ],
        }
        const state = {
            stats: statsSlice.initialState,
            integrations: fromJS({
                integration: {
                    id: 1,
                },
            }),
            ui: {
                stats: {
                    filters: {
                        ...initialState,
                        savedFilterDraft,
                    },
                },
            },
        } as RootState
        const mutateMock = jest.fn().mockResolvedValue({
            data: {id: 123, ...savedFilterDraft},
        })
        useCreateAnalyticsFilterMock.mockReturnValue({
            mutateAsync: mutateMock,
            error: undefined,
        } as any)

        renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            state
        )

        userEvent.click(screen.getByRole('button', {name: SAVE_BUTTON_LABEL}))

        expect(mutateMock).toHaveBeenCalled()
    })

    it('should notify about failed creation of a Saved Filter', async () => {
        const mutateMock = jest.fn().mockRejectedValue({})
        useCreateAnalyticsFilterMock.mockReturnValue({
            mutateAsync: mutateMock,
            error: undefined,
        } as any)

        const savedFilterName = 'Some Name draft'
        const savedFilterDraft: SavedFilterDraft = {
            name: savedFilterName,
            filter_group: [
                {
                    member: FilterKey.Agents,
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['1'],
                },
            ],
        }
        const state = {
            stats: statsSlice.initialState,
            integrations: fromJS({
                integration: {
                    id: 1,
                },
            }),
            ui: {
                stats: {
                    filters: {
                        ...initialState,
                        savedFilterDraft,
                    },
                },
            },
        } as RootState

        const {store} = renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            state
        )

        userEvent.click(screen.getByRole('button', {name: SAVE_BUTTON_LABEL}))

        expect(mutateMock).toHaveBeenCalled()
        await waitFor(() => {
            expect(store.getActions()).toContainEqual(
                expect.objectContaining({
                    payload: expect.objectContaining({
                        message: FILTER_SAVED_ERROR_MESSAGE,
                    }),
                })
            )
        })
    })

    it('should update Saved Filter ', () => {
        const savedFilterName = 'Some Name draft'
        const savedFilterDraft: SavedFilter = {
            id: 123,
            name: savedFilterName,
            filter_group: [
                {
                    member: FilterKey.Agents,
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['1'],
                },
            ],
        }
        const state = {
            stats: statsSlice.initialState,
            integrations: fromJS({
                integration: {
                    id: 1,
                },
            }),
            ui: {
                stats: {
                    filters: {
                        ...initialState,
                        savedFilterDraft,
                        appliedSavedFilterId: 123,
                    },
                },
            },
        } as RootState
        const mutateMock = jest.fn().mockResolvedValue({
            data: savedFilterDraft,
        })
        useUpdateAnalyticsFilterMock.mockReturnValue({
            mutateAsync: mutateMock,
        } as any)

        renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            state
        )

        userEvent.click(screen.getByRole('button', {name: SAVE_BUTTON_LABEL}))

        expect(mutateMock).toHaveBeenCalled()
    })

    it('should failed update of a Saved Filter ', async () => {
        const mutateMock = jest.fn().mockRejectedValue({})
        useUpdateAnalyticsFilterMock.mockReturnValue({
            mutateAsync: mutateMock,
        } as any)

        const savedFilterName = 'Some Name draft'
        const savedFilterDraft: SavedFilter = {
            id: 123,
            name: savedFilterName,
            filter_group: [
                {
                    member: FilterKey.Agents,
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['1'],
                },
            ],
        }
        const state = {
            stats: statsSlice.initialState,
            integrations: fromJS({
                integration: {
                    id: 1,
                },
            }),
            ui: {
                stats: {
                    filters: {
                        ...initialState,
                        savedFilterDraft,
                        appliedSavedFilterId: 123,
                    },
                },
            },
        } as RootState

        const {store} = renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            state
        )

        userEvent.click(screen.getByRole('button', {name: SAVE_BUTTON_LABEL}))

        expect(mutateMock).toHaveBeenCalled()
        await waitFor(() => {
            expect(store.getActions()).toContainEqual(
                expect.objectContaining({
                    payload: expect.objectContaining({
                        message: FILTER_SAVED_ERROR_MESSAGE,
                    }),
                })
            )
        })
    })

    it('should update Filter name', () => {
        const savedFilterName = 'Some Name draft'
        const savedFilterDraft: SavedFilter = {
            id: 123,
            name: savedFilterName,
            filter_group: [
                {
                    member: FilterKey.Agents,
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['1'],
                },
            ],
        }
        const nameChange = ' of mine'
        const state = {
            stats: statsSlice.initialState,
            integrations: fromJS({
                integration: {
                    id: 1,
                },
            }),
            ui: {
                stats: {
                    filters: {
                        ...initialState,
                        savedFilterDraft,
                    },
                },
            },
        } as RootState

        const {store} = renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            state
        )

        userEvent.clear(screen.getByRole('textbox'))
        userEvent.paste(screen.getByRole('textbox'), nameChange)

        expect(store.getActions()).toContainEqual(
            updateSavedFilterDraftName(`${savedFilterName}${nameChange}`)
        )
    })

    it('should delete Saved Filter after confirmation', () => {
        const mutateMock = jest.fn().mockResolvedValue({})
        useDeleteAnalyticsFilterMock.mockReturnValue({
            mutateAsync: mutateMock,
        } as any)
        const savedFilterName = 'Some Name draft'
        const savedFilterDraft: SavedFilter = {
            id: 123,
            name: savedFilterName,
            filter_group: [],
        }
        const state = {
            stats: statsSlice.initialState,
            integrations: fromJS({
                integration: {
                    id: 1,
                },
            }),
            ui: {
                stats: {
                    filters: {
                        ...initialState,
                        savedFilterDraft,
                        appliedSavedFilterId: 123,
                    },
                },
            },
        } as RootState

        renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            state
        )

        userEvent.click(screen.getByText(COLLAPSE_CLOSED_ICON))
        userEvent.click(screen.getByText(SAVED_FILTER_ACTIONS_MENU_ICON))
        userEvent.click(
            screen.getByRole('option', {
                name: new RegExp(DELETE_FILTER_ACTION_LABEL),
            })
        )
        userEvent.click(screen.getByText(DELETE_CONFIRMATION_BUTTON_LABEL))

        expect(mutateMock).toHaveBeenCalled()
    })

    it('should close confirmation modal on Canceled confirmation', async () => {
        const mutateMock = jest.fn().mockResolvedValue({})
        useDeleteAnalyticsFilterMock.mockReturnValue({
            mutateAsync: mutateMock,
        } as any)
        const savedFilterName = 'Some Name draft'
        const savedFilterDraft: SavedFilter = {
            id: 123,
            name: savedFilterName,
            filter_group: [],
        }
        const state = {
            stats: statsSlice.initialState,
            integrations: fromJS({
                integration: {
                    id: 1,
                },
            }),
            ui: {
                stats: {
                    filters: {
                        ...initialState,
                        savedFilterDraft,
                        appliedSavedFilterId: 123,
                    },
                },
            },
        } as RootState

        renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            state
        )

        userEvent.click(screen.getByText(COLLAPSE_CLOSED_ICON))
        userEvent.click(screen.getByText(SAVED_FILTER_ACTIONS_MENU_ICON))
        userEvent.click(
            screen.getByRole('option', {
                name: new RegExp(DELETE_FILTER_ACTION_LABEL),
            })
        )
        const confirmationModal = screen.getByRole('dialog')
        expect(confirmationModal).toBeInTheDocument()
        expect(
            within(confirmationModal).getByText(
                getDeleteConfirmationTitle(savedFilterName)
            )
        ).toBeInTheDocument()
        userEvent.click(
            within(confirmationModal).getByText(CANCEL_BUTTON_LABEL)
        )

        await waitFor(() => {
            expect(
                screen.queryByText(getDeleteConfirmationTitle(savedFilterName))
            ).not.toBeInTheDocument()
            expect(mutateMock).not.toHaveBeenCalled()
        })
    })

    it('should notify about failed delete of the Saved Filter ', async () => {
        const mutateMock = jest.fn().mockRejectedValue({})
        useDeleteAnalyticsFilterMock.mockReturnValue({
            mutateAsync: mutateMock,
        } as any)
        const savedFilterName = 'Some Name draft'
        const savedFilterDraft: SavedFilter = {
            id: 123,
            name: savedFilterName,
            filter_group: [],
        }
        const state = {
            stats: statsSlice.initialState,
            integrations: fromJS({
                integration: {
                    id: 1,
                },
            }),
            ui: {
                stats: {
                    filters: {
                        ...initialState,
                        savedFilterDraft,
                        appliedSavedFilterId: 123,
                    },
                },
            },
        } as RootState

        const {store} = renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            state
        )

        userEvent.click(screen.getByText(COLLAPSE_CLOSED_ICON))
        userEvent.click(screen.getByText(SAVED_FILTER_ACTIONS_MENU_ICON))
        userEvent.click(
            screen.getByRole('option', {
                name: new RegExp(DELETE_FILTER_ACTION_LABEL),
            })
        )
        userEvent.click(screen.getByText(DELETE_CONFIRMATION_BUTTON_LABEL))

        expect(mutateMock).toHaveBeenCalled()
        await waitFor(() => {
            expect(store.getActions()).toContainEqual(
                expect.objectContaining({
                    payload: expect.objectContaining({
                        message: FILTER_DELETED_ERROR_MESSAGE,
                    }),
                })
            )
        })
    })

    it('should duplicate Saved Filter ', () => {
        const mutateMock = jest.fn().mockResolvedValue({})
        useDeleteAnalyticsFilterMock.mockReturnValue({
            mutateAsync: mutateMock,
        } as any)
        const savedFilterName = 'Some Name draft'
        const savedFilter: SavedFilter = {
            id: 123,
            name: savedFilterName,
            filter_group: [],
        }
        const state = {
            stats: statsSlice.initialState,
            integrations: fromJS({
                integration: {
                    id: 1,
                },
            }),
            ui: {
                stats: {
                    filters: {
                        ...initialState,
                        savedFilterDraft: savedFilter,
                        appliedSavedFilterId: 123,
                    },
                },
            },
        } as RootState

        const {store} = renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            state
        )

        userEvent.click(screen.getByText(COLLAPSE_CLOSED_ICON))
        userEvent.click(screen.getByText(SAVED_FILTER_ACTIONS_MENU_ICON))
        userEvent.click(
            screen.getByRole('option', {
                name: new RegExp(DUPLICATE_FILTER_ACTION_LABEL),
            })
        )

        expect(store.getActions()).toContainEqual(
            duplicateSavedFilterDraftFromSavedFilter(savedFilter)
        )
    })

    it('should unapply Saved Filter ', () => {
        const savedFilterName = 'Some Name draft'
        const savedFilterDraft: SavedFilter = {
            id: 123,
            name: savedFilterName,
            filter_group: [],
        }
        const state = {
            stats: statsSlice.initialState,
            integrations: fromJS({
                integration: {
                    id: 1,
                },
            }),
            ui: {
                stats: {
                    filters: {
                        ...initialState,
                        savedFilterDraft,
                        appliedSavedFilterId: 123,
                    },
                },
            },
        } as RootState

        const {store} = renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            state
        )

        userEvent.click(screen.getByText(UNAPPLY_FILTER_ICON))

        expect(store.getActions()).toContainEqual(unapplySavedFilter())
    })

    it('should cancel Saved Filter Draft of New Saved Filter', () => {
        const savedFilterName = 'Some Name draft'
        const savedFilterDraft: SavedFilterDraft = {
            name: savedFilterName,
            filter_group: [
                {
                    member: FilterKey.Agents,
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['1'],
                },
            ],
        }
        const state = {
            stats: statsSlice.initialState,
            integrations: fromJS({
                integration: {
                    id: 1,
                },
            }),
            ui: {
                stats: {
                    filters: {
                        ...initialState,
                        savedFilterDraft,
                        appliedSavedFilterId: null,
                    },
                },
            },
        } as RootState

        const {store} = renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            state
        )
        userEvent.click(screen.getByRole('button', {name: CANCEL_BUTTON_LABEL}))

        expect(store.getActions()).toContainEqual(clearSavedFilterDraft())
        expect(screen.getByText(COLLAPSE_OPEN_ICON)).toBeInTheDocument()
    })

    it('should discard changes made to the Saved Filter and close the Collapse', () => {
        const savedFilterName = 'Some Name draft'
        const savedFilter: SavedFilter = {
            id: 123,
            name: savedFilterName,
            filter_group: [
                {
                    member: FilterKey.Agents,
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['1'],
                },
            ],
        }
        const state = {
            stats: statsSlice.initialState,
            integrations: fromJS({
                integration: {
                    id: 1,
                },
            }),
            ui: {
                stats: {
                    filters: {
                        ...initialState,
                        savedFilterDraft: savedFilter,
                        appliedSavedFilterId: 123,
                    },
                },
            },
        } as RootState
        useListAnalyticsFiltersMock.mockReturnValue({
            data: {
                data: {data: [savedFilter]},
            },
        } as any)

        const {store} = renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            state
        )
        userEvent.click(screen.getByRole('button', {name: CANCEL_BUTTON_LABEL}))

        expect(store.getActions()).toContainEqual(
            initialiseSavedFilterDraftFromSavedFilter(
                fromApiFormatted(savedFilter as SavedFilterAPI)
            )
        )
        expect(screen.getByText(COLLAPSE_CLOSED_ICON)).toBeInTheDocument()
    })
})
