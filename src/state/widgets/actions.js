import axios from 'axios'
import * as types from './constants'
import {jsonToTemplate} from '../../pages/tickets/detail/components/infobar/utils'

export function fetchWidgets() {
    return (dispatch) => {
        dispatch({
            type: types.FETCH_WIDGETS_START
        })

        return axios.get('/api/widgets/', {
            data: {
                type: 'ticket-list'
            }
        })
            .then((json = {}) => json.data)
            .then((resp) => {
                dispatch({
                    type: types.FETCH_WIDGETS_SUCCESS,
                    items: resp.data
                })
            })
            .catch(error => {
                dispatch({
                    type: types.FETCH_WIDGETS_ERROR,
                    error,
                    reason: 'Failed to fetch widgets'
                })
            })
    }
}

export function startEdition(context = 'ticket') {
    return {
        type: types.START_EDITION,
        context
    }
}

export function stopEdition() {
    return {
        type: types.STOP_EDITION
    }
}

export function startWidgetEdition(templatePath) {
    return {
        type: types.START_WIDGET_EDITION,
        path: templatePath
    }
}

export function stopWidgetEdition() {
    return {
        type: types.STOP_WIDGET_EDITION
    }
}

export function generateAndSetWidgets(sources) {
    return (dispatch) => {
        // generate template
        const template = jsonToTemplate(sources.toJS())

        dispatch({
            type: types.GENERATE_AND_SET_WIDGETS,
            items: template
        })
    }
}

export function drag(sourceAbsolutePath) {
    return {
        type: types.DRAG,
        absolutePath: sourceAbsolutePath
    }
}

export function cancelDrag() {
    return {
        type: types.CANCEL_DRAG
    }
}

export function drop(targetAbsolutePath = '', templatePath = '') {
    return (dispatch, getState) => {
        dispatch({
            type: types.DROP,
            templatePath,
            targetAbsolutePath,
            source: {
                ticket: getState().ticket
            }
        })
    }
}

export function updateEditedWidget(data) {
    return {
        type: types.UPDATE_EDITED_WIDGET,
        item: data
    }
}

export function removeEditedWidget(templatePath = '', absolutePath = '') {
    return {
        type: types.REMOVE_EDITED_WIDGET,
        templatePath,
        absolutePath
    }
}

export function addEditedWidget(widget) {
    return {
        type: types.ADD_EDITED_WIDGET,
        item: widget
    }
}

export function addFieldEditedWidget(widgetIndex, field, fieldIndex) {
    return {
        type: types.ADD_FIELD_EDITED_WIDGET,
        widgetIndex,
        field,
        fieldIndex
    }
}

export function updateFieldEditedWidget(widgetIndex, field, fieldIndex) {
    return {
        type: types.UPDATE_FIELD_EDITED_WIDGET,
        widgetIndex,
        fieldIndex,
        field
    }
}

export function resetWidgets() {
    return {
        type: types.RESET_WIDGETS
    }
}
