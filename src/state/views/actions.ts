import axios, {CancelToken, AxiosError} from 'axios'
import {fromJS, List, Map} from 'immutable'
import _max from 'lodash/max'
import {Moment} from 'moment'
import {browserHistory} from 'react-router'
import {updateNotification} from 'reapop'

import * as viewsConfig from '../../config/views'
import {BASE_VIEW_ID} from '../../constants/view.js'
import {OrderDirection, ApiListResponsePagination} from '../../models/api/types'
import {Job, JobType} from '../../models/job/types'
import {Ticket} from '../../models/ticket/types'
import {notify} from '../notifications/actions'
import {NotificationStatus, Notification} from '../notifications/types'
import socketManager from '../../services/socketManager/socketManager'
import {
    SocketEventType,
    JoinEventType,
} from '../../services/socketManager/types'
import {
    getHashOfObj,
    getPluralObjectName,
    isCurrentlyOnTicket,
    isCurrentlyOnView,
} from '../../utils'
import {buildJobMessage} from '../../utils/notificationUtils'
import {getMoment} from '../../utils/date'
import {StoreDispatch, RootState} from '../types'

import {activeViewUrl} from './utils'
import * as viewsSelectors from './selectors'
import * as types from './constants.js'
import {
    ViewFilter,
    ViewImmutable,
    ViewNavDirection,
    View,
    ViewType,
} from './types'

