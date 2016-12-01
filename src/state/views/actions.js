import axios from 'axios'
import {fromJS} from 'immutable'
import {browserHistory} from 'react-router'
import * as types from './constants'
import {notify} from '../notifications/actions'
import {VIEW_TYPE_CONFIGURATION} from '../../config'
import {fetchUsers} from '../users/actions'

export const setViewActive = (view) => ({
    type: types.SET_VIEW_ACTIVE,
    view
})

export const updateView = (view, edit = true) => ({
    type: types.UPDATE_VIEW,
    view,
    edit
})

export const setFieldVisibility = (name, state) => ({
    type: types.SET_FIELD_VISIBILITY,
    name,
    state
})

// add filter for 1 field
export const addFieldFilter = (field, filter) => ({
    type: types.ADD_VIEW_FIELD_FILTER,
    field,
    filter
})

// remove a filter based on index
export const removeFieldFilter = (index) => ({
    type: types.REMOVE_VIEW_FIELD_FILTER,
    index
})

// update a filter value
export const updateFieldFilter = (index, value) => ({
    type: types.UPDATE_VIEW_FIELD_FILTER,
    index,
    value
})

// remove a filter based on index
export const updateFieldFilterOperator = (index, operator) => ({
    type: types.UPDATE_VIEW_FIELD_FILTER_OPERATOR,
    index,
    operator
})

// not a real redux action, is used to return data, not to be used in the reducer
export function fieldEnumSearch(field, query) {
    return (dispatch) => {
        dispatch({
            type: types.UPDATE_VIEW_FIELD_ENUM_START
        })

        return axios.post('/api/search/', {
            doc_type: field.getIn(['filter', 'doc_type']),
            query
        })
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.UPDATE_VIEW_FIELD_ENUM_SUCCESS,
                    field,
                    resp
                })
                return fromJS(resp.data)
            })
            .catch(error => {
                return dispatch({
                    type: types.UPDATE_VIEW_FIELD_ENUM_ERROR,
                    error,
                    reason: 'Failed to select this filter'
                })
            })
    }
}

export const resetView = () => ({type: types.RESET_VIEW})

export function fetchViews(currentViewId) {
    return (dispatch) => {
        dispatch({
            type: types.FETCH_VIEW_LIST_START
        })

        return axios.get('/api/views')
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.FETCH_VIEW_LIST_SUCCESS,
                    resp,
                    currentViewId
                })
            })
            .catch(error => {
                return dispatch({
                    type: types.FETCH_VIEW_LIST_ERROR,
                    error,
                    reason: 'Failed to fetch views'
                })
            })
    }
}

export function submitView(view) {
    return (dispatch) => {
        const isUpdate = !!view.get('id', '')

        dispatch({
            type: types.SUBMIT_VIEW_START
        })

        let promise

        if (isUpdate) {
            promise = axios.put(`/api/views/${view.get('id')}/`, view.delete('dirty').delete('editMode').toJS())
        } else {
            promise = axios.post('/api/views/', view.delete('dirty').delete('editMode').toJS())
        }

        return promise
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: isUpdate ? types.SUBMIT_UPDATE_VIEW_SUCCESS : types.SUBMIT_NEW_VIEW_SUCCESS,
                    resp
                })
            })
            .catch(error => {
                return dispatch({
                    type: isUpdate ? types.SUBMIT_UPDATE_VIEW_ERROR : types.SUBMIT_NEW_VIEW_ERROR,
                    error,
                    reason: 'Failed to submit view. Please try again'
                })
            })
    }
}

export function deleteView(view) {
    return (dispatch, getState) => {
        const viewType = view.get('type', 'ticket-list')
        const otherViewsOfType = getState().views
            .get('items', fromJS([]))
            .filter((v) => v.get('type', 'ticket-list') === viewType && v.get('id') !== view.get('id'))

        // prevent deletion of the last view of this type
        if (otherViewsOfType.size === 0) {
            return dispatch(notify({
                type: 'error',
                title: 'This view cannot be deleted',
                message: 'This is your last view, it needs to exist in order for the helpdesk to function correctly.'
            }))
        }

        if (window.confirm('You\'re about to delete this view for all users. Are you sure?')) {
            axios.delete(`/api/views/${view.get('id')}/`)
                .then((json = {}) => json.data)
                .then(() => {
                    const viewConfig = VIEW_TYPE_CONFIGURATION[viewType]
                    const destinationView = otherViewsOfType.first()
                    const destinationRoute = `/app/${viewConfig.routeList}/${destinationView.get('id')}/${destinationView.get('slug')}`
                    browserHistory.push(destinationRoute)

                    dispatch({
                        type: types.DELETE_VIEW_SUCCESS,
                        viewId: view.get('id')
                    })
                })
                .catch(error => {
                    return dispatch({
                        type: 'ERROR',
                        error,
                        reason: `Failed to delete the view ${view.get('name')}`
                    })
                })
        }
    }
}


