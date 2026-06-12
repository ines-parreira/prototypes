import type { ReactNode } from 'react'
import { assumeMock, render, userEvent } from '@repo/testing'

import { QueryClient, useQueryClient } from '@tanstack/react-query'
import { within } from '@testing-library/dom'
import { screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import randomstring from 'randomstring'

import {
    mockAnalyticsFilter,
    mockCreateAnalyticsFilterHandler,
    mockCreateAnalyticsFilterResponse,
    mockDeleteAnalyticsFilterHandler,
    mockListAnalyticsFiltersHandler,
    mockListAnalyticsFiltersResponse,
    mockUpdateAnalyticsFilterHandler,
    mockUpdateAnalyticsFilterResponse,
} from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { UserRole } from 'config/types/user'
import type {
    SavedFilter,
    SavedFilterAPI,
    SavedFilterDraft,
} from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { DEFAULT_BADGE_TEXT } from 'domains/reporting/pages/common/filters/FiltersEditableTitle/FiltersEditableTitle'
import { fromApiFormatted } from 'domains/reporting/pages/common/filters/helpers'
import { SAVED_FILTER_ACTIONS_MENU_ICON } from 'domains/reporting/pages/common/filters/SavedFilterMenu'
import type { ApplySavedFilterProps } from 'domains/reporting/pages/common/filters/SavedFiltersActions/ApplySavedFilters/ApplySavedFilters'
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
} from 'domains/reporting/pages/common/filters/SavedFiltersPanel'
import { exampleGorgiasApiError } from 'domains/reporting/pages/common/filters/tests/fixtures/errors'
import { CampaignStatsFilters } from 'domains/reporting/pages/convert/providers/CampaignStatsFilters'
import * as statsSlice from 'domains/reporting/state/stats/statsSlice'
import {
    clearSavedFilterDraft,
    duplicateSavedFilterDraftFromSavedFilter,
    initialiseSavedFilterDraftFromSavedFilter,
    initialState,
    updateSavedFilterDraftName,
} from 'domains/reporting/state/ui/stats/filtersSlice'
import type { RootState } from 'state/types'

jest.mock('domains/reporting/pages/common/filters/FiltersPanel')
jest.mock('domains/reporting/pages/convert/providers/CampaignStatsFilters')
const CampaignStatsFiltersMock = assumeMock(CampaignStatsFilters)

const server = setupServer()

const toAnalyticsFilterResponse = (filter: SavedFilter | SavedFilterDraft) =>
    mockAnalyticsFilter({
        ...filter,
        id: 'id' in filter ? filter.id : 123,
        filter_group: filter.filter_group as never,
    })

const mockSavedFiltersList = (filters: SavedFilter[] = []) =>
    mockListAnalyticsFiltersHandler(async () =>
        HttpResponse.json(
            mockListAnalyticsFiltersResponse({
                data: filters.map((filter) =>
                    toAnalyticsFilterResponse(filter),
                ),
            }),
        ),
    )

const mockSavedFiltersListWithRequestCount = (filters: SavedFilter[] = []) => {
    let requestCount = 0
    const listMock = mockListAnalyticsFiltersHandler(async () => {
        requestCount += 1

        return HttpResponse.json(
            mockListAnalyticsFiltersResponse({
                data: filters.map((filter) =>
                    toAnalyticsFilterResponse(filter),
                ),
            }),
        )
    })

    return {
        handler: listMock.handler,
        waitForRequestCount: (expectedCount: number) =>
            waitFor(() => {
                expect(requestCount).toBeGreaterThanOrEqual(expectedCount)
            }),
    }
}

const createSavedFiltersQueryWrapper =
    (filters: SavedFilter[]) =>
    ({ children }: { children: ReactNode }) => {
        const queryClient = useQueryClient()
        queryClient.setQueryData(
            queryKeys.savedFilters.listAnalyticsFilters(),
            {
                data: {
                    data: filters.map((filter) =>
                        toAnalyticsFilterResponse(filter),
                    ),
                },
            },
        )

        return <>{children}</>
    }

const mockCreateSavedFilter = (filter: SavedFilter | SavedFilterDraft) =>
    mockCreateAnalyticsFilterHandler(async () =>
        HttpResponse.json(
            mockCreateAnalyticsFilterResponse(
                toAnalyticsFilterResponse(filter),
            ),
        ),
    )

