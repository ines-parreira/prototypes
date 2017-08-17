import axios from 'axios'
import * as types from './constants'
import {notify} from '../notifications/actions'

export const fail = (error, reason) => ({
    type: 'ERROR',
    error,
    reason,
})

/**
 * Add tags to ticket.
 * @param tags
 */
export function addTags(tags) {
    return {
        type: types.ADD_TAGS,
        tags
    }
}

export function fetchTags(page, sort = 'usage_count', reverse = true) {
    return (dispatch, getState) => {
        dispatch({
            type: types.FETCH_TAG_LIST_START
        })

        const {tags} = getState()
        if (tags) {
            page = tags.getIn(['_internal', 'pagination', 'page'], 1)
        }

        return axios.get('/api/tags/', {
            params: {
                page,
                order_by: sort,
                order_dir: reverse ? 'desc' : 'asc'
            }
        })
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.FETCH_TAG_LIST_SUCCESS,
                    resp
                })
            }, error => {
                return dispatch({
                    type: types.FETCH_TAG_LIST_ERROR,
                    error,
                    reason: 'Failed to fetch tags'
                })
            })
    }
}

/**
 * Select tag
 * @param tag
 */
export function select(tag) {
    return {
        type: types.SELECT_TAG,
        tag,
    }
}

/**
 * Select all tags
 */
export function selectAll() {
    return {
        type: types.SELECT_TAG_ALL,
    }
}


/**
 * Edit tag
 * @param tag
 */
export function edit(tag) {
    return {
        type: types.EDIT_TAG,
        tag,
    }
}

/**
 * Cancel edit tag
 * @param tag
 */
export function cancel(tag) {
    return {
        type: types.EDIT_TAG_CANCEL,
        tag,
    }
}

/**
 * Save tag details
 * @param tag
 */
export const save = (tag) => {
    return dispatch => {
        return axios.put(`/api/tags/${tag.id}/`, tag)
            .then(() => {
                dispatch(notify({
                    status: 'success',
                    message: 'Tag saved successfully',
                }))
                return dispatch({
                    type: types.SAVE_TAG,
                    tag
                })
            })
            .catch(error => {
                return dispatch(fail(error, 'Unable to save tag'))
            })
    }
}

/**
 * Create a tag
 * @param tag
 */
export const create = (tag) => {
    return dispatch => {
        dispatch({
            type: types.CREATE_TAG_START,
            tag
        })

        return axios.post('/api/tags/', tag)
            .then((resp) => {
                dispatch(notify({
                    type: 'success',
                    message: `Created tag: ${tag.name}`
                }))
                dispatch({
                    type: types.CREATE_TAG_SUCCESS,
                    tag: resp.data
                })
            }, (error) => {
                return dispatch({
                    type: types.CREATE_TAG_ERROR,
                    error
                })
            })
    }
}

/**
 * Delete a tag
 * @param id
 */
export const remove = (id) => {
    return dispatch => {
        return axios.delete(`/api/tags/${id}/`)
            .then(() => {
                dispatch(notify({
                    status: 'success',
                    message: 'Tag deleted successfully',
                }))
            }, error => {
                return dispatch(fail(error, 'Unable to delete the tag'))
            })
    }
}

/**
 * Delete multiple tags
 * @param ids: an array of ids of the tags that should be deleted
 */
export const bulkDelete = (ids) => {
    return dispatch => {
        return axios.delete('/api/tags/', {data: {ids}})
            .then(() => {
                dispatch(notify({
                    type: 'success',
                    message: `${ids.length} tags deleted successfully`
                }))
            }, error => {
                return dispatch(fail(error, 'Unable to delete tags'))
            })
    }
}

/**
 * Merge tags
 * @param ids: an array of ids of the tags which should be merged
 */
export const merge = (ids) => {
    return (dispatch) => {
        dispatch({
            type: types.MERGE_TAGS,
            ids
        })

        const destinationId = ids.last()

        return axios.put(`/api/tags/${destinationId}/merge/`, {'source_tags_ids': ids.pop().toJS()})
            .then(() => {
                return dispatch(notify({
                    status: 'success',
                    message: 'Tags merged successfully',
                }))
            }, (error) => {
                return dispatch(fail(error, 'Unable to merge these tags'))
            })
    }
}

/**
 * Set a page in pagination
 *
 * @param page
 * @returns {{type: *, page: *}}
 */
export function setPage(page) {
    return {
        type: types.SET_TAG_LIST_PAGE,
        page,
    }
}

