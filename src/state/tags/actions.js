// @flow
import axios from 'axios'
import * as constants from './constants'
import {notify} from '../notifications/actions'

import type {List} from 'immutable'
import type {actionType, thunkActionType, dispatchType, getStateType} from '../types'
type tagType = {
    id: string,
    name: string
}

export const fail = (error: {}, reason: string) => ({
    type: 'ERROR',
    error,
    reason,
})

/**types
 * Add tags to ticket.
 * @param tags
 */
export function addTags(tags: Array<string> | string) {
    return {
        type: constants.ADD_TAGS,
        tags
    }
}

export function fetchTags(page: ?number, sort: string = 'usage_count', reverse: boolean = true): thunkActionType {
    return (dispatch: dispatchType, getState: getStateType): Promise<dispatchType> => {
        dispatch({
            type: constants.FETCH_TAG_LIST_START
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
                return dispatch({
                    type: constants.FETCH_TAG_LIST_SUCCESS,
                    resp
                })
            }, error => {
                return dispatch({
                    type: constants.FETCH_TAG_LIST_ERROR,
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
export function select(tag: tagType) {
    return {
        type: constants.SELECT_TAG,
        tag,
    }
}

/**
 * Select all tags
 */
export function selectAll() {
    return {
        type: constants.SELECT_TAG_ALL,
    }
}


/**
 * Edit tag
 * @param tag
 */
export function edit(tag: tagType) {
    return {
        type: constants.EDIT_TAG,
        tag,
    }
}

/**
 * Cancel edit tag
 * @param tag
 */
export function cancel(tag: tagType) {
    return {
        type: constants.EDIT_TAG_CANCEL,
        tag,
    }
}

/**
 * Save tag details
 * @param tag
 */
export const save = (tag: tagType): thunkActionType => {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        return axios.put(`/api/tags/${tag.id}/`, tag)
            .then(() => {
                dispatch(notify({
                    status: 'success',
                    message: 'Tag saved successfully',
                }))
                return dispatch({
                    type: constants.SAVE_TAG,
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
export const create = (tag: tagType): thunkActionType => {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        dispatch({
            type: constants.CREATE_TAG_START,
            tag
        })

        return axios.post('/api/tags/', tag)
            .then((resp) => {
                dispatch(notify({
                    status: 'success',
                    message: `Created tag: ${tag.name}`
                }))
                dispatch({
                    type: constants.CREATE_TAG_SUCCESS,
                    tag: resp.data
                })
            }, (error) => {
                return dispatch({
                    type: constants.CREATE_TAG_ERROR,
                    error
                })
            })
    }
}

/**
 * Delete a tag
 * @param id
 */
export const remove = (id: string): thunkActionType => {
    return (dispatch: dispatchType): Promise<dispatchType> => {
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
export const bulkDelete = (ids: Array<string>): thunkActionType => {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        return axios.delete('/api/tags/', {data: {ids}})
            .then(() => {
                dispatch(notify({
                    status: 'success',
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
export const merge = (ids: List<*>): thunkActionType => {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        dispatch({
            type: constants.MERGE_TAGS,
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
export function setPage(page: number): actionType & {page: number} {
    return {
        type: constants.SET_TAG_LIST_PAGE,
        page,
    }
}

