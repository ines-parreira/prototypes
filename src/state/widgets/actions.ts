import {AxiosError} from 'axios'
import _pick from 'lodash/pick'
import _size from 'lodash/size'
import _last from 'lodash/last'
import _isUndefined from 'lodash/isUndefined'
import {Map} from 'immutable'

import {getSources, getSourcesWithCustomer} from '../widgets/selectors'

import {jsonToWidgets} from '../../pages/common/components/infobar/utils'
import * as integrationsSelectors from '../integrations/selectors'
import {notify} from '../notifications/actions'
import {NotificationStatus} from '../notifications/types'
import {StoreDispatch, RootState} from '../types'
import client from '../../models/api/resources'

import {LinksWidget} from '../../pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'

import * as types from './constants'
import {
    Widget,
    WidgetContextType,
    WidgetTemplateWidget,
    WidgetDraft,
} from './types'

export function fetchWidgets() {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: types.FETCH_WIDGETS_START,
        })

        return client
            .get<{data: Widget[]}>('/api/widgets/', {
                data: {
                    type: 'ticket-list',
                },
            })
            .then((json) => json?.data)
            .then(
                (resp) => {
                    return dispatch({
                        type: types.FETCH_WIDGETS_SUCCESS,
                        items: resp.data,
                    })
                },
                (error: AxiosError) => {
                    return dispatch({
                        type: types.FETCH_WIDGETS_ERROR,
                        error,
                        reason: 'Failed to fetch widgets',
                    })
                }
            )
    }
}

export function startEditionMode(context = WidgetContextType.Ticket) {
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
    sources: Map<any, any>,
    context = WidgetContextType.Ticket
) {
    return (dispatch: StoreDispatch): ReturnType<StoreDispatch> => {
        // generate template
        const items = jsonToWidgets(sources.toJS(), context)

        return dispatch({
            type: types.GENERATE_AND_SET_WIDGETS,
            items,
            context,
        })
    }
}

export function setEditedWidgets(items: Map<any, any>[]) {
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

export function selectContext(context = WidgetContextType.Ticket) {
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
    targetParentTemplatePath = '',
    key = '',
    toIndex = 0,
    fromIndex = 0
) {
    return (dispatch: StoreDispatch, getState: () => RootState) => {
        const state = getState()
        const splitKey = key.split('.')
        let type = null
        let integrationId = null

        // If there's an integration matching the `sourcePath` of the object we just dropped, then we want to
        // include its id in the call to the reducer; this way we can set the `integration_id` correctly in the new
        // widget, and filter out widget that are already present in the list.
        if (splitKey.includes('integrations')) {
            const currentIntegrationId = parseInt(_last(splitKey) || '')

            if (!isNaN(currentIntegrationId)) {
                const integration =
                    integrationsSelectors.getIntegrationById(
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

export function updateEditedWidget(data: WidgetTemplateWidget | LinksWidget) {
    return {
        type: types.UPDATE_EDITED_WIDGET,
        item: data,
    }
}

export function removeEditedWidget(templatePath = '', absolutePath = '') {
    return {
        type: types.REMOVE_EDITED_WIDGET,
        templatePath,
        absolutePath,
    }
}

export function submitWidgets(data: Maybe<Widget[]>) {
    return (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): Promise<ReturnType<StoreDispatch>> => {
        const context = getState().widgets.get('currentContext', 'ticket')

        dispatch({
            type: types.SUBMIT_WIDGET_START,
        })

        let items: Array<Widget | WidgetDraft> = data || []

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
            ]) as Widget | WidgetDraft
        })

        return client
            .put<{data: Widget[]}>('/api/widgets/', items)
            .then((json) => json?.data)
            .then(
                (resp) => {
                    dispatch({
                        type: types.SUBMIT_WIDGET_SUCCESS,
                        items: resp.data,
                        context,
                    })

                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'Widgets successfully updated',
                        })
                    )
                },
                (error: AxiosError) => {
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
