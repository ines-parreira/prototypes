import reqwest from 'reqwest'
import { systemMessage } from './systemMessage'
import { DEFAULT_ACTIONS } from '../constants'
import { RECORD_MACRO } from './ticket'

export const FETCH_MACRO_LIST_START = 'FETCH_MACRO_LIST_START'
export const FETCH_MACRO_LIST_SUCCESS = 'FETCH_MACRO_LIST_SUCCESS'

// TicketReply
export const UPDATE_ACTION_ARGS_ON_APPLIED = 'UPDATE_ACTION_ARGS_ON_APPLIED'
export const DELETE_ACTION_ON_APPLIED = 'DELETE_ACTION_ON_APPLIED'

// TicketReplyMacros
export const APPLY_MACRO = 'APPLY_MACRO'
export const PREVIEW_MACRO = 'PREVIEW_MACRO'
export const SET_MACROS_VISIBILITY = 'SET_MACROS_VISIBILITY'
export const PREVIEW_ADJACENT_MACRO = 'PREVIEW_ADJACENT_MACRO'

export const PREVIEW_MACRO_IN_MODAL = 'PREVIEW_MACRO_IN_MODAL'
export const PREVIEW_ADJACENT_MACRO_IN_MODAL = 'PREVIEW_ADJACENT_MACRO_IN_MODAL'

// Macro Management Modal
export const ADD_NEW_MACRO = 'ADD_NEW_MACRO'

export const CREATE_MACRO_START = 'CREATE_MACRO_START'
export const CREATE_MACRO_SUCCESS = 'CREATE_MACRO_SUCCESS'

export const DELETE_MACRO_START = 'DELETE_MACRO_START'
export const DELETE_MACRO_SUCCESS = 'DELETE_MACRO_SUCCESS'

export const ADD_ACTION = 'ADD_ACTION'
export const DELETE_ACTION = 'DELETE_ACTION'

export const UPDATE_MACRO_START = 'UPDATE_MACRO_START'
export const UPDATE_MACRO_SUCCESS = 'UPDATE_MACRO_SUCCESS'

export const OPEN_MODAL = 'OPEN_MODAL'
export const CLOSE_MODAL = 'CLOSE_MODAL'

export const UPDATE_ACTION_ARGS = 'UPDATE_ACTION_ARGS'

export const UPDATE_ACTION_TITLE = 'UPDATE_ACTION_TITLE'
export const SET_NAME = 'SET_NAME_ON_MACRO'

export const SAVE_SEARCH = 'SAVE_SEARCH'

export function deleteActionOnApplied(actionIndex) {
    return {
        type: DELETE_ACTION_ON_APPLIED,
        actionIndex
    }
}

export function updateActionArgsOnApplied(actionIndex, value) {
    return {
        type: UPDATE_ACTION_ARGS_ON_APPLIED,
        actionIndex,
        value
    }
}

export function updateActionArgs(actionIndex, value) {
    return {
        type: UPDATE_ACTION_ARGS,
        actionIndex,
        value
    }
}

export function updateActionTitle(actionIndex, title) {
    return {
        type: UPDATE_ACTION_TITLE,
        actionIndex,
        title
    }
}

export function openModal() {
    return {
        type: OPEN_MODAL
    }
}

export function closeModal() {
    return {
        type: CLOSE_MODAL
    }
}

export function addNewMacro() {
    return {
        type: ADD_NEW_MACRO
    }
}

export function setName(name) {
    return {
        type: SET_NAME,
        name
    }
}

export function addAction(actionType) {
    return {
        type: ADD_ACTION,
        actionType
    }
}

export function deleteAction(actionId) {
    return {
        type: DELETE_ACTION,
        actionId
    }
}

export function previewMacroInModal(macroId) {
    return {
        type: PREVIEW_MACRO_IN_MODAL,
        macroId
    }
}

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
        direction
    }
}

export function previewAdjacentMacroInModal(direction, noExternal) {
    return {
        type: PREVIEW_ADJACENT_MACRO_IN_MODAL,
        direction,
        noExternal
    }
}

export function saveSearch(query) {
    return {
        type: SAVE_SEARCH,
        query
    }
}

export function applyMacroAction(action, currentUser) {
    const { type, name } = action.toJS()
    if (type === 'user' && !DEFAULT_ACTIONS.includes(name)) {
        console.error('Applying unknown macro action', name)
    }

    return {
        type: name,
        args: action.get('arguments'),
        currentUser,
        fromMacro: true
    }
}

export function applyMacro(macro, currentUser) {
    return (dispatch) => {
        dispatch({
            type: APPLY_MACRO,
            macro
        })
        macro.get('actions').forEach(action => dispatch(applyMacroAction(action, currentUser)))
        dispatch({
            type: RECORD_MACRO,
            macro
        })
    }
}

export function fetchMacros() {
    return (dispatch) => {
        dispatch({
            type: FETCH_MACRO_LIST_START
        })

        return reqwest({
            url: '/api/macros/',
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
                internalMessage: err
            }))
        })
    }
}

export function createMacro(macro) {
    return (dispatch) => {
        dispatch({
            type: CREATE_MACRO_START
        })

        return reqwest({
            url: '/api/macros/',
            type: 'json',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(macro.delete('id').toJS())
        }).then((resp) => {
            dispatch({
                type: CREATE_MACRO_SUCCESS,
                resp
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: failed to fetch macros',
                internalMessage: err
            }))
        })
    }
}

export function updateMacro(macro) {
    return (dispatch) => {
        dispatch({
            type: UPDATE_MACRO_START
        })

        return reqwest({
            url: `/api/macros/${macro.get('id')}/`,
            type: 'json',
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(macro.toJS())
        }).then((resp) => {
            dispatch({
                type: UPDATE_MACRO_SUCCESS,
                resp
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: failed to fetch macros',
                internalMessage: err
            }))
        })
    }
}

export function deleteMacro(macroId) {
    return (dispatch) => {
        dispatch({
            type: DELETE_MACRO_START
        })

        return reqwest({
            url: `/api/macros/${macroId}/`,
            type: 'json',
            method: 'DELETE',
            contentType: 'application/json',
        }).then((resp) => {
            dispatch({
                type: DELETE_MACRO_SUCCESS,
                macroId,
                resp
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: failed to fetch macros',
                internalMessage: err
            }))
        })
    }
}
