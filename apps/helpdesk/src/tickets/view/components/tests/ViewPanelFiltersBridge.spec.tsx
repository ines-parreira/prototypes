import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import * as viewsConfig from 'config/views'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { View } from 'models/view/types'
import { getDefaultCustomFieldOperator } from 'pages/common/components/ViewTable/Filters/utils'
import { getHasAutomate } from 'state/billing/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import {
    viewCreated,
    viewDeleted,
    viewUpdated,
} from 'state/entities/views/actions'
import { getSchemas } from 'state/schemas/selectors'
import { activeViewIdSet } from 'state/ui/views/actions'
import {
    addFieldFilter,
    createJob,
    deleteView,
    resetView,
    setViewActive,
    submitView,
} from 'state/views/actions'
import { getDefaultOperator } from 'utils'

import { ViewPanelFiltersBridge } from '../ViewPanelFiltersBridge'

const pushMock = jest.fn()
const addFilterDropdownPropsMock = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: pushMock }),
}))

jest.mock('@tanstack/react-query', () => ({
    useQueryClient: jest.fn(),
}))
const useQueryClientMock = assumeMock(useQueryClient)

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        TicketExport: 'TicketExport',
    },
}))
const logEventMock = assumeMock(logEvent)

jest.mock('@repo/tickets/ticket-list', () => ({
    getTicketsListQueryKey: jest.fn(() => ['tickets-list-query-key']),
}))

jest.mock('config/views', () => ({
    getConfigByName: jest.fn(() =>
        fromJS({
            singular: 'ticket',
            fields: [],
        }),
    ),
}))
const getConfigByNameMock = assumeMock(viewsConfig.getConfigByName)

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions', () => ({
    useCustomFieldDefinitions: jest.fn(),
}))
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)

jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: jest.fn(),
}))
jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn(),
}))
const useAppDispatchMock = assumeMock(useAppDispatch)
const useAppSelectorMock = assumeMock(useAppSelector)

jest.mock('pages/common/components/ViewTable/AddFilterDropdown', () => ({
    AddFilterDropdown: ({
        filterableFields,
        handleClickFilter,
    }: {
        filterableFields: {
            first?: () => unknown
            toJS?: () => Array<{ title?: string }>
        }
        handleClickFilter: (field: unknown) => void
    }) => {
        addFilterDropdownPropsMock({ filterableFields, handleClickFilter })

        const firstField = filterableFields.first?.()
        const titles = filterableFields.toJS?.().map((field) => field.title)

        return (
            <div>
                <button
                    onClick={() => {
                        if (firstField) {
                            handleClickFilter(firstField)
                        }
                    }}
                >
                    Add filter
                </button>
                <p>{titles?.join(',') || 'no filters'}</p>
            </div>
        )
    },
}))

jest.mock('pages/common/components/ViewTable/Filters/ViewFilters', () => ({
    __esModule: true,
    default: () => <div>ViewFilters</div>,
}))

jest.mock('pages/common/components/ViewSharing/ViewSharingButton', () => ({
    __esModule: true,
    default: () => <button>Share view</button>,
}))

jest.mock('pages/common/components/ViewTable/Filters/utils', () => ({
    getDefaultCustomFieldOperator: jest.fn(),
}))
const getDefaultCustomFieldOperatorMock = assumeMock(
    getDefaultCustomFieldOperator,
)

jest.mock('state/billing/selectors', () => ({
    getHasAutomate: jest.fn(),
}))

jest.mock('state/currentUser/selectors', () => ({
    getCurrentUser: jest.fn(),
}))

jest.mock('state/schemas/selectors', () => ({
    getSchemas: jest.fn(),
}))

jest.mock('state/entities/views/actions', () => ({
    viewCreated: jest.fn(),
    viewDeleted: jest.fn(),
    viewUpdated: jest.fn(),
}))
const viewCreatedMock = assumeMock(viewCreated)
const viewDeletedMock = assumeMock(viewDeleted)
const viewUpdatedMock = assumeMock(viewUpdated)

jest.mock('state/ui/views/actions', () => ({
    activeViewIdSet: jest.fn(),
}))
const activeViewIdSetMock = assumeMock(activeViewIdSet)

jest.mock('state/views/actions', () => ({
    addFieldFilter: jest.fn(),
    createJob: jest.fn(),
    deleteView: jest.fn(),
    resetView: jest.fn(),
    setViewActive: jest.fn(),
    setViewEditMode: jest.fn(),
    submitView: jest.fn(),
}))
const addFieldFilterMock = assumeMock(addFieldFilter)
const createJobMock = assumeMock(createJob)
const deleteViewMock = assumeMock(deleteView)
const resetViewMock = assumeMock(resetView)
const setViewActiveMock = assumeMock(setViewActive)
const submitViewMock = assumeMock(submitView)

