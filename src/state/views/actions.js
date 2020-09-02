// @flow
import axios, {type CancelToken} from 'axios'
import {fromJS, type List, type Map} from 'immutable'
import _max from 'lodash/max'
import {browserHistory} from 'react-router'
import {updateNotification} from 'reapop'

import * as viewsConfig from '../../config/views'
import * as socketConstants from '../../config/socketConstants'
import {
    BASE_VIEW_ID,
    NEXT_VIEW_NAV_DIRECTION,
    PREV_VIEW_NAV_DIRECTION,
    VIEW_NAV_DIRECTIONS,
    ViewVisibility,
} from '../../constants/view'
import {notify} from '../notifications/actions.ts'
import socketManager from '../../services/socketManager'
import {
    getHashOfObj,
    getPluralObjectName,
    isCurrentlyOnTicket,
    isCurrentlyOnView,
} from '../../utils'
import {buildJobMessage} from '../../utils/notificationUtils'
import {getMoment} from '../../utils/date'
import type {Dispatch, getStateType, thunkActionType} from '../types'

import {activeViewUrl} from './utils'
import * as viewsSelectors from './selectors'
import * as types from './constants'
import type {filterType, viewType} from './types'

export const setViewActive = (view: viewType) => (
    dispatch: Dispatch
): Dispatch => {
    if (view) {
        socketManager.join('view', view.get('id'))
    }

    dispatch(addRecentView(view.get('id')))

    return dispatch({
        type: types.SET_VIEW_ACTIVE,
        view,
    })
}

export const updateView = (view: ?viewType, edit: boolean = true) => ({
    type: types.UPDATE_VIEW,
    view,
    edit,
})

export const setViewEditMode = (view: ?viewType) => ({
    type: types.ACTIVATE_VIEW_EDIT_MODE,
    view,
})

export const toggleViewSelection = () => ({
    type: types.TOGGLE_VIEW_SELECTION,
})

export const setOrderDirection = (
    fieldPath: string,
    direction: 'asc' | 'desc' = 'asc'
) => (dispatch: Dispatch) => {
    dispatch({
        type: types.SET_ORDER_DIRECTION,
        fieldPath,
        direction,
    })

    dispatch(updateView())
}

export const setFieldVisibility = (name: string, state: boolean) => (
    dispatch: Dispatch
) => {
    dispatch({
        type: types.SET_FIELD_VISIBILITY,
        name,
        state,
    })

    dispatch(updateView())
}

