import axios from 'axios'
import {DEFAULT_ACTIONS} from '../constants'
import {RECORD_MACRO} from '../constants/ticket'
import * as types from '../constants/macro'

export function deleteActionOnApplied(actionIndex) {
    return {
        type: types.DELETE_ACTION_ON_APPLIED,
        actionIndex
    }
}

export function updateActionArgsOnApplied(actionIndex, value) {
    return {
        type: types.UPDATE_ACTION_ARGS_ON_APPLIED,
        actionIndex,
        value
    }
}

export function updateActionArgs(actionIndex, value) {
    return {
        type: types.UPDATE_ACTION_ARGS,
        actionIndex,
        value
    }
}

export function updateActionTitle(actionIndex, title) {
    return {
        type: types.UPDATE_ACTION_TITLE,
        actionIndex,
        title
    }
}

export function openModal() {
    return {
        type: types.OPEN_MODAL
    }
}

export function closeModal() {
    return {
        type: types.CLOSE_MODAL
    }
}

export function addNewMacro() {
    return {
        type: types.ADD_NEW_MACRO
    }
}

export function setName(name) {
    return {
        type: types.SET_NAME,
        name
    }
}

export function addAction(actionType) {
    return {
        type: types.ADD_ACTION,
        actionType
    }
}

export function deleteAction(actionId) {
    return {
        type: types.DELETE_ACTION,
        actionId
    }
}

export function previewMacroInModal(macroId) {
    return {
        type: types.PREVIEW_MACRO_IN_MODAL,
        macroId
    }
}

export function setMacrosVisible(visible) {
    return {
        type: types.SET_MACROS_VISIBILITY,
        visible
    }
}

export function previewMacro(macro) {
    return {
        type: types.PREVIEW_MACRO,
        id: macro.get('id')
    }
}

export function previewAdjacentMacro(direction) {
    return {
        type: types.PREVIEW_ADJACENT_MACRO,
        direction
    }
}

export function previewAdjacentMacroInModal(direction, noExternal) {
    return {
        type: types.PREVIEW_ADJACENT_MACRO_IN_MODAL,
        direction,
        noExternal
    }
}

export function saveSearch(query) {
    return {
        type: types.SAVE_SEARCH,
        query
    }
}

export function applyMacroAction(action, currentUser) {
    const {type, name} = action.toJS()
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
            type: types.APPLY_MACRO,
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
            type: types.FETCH_MACRO_LIST_START
        })

        axios.get('/api/macros/')
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.FETCH_MACRO_LIST_SUCCESS,
                    resp
                })
            })
            .catch(error => {
                dispatch({
                    type: types.FETCH_MACRO_LIST_ERROR,
                    error,
                    reason: 'Failed to fetch macros'
                })
            })
    }
}

export function createMacro(macro) {
    return (dispatch) => {
        dispatch({
            type: types.CREATE_MACRO_START
        })

        axios.post('/api/macros/', macro.delete('id').toJS())
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.CREATE_MACRO_SUCCESS,
                    resp
                })
            })
            .catch(error => {
                dispatch({
                    type: types.CREATE_MACRO_ERROR,
                    error,
                    reason: 'Failed to create macro'
                })
            })
    }
}

export function updateMacro(macro) {
    return (dispatch) => {
        dispatch({
            type: types.UPDATE_MACRO_START
        })

        axios.put(`/api/macros/${macro.get('id')}/`, macro.toJS())
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.UPDATE_MACRO_SUCCESS,
                    resp
                })
            })
            .catch(error => {
                dispatch({
                    type: types.UPDATE_MACRO_ERROR,
                    error,
                    reason: 'Failed to update macro'
                })
            })
    }
}

export function deleteMacro(macroId) {
    return (dispatch) => {
        dispatch({
            type: types.DELETE_MACRO_START
        })

        axios.delete(`/api/macros/${macroId}/`)
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.DELETE_MACRO_SUCCESS,
                    macroId,
                    resp
                })
            })
            .catch(error => {
                dispatch({
                    type: types.DELETE_MACRO_ERROR,
                    error,
                    reason: 'Failed to delete macro'
                })
            })
    }
}