const mockUpdateSavedFilter = (filter: SavedFilter | SavedFilterDraft) =>
    mockUpdateAnalyticsFilterHandler(async () =>
        HttpResponse.json(
            mockUpdateAnalyticsFilterResponse(
                toAnalyticsFilterResponse(filter),
            ),
        ),
    )

const mockDeleteSavedFilter = () =>
    mockDeleteAnalyticsFilterHandler(async () => HttpResponse.json(null))

const mockFailedMutation = (
    handler:
        | typeof mockCreateAnalyticsFilterHandler
        | typeof mockUpdateAnalyticsFilterHandler
        | typeof mockDeleteAnalyticsFilterHandler,
    body: unknown = {},
) =>
    (
        handler as (
            customHandler: unknown,
        ) => ReturnType<typeof mockCreateAnalyticsFilterHandler>
    )((async () => HttpResponse.json(body as never, { status: 400 })) as never)

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
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        CampaignStatsFiltersMock.mockImplementation(() => <div />)
        server.use(
            mockSavedFiltersList().handler,
            mockCreateSavedFilter({
                name: 'Saved Filter',
                filter_group: [],
            }).handler,
            mockUpdateSavedFilter({
                id: 123,
                name: 'Saved Filter',
                filter_group: [],
            }).handler,
            mockDeleteSavedFilter().handler,
        )
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })
    it('should not render when no saved filter draft', () => {
        const { container } = render(
            <SavedFiltersPanel optionalFilters={[]} />,
            { storeState: defaultState },
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
        render(<SavedFiltersPanel optionalFilters={[]} />, {
            storeState: state,
        })
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
        render(<SavedFiltersPanel optionalFilters={[]} />, {
            storeState: state,
        })
        expect(screen.getByText(COLLAPSE_OPEN_ICON))
        expect(screen.getByDisplayValue(new RegExp(savedFilterName)))
    })
    it('should create Saved Filter from Draft', async () => {
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
        const createSavedFilterMock = mockCreateSavedFilter({
            id: 123,
            ...savedFilterDraft,
        })
        const listSavedFiltersMock = mockSavedFiltersListWithRequestCount()
        const waitForCreateSavedFilterRequest =
            createSavedFilterMock.waitForRequest(server)
        server.use(listSavedFiltersMock.handler, createSavedFilterMock.handler)

        render(<SavedFiltersPanel optionalFilters={[]} />, {
            storeState: state,
        })
        await listSavedFiltersMock.waitForRequestCount(1)
        userEvent.click(screen.getByRole('button', { name: SAVE_BUTTON_LABEL }))

        await waitForCreateSavedFilterRequest()
        await listSavedFiltersMock.waitForRequestCount(2)
    })
    it('should notify about failed creation of a Saved Filter', async () => {
        const createSavedFilterMock = mockFailedMutation(
            mockCreateAnalyticsFilterHandler,
        )
        const waitForCreateSavedFilterRequest =
            createSavedFilterMock.waitForRequest(server)
        server.use(createSavedFilterMock.handler)

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
        render(<SavedFiltersPanel optionalFilters={[]} />, {
            storeState: state,
        })
        userEvent.click(screen.getByRole('button', { name: SAVE_BUTTON_LABEL }))
        await waitForCreateSavedFilterRequest()
        const toastEl = await screen.findByRole('status', {
            name: FILTER_SAVED_ERROR_MESSAGE,
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
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
        const listSavedFiltersMock = mockSavedFiltersListWithRequestCount()
        const updateSavedFilterMock = mockUpdateSavedFilter(savedFilterDraft)
        const waitForUpdateSavedFilterRequest =
            updateSavedFilterMock.waitForRequest(server)
        server.use(listSavedFiltersMock.handler, updateSavedFilterMock.handler)

        render(<SavedFiltersPanel optionalFilters={[]} />, {
            storeState: state,
        })
        await listSavedFiltersMock.waitForRequestCount(1)
        userEvent.click(screen.getByRole('button', { name: SAVE_BUTTON_LABEL }))
        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: SAVE_MODAL_BUTTON_LABEL }),
            ).toBeInTheDocument()
            userEvent.click(
                screen.getByRole('button', { name: SAVE_MODAL_BUTTON_LABEL }),
            )
        })
        await waitForUpdateSavedFilterRequest()
        await listSavedFiltersMock.waitForRequestCount(2)
    })
    it('should fail update of a Saved Filter ', async () => {
        const updateSavedFilterMock = mockFailedMutation(
            mockUpdateAnalyticsFilterHandler,
        )
        const waitForUpdateSavedFilterRequest =
            updateSavedFilterMock.waitForRequest(server)
        server.use(updateSavedFilterMock.handler)

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
        render(<SavedFiltersPanel optionalFilters={[]} />, {
            storeState: state,
        })
        userEvent.click(screen.getByRole('button', { name: SAVE_BUTTON_LABEL }))
        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: SAVE_MODAL_BUTTON_LABEL }),
            ).toBeInTheDocument()
            userEvent.click(
                screen.getByRole('button', { name: SAVE_MODAL_BUTTON_LABEL }),
            )
        })
        await waitForUpdateSavedFilterRequest()
        const toastEl = await screen.findByRole('status', {
            name: FILTER_SAVED_ERROR_MESSAGE,
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
    })
    it('should update Filter name', async () => {
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
        const { store } = render(<SavedFiltersPanel optionalFilters={[]} />, {
            storeState: state,
        })
        userEvent.paste(
            screen.getByRole('textbox'),
            savedFilterName + nameChange,
        )
        await waitFor(() => {
            expect(store.getActions()).toContainEqual(
                updateSavedFilterDraftName(`${savedFilterName}${nameChange}`),
            )
        })
    })
    it('should delete Saved Filter after confirmation', async () => {
        const listSavedFiltersMock = mockSavedFiltersListWithRequestCount()
        const deleteSavedFilterMock = mockDeleteSavedFilter()
        const waitForDeleteSavedFilterRequest =
            deleteSavedFilterMock.waitForRequest(server)
        server.use(listSavedFiltersMock.handler, deleteSavedFilterMock.handler)

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
        render(<SavedFiltersPanel optionalFilters={[]} />, {
            storeState: state,
        })
        await listSavedFiltersMock.waitForRequestCount(1)
        userEvent.click(screen.getByText(COLLAPSE_CLOSED_ICON))
        userEvent.click(screen.getByText(SAVED_FILTER_ACTIONS_MENU_ICON))
        userEvent.click(
            screen.getByRole('option', {
                name: new RegExp(DELETE_FILTER_ACTION_LABEL),
            }),
        )
        userEvent.click(screen.getByText(DELETE_CONFIRMATION_BUTTON_LABEL))
        await waitForDeleteSavedFilterRequest()
        await listSavedFiltersMock.waitForRequestCount(2)
    })
    it('should close confirmation modal on Canceled confirmation', async () => {
        let deleteRequestCount = 0
        server.use(
            mockDeleteAnalyticsFilterHandler(async () => {
                deleteRequestCount += 1

                return HttpResponse.json(null)
            }).handler,
        )
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
        render(<SavedFiltersPanel optionalFilters={[]} />, {
            storeState: state,
        })
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
            expect(deleteRequestCount).toBe(0)
        })
    })
    it('should notify about failed delete of the Saved Filter ', async () => {
        const deleteSavedFilterMock = mockFailedMutation(
            mockDeleteAnalyticsFilterHandler,
        )
        const waitForDeleteSavedFilterRequest =
            deleteSavedFilterMock.waitForRequest(server)
        server.use(deleteSavedFilterMock.handler)

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
        render(<SavedFiltersPanel optionalFilters={[]} />, {
            storeState: state,
        })
        userEvent.click(screen.getByText(COLLAPSE_CLOSED_ICON))
        userEvent.click(screen.getByText(SAVED_FILTER_ACTIONS_MENU_ICON))
        userEvent.click(
            screen.getByRole('option', {
                name: new RegExp(DELETE_FILTER_ACTION_LABEL),
            }),
        )
        userEvent.click(screen.getByText(DELETE_CONFIRMATION_BUTTON_LABEL))
        await waitForDeleteSavedFilterRequest()
        const toastEl = await screen.findByRole('status', {
            name: FILTER_DELETED_ERROR_MESSAGE,
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
    })
    it('should duplicate Saved Filter ', () => {
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
        const { store } = render(<SavedFiltersPanel optionalFilters={[]} />, {
            storeState: state,
        })
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
        const { store } = render(<SavedFiltersPanel optionalFilters={[]} />, {
            storeState: state,
        })
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
        const { store } = render(<SavedFiltersPanel optionalFilters={[]} />, {
            storeState: state,
        })
        userEvent.click(
            screen.getByRole('button', { name: CANCEL_BUTTON_LABEL }),
        )
        expect(store.getActions()).toContainEqual(clearSavedFilterDraft())
        expect(screen.getByText(COLLAPSE_OPEN_ICON)).toBeInTheDocument()
    })
    it('should discard changes made to the Saved Filter and close the Collapse', async () => {
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
        const { store } = render(<SavedFiltersPanel optionalFilters={[]} />, {
            storeState: state,
            queryClientOptions: { queries: { staleTime: Infinity } },
            wrapper: createSavedFiltersQueryWrapper([savedFilter]),
        })

        userEvent.click(
            screen.getByRole('button', { name: CANCEL_BUTTON_LABEL }),
        )
        await waitFor(() => {
            expect(store.getActions()).toContainEqual(
                initialiseSavedFilterDraftFromSavedFilter(
                    fromApiFormatted(savedFilter as SavedFilterAPI),
                ),
            )
        })
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
            const createSavedFilterMock = mockFailedMutation(
                mockCreateAnalyticsFilterHandler,
                gorgiasApiError.response.data,
            )
            const waitForCreateSavedFilterRequest =
                createSavedFilterMock.waitForRequest(server)
            server.use(createSavedFilterMock.handler)

            render(<SavedFiltersPanel optionalFilters={[]} />, {
                storeState: createState,
            })
            userEvent.click(
                screen.getByRole('button', { name: SAVE_BUTTON_LABEL }),
            )
            await waitForCreateSavedFilterRequest()
            const toastEl = await screen.findByRole('status', {
                name: FILTER_SAVED_ERROR_MESSAGE,
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
            expect(screen.getByText(errorMessageOnSave)).toBeInTheDocument()
        })
        it('should show error message when error response contains name on update of saved filters', async () => {
            const updateSavedFilterMock = mockFailedMutation(
                mockUpdateAnalyticsFilterHandler,
                gorgiasApiError.response.data,
            )
            const waitForUpdateSavedFilterRequest =
                updateSavedFilterMock.waitForRequest(server)
            server.use(updateSavedFilterMock.handler)

            render(<SavedFiltersPanel optionalFilters={[]} />, {
                storeState: updateState,
            })
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
            await waitForUpdateSavedFilterRequest()
            userEvent.click(screen.getByText(COLLAPSE_CLOSED_ICON))
            const toastEl = await screen.findByRole('status', {
                name: FILTER_SAVED_ERROR_MESSAGE,
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
            expect(screen.getByText(errorMessageOnSave)).toBeInTheDocument()
        })
        it('should not show error message when error response contains name', async () => {
            const createSavedFilterMock = mockFailedMutation(
                mockCreateAnalyticsFilterHandler,
                notGorgiasApiError.response.data,
            )
            const waitForCreateSavedFilterRequest =
                createSavedFilterMock.waitForRequest(server)
            server.use(createSavedFilterMock.handler)

            render(<SavedFiltersPanel optionalFilters={[]} />, {
                storeState: createState,
            })
            userEvent.click(
                screen.getByRole('button', { name: SAVE_BUTTON_LABEL }),
            )
            await waitForCreateSavedFilterRequest()
            const toastEl = await screen.findByRole('status', {
                name: FILTER_SAVED_ERROR_MESSAGE,
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
            expect(
                screen.queryByText(errorMessageOnSave),
            ).not.toBeInTheDocument()
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
            render(<SavedFiltersPanel optionalFilters={[]} />, {
                storeState: state,
            })
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
            render(<SavedFiltersPanel optionalFilters={[]} />, {
                storeState: state,
            })
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
            let updateRequestCount = 0
            server.use(
                mockUpdateAnalyticsFilterHandler(async () => {
                    updateRequestCount += 1

                    return HttpResponse.json(
                        mockUpdateAnalyticsFilterResponse(
                            toAnalyticsFilterResponse(savedFilterDraft),
                        ),
                    )
                }).handler,
            )

            render(<SavedFiltersPanel optionalFilters={[]} />, {
                storeState: state,
            })
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
                expect(updateRequestCount).toBe(0)
            })
        })
        it('should close confirmation edit modal on Discard changes', async () => {
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
            const { store } = render(
                <SavedFiltersPanel optionalFilters={[]} />,
                {
                    storeState: state,
                    queryClientOptions: { queries: { staleTime: Infinity } },
                    wrapper: createSavedFiltersQueryWrapper([otherSavedFilter]),
                },
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
            await waitFor(() => {
                expect(store.getActions()).toContainEqual(
                    initialiseSavedFilterDraftFromSavedFilter(
                        fromApiFormatted(otherSavedFilter as SavedFilterAPI),
                    ),
                )
            })
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
            server.use(mockSavedFiltersList([savedFilter]).handler)
            render(<SavedFiltersPanel optionalFilters={[]} />, {
                storeState: state,
            })
            expect(
                screen.queryByText(
                    getMaxSavedFilterNameLengthErrorText(
                        MAX_SAVED_FILTER_NAME_LENGTH,
                    ),
                ),
            ).not.toBeInTheDocument()
            userEvent.click(screen.getByText(COLLAPSE_CLOSED_ICON))
            userEvent.type(
                screen.getByPlaceholderText('Name Filter'),
                savedFilterName + 'asdf',
            )
            await waitFor(() => {
                expect(
                    screen.getByText(
                        getMaxSavedFilterNameLengthErrorText(
                            MAX_SAVED_FILTER_NAME_LENGTH,
                        ),
                    ),
                ).toBeInTheDocument()
            })
        })
        it('should disable save button if not changes have been made', async () => {
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
            render(<SavedFiltersPanel optionalFilters={[]} />, {
                storeState: state,
                queryClientOptions: { queries: { staleTime: Infinity } },
                wrapper: createSavedFiltersQueryWrapper([savedFilter]),
            })

            userEvent.click(screen.getByText(COLLAPSE_CLOSED_ICON))
            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: SAVE_BUTTON_LABEL }),
                ).toHaveAttribute('aria-disabled', 'true')
            })
            userEvent.click(screen.getByText(SAVE_BUTTON_LABEL))
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
            expect(
                screen.queryByText(DEFAULT_BADGE_TEXT),
            ).not.toBeInTheDocument()
        })
    })
    describe('isPinned', () => {
        it('should contain the default badge text', () => {
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
            const pinnedFilter: ApplySavedFilterProps['pinnedFilter'] = {
                id: 123,
                pin: () => {},
            }
            render(
                <SavedFiltersPanel
                    optionalFilters={[]}
                    pinnedFilter={pinnedFilter}
                />,
                { storeState: state },
            )
            expect(screen.getByText(DEFAULT_BADGE_TEXT)).toBeInTheDocument()
        })
    })
    it('should invalidate savedFilters queries on mutation success', async () => {
        const savedFilterDraft: SavedFilterDraft = {
            name: 'Some Name draft',
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
            integrations: fromJS({ integration: { id: 1 } }),
            ui: {
                stats: {
                    filters: { ...initialState, savedFilterDraft },
                },
            },
            currentUser: defaultState.currentUser,
        } as RootState

        const createSavedFilterMock = mockCreateSavedFilter(savedFilterDraft)
        const listSavedFiltersMock = mockSavedFiltersListWithRequestCount()
        const waitForCreateSavedFilterRequest =
            createSavedFilterMock.waitForRequest(server)
        server.use(listSavedFiltersMock.handler, createSavedFilterMock.handler)

        const invalidateQueriesSpy = jest.spyOn(
            QueryClient.prototype,
            'invalidateQueries',
        )
        render(<SavedFiltersPanel optionalFilters={[]} />, {
            storeState: state,
        })
        await listSavedFiltersMock.waitForRequestCount(1)

        userEvent.click(screen.getByRole('button', { name: SAVE_BUTTON_LABEL }))
        await waitForCreateSavedFilterRequest()
        await listSavedFiltersMock.waitForRequestCount(2)

        await waitFor(() => {
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: ['savedFilters'],
            })
        })
        invalidateQueriesSpy.mockRestore()
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
