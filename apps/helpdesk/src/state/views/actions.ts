import { history } from '@repo/routing'
import type { AxiosError, CancelToken } from 'axios'
import { isCancel } from 'axios'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import _chunk from 'lodash/chunk'
import type { Moment } from 'moment'
import { notify as updateNotification } from 'reapop'
import type { UpsertNotificationAction } from 'reapop/dist/reducers/notifications/actions'

import type { JobType } from '@gorgias/helpdesk-queries'
import type { OrderDirection } from '@gorgias/helpdesk-types'

import * as viewsConfig from 'config/views'
import type { SearchRank } from 'hooks/useSearchRankScenario'
import client from 'models/api/resources'
import type { ApiListResponseLegacyPagination } from 'models/api/types'
import { deepMapKeysToSnakeCase } from 'models/api/utils'
import { searchCustomersWithHighlights } from 'models/customer/resources'
import { JOBS_PATH } from 'models/job/resources'
import type { Job } from 'models/job/types'
import { search, SEARCH_ENGINE_HEADER } from 'models/search/resources'
import type {
    SearchEngine,
    SearchType,
    TicketSearchSortableProperties,
} from 'models/search/types'
import { CUSTOMER_SEARCH_ORDERING } from 'models/search/types'
import { searchTicketsWithHighlights } from 'models/ticket/resources'
import type { Ticket } from 'models/ticket/types'
import { fetchViewsPaginated } from 'models/view/resources'
import type { View } from 'models/view/types'
import { ViewType } from 'models/view/types'
import GorgiasApi from 'services/gorgiasApi'
import socketManager from 'services/socketManager/socketManager'
import { JoinEventType, SocketEventType } from 'services/socketManager/types'
import { notify } from 'state/notifications/actions'
import type { Notification } from 'state/notifications/types'
import { NotificationStatus } from 'state/notifications/types'
import type { RootState, StoreDispatch } from 'state/types'
import * as types from 'state/views/constants'
import * as viewsSelectors from 'state/views/selectors'
import type {
    FetchViewItemsOptions,
    FieldSearchResult,
    ViewFilter,
    ViewImmutable,
} from 'state/views/types'
import { ViewNavDirection } from 'state/views/types'
import { activeViewUrl } from 'state/views/utils'
import {
    getHashOfObj,
    getPluralObjectName,
    isCurrentlyOnTicket,
    isCurrentlyOnView,
} from 'utils'
import { getMoment } from 'utils/date'
import { buildJobMessage } from 'utils/notificationUtils'

export const setViewActive =
    (view: ViewImmutable) =>
    (dispatch: StoreDispatch): ReturnType<StoreDispatch> => {
        if (view) {
            socketManager.join(JoinEventType.View, view.get('id'))
        }

        dispatch(addRecentView(view.get('id') as number) as any)

        return dispatch({
            type: types.SET_VIEW_ACTIVE,
            view,
        })
    }

export const updateView = (view?: Maybe<ViewImmutable>, edit = true) => ({
    type: types.UPDATE_VIEW,
    view,
    edit,
})

export const setViewEditMode = (view?: Maybe<ViewImmutable>) => ({
    type: types.ACTIVATE_VIEW_EDIT_MODE,
    view,
})

export const toggleViewSelection = () => ({
    type: types.TOGGLE_VIEW_SELECTION,
})

export const setOrderDirection =
    ({
        direction,
        fieldPath,
        isEditable,
    }: {
        direction?: OrderDirection
        fieldPath: string
        isEditable: boolean
    }) =>
    (dispatch: StoreDispatch) => {
        dispatch({
            type: types.SET_ORDER_DIRECTION,
            fieldPath,
            direction,
        })

        dispatch(updateView(undefined, isEditable))
    }

export const setFieldVisibility =
    (name: string, state: boolean, shouldStoreFieldConfig?: boolean) =>
    (dispatch: StoreDispatch) => {
        dispatch({
            type: types.SET_FIELD_VISIBILITY,
            name,
            state,
            shouldStoreFieldConfig,
        })

        dispatch(updateView())
    }

// add filter for 1 field
export const addFieldFilter = (field: string, filter: ViewFilter) => ({
    type: types.ADD_VIEW_FIELD_FILTER,
    field,
    filter,
})

// remove a filter based on index
export const removeFieldFilter = (index: number) => ({
    type: types.REMOVE_VIEW_FIELD_FILTER,
    index,
})

// update a filter value
export const updateFieldFilter = (
    index: number,
    value: string | number | boolean | Array<any> | undefined,
) => ({
    type: types.UPDATE_VIEW_FIELD_FILTER,
    index,
    value,
})

