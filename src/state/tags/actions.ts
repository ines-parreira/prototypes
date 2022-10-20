import axios, {AxiosError, CancelToken} from 'axios'
import {List} from 'immutable'

import client from 'models/api/resources'
import {ApiListResponsePagination} from 'models/api/types'
import {TagSortableProperties} from 'models/tag/types'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import type {RootState, StoreDispatch} from 'state/types'
import {createErrorNotification} from 'state/utils'

import * as constants from './constants'
import {Tag, TagDraft} from './types'

export function addTags(tags: Array<string> | string) {
    return {
        type: constants.ADD_TAGS,
        tags,
    }
}

export function fetchTags(
    page?: Maybe<number>,
    sort = TagSortableProperties.Usage,
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

export function select(tag: Tag) {
    return {
        type: constants.SELECT_TAG,
        tag,
    }
}

export function selectAll(tags: Tag[]) {
    return {
        type: constants.SELECT_TAG_ALL,
        tags,
    }
}

export function edit(tag: Tag) {
    return {
        type: constants.EDIT_TAG,
        tag,
    }
}

export function cancel(tag: Tag) {
    return {
        type: constants.EDIT_TAG_CANCEL,
        tag,
    }
}

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

export const bulkDelete = (ids: Array<string>) => {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client.delete('/api/tags/', {data: {ids}}).then(
            () => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: `${ids.length} tag${
                            ids.length > 1 ? 's' : ''
                        } deleted successfully`,
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

export function resetMeta() {
    return {
        type: constants.RESET_META,
    }
}
