import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, render } from '@repo/testing'
import { useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { ViewField } from '@gorgias/helpdesk-types'

import * as viewsConfig from 'config/views'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { useAppDispatch } from 'hooks/useAppDispatch'
import { useAppSelector } from 'hooks/useAppSelector'
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
    updateView,
} from 'state/views/actions'
import { getDefaultOperator } from 'utils'

import { ViewPanelFiltersBridge } from '../ViewPanelFiltersBridge'

const pushMock = jest.fn()
const addFilterDropdownPropsMock = jest.fn()
const setSplitTicketViewEnabledMock = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: pushMock }),
}))

jest.mock('split-ticket-view-toggle', () => ({
    useSplitTicketView: () => ({
        setIsEnabled: setSplitTicketViewEnabledMock,
    }),
}))

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
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
    useAppDispatch: jest.fn(),
}))
jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    useAppSelector: jest.fn(),
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
    ViewFilters: () => <div>ViewFilters</div>,
}))

jest.mock('pages/common/components/ViewSharing/ViewSharingButton', () => ({
    __esModule: true,
    DefaultExportViewSharingButton: () => <button>Share view</button>,
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
    updateView: jest.fn(),
}))
const addFieldFilterMock = assumeMock(addFieldFilter)
const createJobMock = assumeMock(createJob)
const deleteViewMock = assumeMock(deleteView)
const resetViewMock = assumeMock(resetView)
const setViewActiveMock = assumeMock(setViewActive)
const submitViewMock = assumeMock(submitView)
const updateViewMock = assumeMock(updateView)

jest.mock('utils', () => ({
    ...jest.requireActual('utils'),
    getDefaultOperator: jest.fn(),
}))
const getDefaultOperatorMock = assumeMock(getDefaultOperator)

