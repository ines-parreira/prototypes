import axios from 'axios'
import {DEFAULT_ACTIONS} from '../../config'
import {RECORD_MACRO} from '../ticket/constants'
import * as types from './constants'
import {notify} from '../notifications/actions'

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

export function deleteAction(actionIndex) {
    return {
        type: types.DELETE_ACTION,
        actionIndex
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
        id: macro.get('id', '')
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

export function clearAppliedMacro() {
    return {
        type: types.CLEAR_APPLIED_MACRO
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

        return axios.get('/api/macros/')
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.FETCH_MACRO_LIST_SUCCESS,
                    resp
                })
            })
            .catch(error => {
                return dispatch({
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

        return axios.post('/api/macros/', macro.delete('id').toJS())
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.CREATE_MACRO_SUCCESS,
                    resp
                })

                dispatch(notify({
                    type: 'success',
                    message: 'Macro created'
                }))
            })
            .catch(error => {
                return dispatch({
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
        return axios.put(`/api/macros/${macro.get('id')}/`, macro.toJS())
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.UPDATE_MACRO_SUCCESS,
                    resp
                })

                dispatch(notify({
                    type: 'success',
                    message: 'Macro updated'
                }))
            })
            .catch(error => {
                return dispatch({
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

        return axios.delete(`/api/macros/${macroId}/`)
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.DELETE_MACRO_SUCCESS,
                    macroId,
                    resp
                })

                dispatch(notify({
                    type: 'success',
                    message: 'Macro deleted'
                }))
            })
            .catch(error => {
                return dispatch({
                    type: types.DELETE_MACRO_ERROR,
                    error,
                    reason: 'Failed to delete macro'
                })
            })
    }
}

// Add attachments for macro "addAttachements" Action
export function addAttachments(actionIndex, files) {
    return (dispatch) => {
        dispatch({
            type: types.ADD_ATTACHMENTS_MACRO_START
        })

        const formData = new window.FormData()
        for (const file of files) {
            formData.append(file.name, file)
        }

        return axios.post('/api/upload/', formData)
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.ADD_ATTACHMENTS_MACRO_SUCCESS,
                    actionIndex,
                    files: resp
                })
            })
            .catch(error => {
                return dispatch({
                    type: types.ADD_ATTACHMENTS_MACRO_ERROR,
                    error,
                    reason: 'Failed to upload files. Please try again later'
                })
            })
    }
}

export function removeAttachment(actionIndex, fileIndex) {
    return {
        type: types.DELETE_ATTACHMENT_MACRO,
        actionIndex,
        fileIndex
    }
}
