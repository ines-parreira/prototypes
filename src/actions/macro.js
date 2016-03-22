import reqwest from 'reqwest'
import { systemMessage } from './systemMessage'
import { MACRO_ACTIONS } from '../actions/ticket'

export const FETCH_MACRO_LIST_START = 'FETCH_MACRO_LIST_START'
export const FETCH_MACRO_LIST_SUCCESS = 'FETCH_MACRO_LIST_SUCCESS'

export const APPLY_MACRO = 'APPLY_MACRO'
export const PREVIEW_MACRO = 'PREVIEW_MACRO'
export const SET_MACROS_VISIBILITY = 'SET_MACROS_VISIBILITY'
export const PREVIEW_ADJACENT_MACRO = 'PREVIEW_ADJACENT_MACRO'

export function setMacrosVisible(visible) {
    return {
        type: SET_MACROS_VISIBILITY,
        visible
    }
}

export function previewMacro(macro) {
    return {
        type: PREVIEW_MACRO,
        id: macro.get('id')
    }
}

export function previewAdjacentMacro(direction) {
    return {
        type: PREVIEW_ADJACENT_MACRO,
        direction,
    }
}

export function applyMacro(macro, currentUser) {
    return (dispatch) => {
        dispatch({
            type: APPLY_MACRO,
            macro
        })
        macro.get('actions').map((action) => {
            dispatch(applyMacroAction(action, currentUser))
        })
    }
}

export function applyMacroAction(action, currentUser) {
    const { type, name } = action.toJS()
    if (type === 'user' && !MACRO_ACTIONS.includes(name)) {
        console.error("Applying unknown macro action", name)
    }

    return {
        type: name,
        args: action.get('arguments'),
        currentUser: currentUser,
    }
}

export function fetchMacros() {
    return (dispatch) => {
        dispatch({
            type: FETCH_MACRO_LIST_START
        })

        return reqwest({
            url: `/api/macros/`,
            type: 'json',
            method: 'GET',
            contentType: 'application/json'
        }).then((resp) => {
            dispatch({
                type: FETCH_MACRO_LIST_SUCCESS,
                resp
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: failed to fetch macros',
                msg: err
            }))
        })
    }
}