export const setViewActive = (view: ViewImmutable) => (
    dispatch: StoreDispatch
): ReturnType<StoreDispatch> => {
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

export const setViewEditMode = (view: Maybe<ViewImmutable>) => ({
    type: types.ACTIVATE_VIEW_EDIT_MODE,
    view,
})

export const toggleViewSelection = () => ({
    type: types.TOGGLE_VIEW_SELECTION,
})

export const setOrderDirection = (
    fieldPath: string,
    direction: OrderDirection = OrderDirection.Asc
) => (dispatch: StoreDispatch) => {
    dispatch({
        type: types.SET_ORDER_DIRECTION,
        fieldPath,
        direction,
    })

    dispatch(updateView())
}

export const setFieldVisibility = (name: string, state: boolean) => (
    dispatch: StoreDispatch
) => {
    dispatch({
        type: types.SET_FIELD_VISIBILITY,
        name,
        state,
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
    value: string | number | Array<any>
) => ({
    type: types.UPDATE_VIEW_FIELD_FILTER,
    index,
    value,
})

// remove a filter based on index
export const updateFieldFilterOperator = (index: number, operator: string) => ({
    type: types.UPDATE_VIEW_FIELD_FILTER_OPERATOR,
    index,
    operator,
})

export function fieldEnumSearch(
    field: Map<any, any>,
    query: string,
    cancelToken?: CancelToken
) {
    return (): Promise<Maybe<List<any>>> => {
        const data = (field.get('filter') as Map<any, any>).toJS() as Record<
            string,
            unknown
        >
        data.query = query

        return axios
            .post<ApiListResponsePagination<unknown[]>>('/api/search/', data, {
                cancelToken,
            })
            .then((json) => json?.data)
            .then(
                (resp) => {
                    return fromJS(resp.data) as List<any>
                },
                (error: AxiosError) => {
                    return Promise.reject(error)
                }
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
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: types.FETCH_VIEW_LIST_START,
        })

        return axios
            .get<{data: View[]}>('/api/views/')
            .then((json) => json?.data)
            .then(
                (resp) => {
                    dispatch({
                        type: types.FETCH_VIEW_LIST_SUCCESS,
                        resp,
                        currentViewId,
                    })
                },
                (error) => {
                    dispatch({
                        type: types.FETCH_VIEW_LIST_ERROR,
                        error,
                        reason: 'Failed to fetch views',
                    })
                }
            )
    }
}

export function setPage(page: number) {
    return {
        type: types.SET_PAGE,
        page,
    }
}

export function submitView(view: ViewImmutable) {
    return (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): Promise<ReturnType<StoreDispatch>> => {
        const {views} = getState()
        const isUpdate = !!view.get('id')
        const objectName = getPluralObjectName(view.get('type', ''))

        dispatch({
            type: types.SUBMIT_VIEW_START,
        })

        let promise

        if (isUpdate) {
            promise = axios.put<View>(
                `/api/views/${view.get('id') as number}/`,
                view
                    .delete('dirty')
                    .delete('editMode')
                    .delete('allItemsSelected')
                    .delete('visibility')
                    .delete('shared_with_teams')
                    .delete('shared_with_users')
                    .toJS()
            )
        } else {
            const orders = ((views.get('items', fromJS([])) as List<any>)
                .filter(
                    (item: Map<any, any>) =>
                        item.get('type') === view.get('type')
                )
                .map(
                    (item: Map<any, any>) =>
                        item.get('display_order', 0) as number
                )
                .toJS() as number[]) || [0]
            promise = axios.post<View>(
                '/api/views/',
                view
                    .set('display_order', (_max(orders) as number) + 1)
                    .delete('id')
                    .delete('dirty')
                    .delete('editMode')
                    .delete('allItemsSelected')
                    .toJS()
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

                        browserHistory.push(
                            `/app/${objectName}/${resp.id}/${resp.slug}`
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
                }
            )
    }
}

export function deleteView(view: ViewImmutable) {
    return (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): Promise<ReturnType<StoreDispatch>> => {
        const vType = view.get('type', 'ticket-list') as ViewType
        const otherViewsOfType = (getState().views.get(
            'items',
            fromJS([])
        ) as List<any>).filter(
            (v: Map<any, any>) =>
                v.get('type', 'ticket-list') === vType &&
                v.get('id') !== view.get('id')
        ) as List<any>

        if (otherViewsOfType.size === 0) {
            return dispatch(
                notify({
                    status: NotificationStatus.Error,
                    title: 'This view cannot be deleted',
                    message:
                        'This is your last view, it needs to exist in order for the helpdesk to function correctly.',
                })
            )
        }

        return axios.delete(`/api/views/${view.get('id') as number}/`).then(
            () => {
                const viewConfig = viewsConfig.getConfigByType(vType)
                const destinationView = otherViewsOfType.first() as Map<
                    any,
                    any
                >
                const destinationRoute = `/app/${
                    viewConfig.get('routeList') as string
                }/${destinationView.get('id') as number}/${
                    destinationView.get('slug') as string
                }`
                dispatch(setViewActive(destinationView))
                browserHistory.push(destinationRoute)
                return Promise.resolve()
            },
            (error) => {
                return dispatch({
                    type: 'ERROR',
                    error,
                    reason: `Failed to delete the view ${
                        view.get('name') as string
                    }`,
                })
            }
        )
    }
}

export const deleteViewSuccess = (viewId: number) => (
    dispatch: StoreDispatch,
    getState: () => RootState
) => {
    dispatch({
        type: types.DELETE_VIEW_SUCCESS,
        viewId,
    })

    // redirect to first view of the same type if it's the currently active view
    const state = getState().views
    if (state.getIn(['active', 'id']) === viewId) {
        const viewConfig = viewsConfig.getConfigByType(
            state.getIn(['active', 'type'])
        )
        const destinationView = (state.get('items') as List<any>).find(
            (v: Map<any, any>) => {
                return v.get('type') === state.getIn(['active', 'type'])
            }
        ) as Map<any, any>
        const destinationRoute = `/app/${
            viewConfig.get('routeList') as string
        }/${destinationView.get('id') as number}/${
            destinationView.get('slug') as string
        }`
        dispatch(setViewActive(destinationView))
        browserHistory.push(destinationRoute)
    }
}

// Fetch a page of items of a view (tickets or customers) based on the provided cursor and direction.
export function fetchViewItems(
    direction: Maybe<ViewNavDirection> = null,
    cursor?: Maybe<string>,
    isPolling: Maybe<boolean> = false,
    cancelToken?: CancelToken
) {
    return (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): Promise<ReturnType<StoreDispatch>> => {
        const options = cancelToken ? {cancelToken} : {}
        let state = getState()
        const activeView = viewsSelectors.getActiveView(state)
        const activeViewType = activeView.get('type')
        const viewConfig = viewsConfig.getConfigByType(activeViewType)
        const navigation = viewsSelectors.getNavigation(state)

        const viewId = activeView.get('id') as number

        let url = `/api/views/${viewId}/items/`

        if (cursor) {
            url = `${url}?cursor=${cursor}`
        } else if (direction === ViewNavDirection.NextView) {
            url = navigation.get('next_items')
        } else if (direction === ViewNavDirection.PrevView) {
            url = navigation.get('prev_items')
        }
        const isDirty = viewsSelectors.isDirty(state)

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
            viewsSelectors.getActiveViewFilters(state)
        )

        dispatch({
            type: types.FETCH_LIST_VIEW_START,
            viewId,
            discreet: isPolling,
        })

        let promise

        // when a view is dirty, just send the whole view data rather than just the id
        // this will allow us to test a view before submitting it to the DB
        if (isDirty) {
            promise = axios.put<ApiListResponsePagination<Ticket[]>>(
                url,
                {
                    view: activeView
                        .delete('dirty')
                        .delete('editMode')
                        .delete('allItemsSelected')
                        .toJS(),
                },
                options
            )
        } else {
            promise = axios.get<ApiListResponsePagination<Ticket[]>>(
                url,
                options
            )
        }

        return promise
            .then((json) => json?.data)
            .then(
                (data) => {
                    state = getState()

                    // If it's a background polling, or we're not on the first page, don't update displayed items because
                    // polling is only enabled on the first page.
                    if (isPolling && !viewsSelectors.isOnFirstPage(state)) {
                        return
                    }

                    const viewHasChanged =
                        viewsSelectors.getActiveView(state).get('id') !==
                            viewId ||
                        filtersHash !==
                            getHashOfObj(
                                viewsSelectors.getActiveViewFilters(state)
                            )

                    if (viewHasChanged) {
                        return
                    }

                    dispatch({
                        type: types.FETCH_LIST_VIEW_SUCCESS,
                        viewType: activeViewType,
                        data,
                    })
                },
                (error: AxiosError) => {
                    if (axios.isCancel(error)) {
                        return Promise.resolve()
                    }
                    return (dispatch({
                        type: types.FETCH_LIST_VIEW_ERROR,
                        error,
                        reason: `Failed to fetch list of ${
                            viewConfig.get('plural') as string
                        }`,
                    }) as unknown) as Promise<ReturnType<StoreDispatch>>
                }
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
    view: ViewImmutable,
    jobType: JobType,
    jobPartialParams: Record<string, unknown>
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
                scheduled_datetime: (getMoment() as Moment).add(15, 'second'),
                params: Object.assign(
                    {},
                    {
                        view: view
                            .remove('dirty')
                            .remove('editMode')
                            .remove('uri')
                            .remove('allItemsSelected')
                            .remove('slug')
                            .remove('id')
                            .toJS(),
                    },
                    jobPartialParams
                ),
            }
        } else {
            requestPayload = {
                type: jobType,
                scheduled_datetime: (getMoment() as Moment).add(15, 'second'),
                params: Object.assign(
                    {},
                    {view_id: view.get('id')},
                    jobPartialParams
                ),
            }
        }

        const notification = (dispatch(
            notify({
                status: NotificationStatus.Loading,
                dismissAfter: 10000,
                closeOnNext: true,
                message: buildJobMessage(
                    jobType,
                    true,
                    viewsConfig.getConfigByType(view.get('type')).get('plural'),
                    jobPartialParams
                ),
                buttons: [],
            })
        ) as unknown) as Notification

        return axios
            .post<Job>('/api/jobs/', requestPayload)
            .then((json) => json?.data)
            .then(
                (job) => {
                    notification.status = NotificationStatus.Success
                    notification.buttons = [
                        {
                            name: 'Cancel',
                            primary: true,
                            onClick: () => {
                                return axios
                                    .delete<void>(`/api/jobs/${job.id}`)
                                    .then((json) => {
                                        notification.buttons = []
                                        return json.data
                                    })
                                    .then(
                                        () => {
                                            notification.status =
                                                NotificationStatus.Success
                                            notification.message =
                                                'The job has been canceled.'
                                            return dispatch(
                                                notify(notification)
                                            )
                                        },
                                        (
                                            error: AxiosError<{
                                                error: {msg: string}
                                            }>
                                        ) => {
                                            notification.status =
                                                NotificationStatus.Error
                                            notification.message =
                                                error.response?.data.error.msg
                                            return dispatch(
                                                notify(notification)
                                            )
                                        }
                                    )
                            },
                        },
                    ]
                    return dispatch(
                        //eslint-disable-next-line @typescript-eslint/no-unsafe-call
                        updateNotification(notification)
                    ) as Promise<ReturnType<StoreDispatch>>
                },
                (error: AxiosError<{error: {msg: string}}>) => {
                    notification.status = NotificationStatus.Error
                    if (error.response?.status === 403) {
                        notification.message = error.response.data.error.msg
                    } else {
                        notification.message =
                            'Failed to apply action on ' +
                            (viewsConfig
                                .getConfigByType(view.get('type'))
                                .get('plural') as string) +
                            ' view. Please try again.'
                    }
                    //eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    dispatch(updateNotification(notification))
                    throw error
                }
            )
    }
}

/**
 * Handle views item count update
 */
export const handleViewsCount = (counts: {
    counts: number
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

export const fetchActiveViewTickets = () => (
    dispatch: StoreDispatch,
    getState: () => RootState
): Maybe<Promise<ReturnType<StoreDispatch>>> => {
    const state = getState()
    const viewsState = viewsSelectors.getViewsState(state)
    const activeView = viewsSelectors.getActiveView(state)
    const isFetchingView =
        viewsSelectors.isLoading('fetchList')(state) ||
        viewsSelectors.isLoading('fetchListDiscreet')(state)
    const isEditing = activeView.get('editMode') || false

    const shouldUpdateView =
        activeView.get('id') !== BASE_VIEW_ID &&
        isCurrentlyOnView(activeView.get('id'), viewsState) &&
        viewsSelectors.isOnFirstPage(state)

    if (!shouldUpdateView || isFetchingView || isEditing) {
        return
    }

    return dispatch(fetchViewItems(null, null, true))
}

export const fetchVisibleViewsCounts = () => (
    dispatch: StoreDispatch,
    getState: () => RootState
) => {
    const state = getState()
    const viewIds = viewsSelectors.getVisibleViewIds()(state).toJS() as number[]
    socketManager.send(SocketEventType.ViewsCountExpired, {
        viewIds,
        all: true,
    })
}

export const fetchRecentViewsCounts = () => (
    dispatch: StoreDispatch,
    getState: () => RootState
) => {
    // do not fetch views counts when the current user is not doing support
    if (!isCurrentlyOnTicket() && !isCurrentlyOnView()) {
        return
    }

    const state = getState()
    const activeViewId = viewsSelectors.getActiveView(state).get('id')
    let viewIds = viewsSelectors.getExpiredViewsCounts(
        viewsConfig.RECENT_VIEWS_COUNTS_TIMEOUT
    )(state)

    if (viewIds.isEmpty()) {
        return
    }

    const activeViewIndex = viewIds.indexOf(activeViewId)
    // there is already a polling system on ticket view
    // which fetch view count for the active view
    // so if the user is on a view, we don't have to fetch new counts for the active view
    if (isCurrentlyOnView() && ~activeViewIndex) {
        viewIds = viewIds.delete(activeViewIndex)
    }

    if (!viewIds.isEmpty()) {
        dispatch(updateRecentViews(viewIds.toJS()))
        socketManager.send(SocketEventType.ViewsCountExpired, {
            viewIds: viewIds.toJS(),
        })
    }
}

export const fetchActiveViewCount = () => (
    dispatch: StoreDispatch,
    getState: () => RootState
) => {
    const state = getState()
    const activeViewId = viewsSelectors.getActiveView(state).get('id')
    const viewIds = viewsSelectors.getExpiredViewsCounts(
        viewsConfig.ACTIVE_VIEW_COUNT_TIMEOUT
    )(state)

    if (viewIds.includes(activeViewId)) {
        dispatch(updateRecentViews([activeViewId]))
        socketManager.send(SocketEventType.ViewsCountExpired, {
            viewIds: [activeViewId],
        })
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
export const gotoActiveView = () => (
    dispatch: StoreDispatch,
    getState: () => RootState
) => {
    const state = getState()
    const activeView = viewsSelectors.getActiveView(state)
    const navigation = viewsSelectors.getNavigation(state)
    const currentLocation = browserHistory.getCurrentLocation()
    const newUrl = activeViewUrl(activeView, currentLocation, navigation)

    browserHistory.push(newUrl)

    dispatch({type: types.GOTO_ACTIVE_VIEW})
}