export function fetchPage(page, discreet = false) {
    return (dispatch, getState) => {
        let views = getState().views

        const activeView = views.get('active', fromJS({}))
        const viewId = activeView.get('id')
        const isDirty = views.getIn(['active', 'dirty'], false)

        if (!activeView || activeView.isEmpty()) {
            return Promise.resolve()
        }

        if (!page) {
            page = views.getIn(['_internal', 'pagination', 'page'], 1)
        }

        const activeViewType = activeView.get('type', 'ticket-list')
        const viewConfig = VIEW_TYPE_CONFIGURATION[activeViewType]

        if (!isDirty && !viewId) {
            return Promise.resolve()
        }

        dispatch({
            type: types.FETCH_LIST_VIEW_START,
            viewId,
            discreet,
        })

        let promise

        // when a view is dirty, just send the whole view data rather than just the id
        // this will allow us to test a view before submitting it to the DB
        if (isDirty) {
            promise = axios.put(`/api/${viewConfig.api}/view/`, {
                view: activeView.delete('dirty').delete('editMode').toJS(),
                page
            })
        } else {
            promise = axios.get(`/api/${viewConfig.api}/`, {
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
                const isCurrent = views.getIn(['_internal', 'currentViewId']) === viewId
                    && views.getIn(['_internal', 'pagination', 'page']) === data.meta.page

                // make sure the incoming ticket list is the one the current user is looking at
                if (isCurrent) {
                    dispatch({
                        type: types.FETCH_LIST_VIEW_SUCCESS,
                        viewType: activeViewType,
                        data,
                    })
                }
            })
            .catch(error => {
                return dispatch({
                    type: types.FETCH_LIST_VIEW_ERROR,
                    error,
                    reason: `Failed to fetch list of ${viewConfig.plural}`
                })
            })
    }
}

export function setPage(page) {
    return {
        type: types.SET_PAGE,
        page
    }
}

export function saveIndex(currentItemIndex) {
    return {
        type: types.SAVE_INDEX,
        currentItemIndex
    }
}

export function toggleSelection(idOrIds, selectedAll = false) {
    return {
        type: types.TOGGLE_SELECTION,
        idOrIds,
        selectedAll
    }
}

export function bulkUpdate(activeView, ids, key, value) {
    return (dispatch) => {
        const data = {
            ids: ids.toJS(),
            updates: {
                [key]: value
            }
        }

        const activeViewType = activeView.get('type', 'ticket-list')
        const viewConfig = VIEW_TYPE_CONFIGURATION[activeViewType]

        let successMessage = `${ids.size} ${viewConfig.plural}: ${key} successfully set to ${value}!`

        if (activeViewType === 'ticket-list') {
            switch (key) {
                case 'tag':
                    successMessage = `${ids.size} tickets have been tagged "${value.name}'.`
                    break
                case 'status':
                    successMessage = `${ids.size} tickets have been marked as ${value}.`
                    break
                case 'assignee_user':
                    successMessage = `${ids.size} tickets have been assigned to ${value.name}!`
                    break
                case 'priority':
                    successMessage = `${ids.size} tickets have been marked as ${value} priority.`
                    break
                case 'macro':
                    successMessage = `Macro successfully applied to ${ids.size} tickets.`

                    for (const action of value.actions) {
                        switch (action.name) {
                            case 'setStatus':
                                data.updates.status = action.arguments.status
                                break
                            case 'setPriority':
                                data.updates.priority = action.arguments.priority
                                break
                            case 'addTags':
                                data.updates.tags = action.arguments
                                break
                            case 'setAssignee':
                                data.updates.assignee_user = action.arguments.assignee_user
                                break
                            default:
                                break
                        }
                    }
                    break
                default:
                    break
            }
        }

        dispatch({
            type: types.BULK_UPDATE_START
        })

        dispatch(notify({
            type: 'info',
            autoDismiss: false,
            closeOnNext: true,
            message: `Updating ${viewConfig.api}...`
        }))

        return axios.put(`/api/${viewConfig.api}/`, data)
            .then((json = {}) => json.data)
            .then(() => {
                dispatch({
                    type: types.BULK_UPDATE_SUCCESS
                })

                setTimeout(() => dispatch(fetchPage(1)), 800)

                dispatch(notify({
                    type: 'success',
                    message: successMessage
                }))
            })
            .catch(error => {
                return dispatch({
                    type: types.BULK_UPDATE_ERROR,
                    error,
                    reason: `Failed to update list of ${viewConfig.plural}`
                })
            })
    }
}

export function bulkDelete(activeView, ids) {
    return (dispatch) => {
        dispatch({
            type: types.BULK_DELETE_START
        })

        const activeViewType = activeView.get('type', 'ticket-list')
        const viewConfig = VIEW_TYPE_CONFIGURATION[activeViewType]

        dispatch(notify({
            type: 'info',
            autoDismiss: false,
            closeOnNext: true,
            message: `Deleting ${viewConfig.plural}...`
        }))

        return axios.delete(`/api/${viewConfig.api}/`, {
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

                dispatch(notify({
                    type: 'success',
                    message: `${ids.size} ${viewConfig.plural} successfully deleted!`
                }))
            })
            .catch(error => {
                return dispatch({
                    type: types.BULK_DELETE_ERROR,
                    error,
                    reason: `Couldn\'t delete selected ${viewConfig.plural}`
                })
            })
    }
}


export function bulkApplyMacro(macroId) {
    return {
        type: types.BULK_APPLY_MACRO,
        macroId
    }
}
