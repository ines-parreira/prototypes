import reqwest from 'reqwest'
import {systemMessage} from './systemMessage'

export const FETCH_TAG_LIST_START = 'FETCH_TAG_LIST_START'
export const FETCH_TAG_LIST_SUCCESS = 'FETCH_TAG_LIST_SUCCESS'

export const ADD_TAGS = 'ADD_TAGS'

export function addTags(tags) {
    return {
        type: ADD_TAGS,
        tags
    }
}

export function fetchTags() {
    return (dispatch) => {
        dispatch({
            type: FETCH_TAG_LIST_START
        })

        return reqwest({
            url: '/api/tags/',
            type: 'json',
            method: 'GET',
            contentType: 'application/json'
        }).then((resp) => {
            dispatch({
                type: FETCH_TAG_LIST_SUCCESS,
                resp
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: failed to fetch tags',
                msg: err
            }))
        })
    }
}
