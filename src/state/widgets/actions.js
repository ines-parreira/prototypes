import axios from 'axios'
import * as types from './constants'
import {notify} from '../notifications/actions'
import {jsonToWidgets} from '../../pages/common/components/infobar/utils'
import _pick from 'lodash/pick'
import _size from 'lodash/size'

import {getSources} from '../widgets/selectors'

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
            }, error => {
                return dispatch({
                    type: types.FETCH_WIDGETS_ERROR,
                    error,
                    reason: 'Failed to fetch widgets'
                })
            })
    }
}

export function startEditionMode(context = 'ticket') {
    return {
        type: types.START_EDITION_MODE,
        context
    }
}

export function stopEditionMode() {
    return {
        type: types.STOP_EDITION_MODE
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

export function generateAndSetWidgets(sources, context = 'ticket') {
    return (dispatch) => {
        // generate template
        const items = jsonToWidgets(sources.toJS(), context)

        dispatch({
            type: types.GENERATE_AND_SET_WIDGETS,
            items,
            context
        })
    }
}

export function setEditedWidgets(items) {
    return {
        type: types.SET_EDITED_WIDGETS,
        items
    }
}

export function setEditionAsDirty() {
    return {
        type: types.SET_EDITION_AS_DIRTY
    }
}

export function selectContext(context = 'ticket') {
    return {
        type: types.SELECT_CONTEXT,
        context
    }
}

export function drag(group) {
    return {
        type: types.DRAG,
        group
    }
}

export function cancelDrag() {
    return {
        type: types.CANCEL_DRAG
    }
}

export function drop(eventType, targetParentTemplatePath = '', key = '', toIndex = 0, fromIndex = 0) {
    return (dispatch, getState) => {
        const state = getState()

        dispatch({
            type: types.DROP,
            eventType,
            key,
            toIndex,
            fromIndex,
            targetParentTemplatePath,
            source: getSources(state),
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

export function submitWidgets(data) {
    return (dispatch, getState) => {
        const context = getState().widgets.get('currentContext', 'ticket')

        dispatch({
            type: types.SUBMIT_WIDGET_START
        })

        let items = data || []

        // clear widgets, remove those with empty template
        items = items.filter((item) => {
            return _size(item.template || {}) > 0
        })

        // if no widget, just put an empty one
        if (!items.length) {
            items = [{
                order: 0,
                type: 'custom',
                context,
                template: {}
            }]
        }

        // re assign order number and pick only interesting fields
        items = items.map((item, i) => {
            const updatedItem = item
            updatedItem.order = i
            return _pick(updatedItem, ['id', 'order', 'template', 'context', 'type'])
        })

        return axios
            .put('/api/widgets/', items)
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.SUBMIT_WIDGET_SUCCESS,
                    items: resp.data,
                    context
                })

                dispatch(notify({
                    type: 'success',
                    message: 'Widgets successfully updated'
                }))
            }, error => {
                return dispatch({
                    type: types.SUBMIT_WIDGET_ERROR,
                    error,
                    reason: 'Failed to update widgets'
                })
            })
    }
}

export function resetWidgets() {
    return {
        type: types.RESET_WIDGETS
    }
}
