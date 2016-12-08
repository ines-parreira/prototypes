import axios from 'axios'
import {DEFAULT_ACTIONS} from '../../config'
import {RECORD_MACRO} from '../ticket/constants'
import * as types from './constants'
import {notify} from '../notifications/actions'


export const deleteActionOnApplied = (actionIndex, ticketId) => ({
    type: types.DELETE_ACTION_ON_APPLIED,
    actionIndex,
    ticketId
})

export const updateActionArgsOnApplied = (actionIndex, value, ticketId) => ({
    type: types.UPDATE_ACTION_ARGS_ON_APPLIED,
    actionIndex,
    value,
    ticketId
})

export const updateActionArgs = (actionIndex, value) => ({
    type: types.UPDATE_ACTION_ARGS,
    actionIndex,
    value
})

export const updateActionTitle = (actionIndex, title) => ({
    type: types.UPDATE_ACTION_TITLE,
    actionIndex,
    title
})

export const openModal = () => ({
    type: types.OPEN_MODAL
})

export const closeModal = () => ({
    type: types.CLOSE_MODAL
})

export const addNewMacro = () => ({
    type: types.ADD_NEW_MACRO
})

export const setName = (name) => ({
    type: types.SET_NAME,
    name
})

export const addAction = (actionType) => ({
    type: types.ADD_ACTION,
    actionType
})

export const deleteAction = (actionIndex) => ({
    type: types.DELETE_ACTION,
    actionIndex
})

export const previewMacroInModal = (macroId) => ({
    type: types.PREVIEW_MACRO_IN_MODAL,
    macroId
})

export const setMacrosVisible = (visible) => ({
    type: types.SET_MACROS_VISIBILITY,
    visible
})

export const previewMacro = (macro) => ({
    type: types.PREVIEW_MACRO,
    id: macro.get('id', '')
})

export const previewAdjacentMacro = (direction) => ({
    type: types.PREVIEW_ADJACENT_MACRO,
    direction
})

export const previewAdjacentMacroInModal = (direction, noExternal) => ({
    type: types.PREVIEW_ADJACENT_MACRO_IN_MODAL,
    direction,
    noExternal
})

export const saveSearch = (query) => ({
    type: types.SAVE_SEARCH,
    query
})

export const fetchTicketReplyMacro = (ticketId) => ({
    type: types.FETCH_TICKET_REPLY_MACRO,
    ticketId
})

export const applyMacroAction = (action, currentUser) => {
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

export const applyMacro = (macro, ticketId) => (dispatch, getState) => {
    dispatch({
        type: types.APPLY_MACRO,
        macro,
        ticketId
    })
    const currentUser = getState().currentUser
    macro.get('actions').forEach(action => dispatch(applyMacroAction(action, currentUser)))

    dispatch({
        type: RECORD_MACRO,
        macro
    })

    dispatch(setMacrosVisible(false))
}

export const clearAppliedMacro = (ticketId) => ({
    type: types.CLEAR_APPLIED_MACRO,
    ticketId
})

export const fetchMacros = () => (dispatch) => {
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

export const createMacro = (macro) => (dispatch) => {
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

export const updateMacro = (macro) => (dispatch) => {
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

export const deleteMacro = (macroId) => (dispatch) => {
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

// Add attachments for macro "addAttachements" Action
export const addAttachments = (actionIndex, files) => (dispatch) => {
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

export const removeAttachment = (actionIndex, fileIndex) => ({
    type: types.DELETE_ATTACHMENT_MACRO,
    actionIndex,
    fileIndex
})
