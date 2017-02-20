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

export function fetchTags() {
    return (dispatch) => {
        dispatch({
            type: types.FETCH_TAG_LIST_START
        })

        return axios.get('/api/tags/')
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
        tag
    }
}

/**
 * Select all tags
 * @param selected
 */
export function selectAll(selected) {
    return {
        type: types.SELECT_TAG_ALL,
        selected
    }
}


/**
 * Edit tag
 * @param tag
 */
export function edit(tag) {
    return {
        type: types.EDIT_TAG,
        tag
    }
}

/**
 * Cancel edit tag
 * @param tag
 */
export function cancel(tag) {
    return {
        type: types.EDIT_TAG_CANCEL,
        tag
    }
}

/**
 * Save tag details
 * @param tag
 */
export const save = (tag) => {
    return dispatch => {
        dispatch({
            type: types.SAVE_TAG,
            tag
        })

        return axios.put(`/api/tags/${tag.id}/`, tag)
            .then(() => dispatch(notify({
                type: 'success',
                message: 'Tag saved successfully',
            })))
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
            .then((resp) => dispatch({
                type: types.CREATE_TAG_SUCCESS,
                tag: resp.data
            }), (error) => {
                dispatch(fail(error, 'Unable to create the tag'))
            })
    }
}

/**
 * Delete a tag
 * @param id
 */
export const remove = (id) => {
    return dispatch => {
        dispatch({
            type: types.REMOVE_TAG,
            id
        })

        axios.delete(`/api/tags/${id}/`)
            .then(() => {
                dispatch(notify({
                    type: 'success',
                    message: 'Tag deleted successfully',
                }))
            }, error => {
                return dispatch(fail(error, 'Unable to delete the tag'))
            })
    }
}
