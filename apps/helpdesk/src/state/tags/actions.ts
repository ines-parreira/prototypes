import type { AxiosError, AxiosRequestConfig } from 'axios'
import { isCancel } from 'axios'
import type { List } from 'immutable'

import type { ListTagsParams, Tag } from '@gorgias/helpdesk-queries'

import client from 'models/api/resources'
import { fetchTags as fetchTagsResources } from 'models/tag/resources'
import type { OrderByOrderDir, TagDraft } from 'models/tag/types'
import GorgiasApi from 'services/gorgiasApi'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type { StoreDispatch } from 'state/types'
import { createErrorNotification } from 'state/utils'

import * as constants from './constants'

export function addTags(tags: Array<string> | string) {
    return {
        type: constants.ADD_TAGS,
        tags,
    }
}

export function fetchTags(
    options: Omit<ListTagsParams, 'order_by'> & {
        order_by?: OrderByOrderDir
    } = {},
    config: AxiosRequestConfig = {},
) {
    return async (dispatch: StoreDispatch) => {
        dispatch({
            type: constants.FETCH_TAG_LIST_START,
        })

        const client = new GorgiasApi()
        const generator = client.cursorPaginate(
            fetchTagsResources,
            options,
            config,
        )

        let result: Tag[] = []

        try {
            for await (const page of generator) {
                result = result.concat(page)
            }
            dispatch({
                type: constants.FETCH_TAG_LIST_SUCCESS,
                resp: { data: result },
            })
        } catch (error) {
            if (!isCancel(error)) {
                dispatch({
                    type: constants.FETCH_TAG_LIST_ERROR,
                    error,
                    reason: 'Failed to fetch tags',
                })
            }

            return Promise.reject(error)
        }
    }
}

export function select(tag: Tag) {
    return {
        type: constants.SELECT_TAG,
        tag,
    }
}

export function selectAll(tags: Tag[], value?: boolean) {
    return {
        type: constants.SELECT_TAG_ALL,
        payload: { tags, value },
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
                    }),
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
                    }),
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
            },
        )
    }
}

export const remove = (id: string) => {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client
            .delete(`/api/tags/${id}/`)
            .then(() => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Tag deleted successfully',
                    }),
                )
            })
            .catch((error: AxiosError) => {
                dispatch({
                    type: constants.REMOVE_TAG_ERROR,
                    verbose: true,
                    error,
                })

                throw error
            })
    }
}

export const bulkDelete = (ids: Array<string>) => {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client
            .delete('/api/tags/', { data: { ids } })
            .then(() => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: `${ids.length} tag${
                            ids.length > 1 ? 's' : ''
                        } deleted successfully`,
                    }),
                )
            })
            .catch((error: AxiosError) => {
                dispatch({
                    type: constants.REMOVE_TAG_ERROR,
                    verbose: true,
                    error,
                })

                throw error
            })
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
                        }),
                    )
                },
                (error: AxiosError) => {
                    return dispatch(
                        createErrorNotification(
                            error,
                            'Unable to merge these tags',
                        ),
                    )
                },
            )
    }
}

export function resetMeta() {
    return {
        type: constants.RESET_META,
    }
}