// add filter for 1 field
export const addFieldFilter = (field: string, filter: filterType) => ({
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
    field: Map<*, *>,
    query: string,
    cancelToken?: CancelToken
): thunkActionType {
    return (dispatch: Dispatch): Promise<void> => {
        dispatch({
            type: types.UPDATE_VIEW_FIELD_ENUM_START,
        })

        const data = field.get('filter').toJS()
        data.query = query

        return axios
            .post('/api/search/', data, {
                cancelToken,
            })
            .then((json = {}) => json.data)
            .then(
                (resp) => {
                    dispatch({
                        type: types.UPDATE_VIEW_FIELD_ENUM_SUCCESS,
                        field,
                        resp,
                    })
                    return fromJS(resp.data)
                },
                (error) => {
                    if (!axios.isCancel(error)) {
                        dispatch({
                            type: types.UPDATE_VIEW_FIELD_ENUM_ERROR,
                            error,
                            reason: 'Failed to select this filter',
                        })
                    }

                    return Promise.reject(error)
                }
            )
    }
}

export const resetView = (configName: string) => {
    return {
        type: types.RESET_VIEW,
        configName,
    }
}

export function fetchViews(currentViewId: string): thunkActionType {
    return (dispatch: Dispatch): Promise<Dispatch> => {
        dispatch({
            type: types.FETCH_VIEW_LIST_START,
        })

        return axios
            .get('/api/views/')
            .then((json = {}) => json.data)
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

export function submitView(view: viewType): thunkActionType {
    return (dispatch: Dispatch, getState: getStateType): Promise<Dispatch> => {
        const {views, currentUser} = getState()
        const isUpdate = !!view.get('id')
        const objectName = getPluralObjectName(view.get('type', ''))

        dispatch({
            type: types.SUBMIT_VIEW_START,
        })

        let promise

        if (isUpdate) {
            promise = axios.put(
                `/api/views/${view.get('id')}/`,
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
            const orders = views
                .get('items', fromJS([]))
                .filter((item) => item.get('type') === view.get('type'))
                .map((item) => item.get('display_order', 0))
                .toJS() || [0]
            promise = axios.post(
                '/api/views/',
                view
                    .set('display_order', _max(orders) + 1)
                    .set('visibility', ViewVisibility.PRIVATE)
                    .set('shared_with_users', [currentUser.get('id')])
                    .delete('id')
                    .delete('dirty')
                    .delete('editMode')
                    .delete('allItemsSelected')
                    .toJS()
            )
        }

        return promise
            .then((json = {}) => json.data)
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

export function deleteView(view: viewType): thunkActionType {
    return (dispatch: Dispatch, getState: getStateType): Promise<Dispatch> => {
        const vType = view.get('type', 'ticket-list')
        const otherViewsOfType = getState()
            .views.get('items', fromJS([]))
            .filter(
                (v) =>
                    v.get('type', 'ticket-list') === vType &&
                    v.get('id') !== view.get('id')
            )

        if (otherViewsOfType.size === 0) {
            return dispatch(
                notify({
                    status: 'error',
                    title: 'This view cannot be deleted',
                    message:
                        'This is your last view, it needs to exist in order for the helpdesk to function correctly.',
                })
            )
        }

        return axios.delete(`/api/views/${view.get('id')}/`).then(
            () => {
                const viewConfig = viewsConfig.getConfigByType(vType)
                const destinationView = otherViewsOfType.first()
                const destinationRoute = `/app/${viewConfig.get(
                    'routeList'
                )}/${destinationView.get('id')}/${destinationView.get('slug')}`
                dispatch(setViewActive(destinationView))
                browserHistory.push(destinationRoute)
                return Promise.resolve()
            },
            (error) => {
                return dispatch({
                    type: 'ERROR',
                    error,
                    reason: `Failed to delete the view ${view.get('name')}`,
                })
            }
        )
    }
}

export const deleteViewSuccess = (viewId: number): thunkActionType => (
    dispatch: Dispatch,
    getState: getStateType
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
        const destinationView = state.get('items').find((v) => {
            return v.get('type') === state.getIn(['active', 'type'])
        })
        const destinationRoute = `/app/${viewConfig.get(
            'routeList'
        )}/${destinationView.get('id')}/${destinationView.get('slug')}`
        dispatch(setViewActive(destinationView))
        browserHistory.push(destinationRoute)
    }
}

/** Fetch a page of items of a view (tickets or customers) based on the provided cursor and direction.
 *
 * @param direction: next or prev; indicates which items should be fetched compared to the provided cursor
 * @param cursor: the point from which to fetch items
 * @param isPolling: whether or not this was triggered by the polling
 * @returns {Function}
 */
export function fetchViewItems(
    direction: ?$Values<typeof VIEW_NAV_DIRECTIONS> = null,
    cursor: ?number,
    isPolling: ?boolean = false,
    cancelToken?: CancelToken
): thunkActionType {
    return (dispatch: Dispatch, getState: getStateType): Promise<Dispatch> => {
        const options = cancelToken ? {cancelToken} : {}
        let state = getState()
        const activeView = viewsSelectors.getActiveView(state)
        const activeViewType = activeView.get('type')
        const viewConfig = viewsConfig.getConfigByType(activeViewType)

        let navigation = viewsSelectors.getNavigation(state)

        const viewId = activeView.get('id')

        let url = `/api/views/${viewId}/items/`

        if (cursor) {
            url = `${url}?cursor=${cursor}`
        } else if (direction === NEXT_VIEW_NAV_DIRECTION) {
            url = navigation.get('next_items')
        } else if (direction === PREV_VIEW_NAV_DIRECTION) {
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
            promise = axios.put(
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
            promise = axios.get(url, options)
        }

        return promise
            .then((json = {}) => json.data)
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
                (error) => {
                    if (axios.isCancel(error)) {
                        return Promise.resolve()
                    }
                    return dispatch({
                        type: types.FETCH_LIST_VIEW_ERROR,
                        error,
                        reason: `Failed to fetch list of ${viewConfig.get(
                            'plural'
                        )}`,
                    })
                }
            )
    }
}

export function updateSelectedItemsIds(ids: List<*>) {
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
    view: viewType,
    jobType: string,
    jobPartialParams: Object
): thunkActionType {
    return (dispatch: Dispatch): Promise<Dispatch> => {
        let requestPayload
        if (view.get('dirty', false)) {
            requestPayload = {
                type: jobType,
                scheduled_datetime: getMoment().add(15, 'second'),
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
                scheduled_datetime: getMoment().add(15, 'second'),
                params: Object.assign(
                    {},
                    {view_id: view.get('id')},
                    jobPartialParams
                ),
            }
        }

        const notification = dispatch(
            notify({
                status: 'loading',
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
        )

        return axios
            .post('/api/jobs/', requestPayload)
            .then((json = {}) => json.data)
            .then(
                (job) => {
                    notification.status = 'success'
                    notification.buttons = [
                        {
                            name: 'Cancel',
                            primary: true,
                            onClick: () => {
                                return axios
                                    .delete('/api/jobs/' + job.id)
                                    .then((json = {}) => {
                                        notification.buttons = []
                                        return json.data
                                    })
                                    .then(
                                        () => {
                                            notification.status = 'success'
                                            notification.message =
                                                'The job has been canceled.'
                                            return dispatch(
                                                notify(notification)
                                            )
                                        },
                                        (error) => {
                                            notification.status = 'error'
                                            notification.message =
                                                error.response.data.error.msg
                                            return dispatch(
                                                notify(notification)
                                            )
                                        }
                                    )
                            },
                        },
                    ]
                    return dispatch(updateNotification(notification))
                },
                (error) => {
                    notification.status = 'error'
                    if (error.response.status === 403) {
                        notification.message = error.response.data.error.msg
                    } else {
                        notification.message =
                            'Failed to apply action on ' +
                            viewsConfig
                                .getConfigByType(view.get('type'))
                                .get('plural') +
                            ' view. Please try again.'
                    }
                    dispatch(updateNotification(notification))
                    throw error
                }
            )
    }
}

/**
 * Handle views item count update
 * @param response
 */
export const handleViewsCount = (counts: {counts: number}): Object => ({
    type: types.UPDATE_COUNTS,
    counts,
})

/**
 * Add a view to the recent views
 */
export const addRecentView = (viewId: number): Object => ({
    type: types.ADD_RECENT_VIEW,
    viewId,
})

export const fetchActiveViewTickets = () => (
    dispatch: Dispatch,
    getState: getStateType
): ?Promise<Dispatch> => {
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
    dispatch: Dispatch,
    getState: getStateType
) => {
    const state = getState()
    const viewIds = viewsSelectors.getVisibleViewIds()(state).toJS()
    socketManager.send(socketConstants.VIEWS_COUNTS_EXPIRED, {
        viewIds,
        all: true,
    })
}

export const fetchRecentViewsCounts = () => (
    dispatch: Dispatch,
    getState: getStateType
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
        socketManager.send(socketConstants.VIEWS_COUNTS_EXPIRED, {
            viewIds: viewIds.toJS(),
        })
    }
}

export const fetchActiveViewCount = () => (
    dispatch: Dispatch,
    getState: getStateType
) => {
    const state = getState()
    const activeViewId = viewsSelectors.getActiveView(state).get('id')
    const viewIds = viewsSelectors.getExpiredViewsCounts(
        viewsConfig.ACTIVE_VIEW_COUNT_TIMEOUT
    )(state)

    if (viewIds.includes(activeViewId)) {
        dispatch(updateRecentViews([activeViewId]))
        socketManager.send(socketConstants.VIEWS_COUNTS_EXPIRED, {
            viewIds: [activeViewId],
        })
    }
}

/**
 * Update updated datetime of recent views
 */
export const updateRecentViews = (viewIds) => ({
    type: types.UPDATE_RECENT_VIEWS,
    viewIds,
})

/**
 * Go to the parent view
 */
export const gotoActiveView = () => (
    dispatch: Dispatch,
    getState: getStateType
) => {
    const state = getState()
    const activeView = viewsSelectors.getActiveView(state)
    const navigation = viewsSelectors.getNavigation(state)
    const currentLocation = browserHistory.getCurrentLocation()
    const newUrl = activeViewUrl(activeView, currentLocation, navigation)

    browserHistory.push(newUrl)

    dispatch({type: types.GOTO_ACTIVE_VIEW})
}