// update selected custom field filter id
export const updateCustomFieldFilterId = (
    index: number,
    customFieldId: number,
    customFieldOperator: string,
) => ({
    type: types.UPDATE_VIEW_CUSTOM_FIELD_FILTER_ID,
    index,
    customFieldId,
    customFieldOperator,
})

export const updateQAScoreFilterDimension = (
    index: number,
    qaScoreDimension: string,
) => {
    return {
        type: types.UPDATE_VIEW_QA_SCORE_FILTER_DIMENSION,
        index,
        qaScoreDimension,
    }
}

// update a filter operator based on index
export const updateFieldFilterOperator = (index: number, operator: string) => ({
    type: types.UPDATE_VIEW_FIELD_FILTER_OPERATOR,
    index,
    operator,
})

export function fieldEnumSearch(
    field: Map<any, any>,
    query: string,
    cancelToken?: CancelToken,
) {
    return (): Promise<Maybe<List<any>>> => {
        const data = (field.get('filter') as Map<any, any>).toJS() as Record<
            string,
            unknown
        >
        return search<unknown>({
            type: data.type as SearchType,
            query,
            cancelToken,
        }).then(
            (resp) => {
                return fromJS(resp.data) as List<
                    Map<keyof FieldSearchResult, FieldSearchResult>
                >
            },
            (error: AxiosError) => {
                return Promise.reject(error)
            },
        )
    }
}

export const resetView = (configName?: string) => {
    return {
        type: types.RESET_VIEW,
        configName,
    }
}

export function fetchViews(currentViewId: string) {
    return async (dispatch: StoreDispatch) => {
        dispatch({
            type: types.FETCH_VIEW_LIST_START,
        })

        const client = new GorgiasApi()
        const generator = client.cursorPaginate(fetchViewsPaginated)

        let result: View[] = []
        try {
            for await (const page of generator) {
                result = result.concat(page)
            }
            dispatch(fetchViewsSuccess({ data: result }, currentViewId))
        } catch (error) {
            dispatch({
                type: types.FETCH_VIEW_LIST_ERROR,
                error,
                reason: 'Failed to fetch views',
            })
        }
    }
}

export function fetchViewsSuccess(
    data: { data: View[] },
    currentViewId?: string,
) {
    return (dispatch: StoreDispatch) => {
        dispatch({
            type: types.FETCH_VIEW_LIST_SUCCESS,
            resp: data,
            currentViewId,
        })
    }
}

export function setPage(page: number) {
    return {
        type: types.SET_PAGE,
        page,
    }
}

export function submitView(view: ViewImmutable) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        const isUpdate = !!view.get('id')
        const objectName = getPluralObjectName(view.get('type', ''))
        const viewToSend = view
            .delete('dirty')
            .delete('editMode')
            .delete('allItemsSelected')
            .delete('filters_ast')
            .delete('search')

        dispatch({
            type: types.SUBMIT_VIEW_START,
        })

        let promise

        if (isUpdate) {
            promise = client.put<View>(
                `/api/views/${view.get('id') as number}/`,
                viewToSend
                    .delete('visibility')
                    .delete('shared_with_teams')
                    .delete('shared_with_users')
                    .toJS(),
            )
        } else {
            promise = client.post<View>(
                '/api/views/',
                viewToSend.delete('id').toJS(),
            )
        }

        return promise
            .then((json) => json?.data)
            .then(
                (resp) => {
                    // redirect to the view created
                    if (!isUpdate) {
                        dispatch({
                            type: types.SUBMIT_NEW_VIEW_SUCCESS,
                            resp,
                        })

                        history.push(
                            `/app/${objectName}/${resp.id}/${encodeURIComponent(
                                resp.slug,
                            )}`,
                        )
                    }
                    return Promise.resolve(resp)
                },
                (error) => {
                    return dispatch({
                        type: isUpdate
                            ? types.SUBMIT_UPDATE_VIEW_ERROR
                            : types.SUBMIT_NEW_VIEW_ERROR,
                        error,
                        reason: 'Failed to submit view. Please try again',
                    })
                },
            )
    }
}

