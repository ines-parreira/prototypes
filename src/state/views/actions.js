// @flow
import axios from 'axios'
import {fromJS} from 'immutable'
import _max from 'lodash/max'
import {browserHistory} from 'react-router'


import * as types from './constants'
import * as viewsSelectors from './selectors'
import * as viewsConfig from '../../config/views'
import * as socketConstants from '../../config/socketConstants'
import {notify} from '../notifications/actions'
import {fetchUsers} from '../users/actions'
import socketManager from '../../services/socketManager'
import {getPluralObjectName, getHashOfObj, isCurrentlyOnTicket, isCurrentlyOnView} from '../../utils'
import {shouldUpdateView} from './utils'

import type {Map, List} from 'immutable'
import type {dispatchType, getStateType, thunkActionType} from '../types'
import type {viewType, filterType} from './types'

export const setViewActive = (view: viewType) => (dispatch: dispatchType): dispatchType => {
    if (view) {
        socketManager.join('view', view.get('id'))
    }

    dispatch(addRecentView(view.get('id')))

    return dispatch({
        type: types.SET_VIEW_ACTIVE,
        view
    })
}

export const updateView = (view: ?viewType, edit: boolean = true) => ({
    type: types.UPDATE_VIEW,
    view,
    edit
})

export const setOrderDirection = (fieldPath: string, direction: 'asc' | 'desc' = 'asc') => (dispatch: dispatchType) => {
    dispatch({
        type: types.SET_ORDER_DIRECTION,
        fieldPath,
        direction,
    })

    dispatch(updateView())
}

export const setFieldVisibility = (name: string, state: boolean) => (dispatch: dispatchType) => {
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
    filter
})

// remove a filter based on index
export const removeFieldFilter = (index: number) => ({
    type: types.REMOVE_VIEW_FIELD_FILTER,
    index
})

// update a filter value
export const updateFieldFilter = (index: number, value: string) => ({
    type: types.UPDATE_VIEW_FIELD_FILTER,
    index,
    value
})

// remove a filter based on index
export const updateFieldFilterOperator = (index: number, operator: string) => ({
    type: types.UPDATE_VIEW_FIELD_FILTER_OPERATOR,
    index,
    operator
})

// not a real redux action, is used to return data, not to be used in the reducer
export function fieldEnumSearch(field: Map<*, *>, query: string): thunkActionType {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        dispatch({
            type: types.UPDATE_VIEW_FIELD_ENUM_START
        })

        const data = field.get('filter').toJS()
        data.query = query
        return axios.post('/api/search/', data)
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.UPDATE_VIEW_FIELD_ENUM_SUCCESS,
                    field,
                    resp
                })
                return fromJS(resp.data)
            }, error => {
                return dispatch({
                    type: types.UPDATE_VIEW_FIELD_ENUM_ERROR,
                    error,
                    reason: 'Failed to select this filter'
                })
            })
    }
}

export const resetView = (configName: string) => {
    return {
        type: types.RESET_VIEW,
        configName,
    }
}

export function fetchViews(currentViewId: string): thunkActionType {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        dispatch({
            type: types.FETCH_VIEW_LIST_START
        })

        return axios.get('/api/views/')
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.FETCH_VIEW_LIST_SUCCESS,
                    resp,
                    currentViewId
                })
            }, error => {
                return dispatch({
                    type: types.FETCH_VIEW_LIST_ERROR,
                    error,
                    reason: 'Failed to fetch views'
                })
            })
    }
}

export function setPage(page: number) {
    return {
        type: types.SET_PAGE,
        page
    }
}

