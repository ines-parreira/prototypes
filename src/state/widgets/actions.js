// @flow
import axios from 'axios'
import _pick from 'lodash/pick'
import _size from 'lodash/size'
import _last from 'lodash/last'
import _isUndefined from 'lodash/isUndefined'

import type {Map} from 'immutable'

import {getSources, getSourcesWithCustomer} from '../widgets/selectors'

import {jsonToWidgets} from '../../pages/common/components/infobar/utils'
import {notify} from '../notifications/actions'
import type {dispatchType, getStateType} from '../types'

import * as integrationsSelectors from './../integrations/selectors'
import * as types from './constants'
type widgetUpdateType = {
    title: string,
    meta: {
        link: string,
        displayCard: boolean,
    },
}
type widgetType = {
    order: number,
    type: string,
    context: {},
    template: {},
}

export function fetchWidgets() {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        dispatch({
            type: types.FETCH_WIDGETS_START,
        })

        return axios
            .get('/api/widgets/', {
                data: {
                    type: 'ticket-list',
                },
            })
            .then((json = {}) => json.data)
            .then(
                (resp) => {
                    return dispatch({
                        type: types.FETCH_WIDGETS_SUCCESS,
                        items: resp.data,
                    })
                },
                (error) => {
                    return dispatch({
                        type: types.FETCH_WIDGETS_ERROR,
                        error,
                        reason: 'Failed to fetch widgets',
                    })
                }
            )
    }
}

export function startEditionMode(context: string = 'ticket') {
    return {
        type: types.START_EDITION_MODE,
        context,
    }
}

export function stopEditionMode() {
    return {
        type: types.STOP_EDITION_MODE,
    }
}

export function startWidgetEdition(templatePath: string) {
    return {
        type: types.START_WIDGET_EDITION,
        path: templatePath,
    }
}

export function stopWidgetEdition() {
    return {
        type: types.STOP_WIDGET_EDITION,
    }
}

export function generateAndSetWidgets(
    sources: Map<*, *>,
    context: string = 'ticket'
) {
    return (dispatch: dispatchType): dispatchType => {
        // generate template
        const items = jsonToWidgets(sources.toJS(), context)

        return dispatch({
            type: types.GENERATE_AND_SET_WIDGETS,
            items,
            context,
        })
    }
}

export function setEditedWidgets(items: Array<Map<*, *>>) {
    return {
        type: types.SET_EDITED_WIDGETS,
        items,
    }
}

export function setEditionAsDirty() {
    return {
        type: types.SET_EDITION_AS_DIRTY,
    }
}

export function selectContext(context: string = 'ticket') {
    return {
        type: types.SELECT_CONTEXT,
        context,
    }
}

export function drag(group: string) {
    return {
        type: types.DRAG,
        group,
    }
}

export function cancelDrag() {
    return {
        type: types.CANCEL_DRAG,
    }
}

export function drop(
    eventType: 'add' | 'update',
    targetParentTemplatePath: string = '',
    key: string = '',
    toIndex: number = 0,
    fromIndex: number = 0
) {
    return (dispatch: dispatchType, getState: getStateType): dispatchType => {
        const state = getState()
        const splitKey = key.split('.')
        let type = null
        let integrationId = null

        // If there's an integration matching the `sourcePath` of the object we just dropped, then we want to
        // include its id in the call to the reducer; this way we can set the `integration_id` correctly in the new
        // widget, and filter out widget that are already present in the list.
        if (splitKey.includes('integrations')) {
            const currentIntegrationId = parseInt(_last(splitKey))

            if (!isNaN(currentIntegrationId)) {
                const integration = integrationsSelectors.getIntegrationById(
                    currentIntegrationId
                )(state)

                if (integration) {
                    type = integration.get('type')
                    integrationId = currentIntegrationId
                }
            }
        }

        let source = getSources(state)
        // edit-widgets for new tickets
        if (
            source.get('ticket') &&
            _isUndefined(source.getIn(['ticket', 'id']))
        ) {
            source = getSourcesWithCustomer(state)
        }

        dispatch({
            type: types.DROP,
            eventType,
            key,
            toIndex,
            fromIndex,
            targetParentTemplatePath,
            source,
            widgetType: type,
            integrationId,
        })
    }
}

export function updateEditedWidget(data: widgetUpdateType) {
    return {
        type: types.UPDATE_EDITED_WIDGET,
        item: data,
    }
}

export function removeEditedWidget(
    templatePath: string = '',
    absolutePath: string = ''
) {
    return {
        type: types.REMOVE_EDITED_WIDGET,
        templatePath,
        absolutePath,
    }
}

export function submitWidgets(data: ?Array<widgetType>) {
    return (
        dispatch: dispatchType,
        getState: getStateType
    ): Promise<dispatchType> => {
        const context = getState().widgets.get('currentContext', 'ticket')

        dispatch({
            type: types.SUBMIT_WIDGET_START,
        })

        let items = data || []

        // clear widgets, remove those with empty template
        items = items.filter((item) => {
            return _size(item.template || {}) > 0
        })

        // if no widget, just put an empty one
        if (!items.length) {
            items = [
                {
                    order: 0,
                    type: 'custom',
                    context,
                    template: {},
                },
            ]
        }

        // re assign order number and pick only interesting fields
        items = items.map((item, i) => {
            const updatedItem = item
            updatedItem.order = i
            return _pick(updatedItem, [
                'id',
                'order',
                'template',
                'context',
                'type',
                'integration_id',
            ])
        })

        return axios
            .put('/api/widgets/', items)
            .then((json = {}) => json.data)
            .then(
                (resp) => {
                    dispatch({
                        type: types.SUBMIT_WIDGET_SUCCESS,
                        items: resp.data,
                        context,
                    })

                    dispatch(
                        notify({
                            status: 'success',
                            message: 'Widgets successfully updated',
                        })
                    )
                },
                (error) => {
                    return dispatch({
                        type: types.SUBMIT_WIDGET_ERROR,
                        error,
                        reason: 'Failed to update widgets',
                    })
                }
            )
    }
}

export function resetWidgets() {
    return {
        type: types.RESET_WIDGETS,
    }
}