jest.mock('state/views/selectors', () => ({
    areFiltersValid: jest.fn(),
    getActiveView: jest.fn(),
    getLastViewId: jest.fn(),
    getNavigation: jest.fn(),
    getPristineActiveView: jest.fn(),
    getViewIdToDisplay: jest.fn(),
    isDirty: jest.fn(),
}))
const {
    areFiltersValid: getAreFiltersValid,
    getActiveView,
    getLastViewId,
    getNavigation,
    getPristineActiveView,
    getViewIdToDisplay,
    isDirty: getIsDirty,
} = jest.requireMock('state/views/selectors') as {
    areFiltersValid: unknown
    getActiveView: unknown
    getLastViewId: unknown
    getNavigation: unknown
    getPristineActiveView: unknown
    getViewIdToDisplay: unknown
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
    const updateViewAction: ReturnType<typeof updateView> = {
        type: 'UPDATE_VIEW',
        view: activeView,
        edit: true,
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

    const renderComponent = (
        props?: Partial<React.ComponentProps<typeof ViewPanelFiltersBridge>>,
    ) => {
        return render(
            <ViewPanelFiltersBridge
                viewId={42}
                onExpandedChange={onExpandedChange}
                {...props}
            />,
        )
    }

    const expectHiddenPopoverTrigger = (container: HTMLElement) => {
        const trigger = container.querySelector(
            'button[aria-hidden="true"][tabindex="-1"]',
        )

        expect(trigger).toBeInstanceOf(HTMLButtonElement)
    }

    beforeEach(() => {
        dispatchMock.mockReset()
        invalidateQueriesMock.mockClear()
        onExpandedChange.mockReset()
        pushMock.mockReset()
        setSplitTicketViewEnabledMock.mockReset()
        logEventMock.mockReset()
        addFilterDropdownPropsMock.mockClear()
        updateViewMock.mockReset()

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
            if (selector === getLastViewId) return 3
            if (selector === getNavigation) return fromJS({})
            if (selector === getCurrentUser) return currentUser
            if (selector === getHasAutomate) return true
            if (selector === getSchemas) return fromJS({})
            if (typeof selector === 'function') {
                return selector({} as never)
            }
            return undefined
        })
        ;(getViewIdToDisplay as jest.Mock).mockReturnValue(() => 3)

        getDefaultOperatorMock.mockReturnValue('is')
        getDefaultCustomFieldOperatorMock.mockReturnValue('is')
        addFieldFilterMock.mockReturnValue(addFieldFilterAction)
        submitViewMock.mockReturnValue(submitViewAction)
        createJobMock.mockReturnValue(createJobAction)
        setViewActiveMock.mockReturnValue(setViewActiveAction)
        resetViewMock.mockReturnValue(resetViewAction)
        updateViewMock.mockReturnValue(updateViewAction)
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

    it('keeps the typed view name when draft filters change', async () => {
        const user = userEvent.setup()
        let draftView = activeView.delete('id').set('name', '').set('slug', '')

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

        const { rerender } = renderComponent()

        await user.type(
            screen.getByRole('textbox', { name: /view name/i }),
            'Urgent tickets',
        )

        draftView = draftView.set('filters', 'priority:urgent')

        rerender(
            <ViewPanelFiltersBridge
                viewId={42}
                onExpandedChange={onExpandedChange}
            />,
        )

        expect(screen.getByRole('textbox', { name: /view name/i })).toHaveValue(
            'Urgent tickets',
        )
    })

    it('initializes the emoji picker from the active view decoration', () => {
        const emojiView = activeView.setIn(['decoration', 'emoji'], '🔥')

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getActiveView) return emojiView
            if (selector === getPristineActiveView) return emojiView
            if (selector === getAreFiltersValid) return true
            if (selector === getIsDirty) return false
            if (selector === getCurrentUser) return currentUser
            if (selector === getHasAutomate) return true
            if (selector === getSchemas) return fromJS({})
            return undefined
        })

        renderComponent()

        expect(
            screen.getByRole('button', { name: /view emoji/i }),
        ).toHaveTextContent('🔥')
    })

    it('renders the emoji trigger in the view name field', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /view emoji/i }),
        ).toBeInTheDocument()
    })

    it('selecting an emoji updates the draft view decoration', async () => {
        const user = userEvent.setup()

        renderComponent()

        await user.click(screen.getByRole('button', { name: /view emoji/i }))
        const emojiSelection = await waitFor(() => {
            const pickerEmoji =
                document.getElementsByClassName('emoji-mart-emoji')[0]

            expect(pickerEmoji).toBeInTheDocument()
            return pickerEmoji as HTMLElement
        })
        await user.click(emojiSelection)

        const nextDraftView = updateViewMock.mock.calls.at(-1)?.[0]
        expect(nextDraftView?.getIn(['decoration', 'emoji'])).toBe(
            emojiSelection.textContent,
        )
        expect(dispatchMock).toHaveBeenCalledWith(updateViewAction)
    })

    it('keeps the typed view name when emoji updates change the draft view', async () => {
        const user = userEvent.setup()
        let draftView = activeView.delete('id').set('name', '').set('slug', '')

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

        const { rerender } = renderComponent()

        await user.type(
            screen.getByRole('textbox', { name: /view name/i }),
            'Urgent tickets',
        )

        draftView = draftView.setIn(['decoration', 'emoji'], '🔥')

        rerender(
            <ViewPanelFiltersBridge
                viewId={42}
                onExpandedChange={onExpandedChange}
            />,
        )

        expect(screen.getByRole('textbox', { name: /view name/i })).toHaveValue(
            'Urgent tickets',
        )
        expect(
            screen.getByRole('button', { name: /view emoji/i }),
        ).toHaveTextContent('🔥')
    })

    it('clearing removes the draft emoji', async () => {
        const user = userEvent.setup()
        const emojiView = activeView.setIn(['decoration', 'emoji'], '🔥')
        const clearedViewAction: ReturnType<typeof updateView> = {
            type: 'UPDATE_VIEW',
            view: emojiView.deleteIn(['decoration', 'emoji']),
            edit: true,
        }

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getActiveView) return emojiView
            if (selector === getPristineActiveView) return emojiView
            if (selector === getAreFiltersValid) return true
            if (selector === getIsDirty) return false
            if (selector === getCurrentUser) return currentUser
            if (selector === getHasAutomate) return true
            if (selector === getSchemas) return fromJS({})
            return undefined
        })
        updateViewMock.mockReturnValueOnce(clearedViewAction)

        renderComponent()

        await user.click(screen.getByRole('button', { name: /view emoji/i }))
        await user.click(screen.getByRole('button', { name: /clear icon/i }))

        const nextDraftView = updateViewMock.mock.calls.at(-1)?.[0]
        expect(nextDraftView?.getIn(['decoration', 'emoji'])).toBeUndefined()
        expect(dispatchMock).toHaveBeenCalledWith(clearedViewAction)
    })

    it('includes draft emoji from active view in the create payload', async () => {
        const user = userEvent.setup()
        const draftView = activeView
            .delete('id')
            .set('name', '')
            .set('slug', '')
            .setIn(['decoration', 'emoji'], '🔥')

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

        await user.type(screen.getByLabelText(/view name/i), 'New queue')
        await user.click(screen.getByRole('button', { name: /create view/i }))

        const payload = submitViewMock.mock.calls.at(-1)?.[0]
        if (!payload) {
            throw new Error('Expected submitView to be called')
        }

        expect(payload.getIn(['decoration', 'emoji'])).toBe('🔥')
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

    it('uses the provided draft fields when creating a new view', async () => {
        const user = userEvent.setup()
        const draftView = activeView
            .delete('id')
            .set('name', '')
            .set('slug', '')

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getActiveView) return draftView
            if (selector === getPristineActiveView) return draftView
            if (selector === getAreFiltersValid) return true
            if (selector === getIsDirty) return false
            if (selector === getLastViewId) return 3
            if (selector === getCurrentUser) return currentUser
            if (selector === getHasAutomate) return true
            if (selector === getSchemas) return fromJS({})
            if (typeof selector === 'function') {
                return selector({} as never)
            }
            return undefined
        })

        renderComponent({
            draftFields: [ViewField.Subject, ViewField.Customer],
        })

        await user.type(
            screen.getByRole('textbox', { name: /view name/i }),
            'Urgent tickets',
        )
        await user.click(screen.getByRole('button', { name: /create view/i }))

        const payload = submitViewMock.mock.calls.at(-1)?.[0]
        if (!payload) {
            throw new Error('Expected submitView to be called')
        }

        expect(payload.get('fields')?.toJS()).toEqual([
            ViewField.Subject,
            ViewField.Customer,
        ])
    })

    it('preserves the provided draft field order when creating a new view', async () => {
        const user = userEvent.setup()
        const draftView = activeView
            .delete('id')
            .set('name', '')
            .set('slug', '')

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getActiveView) return draftView
            if (selector === getPristineActiveView) return draftView
            if (selector === getAreFiltersValid) return true
            if (selector === getIsDirty) return false
            if (selector === getLastViewId) return 3
            if (selector === getCurrentUser) return currentUser
            if (selector === getHasAutomate) return true
            if (selector === getSchemas) return fromJS({})
            if (typeof selector === 'function') {
                return selector({} as never)
            }
            return undefined
        })

        renderComponent({
            draftFields: [
                ViewField.Customer,
                ViewField.Created,
                ViewField.Subject,
            ],
        })

        await user.type(
            screen.getByRole('textbox', { name: /view name/i }),
            'Ordered tickets',
        )
        await user.click(screen.getByRole('button', { name: /create view/i }))

        const payload = submitViewMock.mock.calls.at(-1)?.[0]
        if (!payload) {
            throw new Error('Expected submitView to be called')
        }

        expect(payload.get('fields')?.toJS()).toEqual([
            ViewField.Customer,
            ViewField.Created,
            ViewField.Subject,
        ])
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
        await user.click(screen.getByRole('button', { name: /^yes$/i }))

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

    it('replaces save and delete actions with explanatory text for system views', () => {
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

        expect(
            screen.getByText('This view cannot be saved.'),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /cancel/i }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /update view/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /more save actions/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /^delete$/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /export tickets/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /share view/i }),
        ).toBeInTheDocument()
    })

    it('shows a tooltip on the disabled save action when filters are invalid', async () => {
        const user = userEvent.setup()

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getActiveView) return activeView
            if (selector === getPristineActiveView) return activeView
            if (selector === getAreFiltersValid) return false
            if (selector === getIsDirty) return false
            if (selector === getCurrentUser) return currentUser
            if (selector === getHasAutomate) return true
            if (selector === getSchemas) return fromJS({})
            return undefined
        })

        renderComponent()

        await user.hover(screen.getByRole('button', { name: /update view/i }))

        expect(
            await screen.findByText(
                'Fix incomplete filters before saving this view.',
            ),
        ).toBeInTheDocument()
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

    it('navigates back to the previous inbox view when cancel is clicked on a new draft', async () => {
        const user = userEvent.setup()
        const draftView = activeView
            .delete('id')
            .set('name', '')
            .set('slug', '')

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getActiveView) return draftView
            if (selector === getPristineActiveView) return draftView
            if (selector === getAreFiltersValid) return true
            if (selector === getIsDirty) return false
            if (selector === getLastViewId) return 3
            if (selector === getCurrentUser) return currentUser
            if (selector === getHasAutomate) return true
            if (selector === getSchemas) return fromJS({})
            if (typeof selector === 'function') {
                return selector({} as never)
            }
            return undefined
        })

        renderComponent()

        await user.click(screen.getByRole('button', { name: /cancel/i }))

        expect(dispatchMock).toHaveBeenCalledWith(activeViewIdSetAction)
        expect(pushMock).toHaveBeenCalledWith('/app/tickets/3')
        expect(dispatchMock).not.toHaveBeenCalledWith(resetViewAction)
        expect(onExpandedChange).not.toHaveBeenCalledWith(false)
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

        renderComponent()

        expect(
            screen.getAllByText(
                'Live ticket updates are paused while filters are being edited',
            ),
        ).toHaveLength(1)
    })

    it('shows the stale updates warning in the same header location when the draft is dirty and expanded', () => {
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

        const exportButton = screen.getByRole('button', {
            name: /export tickets/i,
        })

        expect(exportButton).toBeInTheDocument()
        expect(exportButton).toHaveTextContent('Export tickets')
        expect(
            screen.getByRole('button', { name: /share view/i }),
        ).toBeInTheDocument()
    })

    it('renders the default bridge chrome when overrides are omitted', () => {
        renderComponent()

        expect(screen.getByLabelText(/view name/i)).toBeEnabled()
        expect(
            screen.getByRole('button', { name: /update view/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /cancel/i }),
        ).toBeInTheDocument()
        expect(screen.queryByText('200 tickets')).not.toBeInTheDocument()
        expect(screen.queryByText('1 ticket')).not.toBeInTheDocument()
    })

    it('supports search-mode bridge chrome overrides', () => {
        renderComponent({
            hideViewNameInput: true,
            hideFooterActions: true,
        })

        expect(screen.queryByLabelText(/view name/i)).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /update view/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /cancel/i }),
        ).not.toBeInTheDocument()
    })

    it('shows the search result count outside search mode', () => {
        renderComponent({ searchResultCount: 200 })

        expect(screen.getByText('200 tickets')).toBeInTheDocument()
    })

    it('shows the search result count in search mode', () => {
        renderComponent({
            isSearchMode: true,
            searchResultCount: 200,
        })

        expect(screen.getByText('200 tickets')).toBeInTheDocument()
        expect(
            screen.queryByText(
                'Live ticket updates are paused while filters are being edited',
            ),
        ).not.toBeInTheDocument()
    })

    it('shows the singular search result count in search mode', () => {
        renderComponent({
            isSearchMode: true,
            searchResultCount: 1,
        })

        expect(screen.getByText('1 ticket')).toBeInTheDocument()
    })

    it('caps the search result count at 5000+ tickets', () => {
        renderComponent({
            isSearchMode: true,
            searchResultCount: 5000,
        })

        expect(screen.getByText('5000+ tickets')).toBeInTheDocument()
    })

    it('hides the search result count when it is unavailable', () => {
        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getActiveView) return activeView
            if (selector === getPristineActiveView) return activeView
            if (selector === getAreFiltersValid) return true
            if (selector === getIsDirty) return true
            if (selector === getLastViewId) return 3
            if (selector === getNavigation) return fromJS({})
            if (selector === getCurrentUser) return currentUser
            if (selector === getHasAutomate) return true
            if (selector === getSchemas) return fromJS({})
            if (typeof selector === 'function') {
                return selector({} as never)
            }
            return undefined
        })

        renderComponent({
            isSearchMode: true,
        })

        expect(screen.queryByText('200 tickets')).not.toBeInTheDocument()
        expect(screen.queryByText('5000+ tickets')).not.toBeInTheDocument()
        expect(
            screen.queryByText(
                'Live ticket updates are paused while filters are being edited',
            ),
        ).not.toBeInTheDocument()
    })

    it('disables the view name input for system views', () => {
        const systemView = activeView.set('category', 'system')

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getActiveView) return systemView
            if (selector === getPristineActiveView) return systemView
            if (selector === getAreFiltersValid) return true
            if (selector === getIsDirty) return false
            if (selector === getLastViewId) return 3
            if (selector === getNavigation) return fromJS({})
            if (selector === getCurrentUser) return currentUser
            if (selector === getHasAutomate) return true
            if (selector === getSchemas) return fromJS({})
            if (typeof selector === 'function') {
                return selector({} as never)
            }
            return undefined
        })

        renderComponent()

        expect(screen.getByLabelText(/view name/i)).toBeDisabled()
    })

    it('disables the save actions when filters are invalid', () => {
        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getActiveView) return activeView
            if (selector === getPristineActiveView) return activeView
            if (selector === getAreFiltersValid) return false
            if (selector === getIsDirty) return false
            if (selector === getLastViewId) return 3
            if (selector === getNavigation) return fromJS({})
            if (selector === getCurrentUser) return currentUser
            if (selector === getHasAutomate) return true
            if (selector === getSchemas) return fromJS({})
            if (typeof selector === 'function') {
                return selector({} as never)
            }
            return undefined
        })

        renderComponent()

        expect(
            screen.getByRole('button', { name: /update view/i }),
        ).toBeDisabled()
        expect(
            screen.getByRole('button', { name: /more save actions/i }),
        ).toBeDisabled()
    })

    it('keeps the action row visible when the bridge is collapsed', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /update view/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /cancel/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /^delete$/i }),
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

    it('disables the export action while the export job is running', async () => {
        const user = userEvent.setup()
        let resolveJob: (() => void) | undefined

        dispatchMock.mockImplementation((action) => {
            if (action === createJobAction) {
                return new Promise<void>((resolve) => {
                    resolveJob = resolve
                })
            }

            return action
        })

        renderComponent()

        await user.click(
            screen.getByRole('button', { name: /export tickets/i }),
        )

        expect(
            screen.getByRole('button', { name: /export tickets/i }),
        ).toBeDisabled()

        resolveJob?.()

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /export tickets/i }),
            ).toBeEnabled()
        })
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

    it('starts with an empty name and disabled update action for a new draft', () => {
        const draftView = activeView
            .delete('id')
            .set('name', '')
            .set('slug', '')

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

        expect(screen.getByLabelText(/view name/i)).toHaveValue('')
        expect(
            screen.getByRole('button', { name: /create view/i }),
        ).toBeDisabled()
        expect(
            screen.queryByRole('button', { name: /^delete$/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /more save actions/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /share view/i }),
        ).not.toBeInTheDocument()
    })

    it('renders a single create view button for a new draft', () => {
        const draftView = activeView
            .delete('id')
            .set('name', '')
            .set('slug', '')

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
            screen.getByRole('button', { name: /create view/i }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /update view/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /more save actions/i }),
        ).not.toBeInTheDocument()
    })

    it('creates a new draft view and lands on the saved route in full width', async () => {
        const user = userEvent.setup()
        const draftView = activeView
            .delete('id')
            .set('name', '')
            .set('slug', '')

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

        await user.type(screen.getByLabelText(/view name/i), 'New queue')
        await user.click(screen.getByRole('button', { name: /create view/i }))

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith('/app/tickets/42')
        })

        expect(setSplitTicketViewEnabledMock).toHaveBeenCalledWith(false)
    })

    it('shows the confirmation popover before updating a public view', async () => {
        const user = userEvent.setup()
        const publicView = fromJS({
            id: 42,
            name: 'Public tickets',
            slug: 'public-tickets',
            filters: 'status:open',
            search: '',
            category: 'custom',
            visibility: 'public',
            shared_with_users: [7],
            shared_with_teams: [],
        })

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getActiveView) return publicView
            if (selector === getPristineActiveView) return publicView
            if (selector === getAreFiltersValid) return true
            if (selector === getIsDirty) return false
            if (selector === getCurrentUser) return currentUser
            if (selector === getHasAutomate) return true
            if (selector === getSchemas) return fromJS({})
            return undefined
        })

        renderComponent()
        await user.click(screen.getByRole('button', { name: /update view/i }))

        expect(screen.getByText('Are you sure?')).toBeInTheDocument()
        expect(
            screen.getByText('You are about to edit this view for all users.'),
        ).toBeInTheDocument()
        expect(submitViewMock).not.toHaveBeenCalled()
    })

    it('keeps the fake popover trigger outside accessibility and tab order', () => {
        const { container } = renderComponent()

        expectHiddenPopoverTrigger(container)
    })

    it('does not submit a public view update when the popover is canceled', async () => {
        const user = userEvent.setup()
        const publicView = fromJS({
            id: 42,
            name: 'Public tickets',
            slug: 'public-tickets',
            filters: 'status:open',
            search: '',
            category: 'custom',
            visibility: 'public',
            shared_with_users: [7],
            shared_with_teams: [],
        })

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getActiveView) return publicView
            if (selector === getPristineActiveView) return publicView
            if (selector === getAreFiltersValid) return true
            if (selector === getIsDirty) return false
            if (selector === getCurrentUser) return currentUser
            if (selector === getHasAutomate) return true
            if (selector === getSchemas) return fromJS({})
            return undefined
        })

        renderComponent()
        await user.click(screen.getByRole('button', { name: /update view/i }))
        await user.click(screen.getByRole('button', { name: /^no$/i }))

        expect(submitViewMock).not.toHaveBeenCalled()
        expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument()
    })

    it('submits a public view update after confirmation', async () => {
        const user = userEvent.setup()
        const publicView = fromJS({
            id: 42,
            name: 'Public tickets',
            slug: 'public-tickets',
            filters: 'status:open',
            search: '',
            category: 'custom',
            visibility: 'public',
            shared_with_users: [7],
            shared_with_teams: [],
        })

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getActiveView) return publicView
            if (selector === getPristineActiveView) return publicView
            if (selector === getAreFiltersValid) return true
            if (selector === getIsDirty) return false
            if (selector === getCurrentUser) return currentUser
            if (selector === getHasAutomate) return true
            if (selector === getSchemas) return fromJS({})
            return undefined
        })

        renderComponent()
        await user.click(screen.getByRole('button', { name: /update view/i }))
        await user.click(screen.getByRole('button', { name: /^yes$/i }))

        await waitFor(() => {
            expect(submitViewMock).toHaveBeenCalled()
        })
    })

    it('updates private views without showing the confirmation popover', async () => {
        const user = userEvent.setup()

        renderComponent()
        await user.click(screen.getByRole('button', { name: /update view/i }))

        expect(submitViewMock).toHaveBeenCalled()
        expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument()
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

    it('hides delete for unsaved draft views', () => {
        const draftView = activeView
            .delete('id')
            .set('name', '')
            .set('slug', '')

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
            screen.queryByRole('button', { name: /^delete$/i }),
        ).not.toBeInTheDocument()
    })

    it('disables delete while a save is in flight', async () => {
        const user = userEvent.setup()
        let resolveSubmit: ((value: View) => void) | undefined

        dispatchMock.mockImplementation((action) => {
            if (action === submitViewAction) {
                return new Promise<View>((resolve) => {
                    resolveSubmit = resolve
                })
            }

            return action
        })

        renderComponent()

        await user.click(screen.getByRole('button', { name: /update view/i }))

        expect(screen.getByRole('button', { name: /^delete$/i })).toBeDisabled()

        resolveSubmit?.(updatedResponse)

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /^delete$/i }),
            ).toBeEnabled()
        })
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

        await user.click(screen.getByRole('button', { name: /^delete$/i }))
        await user.click(screen.getByRole('button', { name: /confirm/i }))

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

        await user.click(screen.getByRole('button', { name: /^delete$/i }))
        await user.click(screen.getByRole('button', { name: /confirm/i }))

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

    it('shows the shared delete confirmation copy for public views', async () => {
        const user = userEvent.setup()
        const publicView = activeView.set('visibility', 'public')

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getActiveView) return publicView
            if (selector === getPristineActiveView) return publicView
            if (selector === getAreFiltersValid) return true
            if (selector === getIsDirty) return false
            if (selector === getCurrentUser) return currentUser
            if (selector === getHasAutomate) return true
            if (selector === getSchemas) return fromJS({})
            return undefined
        })

        renderComponent()

        await user.click(screen.getByRole('button', { name: /^delete$/i }))

        expect(screen.getByText('Are you sure?')).toBeInTheDocument()
        expect(
            screen.getByText(
                'You are about to delete this view for all users.',
            ),
        ).toBeInTheDocument()
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