export function submitView(view: viewType): thunkActionType {
    return (dispatch: dispatchType, getState: getStateType): Promise<dispatchType> => {
        const {views} = getState()
        const isUpdate = !!view.get('id', '')
        const objectName = getPluralObjectName(view.get('type', ''))

        dispatch({
            type: types.SUBMIT_VIEW_START,
        })

        let promise

        if (isUpdate) {
            promise = axios.put(`/api/views/${view.get('id')}/`, view.delete('dirty').delete('editMode').toJS())
        } else {
            const orders = views.get('items', fromJS([]))
                    .filter((item) => item.get('type') === view.get('type'))
                    .map((item) => item.get('display_order', 0))
                    .toJS()
                || [0]
            promise = axios.post(
                '/api/views/',
                view.set('display_order', _max(orders) + 1)
                    .delete('dirty')
                    .delete('editMode')
                    .toJS())
        }

        return promise
            .then((json = {}) => json.data)
            .then(resp => {
                // redirect to the view created
                if (!isUpdate) {
                    browserHistory.push(`/app/${objectName}/${resp.id}/${resp.slug}`)
                }
                return Promise.resolve(resp)
            }, error => {
                return dispatch({
                    type: isUpdate ? types.SUBMIT_UPDATE_VIEW_ERROR : types.SUBMIT_NEW_VIEW_ERROR,
                    error,
                    reason: 'Failed to submit view. Please try again'
                })
            })
    }
}

export function deleteView(view: viewType): thunkActionType {
    return (dispatch: dispatchType, getState: getStateType): Promise<dispatchType> => {
        const vType = view.get('type', 'ticket-list')
        const otherViewsOfType = getState().views
            .get('items', fromJS([]))
            .filter((v) => v.get('type', 'ticket-list') === vType && v.get('id') !== view.get('id'))

        // prevent deletion of the last view of this type
        if (otherViewsOfType.size === 0) {
            return dispatch(notify({
                status: 'error',
                title: 'This view cannot be deleted',
                message: 'This is your last view, it needs to exist in order for the helpdesk to function correctly.'
            }))
        }

        return axios.delete(`/api/views/${view.get('id')}/`)
            .then((json = {}) => json.data)
            .then(() => {
                const viewConfig = viewsConfig.getConfigByType(vType)
                const destinationView = otherViewsOfType.first()
                const destinationRoute = `/app/${viewConfig.get('routeList')}/${destinationView.get('id')}/${destinationView.get('slug')}`
                browserHistory.push(destinationRoute)
                return Promise.resolve()
            }, error => {
                return dispatch({
                    type: 'ERROR',
                    error,
                    reason: `Failed to delete the view ${view.get('name')}`
                })
            })
    }
}

export const deleteViewSuccess = (viewId: number): thunkActionType => (dispatch: dispatchType, getState: getStateType) => {
    dispatch({
        type: types.DELETE_VIEW_SUCCESS,
        viewId
    })

    // redirect to first view of the same type if it's the currently active view
    const state = getState().views
    if (state.getIn(['active', 'id']) === viewId) {
        const viewConfig = viewsConfig.getConfigByType(state.getIn(['active', 'type']))
        const destinationView = state.get('items').find((v) => {
            return v.get('type') === state.getIn(['active', 'type'])
        })
        const destinationRoute = `/app/${viewConfig.get('routeList')}/${destinationView.get('id')}/${destinationView.get('slug')}`
        browserHistory.push(destinationRoute)
    }
}

