import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { within } from '@testing-library/dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import randomstring from 'randomstring'
import { MemoryRouter } from 'react-router-dom'

import {
    useCreateAnalyticsFilter,
    useDeleteAnalyticsFilter,
    useListAnalyticsFilters,
    useUpdateAnalyticsFilter,
} from '@gorgias/api-queries'

import { UserRole } from 'config/types/user'
import {
    FilterKey,
    SavedFilter,
    SavedFilterAPI,
    SavedFilterDraft,
} from 'models/stat/types'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { fromApiFormatted } from 'pages/stats/common/filters/helpers'
import { SAVED_FILTER_ACTIONS_MENU_ICON } from 'pages/stats/common/filters/SavedFilterMenu'
import {
    CANCEL_BUTTON_LABEL,
    CANCEL_MODAL_BUTTON_LABEL,
    CLOSE_MODAL_BUTTON_LABEL,
    COLLAPSE_CLOSED_ICON,
    COLLAPSE_OPEN_ICON,
    DELETE_CONFIRMATION_BUTTON_LABEL,
    DELETE_FILTER_ACTION_LABEL,
    DUPLICATE_FILTER_ACTION_LABEL,
    FILTER_DELETED_ERROR_MESSAGE,
    FILTER_SAVED_ERROR_MESSAGE,
    getDeleteConfirmationTitle,
    getMaxSavedFilterNameLengthErrorText,
    getSaveConfirmationTitle,
    isSavedFiltersError,
    MAX_SAVED_FILTER_NAME_LENGTH,
    SAVE_BUTTON_LABEL,
    SAVE_MODAL_BUTTON_LABEL,
    SAVED_FILTER_FIELD_GROUP_FIELD_KEY,
    SAVED_FILTER_NAME_FIELD_KEY,
    SavedFiltersPanel,
    UNAPPLY_FILTER_ICON,
} from 'pages/stats/common/filters/SavedFiltersPanel'
import { exampleGorgiasApiError } from 'pages/stats/common/filters/tests/fixtures/errors'
import { CampaignStatsFilters } from 'pages/stats/convert/providers/CampaignStatsFilters'
import * as statsSlice from 'state/stats/statsSlice'
import { RootState } from 'state/types'
import {
    clearSavedFilterDraft,
    duplicateSavedFilterDraftFromSavedFilter,
    initialiseSavedFilterDraftFromSavedFilter,
    initialState,
    updateSavedFilterDraftName,
} from 'state/ui/stats/filtersSlice'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock, renderWithStore } from 'utils/testing'

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
    const adminUser = {
        has_password: false,
        lastname: 'Doe',
        settings: [
            {
                data: {
                    available: true,
                    date_format: 'en_US',
                    macros_default_to_search_popover: false,
                    prefill_best_macro: true,
                    show_macros: true,
                    time_format: 'AM/PM',
                },
                id: 123,
                type: 'preferences',
            },
        ],
        active: true,
        name: 'John Doe',
        external_id: '00000001',
        created_datetime: '2022-05-23T09:30:00',
        role: {
            id: 7,
            name: UserRole.Admin,
        },
        country: null,
        language: null,
        timezone: 'EET',
        id: 629084,
        firstname: 'John',
        is_active: true,
        email: 'john.doe@gorgias.com',
        roles: [
            {
                id: 7,
                name: UserRole.Admin,
            },
        ],
        updated_datetime: '2022-10-03T10:45:00',
    }

    const defaultState = {
        currentUser: fromJS(adminUser),
        ui: {
            stats: {
                filters: initialState,
            },
        },
    } as RootState

    const errorMessageOnSave = 'this is an api error'

    const gorgiasApiError = {
        ...exampleGorgiasApiError,
        response: {
            data: {
                error: {
                    data: {
                        [SAVED_FILTER_NAME_FIELD_KEY]: [errorMessageOnSave],
                    },
                    msg: 'something went wrong',
                },
            },
        },
    }

    const notGorgiasApiError = {
        ...exampleGorgiasApiError,
        response: {
            data: {},
        },
    }

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
        const { container } = renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            defaultState,
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
            currentUser: defaultState.currentUser,
        } as RootState

        renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            state,
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
            state,
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
            currentUser: defaultState.currentUser,
        } as RootState
        const mutateMock = jest.fn().mockResolvedValue({
            data: { id: 123, ...savedFilterDraft },
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
            state,
        )

        userEvent.click(screen.getByRole('button', { name: SAVE_BUTTON_LABEL }))

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
            currentUser: defaultState.currentUser,
        } as RootState

        const { store } = renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            state,
        )

        userEvent.click(screen.getByRole('button', { name: SAVE_BUTTON_LABEL }))

        expect(mutateMock).toHaveBeenCalled()
        await waitFor(() => {
            expect(store.getActions()).toContainEqual(
                expect.objectContaining({
                    payload: expect.objectContaining({
                        message: FILTER_SAVED_ERROR_MESSAGE,
                    }),
                }),
            )
        })
    })

    it('should update Saved Filter ', async () => {
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
            currentUser: defaultState.currentUser,
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
            state,
        )

        userEvent.click(screen.getByRole('button', { name: SAVE_BUTTON_LABEL }))

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: SAVE_MODAL_BUTTON_LABEL }),
            ).toBeInTheDocument()
            userEvent.click(
                screen.getByRole('button', { name: SAVE_MODAL_BUTTON_LABEL }),
            )
        })

        expect(mutateMock).toHaveBeenCalled()
    })

    it('should fail update of a Saved Filter ', async () => {
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
            currentUser: defaultState.currentUser,
        } as RootState

        const { store } = renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            state,
        )

        userEvent.click(screen.getByRole('button', { name: SAVE_BUTTON_LABEL }))

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: SAVE_MODAL_BUTTON_LABEL }),
            ).toBeInTheDocument()
            userEvent.click(
                screen.getByRole('button', { name: SAVE_MODAL_BUTTON_LABEL }),
            )
        })

        expect(mutateMock).toHaveBeenCalled()

        await waitFor(() => {
            expect(store.getActions()).toContainEqual(
                expect.objectContaining({
                    payload: expect.objectContaining({
                        message: FILTER_SAVED_ERROR_MESSAGE,
                    }),
                }),
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
            currentUser: defaultState.currentUser,
        } as RootState

        const { store } = renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            state,
        )

        userEvent.clear(screen.getByRole('textbox'))
        userEvent.paste(screen.getByRole('textbox'), nameChange)

        expect(store.getActions()).toContainEqual(
            updateSavedFilterDraftName(`${savedFilterName}${nameChange}`),
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
            currentUser: defaultState.currentUser,
        } as RootState

        renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            state,
        )

        userEvent.click(screen.getByText(COLLAPSE_CLOSED_ICON))
        userEvent.click(screen.getByText(SAVED_FILTER_ACTIONS_MENU_ICON))
        userEvent.click(
            screen.getByRole('option', {
                name: new RegExp(DELETE_FILTER_ACTION_LABEL),
            }),
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
            currentUser: defaultState.currentUser,
        } as RootState

        renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            state,
        )

        userEvent.click(screen.getByText(COLLAPSE_CLOSED_ICON))
        userEvent.click(screen.getByText(SAVED_FILTER_ACTIONS_MENU_ICON))
        userEvent.click(
            screen.getByRole('option', {
                name: new RegExp(DELETE_FILTER_ACTION_LABEL),
            }),
        )
        const confirmationModal = screen.getByRole('dialog')
        expect(confirmationModal).toBeInTheDocument()
        expect(
            within(confirmationModal).getByText(
                getDeleteConfirmationTitle(savedFilterName),
            ),
        ).toBeInTheDocument()
        userEvent.click(
            within(confirmationModal).getByText(CANCEL_BUTTON_LABEL),
        )

        await waitFor(() => {
            expect(
                screen.queryByText(getDeleteConfirmationTitle(savedFilterName)),
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
            currentUser: defaultState.currentUser,
        } as RootState

        const { store } = renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            state,
        )

        userEvent.click(screen.getByText(COLLAPSE_CLOSED_ICON))
        userEvent.click(screen.getByText(SAVED_FILTER_ACTIONS_MENU_ICON))
        userEvent.click(
            screen.getByRole('option', {
                name: new RegExp(DELETE_FILTER_ACTION_LABEL),
            }),
        )
        userEvent.click(screen.getByText(DELETE_CONFIRMATION_BUTTON_LABEL))

        expect(mutateMock).toHaveBeenCalled()
        await waitFor(() => {
            expect(store.getActions()).toContainEqual(
                expect.objectContaining({
                    payload: expect.objectContaining({
                        message: FILTER_DELETED_ERROR_MESSAGE,
                    }),
                }),
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
            currentUser: defaultState.currentUser,
        } as RootState

        const { store } = renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            state,
        )

        userEvent.click(screen.getByText(COLLAPSE_CLOSED_ICON))
        userEvent.click(screen.getByText(SAVED_FILTER_ACTIONS_MENU_ICON))
        userEvent.click(
            screen.getByRole('option', {
                name: new RegExp(DUPLICATE_FILTER_ACTION_LABEL),
            }),
        )

        expect(store.getActions()).toContainEqual(
            duplicateSavedFilterDraftFromSavedFilter(savedFilter),
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
            currentUser: defaultState.currentUser,
        } as RootState

        const { store } = renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            state,
        )

        userEvent.click(screen.getByText(UNAPPLY_FILTER_ICON))

        expect(store.getActions()).toContainEqual(clearSavedFilterDraft())
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
            currentUser: defaultState.currentUser,
        } as RootState

        const { store } = renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            state,
        )
        userEvent.click(
            screen.getByRole('button', { name: CANCEL_BUTTON_LABEL }),
        )

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
            currentUser: defaultState.currentUser,
        } as RootState
        useListAnalyticsFiltersMock.mockReturnValue({
            data: {
                data: { data: [savedFilter] },
            },
        } as any)

        const { store } = renderWithStore(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <SavedFiltersPanel optionalFilters={[]} />
                </QueryClientProvider>
            </MemoryRouter>,
            state,
        )
        userEvent.click(
            screen.getByRole('button', { name: CANCEL_BUTTON_LABEL }),
        )

        expect(store.getActions()).toContainEqual(
            initialiseSavedFilterDraftFromSavedFilter(
                fromApiFormatted(savedFilter as SavedFilterAPI),
            ),
        )
        expect(screen.getByText(COLLAPSE_CLOSED_ICON)).toBeInTheDocument()
    })

    describe('error handling', () => {
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
        const savedFilterSaved: SavedFilter = {
            ...savedFilterDraft,
            id: 123,
        }
        const createState = {
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
            currentUser: defaultState.currentUser,
        } as RootState

        const updateState = {
            ...createState,
            ui: {
                stats: {
                    filters: {
                        ...initialState,
                        savedFilterDraft: savedFilterSaved,
                        appliedSavedFilterId: 123,
                    },
                },
            },
            currentUser: defaultState.currentUser,
        } as RootState

        it('should show error message when error response contains name on creation of saved filters', async () => {
            const mutateMock = jest.fn().mockRejectedValue(gorgiasApiError)
            useCreateAnalyticsFilterMock.mockReturnValue({
                mutateAsync: mutateMock,
                error: undefined,
            } as any)

            const { store } = renderWithStore(
                <MemoryRouter>
                    <QueryClientProvider client={queryClient}>
                        <SavedFiltersPanel optionalFilters={[]} />
                    </QueryClientProvider>
                </MemoryRouter>,
                createState,
            )

            userEvent.click(
                screen.getByRole('button', { name: SAVE_BUTTON_LABEL }),
            )

            expect(mutateMock).toHaveBeenCalled()
            await waitFor(() => {
                expect(store.getActions()).toContainEqual(
                    expect.objectContaining({
                        payload: expect.objectContaining({
                            message: FILTER_SAVED_ERROR_MESSAGE,
                        }),
                    }),
                )
                expect(screen.getByText(errorMessageOnSave)).toBeInTheDocument()
            })
        })

        it('should show error message when error response contains name on update of saved filters', async () => {
            const mutateMock = jest.fn().mockRejectedValue(gorgiasApiError)
            useUpdateAnalyticsFilterMock.mockReturnValue({
                mutateAsync: mutateMock,
            } as any)

            const { store } = renderWithStore(
                <MemoryRouter>
                    <QueryClientProvider client={queryClient}>
                        <SavedFiltersPanel optionalFilters={[]} />
                    </QueryClientProvider>
                </MemoryRouter>,
                updateState,
            )

            userEvent.click(
                screen.getByRole('button', { name: SAVE_BUTTON_LABEL }),
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {
                        name: SAVE_MODAL_BUTTON_LABEL,
                    }),
                ).toBeInTheDocument()
                userEvent.click(
                    screen.getByRole('button', {
                        name: SAVE_MODAL_BUTTON_LABEL,
                    }),
                )
            })

            expect(mutateMock).toHaveBeenCalled()

            userEvent.click(screen.getByText(COLLAPSE_CLOSED_ICON))

            await waitFor(() => {
                expect(store.getActions()).toContainEqual(
                    expect.objectContaining({
                        payload: expect.objectContaining({
                            message: FILTER_SAVED_ERROR_MESSAGE,
                        }),
                    }),
                )
                expect(screen.getByText(errorMessageOnSave)).toBeInTheDocument()
            })
        })

        it('should not show error message when error response contains name', async () => {
            const mutateMock = jest.fn().mockRejectedValue(notGorgiasApiError)
            useCreateAnalyticsFilterMock.mockReturnValue({
                mutateAsync: mutateMock,
                error: undefined,
            } as any)

            const { store } = renderWithStore(
                <MemoryRouter>
                    <QueryClientProvider client={queryClient}>
                        <SavedFiltersPanel optionalFilters={[]} />
                    </QueryClientProvider>
                </MemoryRouter>,
                createState,
            )

            userEvent.click(
                screen.getByRole('button', { name: SAVE_BUTTON_LABEL }),
            )

            expect(mutateMock).toHaveBeenCalled()
            await waitFor(() => {
                expect(store.getActions()).toContainEqual(
                    expect.objectContaining({
                        payload: expect.objectContaining({
                            message: FILTER_SAVED_ERROR_MESSAGE,
                        }),
                    }),
                )
                expect(
                    screen.queryByText(errorMessageOnSave),
                ).not.toBeInTheDocument()
            })
        })

        it('should check that cancel and save buttons are visible when user has admin role', () => {
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
                currentUser: defaultState.currentUser,
            } as RootState

            renderWithStore(
                <MemoryRouter>
                    <QueryClientProvider client={queryClient}>
                        <SavedFiltersPanel optionalFilters={[]} />
                    </QueryClientProvider>
                </MemoryRouter>,
                state,
            )

            expect(
                screen.getByRole('button', { name: CANCEL_BUTTON_LABEL }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: SAVE_BUTTON_LABEL }),
            ).toBeInTheDocument()
        })

        it('should check that cancel and save buttons are not visible when user has other than admin role', () => {
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
                currentUser: fromJS({
                    ...adminUser,
                    role: {
                        id: 1,
                        name: 'some_role',
                    },
                }),
            } as RootState

            renderWithStore(
                <MemoryRouter>
                    <QueryClientProvider client={queryClient}>
                        <SavedFiltersPanel optionalFilters={[]} />
                    </QueryClientProvider>
                </MemoryRouter>,
                state,
            )

            expect(
                screen.queryByRole('button', { name: CANCEL_BUTTON_LABEL }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: SAVE_BUTTON_LABEL }),
            ).not.toBeInTheDocument()
        })

        it('should close confirmation edit modal on Canceled confirmation', async () => {
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
                currentUser: defaultState.currentUser,
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
                state,
            )

            userEvent.click(screen.getByText(COLLAPSE_CLOSED_ICON))
            userEvent.click(screen.getByText(SAVE_BUTTON_LABEL))

            const confirmationModal = screen.getByRole('dialog')
            expect(confirmationModal).toBeInTheDocument()
            expect(
                within(confirmationModal).getByText(
                    getSaveConfirmationTitle(savedFilterName),
                ),
            ).toBeInTheDocument()
            userEvent.click(
                within(confirmationModal).getByText(CLOSE_MODAL_BUTTON_LABEL),
            )

            await waitFor(() => {
                expect(
                    screen.queryByText(
                        getSaveConfirmationTitle(savedFilterName),
                    ),
                ).not.toBeInTheDocument()
                expect(mutateMock).not.toHaveBeenCalled()
            })
        })

        it('should close confirmation edit modal on Discard changes', () => {
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

            const otherSavedFilter: SavedFilter = {
                id: 123,
                name: savedFilterName,
                filter_group: [
                    {
                        member: FilterKey.Agents,
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['2'],
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
                currentUser: defaultState.currentUser,
            } as RootState

            useListAnalyticsFiltersMock.mockReturnValue({
                data: {
                    data: {
                        data: [otherSavedFilter],
                    },
                },
            } as any)

            const { store } = renderWithStore(
                <MemoryRouter>
                    <QueryClientProvider client={queryClient}>
                        <SavedFiltersPanel optionalFilters={[]} />
                    </QueryClientProvider>
                </MemoryRouter>,
                state,
            )

            userEvent.click(screen.getByText(COLLAPSE_CLOSED_ICON))
            userEvent.click(screen.getByText(SAVE_BUTTON_LABEL))

            const confirmationModal = screen.getByRole('dialog')
            expect(confirmationModal).toBeInTheDocument()
            expect(
                within(confirmationModal).getByText(
                    getSaveConfirmationTitle(savedFilterName),
                ),
            ).toBeInTheDocument()
            userEvent.click(
                within(confirmationModal).getByText(CANCEL_MODAL_BUTTON_LABEL),
            )

            expect(store.getActions()).toContainEqual(
                initialiseSavedFilterDraftFromSavedFilter(
                    fromApiFormatted(otherSavedFilter as SavedFilterAPI),
                ),
            )
            expect(screen.getByText(COLLAPSE_CLOSED_ICON)).toBeInTheDocument()
        })

        it('should show an error is you try to input a string length greater than 255', async () => {
            const savedFilterName = randomstring.generate(
                MAX_SAVED_FILTER_NAME_LENGTH,
            )
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
                currentUser: defaultState.currentUser,
            } as RootState
            useListAnalyticsFiltersMock.mockReturnValue({
                data: {
                    data: { data: [savedFilter] },
                },
            } as any)

            renderWithStore(
                <MemoryRouter>
                    <QueryClientProvider client={queryClient}>
                        <SavedFiltersPanel optionalFilters={[]} />
                    </QueryClientProvider>
                </MemoryRouter>,
                state,
            )

            expect(
                screen.queryByText(
                    getMaxSavedFilterNameLengthErrorText(
                        MAX_SAVED_FILTER_NAME_LENGTH,
                    ),
                ),
            ).not.toBeInTheDocument()

            userEvent.click(screen.getByText(COLLAPSE_CLOSED_ICON))
            await userEvent.type(
                screen.getByPlaceholderText('Name Filter'),
                'asdf',
            )

            expect(
                screen.getByText(
                    getMaxSavedFilterNameLengthErrorText(
                        MAX_SAVED_FILTER_NAME_LENGTH,
                    ),
                ),
            ).toBeInTheDocument()
        })

        it('should disable save button if not changes have been made', () => {
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
                currentUser: defaultState.currentUser,
            } as RootState

            useListAnalyticsFiltersMock.mockReturnValue({
                data: {
                    data: {
                        data: [savedFilter],
                    },
                },
            } as any)

            renderWithStore(
                <MemoryRouter>
                    <QueryClientProvider client={queryClient}>
                        <SavedFiltersPanel optionalFilters={[]} />
                    </QueryClientProvider>
                </MemoryRouter>,
                state,
            )

            userEvent.click(screen.getByText(COLLAPSE_CLOSED_ICON))

            userEvent.click(screen.getByText(SAVE_BUTTON_LABEL))

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })

    describe('isSavedFiltersError', () => {
        it('should return true', () => {
            const savedFilterError1 = {
                [SAVED_FILTER_NAME_FIELD_KEY]: ['name'],
            }
            const savedFilterError2 = {
                [SAVED_FILTER_FIELD_GROUP_FIELD_KEY]: {},
            }

            expect(isSavedFiltersError(savedFilterError1)).toBeTruthy()
            expect(isSavedFiltersError(savedFilterError2)).toBeTruthy()
        })
        it('should return false', () => {
            const savedFilterError = {}

            expect(isSavedFiltersError(savedFilterError)).toBeFalsy()
        })
    })
})
