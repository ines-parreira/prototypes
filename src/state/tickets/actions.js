import * as types from'./constants'

export const updateCursor = (cursor) => (dispatch) => {
    return dispatch({
        type: types.UPDATE_CURSOR,
        cursor
    })
}