export function fetchPage(page: ?number, discreet: boolean = false): thunkActionType {
    return (dispatch: dispatchType, getState: getStateType): Promise<dispatchType> => {
        const state = getState()
        let views = state.views

        const activeView = viewsSelectors.getActiveView(state)
        const viewId = activeView.get('id')
        const isDirty = viewsSelectors.isDirty(state)

        if (!viewsSelectors.hasActiveView(state)) {
            return Promise.resolve()
        }

        if (!page) {
            page = views.getIn(['_internal', 'pagination', 'page'], 1)
        }

        dispatch(setPage(page))

        const activeViewType = activeView.get('type', 'ticket-list')
        const viewConfig = viewsConfig.getConfigByType(activeViewType)

        if (!isDirty && !viewId) {
            return Promise.resolve()
        }

        const filtersHash = getHashOfObj(viewsSelectors.getActiveViewFilters(getState()))

        dispatch({
            type: types.FETCH_LIST_VIEW_START,
            viewId,
            discreet,
        })

        let promise

        // when a view is dirty, just send the whole view data rather than just the id
        // this will allow us to test a view before submitting it to the DB
        if (isDirty) {
            promise = axios.put(`/api/${viewConfig.get('api')}/view/?page=${page}`, {
                view: activeView
                    .delete('dirty')
                    .delete('editMode')
                    .toJS()
            })
        } else {
            promise = axios.get(`/api/${viewConfig.get('api')}/`, {
                params: {
                    view_id: viewId,
                    page
                }
            })
        }

        return promise
            .then((json = {}) => json.data)
            .then(data => {
                views = getState().views
                // if the current view id the same as the received one
                const isCurrent = views.getIn(['_internal', 'currentViewId']) === viewId
                    // is the current page the same as the received one
                    && views.getIn(['_internal', 'pagination', 'page'], 1).toString() === data.meta.page.toString()
                    // (if somebody has modified the filters while the request was done)
                    && filtersHash === getHashOfObj(viewsSelectors.getActiveViewFilters(getState()))

                // make sure the incoming ticket list is the one the current user is looking at
                if (isCurrent) {
                    dispatch({
                        type: types.FETCH_LIST_VIEW_SUCCESS,
                        viewType: activeViewType,
                        data,
                    })
                }
            }, error => {
                return dispatch({
                    type: types.FETCH_LIST_VIEW_ERROR,
                    error,
                    reason: `Failed to fetch list of ${viewConfig.get('plural')}`
                })
            })
    }
}

export function toggleSelection(idOrIds: number | List<*>, selectAll: boolean = false) {
    return {
        type: types.TOGGLE_SELECTION,
        idOrIds,
        selectAll,
    }
}

export function bulkUpdate(activeView: viewType, ids: List<*>, key: string, value: any): thunkActionType {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        const data = {
            ids: ids.toJS(),
            updates: {
                [key]: value
            }
        }

        const activeViewType = activeView.get('type', 'ticket-list')
        const viewConfig = viewsConfig.getConfigByType(activeViewType)

        let successMessage = `${ids.size} ${viewConfig.get('plural')}: ${key} successfully set to ${value}!`

        if (activeViewType === 'ticket-list') {
            switch (key) {
                case 'tag':
                    successMessage = `${ids.size} tickets have been tagged "${value.name}".`
                    break
                case 'status':
                    successMessage = `${ids.size} tickets have been marked as ${value}.`
                    break
                case 'assignee_user':
                    successMessage = value
                        ? `${ids.size} tickets have been assigned to ${value.name}.`
                        : `${ids.size} tickets have been unassigned.`
                    break
                case 'priority':
                    successMessage = `${ids.size} tickets have been marked as ${value} priority.`
                    break
                case 'macro':
                    successMessage = `Macro successfully applied to ${ids.size} tickets.`
                    break
                case 'trashed_datetime':
                    if (value) {
                        successMessage = `${ids.size} tickets have been moved to the trash`
                    } else {
                        successMessage = `${ids.size} tickets have been undeleted`
                    }
                    break
                default:
                    break
            }
        }

        dispatch({
            type: types.BULK_UPDATE_START
        })

        const notification = dispatch(notify({
            status: 'loading',
            dismissAfter: 0,
            closeOnNext: true,
            message: `Updating ${viewConfig.get('api')}...`
        }))

        return axios.put(`/api/${viewConfig.get('api')}/`, data)
            .then((json = {}) => json.data)
            .then(() => {
                dispatch({
                    type: types.BULK_UPDATE_SUCCESS
                })

                setTimeout(() => dispatch(fetchPage()), 800)
                notification.status = 'success'
                notification.message = successMessage
                dispatch(notify(notification))
            }, () => {
                notification.status = 'error'
                notification.message = `Failed to update list of ${viewConfig.get('plural')}`
                dispatch(notify(notification))

                return dispatch({
                    type: types.BULK_UPDATE_ERROR,
                })
            })
    }
}

