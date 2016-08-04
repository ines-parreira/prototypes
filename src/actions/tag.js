import axios from 'axios'
import * as types from '../constants/tag'

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

        axios.get('/api/tags/')
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.FETCH_TAG_LIST_SUCCESS,
                    resp
                })
            })
            .catch(error => {
                dispatch({
                    type: types.FETCH_TAG_LIST_ERROR,
                    error,
                    reason: 'Failed to fetch tags'
                })
            })
    }
}
