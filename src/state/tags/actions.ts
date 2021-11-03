import axios, {AxiosError, CancelToken} from 'axios'
import {List} from 'immutable'

import {ApiListResponsePagination} from '../../models/api/types'
import {notify} from '../notifications/actions'
import {NotificationStatus} from '../notifications/types'
import {createErrorNotification} from '../utils'
import type {RootState, StoreDispatch} from '../types'
import client from '../../models/api/resources'

import * as constants from './constants.js'
import {TagSortableProperty, Tag, TagDraft} from './types'

/**types
 * Add tags to ticket.
 */
export function addTags(
    tags: Array<string> | string
): ReturnType<StoreDispatch> {
    return {
        type: constants.ADD_TAGS,
        tags,
    }
}

export function fetchTags(
    page?: Maybe<number>,
    sort: TagSortableProperty = TagSortableProperty.Usage,
    reverse = true,
    search = '',
    cancelToken?: CancelToken
) {
    return (dispatch: StoreDispatch, getState: () => RootState) => {
        dispatch({
            type: constants.FETCH_TAG_LIST_START,
        })

        const {tags} = getState()

        return client
            .get<ApiListResponsePagination<Tag[]>>('/api/tags/', {
                cancelToken,
                params: {
                    page: tags
                        ? tags.getIn(['_internal', 'pagination', 'page'], 1)
                        : page,
                    order_by: sort,
                    order_dir: reverse ? 'desc' : 'asc',
                    search,
                },
            })
            .then((json) => json?.data)
            .then(
                (resp) => {
                    return dispatch({
                        type: constants.FETCH_TAG_LIST_SUCCESS,
                        resp,
                    })
                },
                (error: AxiosError) => {
                    if (axios.isCancel(error)) {
                        return Promise.reject(error)
                    }
                    return dispatch({
                        type: constants.FETCH_TAG_LIST_ERROR,
                        error,
                        reason: 'Failed to fetch tags',
                    })
                }
            )
    }
}

/**
 * Select tag
 */
export function select(tag: Tag) {
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
 */
export function edit(tag: Tag) {
    return {
        type: constants.EDIT_TAG,
        tag,
    }
}

/**
 * Cancel edit tag
 */
export function cancel(tag: Tag) {
    return {
        type: constants.EDIT_TAG_CANCEL,
        tag,
    }
}

/**
 * Save tag details
 */
export const save = (tag: Tag) => {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client
            .put<Tag>(`/api/tags/${tag.id}/`, tag)
            .then(() => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Tag saved successfully',
                    })
                )
                return dispatch({
                    type: constants.SAVE_TAG,
                    tag,
                })
            })
            .catch((error: AxiosError) => {
                return dispatch({
                    type: constants.SAVE_TAG_ERROR,
                    verbose: true,
                    error,
                })
            })
    }
}

/**
 * Create a tag
 */
export const create = (tag: TagDraft) => {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: constants.CREATE_TAG_START,
            tag,
        })

        return client.post<Tag>('/api/tags/', tag).then(
            (resp) => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: `Created tag: ${tag.name}`,
                    })
                )
                dispatch({
                    type: constants.CREATE_TAG_SUCCESS,
                    tag: resp.data,
                })
            },
            (error: AxiosError) => {
                return dispatch({
                    type: constants.CREATE_TAG_ERROR,
                    verbose: true,
                    error,
                })
            }
        )
    }
}

/**
 * Delete a tag
 */
export const remove = (id: string) => {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client.delete(`/api/tags/${id}/`).then(
            () => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Tag deleted successfully',
                    })
                )
            },
            (error: AxiosError) => {
                return dispatch({
                    type: constants.REMOVE_TAG_ERROR,
                    verbose: true,
                    error,
                })
            }
        )
    }
}

/**
 * Delete multiple tags
 */
export const bulkDelete = (ids: Array<string>) => {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client.delete('/api/tags/', {data: {ids}}).then(
            () => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: `${ids.length} tags deleted successfully`,
                    })
                )
            },
            (error: AxiosError) => {
                return dispatch({
                    type: constants.REMOVE_TAG_ERROR,
                    verbose: true,
                    error,
                })
            }
        )
    }
}

/**
 * Merge tags
 */
export const merge = (ids: List<any>) => {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: constants.MERGE_TAGS,
            ids,
        })

        const destinationId = ids.last() as string

        return client
            .put<Tag>(`/api/tags/${destinationId}/merge/`, {
                source_tags_ids: ids.pop().toJS(),
            })
            .then(
                () => {
                    return dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'Tags merged successfully',
                        })
                    )
                },
                (error: AxiosError) => {
                    return dispatch(
                        createErrorNotification(
                            error,
                            'Unable to merge these tags'
                        )
                    )
                }
            )
    }
}

/**
 * Set a page in pagination
 */
export function setPage(page: number): ReturnType<StoreDispatch> {
    return {
        type: constants.SET_TAG_LIST_PAGE,
        page,
    }
}