export function bulkDelete(activeView: viewType, ids: List<*>): thunkActionType {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        dispatch({
            type: types.BULK_DELETE_START
        })

        const activeViewType = activeView.get('type', 'ticket-list')
        const viewConfig = viewsConfig.getConfigByType(activeViewType)

        const notification = dispatch(notify({
            status: 'info',
            dismissAfter: 0,
            closeOnNext: true,
            message: `Deleting ${viewConfig.get('plural')}...`
        }))

        return axios.delete(`/api/${viewConfig.get('api')}/`, {
            data: {ids}
        })
            .then((json = {}) => json.data)
            .then(() => {
                dispatch({
                    type: types.BULK_DELETE_SUCCESS,
                    viewType: activeViewType,
                    ids
                })

                // refetch agents and admins list if it comes from users view
                if (activeViewType === 'user-list') {
                    dispatch(fetchUsers(['agent', 'admin']))
                }

                notification.status = 'success'
                notification.message = `${ids.size} ${viewConfig.get('plural')} successfully deleted!`
                dispatch(notify(notification))
            }, () => {
                notification.status = 'error'
                notification.message = `Couldn\'t delete selected ${viewConfig.get('plural')}`
                dispatch(notify(notification))
                return dispatch({type: types.BULK_DELETE_ERROR})
            })
    }
}

export function bulkApplyMacro(macroId: string) {
    return {
        type: types.BULK_APPLY_MACRO,
        macroId
    }
}

/**
 * Handle views item count update
 * @param response
 */
export const handleViewsCount = (counts: { counts: number }): Object => ({
    type: types.UPDATE_COUNTS,
    counts,
})

/**
 * Add a view to the recent views
 */
export const addRecentView = (viewId: number): Object => ({
    type: types.ADD_RECENT_VIEW,
    viewId
})

export const fetchActiveViewTickets = () => (dispatch: dispatchType, getState: getStateType): ?Promise<dispatchType> => {
    const state = getState()
    const viewsState = viewsSelectors.getViewsState(state)
    const activeView = viewsSelectors.getActiveView(state)
    const isFetchingView = viewsSelectors.isLoading('fetchList')(state)
        || viewsSelectors.isLoading('fetchListDiscreet')(state)
    const isEditing = activeView.get('editMode') || false

    if (!shouldUpdateView(activeView.get('id'), viewsState) || isFetchingView || isEditing) {
        return
    }

    return dispatch(fetchPage(null, true))
}

export const fetchVisibleViewsCounts = () => (dispatch: dispatchType, getState: getStateType) => {
    const state = getState()
    const viewIds = viewsSelectors.getVisibleViewIds()(state).toJS()
    socketManager.send(socketConstants.VIEWS_COUNTS_EXPIRED, {
        viewIds,
        force: true
    })
}

export const fetchRecentViewsCounts = () => (dispatch: dispatchType, getState: getStateType) => {
    // do not fetch views counts when the current user is not doing support
    if (!isCurrentlyOnTicket() && !isCurrentlyOnView()) {
        return
    }

    const state = getState()
    const activeViewId = viewsSelectors.getActiveView(state).get('id')
    let viewIds = viewsSelectors.getExpiredViewsCounts(viewsConfig.RECENT_VIEWS_COUNTS_TIMEOUT)(state)

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
        socketManager.send(socketConstants.VIEWS_COUNTS_EXPIRED, viewIds.toJS())
    }
}

export const fetchActiveViewCount = () => (dispatch: dispatchType, getState: getStateType) => {
    // there is already a polling system on ticket view
    // which fetch view count for the active view
    // so if the user is not on a ticket, we don't have to fetch new counts
    if (!isCurrentlyOnTicket()) {
        return
    }

    const state = getState()
    const activeViewId = viewsSelectors.getActiveView(state).get('id')
    const viewIds = viewsSelectors.getExpiredViewsCounts(viewsConfig.ACTIVE_VIEW_COUNT_TIMEOUT)(state)

    if (viewIds.includes(activeViewId)) {
        dispatch(updateRecentViews([activeViewId]))
        socketManager.send(socketConstants.VIEWS_COUNTS_EXPIRED, [activeViewId])
    }
}

/**
 * Update updated datetime of recent views
 */
export const updateRecentViews = (viewIds) => ({
    type: types.UPDATE_RECENT_VIEWS,
    viewIds
})