jest.mock('utils', () => ({
    ...jest.requireActual('utils'),
    getDefaultOperator: jest.fn(),
}))
const getDefaultOperatorMock = assumeMock(getDefaultOperator)

jest.mock('state/views/selectors', () => ({
    areFiltersValid: jest.fn(),
    getActiveView: jest.fn(),
    getPristineActiveView: jest.fn(),
    isDirty: jest.fn(),
}))
const {
    areFiltersValid: getAreFiltersValid,
    getActiveView,
    getPristineActiveView,
    isDirty: getIsDirty,
} = jest.requireMock('state/views/selectors') as {
    areFiltersValid: unknown
    getActiveView: unknown
    getPristineActiveView: unknown
    isDirty: unknown
}

describe('ViewPanelFiltersBridge', () => {
    const dispatchMock = jest.fn()
    const invalidateQueriesMock = jest.fn().mockResolvedValue(undefined)
    const onExpandedChange = jest.fn()
    const activeView = fromJS({
        id: 42,
        name: 'Open tickets',
        slug: 'open-tickets',
        filters: 'status:open',
        search: '',
        category: 'custom',
        visibility: 'private',
        editMode: false,
    })
    const currentUser = fromJS({ id: 7 })

    const updatedResponse = {
        id: 42,
        name: 'Open tickets',
        slug: 'open-tickets',
        filters: 'status:open',
    } as View
    const createJobAction = jest.fn() as unknown as ReturnType<typeof createJob>
    const addFieldFilterAction: ReturnType<typeof addFieldFilter> = {
        type: 'ADD_FIELD_FILTER',
        field: 'status',
        filter: {
            operator: 'is',
            value: 'open',
        } as unknown as Parameters<typeof addFieldFilter>[1],
    }
    const submitViewAction = jest.fn() as unknown as ReturnType<
        typeof submitView
    >
    const deleteViewAction = jest.fn() as unknown as ReturnType<
        typeof deleteView
    >
    const setViewActiveAction = jest.fn() as unknown as ReturnType<
        typeof setViewActive
    >
    const resetViewAction: ReturnType<typeof resetView> = {
        type: 'RESET_VIEW',
        configName: undefined,
    }
    const activeViewIdSetAction: ReturnType<typeof activeViewIdSet> = {
        type: 'ACTIVE_VIEW_ID_SET',
        payload: 42,
    }
    const viewUpdatedAction: ReturnType<typeof viewUpdated> = {
        type: 'VIEW_UPDATED',
        payload: updatedResponse,
    }
    const viewCreatedAction: ReturnType<typeof viewCreated> = {
        type: 'VIEW_CREATED',
        payload: updatedResponse,
    }
    const viewDeletedAction: ReturnType<typeof viewDeleted> = {
        type: 'VIEW_DELETED',
        payload: 42,
    }

    const renderComponent = (isExpanded = true) =>
        render(
            <ViewPanelFiltersBridge
                viewId={42}
                isExpanded={isExpanded}
                onExpandedChange={onExpandedChange}
            />,
        )

    beforeEach(() => {
        dispatchMock.mockReset()
        invalidateQueriesMock.mockClear()
        onExpandedChange.mockReset()
        pushMock.mockReset()
        logEventMock.mockReset()
        addFilterDropdownPropsMock.mockClear()

        useQueryClientMock.mockReturnValue({
            invalidateQueries: invalidateQueriesMock,
        } as unknown as QueryClient)
        getConfigByNameMock.mockReturnValue(
            fromJS({
                singular: 'ticket',
                fields: [],
            }),
        )
        useAppDispatchMock.mockReturnValue(dispatchMock)
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: {
                data: [],
                meta: {},
                object: 'list',
                uri: '/api/custom-fields',
            },
        } as unknown as ReturnType<typeof useCustomFieldDefinitions>)

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getActiveView) return activeView
            if (selector === getPristineActiveView) return activeView
            if (selector === getAreFiltersValid) return true
            if (selector === getIsDirty) return false
            if (selector === getCurrentUser) return currentUser
            if (selector === getHasAutomate) return true
            if (selector === getSchemas) return fromJS({})
            return undefined
        })

        getDefaultOperatorMock.mockReturnValue('is')
        getDefaultCustomFieldOperatorMock.mockReturnValue('is')
        addFieldFilterMock.mockReturnValue(addFieldFilterAction)
        submitViewMock.mockReturnValue(submitViewAction)
        createJobMock.mockReturnValue(createJobAction)
        setViewActiveMock.mockReturnValue(setViewActiveAction)
        resetViewMock.mockReturnValue(resetViewAction)
        activeViewIdSetMock.mockReturnValue(activeViewIdSetAction)
        viewCreatedMock.mockReturnValue(viewCreatedAction)
        viewDeletedMock.mockReturnValue(viewDeletedAction)
        viewUpdatedMock.mockReturnValue(viewUpdatedAction)
        deleteViewMock.mockReturnValue(deleteViewAction)

        dispatchMock.mockImplementation((action) => {
            if (action === submitViewAction) {
                return Promise.resolve(updatedResponse)
            }

            return action
        })
    })

    it('passes only filterable sorted fields to the add filter dropdown', () => {
        getConfigByNameMock.mockReturnValue(
            fromJS({
                singular: 'ticket',
                fields: [
                    { name: 'feedback', title: 'Feedback', filter: {} },
                    { name: 'priority', title: 'Priority', filter: {} },
                    { name: 'subject', title: 'Subject' },
                    { name: 'channel', title: 'Channel', filter: {} },
                ],
            }),
        )

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getActiveView) return activeView
            if (selector === getPristineActiveView) return activeView
            if (selector === getAreFiltersValid) return true
            if (selector === getIsDirty) return false
            if (selector === getCurrentUser) return currentUser
            if (selector === getHasAutomate) return false
            if (selector === getSchemas) return fromJS({})
            return undefined
        })

        renderComponent()

        const [{ filterableFields }] = addFilterDropdownPropsMock.mock.calls.at(
            -1,
        ) as [{ filterableFields: { toJS: () => Array<{ title: string }> } }]

        expect(filterableFields.toJS().map((field) => field.title)).toEqual([
            'Channel',
            'Priority',
        ])
    })

    it('uses the first active custom field operator when adding a custom field filter', async () => {
        const user = userEvent.setup()

        getConfigByNameMock.mockReturnValue(
            fromJS({
                singular: 'ticket',
                fields: [
                    {
                        name: 'custom_fields',
                        path: 'custom_fields',
                        title: 'Custom field',
                        filter: {},
                    },
                ],
            }),
        )
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: {
                data: [
                    { id: 1, deactivated_datetime: '2025-01-01T00:00:00Z' },
                    { id: 2, deactivated_datetime: null },
                ],
                meta: {},
                object: 'list',
                uri: '/api/custom-fields',
            },
        } as unknown as ReturnType<typeof useCustomFieldDefinitions>)

        renderComponent()

        await user.click(screen.getByRole('button', { name: 'Add filter' }))

        expect(getDefaultCustomFieldOperatorMock).toHaveBeenCalledWith(
            fromJS({}),
            expect.objectContaining({ id: 2 }),
        )
        expect(addFieldFilterMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'custom_fields',
                path: 'custom_fields',
            }),
            {
                left: 'ticket.custom_fields',
                operator: 'is',
            },
        )
    })

    it('does not dispatch a filter action when no default operator is available', async () => {
        const user = userEvent.setup()

        getConfigByNameMock.mockReturnValue(
            fromJS({
                singular: 'ticket',
                fields: [
                    {
                        name: 'channel',
                        path: 'channel',
                        title: 'Channel',
                        filter: {},
                    },
                ],
            }),
        )
        getDefaultOperatorMock.mockReturnValue(undefined)

        renderComponent()

        await user.click(screen.getByRole('button', { name: 'Add filter' }))

        expect(addFieldFilterMock).not.toHaveBeenCalled()
        expect(dispatchMock).not.toHaveBeenCalledWith(addFieldFilterAction)
    })

    it('keeps the disclosure open after successfully updating a view', async () => {
        const user = userEvent.setup()

        renderComponent()

        await user.click(screen.getByRole('button', { name: /update view/i }))

        await waitFor(() => {
            expect(dispatchMock).toHaveBeenCalledWith(viewUpdatedAction)
        })

        expect(onExpandedChange).not.toHaveBeenCalledWith(false)
    })

    it('normalizes shared visibility ids before updating a view', async () => {
        const user = userEvent.setup()
        const sharedView = fromJS({
            id: 42,
            name: 'Shared tickets',
            slug: 'shared-tickets',
            filters: 'status:open',
            search: '',
            category: 'custom',
            visibility: 'shared',
            shared_with_users: [7, { id: 9 }],
            shared_with_teams: [4, { id: 5 }],
        })

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getActiveView) return sharedView
            if (selector === getPristineActiveView) return sharedView
            if (selector === getAreFiltersValid) return true
            if (selector === getIsDirty) return false
            if (selector === getCurrentUser) return currentUser
            if (selector === getHasAutomate) return true
            if (selector === getSchemas) return fromJS({})
            return undefined
        })

        renderComponent()
        await user.click(screen.getByRole('button', { name: /update view/i }))

        expect(submitViewMock).toHaveBeenCalledWith(
            expect.objectContaining({
                get: expect.any(Function),
            }),
        )

        const payload = submitViewMock.mock.calls.at(-1)?.[0]
        if (!payload) {
            throw new Error('Expected submitView to be called')
        }
        expect(payload.get('shared_with_users').toJS()).toEqual([7, 9])
        expect(payload.get('shared_with_teams').toJS()).toEqual([4, 5])
    })

    it('adds the current user to private views before saving', async () => {
        const user = userEvent.setup()

        renderComponent()
        await user.click(screen.getByRole('button', { name: /update view/i }))

        const payload = submitViewMock.mock.calls.at(-1)?.[0]
        if (!payload) {
            throw new Error('Expected submitView to be called')
        }
        expect(payload.get('shared_with_users')).toEqual([7])
    })

    it('returns early when update is forced while saving is disabled', async () => {
        const user = userEvent.setup()
        const systemView = activeView.set('category', 'system')

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getActiveView) return systemView
            if (selector === getPristineActiveView) return systemView
            if (selector === getAreFiltersValid) return true
            if (selector === getIsDirty) return false
            if (selector === getCurrentUser) return currentUser
            if (selector === getHasAutomate) return true
            if (selector === getSchemas) return fromJS({})
            return undefined
        })

        renderComponent()

        const updateButton = screen.getByRole('button', {
            name: /update view/i,
        })
        updateButton.removeAttribute('disabled')

        await user.click(updateButton)

        expect(submitViewMock).not.toHaveBeenCalled()
    })

    it('ignores save responses that are not views', async () => {
        const user = userEvent.setup()

        dispatchMock.mockImplementation((action) => {
            if (action === submitViewAction) {
                return Promise.resolve(undefined)
            }

            return action
        })

        renderComponent()
        await user.click(screen.getByRole('button', { name: /update view/i }))

        await waitFor(() => {
            expect(submitViewMock).toHaveBeenCalled()
        })

        expect(dispatchMock).not.toHaveBeenCalledWith(viewUpdatedAction)
        expect(dispatchMock).not.toHaveBeenCalledWith(setViewActiveAction)
    })

    it('resets the draft and closes when cancel is clicked', async () => {
        const user = userEvent.setup()

        renderComponent()

        await user.click(screen.getByRole('button', { name: /cancel/i }))

        expect(dispatchMock).toHaveBeenCalledWith(resetViewAction)
        expect(onExpandedChange).toHaveBeenCalledWith(false)
    })

    it('only collapses the disclosure when the user manually collapses it', async () => {
        const user = userEvent.setup()

        renderComponent()

        await user.click(
            screen.getByRole('button', { name: /filters/i, expanded: true }),
        )

        expect(onExpandedChange).toHaveBeenCalledWith(false)
        expect(dispatchMock).not.toHaveBeenCalledWith(resetViewAction)
    })

    it('allows collapsing the disclosure while the draft is dirty', async () => {
        const user = userEvent.setup()

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getActiveView) return activeView
            if (selector === getPristineActiveView) return activeView
            if (selector === getAreFiltersValid) return true
            if (selector === getIsDirty) return true
            if (selector === getCurrentUser) return currentUser
            if (selector === getHasAutomate) return true
            if (selector === getSchemas) return fromJS({})
            return undefined
        })

        renderComponent()

        await user.click(
            screen.getByRole('button', { name: /filters/i, expanded: true }),
        )

        expect(onExpandedChange).toHaveBeenCalledWith(false)
        expect(dispatchMock).not.toHaveBeenCalledWith(resetViewAction)
    })

    it('shows the stale updates warning in the collapsed header when the draft is dirty', () => {
        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getActiveView) return activeView
            if (selector === getPristineActiveView) return activeView
            if (selector === getAreFiltersValid) return true
            if (selector === getIsDirty) return true
            if (selector === getCurrentUser) return currentUser
            if (selector === getHasAutomate) return true
            if (selector === getSchemas) return fromJS({})
            return undefined
        })

        renderComponent(false)

        expect(
            screen.getAllByText(
                'Live ticket updates are paused while filters are being edited',
            ).length,
        ).toBeGreaterThan(0)
    })

    it('shows the stale updates warning above the footer actions when the draft is dirty and expanded', () => {
        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getActiveView) return activeView
            if (selector === getPristineActiveView) return activeView
            if (selector === getAreFiltersValid) return true
            if (selector === getIsDirty) return true
            if (selector === getCurrentUser) return currentUser
            if (selector === getHasAutomate) return true
            if (selector === getSchemas) return fromJS({})
            return undefined
        })

        renderComponent()

        expect(
            screen.getAllByText(
                'Live ticket updates are paused while filters are being edited',
            ),
        ).toHaveLength(1)
    })

    it('renders export and sharing actions for existing views', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /export tickets/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /share view/i }),
        ).toBeInTheDocument()
    })

    it('logs export tracking before creating the export job', async () => {
        const user = userEvent.setup()

        renderComponent()

        await user.click(
            screen.getByRole('button', { name: /export tickets/i }),
        )

        expect(logEventMock).toHaveBeenCalledWith(SegmentEvent.TicketExport, {
            type: 'views-export-button',
        })
        expect(createJobMock).toHaveBeenCalled()
    })

    it('does not render export controls when the view does not exist yet', () => {
        const draftView = activeView.delete('id')

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getActiveView) return draftView
            if (selector === getPristineActiveView) return draftView
            if (selector === getAreFiltersValid) return true
            if (selector === getIsDirty) return false
            if (selector === getCurrentUser) return currentUser
            if (selector === getHasAutomate) return true
            if (selector === getSchemas) return fromJS({})
            return undefined
        })

        renderComponent()

        expect(
            screen.queryByRole('button', { name: /export tickets/i }),
        ).not.toBeInTheDocument()
    })

    it('saves a new view from the save menu action', async () => {
        const user = userEvent.setup()

        renderComponent()

        await user.click(
            screen.getByRole('button', { name: /more save actions/i }),
        )
        await user.click(
            await screen.findByRole('menuitem', { name: /save new view/i }),
        )

        expect(submitViewMock).toHaveBeenCalled()
    })

    it('does nothing when delete resolves to a non-map destination', async () => {
        const user = userEvent.setup()

        dispatchMock.mockImplementation((action) => {
            if (action === deleteViewAction) {
                return Promise.resolve(undefined)
            }

            return action
        })

        renderComponent()

        await user.click(screen.getByRole('button', { name: /delete view/i }))
        await user.click(
            screen.getByRole('button', { name: /confirm delete/i }),
        )

        await waitFor(() => {
            expect(deleteViewMock).toHaveBeenCalled()
        })

        expect(dispatchMock).not.toHaveBeenCalledWith(viewDeletedAction)
        expect(pushMock).not.toHaveBeenCalled()
    })

    it('deletes the view and navigates to the replacement view', async () => {
        const user = userEvent.setup()
        const destinationView = fromJS({
            id: 88,
            name: 'Destination view',
        })
        activeViewIdSetMock.mockReturnValue({
            type: 'ACTIVE_VIEW_ID_SET',
            payload: 88,
        })

        dispatchMock.mockImplementation((action) => {
            if (action === deleteViewAction) {
                return Promise.resolve(destinationView)
            }
            if (action === submitViewAction) {
                return Promise.resolve(updatedResponse)
            }

            return action
        })

        renderComponent()

        await user.click(screen.getByRole('button', { name: /delete view/i }))
        await user.click(
            screen.getByRole('button', { name: /confirm delete/i }),
        )

        await waitFor(() => {
            expect(dispatchMock).toHaveBeenCalledWith(viewDeletedAction)
        })

        expect(dispatchMock).toHaveBeenCalledWith({
            type: 'ACTIVE_VIEW_ID_SET',
            payload: 88,
        })
        expect(pushMock).toHaveBeenCalledWith('/app/views/88')
        expect(onExpandedChange).toHaveBeenCalledWith(false)
    })

    it('renders nothing when the active view is empty', () => {
        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getActiveView) return fromJS({})
            if (selector === getPristineActiveView) return fromJS({})
            if (selector === getAreFiltersValid) return true
            if (selector === getIsDirty) return false
            if (selector === getCurrentUser) return currentUser
            if (selector === getHasAutomate) return true
            if (selector === getSchemas) return fromJS({})
            return undefined
        })

        const { container } = renderComponent()

        expect(container).toBeEmptyDOMElement()
    })
})