export function deleteView(view: ViewImmutable) {
    return (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Promise<ReturnType<StoreDispatch>> => {
        const vType: ViewType = view.get('type', ViewType.TicketList)
        const otherViewsOfType = (
            getState().views.get('items', fromJS([])) as List<any>
        ).filter(
            (v: Map<any, any>) =>
                v.get('type', ViewType.TicketList) === vType &&
                v.get('id') !== view.get('id'),
        ) as List<any>

        if (otherViewsOfType.size === 0) {
            return dispatch(
                notify({
                    status: NotificationStatus.Error,
                    title: 'This view cannot be deleted',
                    message:
                        'This is your last view, it needs to exist in order for the helpdesk to function correctly.',
                }),
            )
        }

        return client.delete(`/api/views/${view.get('id') as number}/`).then(
            () => {
                const destinationView = otherViewsOfType.first() as Map<
                    any,
                    any
                >
                dispatch(setViewActive(destinationView))
                return Promise.resolve(destinationView)
            },
            (error) => {
                return dispatch({
                    type: 'ERROR',
                    error,
                    reason: `Failed to delete the view ${
                        view.get('name') as string
                    }`,
                })
            },
        )
    }
}

export const deleteViewSuccess =
    (viewId: number) =>
    (dispatch: StoreDispatch, getState: () => RootState): void => {
        dispatch({
            type: types.DELETE_VIEW_SUCCESS,
            viewId,
        })

        // redirect to first view of the same type if it's the currently active view
        const state = getState().views
        if (state.getIn(['active', 'id']) === viewId) {
            const destinationView = (state.get('items') as List<any>).find(
                (v: Map<any, any>) =>
                    v.get('type') === state.getIn(['active', 'type']),
            ) as Map<any, any>
            dispatch(setViewActive(destinationView))
        }
    }

export function fetchViewItems(
    direction: Maybe<ViewNavDirection> = null,
    cursor?: Maybe<string>,
    isPolling: Maybe<boolean> = false,
    searchRank?: SearchRank | null,
    params?: FetchViewItemsOptions,
    cancelToken?: CancelToken,
) {
    return async (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Promise<ReturnType<StoreDispatch>> => {
        const options = cancelToken ? { cancelToken } : {}
        let state = getState()
        const activeView = viewsSelectors.getActiveView(state)
        const activeViewType = activeView.get('type')
        const viewConfig = viewsConfig.getConfigByType(activeViewType)
        const navigation = viewsSelectors.getNavigation(state)
        const shouldRegisterSearchRankRequest = !direction && !cursor

        const viewId: string = activeView.get('id')

        let url = `/api/views/${viewId}/items/`

        if (cursor) {
            url = `${url}?cursor=${cursor}`
        } else if (direction === ViewNavDirection.NextView) {
            url = navigation.get('next_items')
        } else if (direction === ViewNavDirection.PrevView) {
            url = navigation.get('prev_items')
        }
        const isDirty = viewsSelectors.isDirty(state)
        const isEditMode = viewsSelectors.isEditMode(state)

        if (activeView.get('deactivated_datetime')) {
            return Promise.resolve()
        }

        if (!viewsSelectors.hasActiveView(state)) {
            return Promise.resolve()
        }

        if (!isDirty && !viewId) {
            return Promise.resolve()
        }

        const filtersHash = getHashOfObj(
            viewsSelectors.getActiveViewFilters(state),
        )
        let promise

        dispatch({
            type: types.FETCH_LIST_VIEW_START,
            viewId,
            discreet: isPolling,
        })

        const isTicketSearch =
            activeView.get('search') != null &&
            activeViewType === ViewType.TicketList
        const isCustomerSearch =
            activeView.get('search') != null &&
            activeViewType === ViewType.CustomerList

        const nextCursor: Maybe<string> = navigation.get('next_cursor')
        const prevCursor: Maybe<string> = navigation.get('prev_cursor')
        const cursorParam =
            cursor ||
            (direction === ViewNavDirection.NextView && nextCursor) ||
            (direction === ViewNavDirection.PrevView && prevCursor) ||
            undefined

        if (isTicketSearch) {
            promise = searchTicketsWithHighlights({
                search: activeView.get('search'),
                filters: activeView.get('filters'),
                cursor: cursorParam,
                trackTotalHits: true,
                cancelToken,
                ...params,
            })
        } else if (isCustomerSearch) {
            promise = searchCustomersWithHighlights({
                search: activeView.get('search'),
                cursor: cursorParam,
                orderBy: CUSTOMER_SEARCH_ORDERING,
                cancelToken,
            })
        } else if (
            isDirty &&
            isEditMode &&
            activeViewType === ViewType.TicketList
        ) {
            // when a view is dirty, just send the whole view data rather than just the id
            // this will allow us to test a view before submitting it to the DB
            promise = searchTicketsWithHighlights({
                search: activeView.get('search') || '',
                filters: activeView.get('filters'),
                cursor: cursorParam,
                orderBy: 'last_message_datetime:desc',
                cancelToken,
                ...params,
            })
        } else {
            promise = client.get<ApiListResponseLegacyPagination<Ticket[]>>(
                url,
                {
                    ...options,
                    // only send params if we're not in edit mode -
                    // i.e. view orderBy was modified without opening the view edition
                    ...(params && isDirty
                        ? { params: deepMapKeysToSnakeCase(params) }
                        : {}),
                    headers: { 'x-gorgias-search-engine': 'ES' },
                },
            )
        }

        searchRank?.endScenario()
        if (shouldRegisterSearchRankRequest) {
            searchRank?.registerResultsRequest({
                query: activeView.get('search'),
                requestTime: Date.now(),
            })
        }
        return promise.then(
            (resp) => {
                if (shouldRegisterSearchRankRequest) {
                    searchRank?.registerResultsResponse({
                        numberOfResults: resp.data?.data?.length ?? 0,
                        responseTime: Date.now(),
                        searchEngine:
                            resp.headers &&
                            (
                                resp.headers as Partial<
                                    Record<
                                        typeof SEARCH_ENGINE_HEADER,
                                        SearchEngine
                                    >
                                >
                            )[SEARCH_ENGINE_HEADER],
                    })
                }

                state = getState()

                // If it's a background polling, or we're not on the first page, don't update displayed items because
                // polling is only enabled on the first page.
                if (isPolling && !viewsSelectors.isOnFirstPage(state)) {
                    return
                }

                const viewHasChanged =
                    viewsSelectors.getActiveView(state).get('id') !== viewId ||
                    filtersHash !==
                        getHashOfObj(viewsSelectors.getActiveViewFilters(state))

                if (viewHasChanged) {
                    return
                }

                dispatch({
                    type: types.FETCH_LIST_VIEW_SUCCESS,
                    viewType: activeViewType,
                    fetched: resp.data,
                })
            },
            (error: AxiosError) => {
                if (isCancel(error)) {
                    return Promise.resolve()
                }
                return dispatch({
                    type: types.FETCH_LIST_VIEW_ERROR,
                    error,
                    reason: `Failed to fetch list of ${
                        viewConfig.get('plural') as string
                    }`,
                }) as unknown as Promise<ReturnType<StoreDispatch>>
            },
        )
    }
}

export function updateSelectedItemsIds(ids: List<any>) {
    return {
        type: types.UPDATE_PAGE_SELECTION,
        ids,
    }
}

export function toggleIdInSelectedItemsIds(id: number) {
    return {
        type: types.TOGGLE_ID_IN_PAGE_SELECTION,
        id,
    }
}

export function createJob(
    view: Map<any, any>,
    jobType: JobType,
    jobPartialParams: Record<string, unknown>,
) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        let requestPayload: {
            type: JobType
            scheduled_datetime: Moment
            params: Record<string, unknown>
        }
        if (view.get('dirty', false)) {
            requestPayload = {
                type: jobType,
                scheduled_datetime: getMoment().add(15, 'second'),
                params: Object.assign(
                    {},
                    {
                        view: view
                            .remove('id')
                            .remove('allItemsSelected')
                            .remove('dirty')
                            .remove('editMode')
                            .remove('shared_with_teams')
                            .remove('shared_with_users')
                            .remove('slug')
                            .remove('uri')
                            .toJS(),
                    },
                    jobPartialParams,
                ),
            }
        } else {
            requestPayload = {
                type: jobType,
                scheduled_datetime: getMoment().add(15, 'second'),
                params: Object.assign(
                    {},
                    { view_id: view.get('id') },
                    jobPartialParams,
                ),
            }
        }

        const notification = dispatch(
            notify({
                status: NotificationStatus.Loading,
                dismissAfter: 10000,
                closeOnNext: true,
                message: buildJobMessage(
                    jobType,
                    true,
                    viewsConfig.getConfigByType(view.get('type')).get('plural'),
                    jobPartialParams,
                ),
                buttons: [],
            }),
        ) as unknown as UpsertNotificationAction

        return client
            .post<Job>(JOBS_PATH, requestPayload)
            .then((json) => json?.data)
            .then(
                (job) => {
                    notification.payload.status = NotificationStatus.Success
                    notification.payload.buttons = [
                        {
                            name: 'Cancel',
                            primary: true,
                            onClick: () => {
                                return client
                                    .delete<void>(`/api/jobs/${job.id}`)
                                    .then((json) => {
                                        notification.payload.buttons = []
                                        return json.data
                                    })
                                    .then(
                                        () => {
                                            notification.payload.status =
                                                NotificationStatus.Success
                                            notification.payload.message =
                                                'The job has been canceled.'
                                            return dispatch(
                                                notify(
                                                    notification.payload as Notification,
                                                ),
                                            )
                                        },
                                        (
                                            error: AxiosError<{
                                                error: { msg: string }
                                            }>,
                                        ) => {
                                            notification.payload.status =
                                                NotificationStatus.Error
                                            notification.payload.message =
                                                error.response?.data.error.msg
                                            return dispatch(
                                                notify(
                                                    notification.payload as Notification,
                                                ),
                                            )
                                        },
                                    )
                            },
                        },
                    ]
                    return dispatch(
                        updateNotification(notification.payload),
                    ) as unknown as Promise<ReturnType<StoreDispatch>>
                },
                (error: AxiosError<{ error: { msg: string } }>) => {
                    notification.payload.status = NotificationStatus.Error
                    if (error.response?.status === 403) {
                        notification.payload.message =
                            error.response.data.error.msg
                    } else {
                        notification.payload.message =
                            'Failed to apply action on ' +
                            (viewsConfig
                                .getConfigByType(view.get('type'))
                                .get('plural') as string) +
                            ' view. Please try again.'
                    }
                    dispatch(updateNotification(notification.payload))
                    throw error
                },
            )
    }
}

/**
 * Handle views item count update
 */
export const handleViewsCount = (counts: {
    [key: string]: number
}): ReturnType<StoreDispatch> => ({
    type: types.UPDATE_COUNTS,
    counts,
})

/**
 * Add a view to the recent views
 */
export const addRecentView = (viewId: number): ReturnType<StoreDispatch> => ({
    type: types.ADD_RECENT_VIEW,
    viewId,
})

export const fetchActiveViewTickets =
    () =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Maybe<Promise<ReturnType<StoreDispatch>>> => {
        const state = getState()
        const shouldFetchActiveViewTickets =
            viewsSelectors.shouldFetchActiveViewTickets(state)
        const isDirty = viewsSelectors.isDirty(state)
        const viewOrderBy = viewsSelectors.getActiveViewOrderBy(
            state,
        ) as ValueOf<typeof TicketSearchSortableProperties>
        const viewOrderDir = viewsSelectors.getActiveViewOrderDirection(state)

        if (!shouldFetchActiveViewTickets) return
        return dispatch(
            fetchViewItems(
                null,
                null,
                true,
                undefined,
                isDirty
                    ? { orderBy: `${viewOrderBy}:${viewOrderDir}` }
                    : undefined,
            ),
        )
    }

export const fetchVisibleViewsCounts =
    () => (dispatch: StoreDispatch, getState: () => RootState) => {
        const state = getState()
        const viewIdsChunks = _chunk(
            viewsSelectors
                .getViewIdsOrderedByCollapsedSections()(state)
                .toJS() as number[],
            10,
        )

        function sendNextChunk(chunks: number[][]) {
            socketManager.send(SocketEventType.ViewsCountExpired, {
                viewIds: chunks.shift(),
                all: true,
            })
            if (chunks.length) {
                setTimeout(() => sendNextChunk(chunks), 500)
            }
        }

        sendNextChunk(viewIdsChunks)
    }

export const fetchRecentViewsCounts =
    () => (dispatch: StoreDispatch, getState: () => RootState) => {
        // do not fetch views counts when the current user is not doing support
        if (!isCurrentlyOnTicket() && !isCurrentlyOnView()) {
            return
        }

        const viewIds = viewsSelectors.getExpiredViewsCounts()(getState())
        if (viewIds.length) {
            dispatch(updateRecentViews(viewIds))
            socketManager.send(SocketEventType.ViewsCountExpired, { viewIds })
        }
    }

/**
 * Update updated datetime of recent views
 */
export const updateRecentViews = (viewIds: number[]) => ({
    type: types.UPDATE_RECENT_VIEWS,
    viewIds,
})

/**
 * Go to the parent view
 */
export const goToActiveView =
    () => (dispatch: StoreDispatch, getState: () => RootState) => {
        const state = getState()
        const activeView = viewsSelectors.getActiveView(state)
        const navigation = viewsSelectors.getNavigation(state)
        const currentLocation = history.location
        const newUrl = activeViewUrl(activeView, currentLocation, navigation)

        history.push(newUrl)

        dispatch({ type: types.GOTO_ACTIVE_VIEW })
    }
